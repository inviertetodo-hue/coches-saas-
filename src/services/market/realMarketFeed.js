const REAL_FEED_TIMEOUT_MS = 8000;
const MAX_LINKS_TO_TRY = 6;

export async function fetchRealMarketListings(scan = {}, options = {}) {
  const maxListings = Number(options.maxListings || 20);
  const searchLinks = Array.isArray(scan.searchLinks) ? scan.searchLinks : [];

  if (searchLinks.length === 0) {
    return {
      mode: "real-feed-empty",
      listings: [],
      errors: ["No hay enlaces de búsqueda disponibles."],
    };
  }

  const linksToTry = searchLinks.slice(0, MAX_LINKS_TO_TRY);
  const allListings = [];
  const errors = [];

  for (const link of linksToTry) {
    try {
      const text = await fetchSearchText(link.url);
      const parsedListings = parseListingsFromText({
        text,
        source: link.source,
        country: link.country,
        query: scan.query,
      });

      allListings.push(...parsedListings);

      if (allListings.length >= maxListings) {
        break;
      }
    } catch (error) {
      errors.push(`${link.source} ${link.country}: ${error.message}`);
    }
  }

  return {
    mode: allListings.length > 0 ? "real-feed" : "real-feed-failed",
    listings: dedupeListings(allListings).slice(0, maxListings),
    errors,
  };
}

async function fetchSearchText(url) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REAL_FEED_TIMEOUT_MS);

  try {
    const readerUrl = buildReaderUrl(url);

    const response = await fetch(readerUrl, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "text/plain",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();

    if (!text || text.length < 200) {
      throw new Error("Respuesta vacía o demasiado corta.");
    }

    return text;
  } finally {
    window.clearTimeout(timeout);
  }
}

function buildReaderUrl(url) {
  return `https://r.jina.ai/http://r.jina.ai/http://${url}`;
}

function parseListingsFromText({ text, source, country, query }) {
  const lines = String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const listings = [];
  const queryBrand = detectBrand(query);

  for (let index = 0; index < lines.length; index += 1) {
    const line = cleanText(lines[index]);

    if (!looksLikeVehicleTitle(line, query)) {
      continue;
    }

    const windowText = lines.slice(index, index + 12).join(" ");
    const price = extractPrice(windowText);
    const mileage = extractMileage(windowText);
    const year = extractYear(windowText);

    if (!price || !mileage || !year) {
      continue;
    }

    listings.push({
      id: buildListingId({ source, country, line, price, mileage, year }),
      title: line,
      brand: queryBrand,
      model: detectModel(line, query),
      price,
      km: mileage,
      mileage,
      year,
      country,
      fuelType: detectFuelType(windowText),
      drivetrain: detectDrivetrain(windowText),
      bodyType: detectBodyType(windowText),
      performancePackage: detectPerformancePackage(windowText),
      electrified: isElectrified(windowText),
      marketMultiplier: estimateMarketMultiplier({ price, mileage, year }),
      source,
      url: "",
      isRealData: true,
    });
  }

  return listings;
}

function looksLikeVehicleTitle(line, query) {
  const text = normalize(line);
  const queryText = normalize(query);

  if (line.length < 8 || line.length > 120) return false;
  if (!queryText) return false;

  const brand = detectBrand(queryText).toLowerCase();

  if (brand && text.includes(brand)) return true;

  return queryText
    .split(" ")
    .filter((part) => part.length >= 3)
    .some((part) => text.includes(part));
}

function extractPrice(text) {
  const patterns = [
    /€\s?([\d.]{4,8})/i,
    /([\d.]{4,8})\s?€/i,
    /EUR\s?([\d.]{4,8})/i,
  ];

  for (const pattern of patterns) {
    const match = String(text).match(pattern);

    if (match?.[1]) {
      return safeNumber(match[1]);
    }
  }

  return 0;
}

function extractMileage(text) {
  const patterns = [
    /([\d.]{2,8})\s?km/i,
    /kilometerstand\s?([\d.]{2,8})/i,
  ];

  for (const pattern of patterns) {
    const match = String(text).match(pattern);

    if (match?.[1]) {
      return safeNumber(match[1]);
    }
  }

  return 0;
}

function extractYear(text) {
  const match = String(text).match(/\b(2012|2013|2014|2015|2016|2017|2018|2019|2020|2021|2022|2023|2024|2025|2026)\b/);

  return match?.[1] ? safeNumber(match[1]) : 0;
}

function detectBrand(value) {
  const text = normalize(value);

  if (text.includes("bmw")) return "BMW";
  if (text.includes("audi")) return "Audi";
  if (text.includes("mercedes")) return "Mercedes-Benz";
  if (text.includes("volvo")) return "Volvo";
  if (text.includes("peugeot")) return "Peugeot";
  if (text.includes("volkswagen") || text.includes("vw")) return "Volkswagen";
  if (text.includes("skoda")) return "Skoda";
  if (text.includes("seat")) return "SEAT";
  if (text.includes("renault")) return "Renault";
  if (text.includes("toyota")) return "Toyota";
  if (text.includes("porsche")) return "Porsche";

  return "";
}

function detectModel(title, query) {
  const text = normalize(`${title} ${query}`);

  const models = [
    "x5",
    "x3",
    "q7",
    "q5",
    "a6",
    "a4",
    "glc",
    "gle",
    "clase a",
    "classe a",
    "xc60",
    "xc90",
    "v60",
    "v90",
    "208",
    "308",
    "3008",
    "golf",
    "tiguan",
    "octavia",
    "fabia",
  ];

  return models.find((model) => text.includes(model)) || cleanText(query);
}

function detectFuelType(text) {
  const value = normalize(text);

  if (value.includes("diesel") || value.includes("tdi") || value.includes("dci")) {
    return "Diesel";
  }

  if (value.includes("hybrid") || value.includes("híbrido") || value.includes("phev")) {
    return "PHEV";
  }

  if (value.includes("electric") || value.includes("eléctrico")) {
    return "Electric";
  }

  if (value.includes("petrol") || value.includes("gasolina") || value.includes("tsi")) {
    return "Gasolina";
  }

  return "";
}

function detectDrivetrain(text) {
  const value = normalize(text);

  if (value.includes("xdrive")) return "xDrive AWD";
  if (value.includes("quattro")) return "quattro AWD";
  if (value.includes("4matic")) return "4MATIC AWD";
  if (value.includes("awd")) return "AWD";

  return "";
}

function detectBodyType(text) {
  const value = normalize(text);

  if (value.includes("suv")) return "SUV";
  if (value.includes("avant") || value.includes("touring") || value.includes("estate")) {
    return "Familiar";
  }

  return "";
}

function detectPerformancePackage(text) {
  const value = normalize(text);

  if (value.includes("m sport")) return "M Sport";
  if (value.includes("s line")) return "S line";
  if (value.includes("amg")) return "AMG";
  if (value.includes("r-design")) return "R-Design";

  return "";
}

function isElectrified(text) {
  const value = normalize(text);

  return (
    value.includes("phev") ||
    value.includes("hybrid") ||
    value.includes("híbrido") ||
    value.includes("electric")
  );
}

function estimateMarketMultiplier({ price, mileage, year }) {
  let multiplier = 1.08;

  if (year >= 2022) multiplier += 0.05;
  if (mileage <= 50000) multiplier += 0.04;
  if (price <= 30000) multiplier += 0.03;

  return Number(multiplier.toFixed(2));
}

function dedupeListings(listings) {
  const seen = new Set();

  return listings.filter((listing) => {
    const key = `${normalize(listing.title)}-${listing.price}-${listing.km}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function buildListingId({ source, country, line, price, mileage, year }) {
  return `${normalize(source)}-${normalize(country)}-${normalize(line)}-${price}-${mileage}-${year}`
    .replace(/[^a-z0-9-]/g, "-")
    .slice(0, 120);
}

function safeNumber(value) {
  const cleaned = String(value || "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : 0;
}

function cleanText(value) {
  return String(value || "").trim();
}

function normalize(value) {
  return cleanText(value).toLowerCase();
}