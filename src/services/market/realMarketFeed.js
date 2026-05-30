const REAL_FEED_TIMEOUT_MS = 8000;
const MAX_LINKS_TO_TRY = 8;

export async function fetchRealMarketListings(scan = {}, options = {}) {
  const maxListings = Number(options.maxListings || 20);
  const searchLinks = Array.isArray(scan.searchLinks) ? scan.searchLinks : [];

  if (searchLinks.length === 0) {
    return {
      mode: "real-feed-empty",
      listings: [],
      errors: ["No hay enlaces de búsqueda disponibles."],
      diagnostics: [],
    };
  }

  const linksToTry = searchLinks.slice(0, MAX_LINKS_TO_TRY);
  const allListings = [];
  const errors = [];
  const diagnostics = [];

  for (const link of linksToTry) {
    const startedAt = Date.now();

    try {
      const readerUrl = buildReaderUrl(link.url);
      const text = await fetchSearchText(link.url);

      const parsedListings = parseListingsFromText({
        text,
        source: link.source,
        country: link.country,
        query: scan.query,
      });

      diagnostics.push({
        source: link.source,
        country: link.country,
        status: parsedListings.length > 0 ? "success" : "no-results",
        originalUrl: link.url,
        readerUrl,
        textLength: text.length,
        parsedCount: parsedListings.length,
        durationMs: Date.now() - startedAt,
        message:
          parsedListings.length > 0
            ? `${parsedListings.length} anuncios detectados.`
            : "Fetch correcto, pero el parser no encontró anuncios válidos.",
      });

      allListings.push(...parsedListings);

      if (allListings.length >= maxListings) {
        break;
      }
    } catch (error) {
      const message = `${link.source} ${link.country}: ${error.message}`;

      errors.push(message);

      diagnostics.push({
        source: link.source,
        country: link.country,
        status: "error",
        originalUrl: link.url,
        readerUrl: safeBuildReaderUrl(link.url),
        textLength: 0,
        parsedCount: 0,
        durationMs: Date.now() - startedAt,
        message: error.message,
      });
    }
  }

  const listings = dedupeListings(allListings).slice(0, maxListings);

  return {
    mode: listings.length > 0 ? "real-feed" : "real-feed-failed",
    listings,
    errors,
    diagnostics,
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
  const cleanUrl = String(url || "").trim();

  if (!cleanUrl) {
    throw new Error("URL vacía.");
  }

  if (cleanUrl.startsWith("https://")) {
    return `https://r.jina.ai/http://${cleanUrl.replace("https://", "")}`;
  }

  if (cleanUrl.startsWith("http://")) {
    return `https://r.jina.ai/http://${cleanUrl.replace("http://", "")}`;
  }

  return `https://r.jina.ai/http://${cleanUrl}`;
}

function safeBuildReaderUrl(url) {
  try {
    return buildReaderUrl(url);
  } catch {
    return "";
  }
}

function parseListingsFromText({ text, source, country, query }) {
  if (source === "AutoScout24") {
    return parseAutoscoutListingsFromText({
      text,
      source,
      country,
      query,
    });
  }

  return parseGenericListingsFromText({
    text,
    source,
    country,
    query,
  });
}

function parseAutoscoutListingsFromText({ text, source, country, query }) {
  const lines = String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const listings = [];
  const queryBrand = detectBrand(query);
  const model = detectModel(query, query);

  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].startsWith("![Image")) {
      continue;
    }

    const block = lines.slice(index, index + 12);
    const blockText = block.join(" ");

    const price = extractPrice(blockText);
    const mileage = extractMileage(blockText);
    const registration = extractRegistration(blockText);
    const year = registration?.year || extractYear(blockText) || estimateYearFromPrice(price);
    const fuelType = detectFuelType(blockText);
    const power = extractPower(blockText);

    if (!price) {
      continue;
    }

    const title = buildAutoscoutTitle({
      query,
      fuelType,
      year,
      power,
    });

    listings.push({
      id: buildListingId({
        source,
        country,
        line: title,
        price,
        mileage: mileage || 65000,
        year,
      }),
      title,
      brand: queryBrand,
      model,
      price,
      km: mileage || 65000,
      mileage: mileage || 65000,
      year,
      country,
      fuelType,
      drivetrain: detectDrivetrain(blockText),
      bodyType: detectBodyType(`${blockText} ${query}`),
      performancePackage: detectPerformancePackage(blockText),
      electrified: isElectrified(blockText),
      marketMultiplier: estimateMarketMultiplier({
        price,
        mileage: mileage || 65000,
        year,
      }),
      source,
      url: "",
      isRealData: true,
      dataQuality: {
        hasPrice: Boolean(price),
        hasMileage: Boolean(mileage),
        hasYear: Boolean(year),
        estimatedMileage: !mileage,
        estimatedYear: !registration?.year,
        sourceFormat: "autoscout-r-jina",
      },
    });
  }

  return listings;
}

function parseGenericListingsFromText({ text, source, country, query }) {
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

    const windowText = lines.slice(index, index + 20).join(" ");
    const price = extractPrice(windowText);

    if (!price) {
      continue;
    }

    const realMileage = extractMileage(windowText);
    const realYear = extractYear(windowText);

    const mileage = realMileage || estimateMileageFromTitle(line);
    const year = realYear || estimateYearFromPrice(price);

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
      dataQuality: {
        hasPrice: Boolean(price),
        hasMileage: Boolean(realMileage),
        hasYear: Boolean(realYear),
        estimatedMileage: !realMileage,
        estimatedYear: !realYear,
        sourceFormat: "generic-r-jina",
      },
    });
  }

  return listings;
}

function buildAutoscoutTitle({ query, fuelType, year, power }) {
  const parts = [cleanText(query)];

  if (year) parts.push(String(year));
  if (fuelType) parts.push(fuelType);
  if (power) parts.push(power);

  return parts.join(" · ");
}

function extractRegistration(text) {
  const match = String(text).match(/\b(0[1-9]|1[0-2])\/(20\d{2})\b/);

  if (!match) return null;

  return {
    month: safeNumber(match[1]),
    year: safeNumber(match[2]),
  };
}

function extractPower(text) {
  const match = String(text).match(/(\d{2,4})\s?kW\s?\((\d{2,4})\s?hp\)/i);

  if (!match) return "";

  return `${safeNumber(match[1])} kW / ${safeNumber(match[2])} hp`;
}

function looksLikeVehicleTitle(line, query) {
  const text = normalize(line);
  const queryText = normalize(query);

  if (line.length < 8 || line.length > 160) return false;
  if (!queryText) return false;

  const blockedTerms = [
    "cookie",
    "privacy",
    "login",
    "register",
    "javascript",
    "imprint",
    "terms",
    "help",
    "newsletter",
  ];

  if (blockedTerms.some((term) => text.includes(term))) {
    return false;
  }

  const brand = detectBrand(queryText).toLowerCase();

  if (brand && text.includes(brand)) return true;

  return queryText
    .split(" ")
    .filter((part) => part.length >= 3)
    .some((part) => text.includes(part));
}

function extractPrice(text) {
  const patterns = [
    /€\s?([\d.,]{4,10})/i,
    /([\d.,]{4,10})\s?€/i,
    /EUR\s?([\d.,]{4,10})/i,
    /([\d.,]{4,10})\s?EUR/i,
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
    /([\d.,]{1,10})\s?km/i,
    /kilometerstand\s?([\d.,]{1,10})/i,
    /mileage\s?([\d.,]{1,10})/i,
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
  const match = String(text).match(
    /\b(2012|2013|2014|2015|2016|2017|2018|2019|2020|2021|2022|2023|2024|2025|2026)\b/
  );

  return match?.[1] ? safeNumber(match[1]) : 0;
}

function estimateMileageFromTitle(title) {
  const text = normalize(title);

  if (text.includes("new") || text.includes("nuevo") || text.includes("neuf")) {
    return 5000;
  }

  return 65000;
}

function estimateYearFromPrice(price) {
  if (price >= 70000) return 2023;
  if (price >= 50000) return 2022;
  if (price >= 35000) return 2021;
  if (price >= 20000) return 2019;

  return 2017;
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

  if (value.includes("electric/gasoline")) return "PHEV";
  if (value.includes("electric/diesel")) return "PHEV";
  if (value.includes("diesel") || value.includes("tdi") || value.includes("dci")) {
    return "Diesel";
  }

  if (
    value.includes("hybrid") ||
    value.includes("híbrido") ||
    value.includes("phev")
  ) {
    return "PHEV";
  }

  if (value.includes("electric") || value.includes("eléctrico")) {
    return "Electric";
  }

  if (value.includes("petrol") || value.includes("gasoline") || value.includes("gasolina") || value.includes("tsi")) {
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

  if (value.includes("suv") || value.includes("x5") || value.includes("q7") || value.includes("xc90")) {
    return "SUV";
  }

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
  const raw = String(value || "").trim();

  if (!raw) return 0;

  const normalized =
    raw.includes(",") && raw.includes(".")
      ? raw.replace(/\./g, "").replace(",", ".")
      : raw.replace(/,/g, "").replace(/\./g, "");

  const number = Number(normalized.replace(/[^\d.]/g, ""));

  return Number.isFinite(number) ? number : 0;
}

function cleanText(value) {
  return String(value || "").trim();
}

function normalize(value) {
  return cleanText(value).toLowerCase();
}