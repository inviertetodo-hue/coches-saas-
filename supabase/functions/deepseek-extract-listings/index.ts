const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_MODEL = "deepseek-v4-flash";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse(
      {
        status: "error",
        listings: [],
        diagnostics: ["Método no permitido."],
      },
      405
    );
  }

  try {
    const apiKey = Deno.env.get("DEEPSEEK_API_KEY") || "";

    if (!apiKey) {
      return jsonResponse(
        {
          status: "missing_api_key",
          source: "deepseek_edge_extractor",
          listings: [],
          diagnostics: [
            "Falta DEEPSEEK_API_KEY en Supabase Edge Function secrets.",
          ],
        },
        200
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawText = String(body.rawText || "").trim();

    if (!rawText) {
      return jsonResponse(
        {
          status: "empty",
          source: "deepseek_edge_extractor",
          listings: [],
          diagnostics: ["No hay texto bruto para extraer."],
        },
        200
      );
    }

    const startedAt = Date.now();

    const deepSeekResponse = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: body.aiModel || DEFAULT_MODEL,
        temperature: 0,
        max_tokens: Number(body.maxTokens || 2200),
        response_format: {
          type: "json_object",
        },
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(),
          },
          {
            role: "user",
            content: buildUserPrompt(rawText, body),
          },
        ],
      }),
    });

    const raw = await deepSeekResponse.text();

    if (!deepSeekResponse.ok) {
      return jsonResponse(
        {
          status: "error",
          source: "deepseek_edge_extractor",
          listings: [],
          diagnostics: [
            `DeepSeek error ${deepSeekResponse.status}`,
            raw.slice(0, 1200),
          ],
        },
        200
      );
    }

    const json = JSON.parse(raw);
    const rawModelText = json?.choices?.[0]?.message?.content || "";
    const parsed = parseJsonObject(rawModelText);
    const extractedListings = Array.isArray(parsed?.listings)
      ? parsed.listings
      : [];

    const listings = extractedListings.map(normalizeExtractedListing);

    return jsonResponse(
      {
        status: listings.length ? "ready" : "empty",
        source: "deepseek_edge_extractor",
        totalListings: listings.length,
        listings,
        diagnostics: [
          `Modelo: ${body.aiModel || DEFAULT_MODEL}`,
          `Tokens input: ${json?.usage?.prompt_tokens ?? "n/d"}`,
          `Tokens output: ${json?.usage?.completion_tokens ?? "n/d"}`,
          `Anuncios extraídos: ${listings.length}`,
          `Duración: ${Date.now() - startedAt} ms`,
        ],
        usage: json?.usage || null,
        rawText: body.includeRawText ? rawModelText : "",
        generatedAt: new Date().toISOString(),
      },
      200
    );
  } catch (error) {
    return jsonResponse(
      {
        status: "error",
        source: "deepseek_edge_extractor",
        listings: [],
        diagnostics: [
          error instanceof Error ? error.message : "Error desconocido.",
        ],
      },
      200
    );
  }
});

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

function buildUserPrompt(rawText: string, options: Record<string, unknown>) {
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

function normalizeExtractedListing(item: Record<string, unknown>) {
  const km = nullableNumber(item.km);

  return {
    source: "deepseek_extracted",
    title: cleanNullableText(item.title),
    brand: cleanNullableText(item.brand),
    model: cleanNullableText(item.model),
    version: cleanNullableText(item.version),
    price: nullableNumber(item.price),
    year: nullableNumber(item.year),
    km,
    mileage: km,
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

function parseJsonObject(text: string) {
  const value = String(text || "").trim();

  try {
    return JSON.parse(value);
  } catch {
    const first = value.indexOf("{");
    const last = value.lastIndexOf("}");

    if (first === -1 || last === -1 || last <= first) return null;

    try {
      return JSON.parse(value.slice(first, last + 1));
    } catch {
      return null;
    }
  }
}

function cleanNullableText(value: unknown) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text || null;
}

function nullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;

  const number = Number(
    String(value)
      .replace(/\s/g, "")
      .replace(",", ".")
      .replace(/[^0-9.-]/g, "")
  );

  return Number.isFinite(number) ? number : null;
}

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });
}
