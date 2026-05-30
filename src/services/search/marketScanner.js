import { buildMarketSearch } from "./marketSearchBuilder";

export async function scanMarket(searchInput = {}) {
  const search = buildMarketSearch(searchInput);

  return {
    status: "ready",
    mode: "market-scanner-v1",
    search,
    listings: [],
    summary: {
      totalListings: 0,
      validListings: 0,
      rejectedListings: 0,
      message:
        "Market Scanner preparado. Todavía no hay fuente real conectada, por eso no se devuelven anuncios inventados.",
    },
    nextStep:
      "Conectar una fuente real de anuncios antes de calcular oportunidades.",
  };
}

export function normalizeMarketListings(rawListings = []) {
  if (!Array.isArray(rawListings)) {
    return [];
  }

  return rawListings
    .map(normalizeListing)
    .filter((listing) => listing.isValid);
}

function normalizeListing(raw = {}) {
  const title = cleanText(raw.title);
  const url = cleanText(raw.url);
  const price = safeNumber(raw.price);
  const mileage = safeNumber(raw.mileage);
  const year = safeNumber(raw.year);

  const missingFields = [];

  if (!title) missingFields.push("title");
  if (!url) missingFields.push("url");
  if (!price) missingFields.push("price");
  if (!mileage) missingFields.push("mileage");
  if (!year) missingFields.push("year");

  return {
    title,
    url,
    price,
    mileage,
    year,
    location: cleanText(raw.location),
    source: cleanText(raw.source) || "unknown",
    isValid: missingFields.length === 0,
    missingFields,
    raw,
  };
}

function cleanText(value) {
  return String(value || "").trim();
}

function safeNumber(value) {
  const cleaned = String(value || "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : 0;
}