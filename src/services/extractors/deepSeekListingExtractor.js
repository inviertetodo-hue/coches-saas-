import { callDeepSeekJson } from "../ai/deepSeekClient.js";

export async function extractListingsWithDeepSeek(rawText = "", options = {}) {
  const text = String(rawText || "").trim();

  if (!text) {
    return {
      status: "empty",
      source: "deepseek_listing_extractor",
      listings: [],
      diagnostics: ["No hay texto bruto para extraer."],
      generatedAt: new Date().toISOString(),
    };
  }

  const response = await callDeepSeekJson({
    apiKey: options.apiKey,
    model: options.aiModel || "deepseek-v4-flash",
    temperature: 0,
    maxTokens: options.maxTokens || 2200,
    systemPrompt: buildSystemPrompt(),
    userPrompt: buildUserPrompt(text, options),
  });

  if (response.status !== "ready") {
    return {
      status: response.status,
      source: "deepseek_listing_extractor",
      listings: [],
      diagnostics: response.diagnostics || [],
      rawText: options.includeRawText ? response.rawText : "",
      usage: response.usage || null,
      generatedAt: new Date().toISOString(),
    };
  }

  const extractedListings = Array.isArray(response.data?.listings)
    ? response.data.listings
    : [];

  const listings = extractedListings.map(normalizeExtractedListing);

  return {
    status: listings.length ? "ready" : "empty",
    source: "deepseek_listing_extractor",
    totalListings: listings.length,
    listings,
    diagnostics: [
      ...(response.diagnostics || []),
      `Anuncios extraídos: ${listings.length}`,
    ],
    rawText: options.includeRawText ? response.rawText : "",
    usage: response.usage || null,
    generatedAt: new Date().toISOString(),
  };
}

function buildSystemPrompt() {
  return `
Eres un extractor de datos de anuncios de coches.

Tu única tarea es extraer campos estructurados desde texto bruto.
No analices rentabilidad.
No calcules oportunidad.
No filtres por calidad.
No decidas BUY/WATCH/REJECT.
No inventes datos.
Si un campo no aparece claro, usa null.
Devuelve SOLO JSON válido.
`.trim();
}

function buildUserPrompt(rawText = "", options = {}) {
  return JSON.stringify(
    {
      task: "extract_vehicle_listings_from_raw_text",
      target: {
        brand: options.brand || null,
        model: options.model || null,
      },
      outputFormat: {
        listings: [
          {
            title: "string|null",
            brand: "string|null",
            model: "string|null",
            version: "string|null",
            price: "number|null",
            year: "number|null",
            km: "number|null",
            fuelType: "string|null",
            hp: "number|null",
            country: "string|null",
            location: "string|null",
            sourceUrl: "string|null",
            equipment: ["string"],
            sellerType: "string|null",
          },
        ],
      },
      rawText: rawText.slice(0, 18000),
    },
    null,
    2
  );
}

function normalizeExtractedListing(item = {}) {
  return {
    source: "deepseek_extracted",
    title: cleanNullableText(item.title),
    brand: cleanNullableText(item.brand),
    model: cleanNullableText(item.model),
    version: cleanNullableText(item.version),
    price: nullableNumber(item.price),
    year: nullableNumber(item.year),
    km: nullableNumber(item.km),
    mileage: nullableNumber(item.km),
    fuelType: cleanNullableText(item.fuelType),
    hp: nullableNumber(item.hp),
    country: cleanNullableText(item.country),
    location: cleanNullableText(item.location),
    sourceUrl: cleanNullableText(item.sourceUrl),
    url: cleanNullableText(item.sourceUrl),
    equipment: Array.isArray(item.equipment)
      ? item.equipment.map(cleanNullableText).filter(Boolean).slice(0, 30)
      : [],
    sellerType: cleanNullableText(item.sellerType),
    extractedAt: new Date().toISOString(),
  };
}

function cleanNullableText(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text || null;
}

function nullableNumber(value) {
  if (value === null || value === undefined || value === "") return null;

  const number = Number(
    String(value)
      .replace(/\s/g, "")
      .replace(",", ".")
      .replace(/[^0-9.-]/g, "")
  );

  return Number.isFinite(number) ? number : null;
}
