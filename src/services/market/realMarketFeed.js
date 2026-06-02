const REAL_FEED_TIMEOUT_MS = 20000;
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

  const allListings = [];
  const errors = [];
  const diagnostics = [];

  for (const link of searchLinks.slice(0, MAX_LINKS_TO_TRY)) {
    const startedAt = Date.now();

    try {
      const readerUrl = buildReaderUrl(link.url);
      const text = await fetchSearchText(link.url);

      const parsedListings = parseListingsFromText({
        text,
        source: link.source,
        country: link.country,
        query: scan.query,
        maxBudget: scan.maxBudget,
        semantic: scan.semantic,
      });

      diagnostics.push({
        source: link.source,
        country: link.country,
        status: parsedListings.length > 0 ? "success" : "no-results",
        originalUrl: link.url,
        readerUrl,
        textLength: text.length,
        textSample: text.slice(0, 1200),
        parsedCount: parsedListings.length,
        durationMs: Date.now() - startedAt,
        message:
          parsedListings.length > 0
            ? `${parsedListings.length} anuncios normalizados detectados.`
            : "Fetch correcto, pero el normalizador no encontró anuncios completos.",
      });

      allListings.push(...parsedListings);

      if (allListings.length >= maxListings) break;
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
        textSample: "",
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
  const timeout = window.setTimeout(
    () => controller.abort(),
    REAL_FEED_TIMEOUT_MS
  );

  try {
    const response = await fetch(buildReaderUrl(url), {
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

function parseListingsFromText({
  text,
  source,
  country,
  query,
  maxBudget,
  semantic,
}) {
  const normalizedSource = normalize(source);

  if (normalizedSource.includes("autoscout")) {
    return parseAutoscoutListingsFromText({
      text,
      source,
      country,
      query,
      maxBudget,
      semantic,
    });
  }

  return parseGenericListingsFromText({
    text,
    source,
    country,
    query,
    maxBudget,
    semantic,
  });
}

function parseAutoscoutListingsFromText({
  text,
  source,
  country,
  query,
  maxBudget,
  semantic,
}) {
  const blocks = splitAutoscoutTextIntoListingBlocks(text);
  const queryBrand = detectBrand(query);
  const queryModel = detectModel(query, query);
  const listings = [];

  blocks.forEach((block, index) => {
    const normalizedBlock = normalizeBlockLines(block);
    const blockText = normalizedBlock.join(" ");

    const price = extractPrice(blockText);
    const mileage = extractMileage(blockText);
    const registration = extractRegistration(blockText);
    const year = registration?.year || extractYear(blockText);
    const fuelType = detectFuelType(blockText);
    const powerKw = extractPowerKw(blockText);
    const power = extractPower(blockText);
    const imageUrl = extractFirstImageUrl(block.join("\n"));
    const sourceUrl = extractFirstUrl(blockText);

    if (!price || !mileage || !year) {
      return;
    }

    const identity = buildListingIdentityFromContext({
      block: normalizedBlock,
      query,
      queryBrand,
      queryModel,
      fuelType,
      year,
      power,
      index,
    });

    if (!identity.brand || !identity.model) {
      return;
    }

    if (isGenericOrDealerTitle(identity.title)) {
      return;
    }

    const validation = validateVehicleCompatibility({
      query,
      semantic,
      price,
      mileage,
      year,
      fuelType,
      powerKw,
      maxBudget,
    });

    if (!validation.isCompatible) {
      return;
    }

    listings.push({
      id: buildListingId({
        source,
        country,
        line: identity.title,
        price,
        mileage,
        year,
      }),
      title: identity.title,
      brand: identity.brand,
      model: identity.model,
      price,
      km: mileage,
      mileage,
      year,
      country,
      fuelType,
      drivetrain: detectDrivetrain(blockText),
      bodyType: detectBodyType(`${blockText} ${query}`),
      performancePackage: detectPerformancePackage(blockText),
      electrified: isElectrified(blockText),
      marketMultiplier: estimateMarketMultiplier({ price, mileage, year }),
      source,
      url: sourceUrl,
      imageUrl,
      isRealData: true,
      semanticScore: validation.score,
      semanticWarnings: validation.warnings,
      dataQuality: {
        hasPrice: true,
        hasMileage: true,
        hasYear: true,
        hasPower: Boolean(powerKw),
        estimatedMileage: false,
        estimatedYear: false,
        sourceFormat: "autoscout-r-jina-block-v2",
      },
      raw: {
        block: normalizedBlock,
      },
    });
  });

  return listings;
}

function splitAutoscoutTextIntoListingBlocks(text) {
  const lines = String(text || "").split("\n");
  const blocks = [];
  let currentBlock = [];

  lines.forEach((line) => {
    const cleanLine = String(line || "").trim();

    if (cleanLine.startsWith("![Image")) {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock);
      }

      currentBlock = [cleanLine];
      return;
    }

    if (currentBlock.length > 0) {
      currentBlock.push(cleanLine);
    }
  });

  if (currentBlock.length > 0) {
    blocks.push(currentBlock);
  }

  return blocks
    .map((block) => block.map((line) => String(line || "").trim()).filter(Boolean))
    .filter((block) => block.length >= 4)
    .filter((block) => isRealListingImageBlock(block));
}

function isRealListingImageBlock(block = []) {
  const firstLine = block[0] || "";

  if (!firstLine.startsWith("![Image")) return false;
  if (firstLine.includes("seal-images")) return false;
  if (!firstLine.includes("listing-images")) return false;

  const text = block.join(" ");

  return Boolean(extractPrice(text) && extractMileage(text));
}

function normalizeBlockLines(block = []) {
  return block
    .map((line) => cleanText(line))
    .filter(Boolean)
    .filter((line) => !isBlockedLine(line))
    .filter((line) => !line.startsWith("![Image"))
    .filter((line) => !line.includes("listing-images"))
    .filter((line) => !line.includes("seal-images"));
}

function buildListingIdentityFromContext({
  block,
  query,
  queryBrand,
  queryModel,
  fuelType,
  year,
  power,
  index,
}) {
  const brandFromBlock = detectBrand(block.join(" "));
  const modelFromBlock = detectModel(block.join(" "), query);

  const brand = queryBrand || brandFromBlock;
  const model = queryModel || modelFromBlock;

  const titleCandidate = findBestTitleLine({
    block,
    brand,
    model,
    query,
  });

  const title =
    titleCandidate ||
    buildAutoscoutTitle({
      brand,
      model,
      fuelType,
      year,
      power,
      index,
    });

  return {
    brand,
    model,
    title,
  };
}

function findBestTitleLine({ block, brand, model, query }) {
  const candidates = block.filter((line) =>
    looksLikePotentialListingTitle({ line, brand, model, query })
  );

  const withBrandAndModel = candidates.find((line) => {
    const text = normalize(line);
    return normalize(brand) && normalize(model)
      ? text.includes(normalize(brand)) && text.includes(normalize(model))
      : false;
  });

  if (withBrandAndModel) return cleanTitle(withBrandAndModel);

  const withModel = candidates.find((line) => {
    const text = normalize(line);
    return normalize(model) ? text.includes(normalize(model)) : false;
  });

  if (withModel) return cleanTitle(withModel);

  return "";
}

function looksLikePotentialListingTitle({ line, brand, model, query }) {
  const text = normalize(line);

  if (!line || line.length < 5 || line.length > 160) return false;
  if (extractPrice(line)) return false;
  if (extractMileage(line)) return false;
  if (extractYear(line)) return false;
  if (extractPowerKw(line)) return false;
  if (detectFuelType(line)) return false;
  if (isBlockedLine(line)) return false;
  if (isEquipmentLine(line)) return false;
  if (isDealerLine(line)) return false;
  if (isGenericOrDealerTitle(line)) return false;
  if (text.includes("http")) return false;

  const normalizedBrand = normalize(brand);
  const normalizedModel = normalize(model);
  const normalizedQuery = normalize(query);

  if (normalizedBrand && text.includes(normalizedBrand)) return true;
  if (normalizedModel && text.includes(normalizedModel)) return true;

  return normalizedQuery
    .split(" ")
    .filter((part) => part.length >= 3)
    .some((part) => text.includes(part));
}

function buildAutoscoutTitle({ brand, model, fuelType, year, power, index }) {
  const parts = [brand, model].filter(Boolean);

  if (year) parts.push(String(year));
  if (fuelType) parts.push(fuelType);
  if (power) parts.push(power);

  if (parts.length === 0) {
    return `Vehículo detectado ${index + 1}`;
  }

  return parts.join(" · ");
}

function parseGenericListingsFromText({
  text,
  source,
  country,
  query,
  maxBudget,
  semantic,
}) {
  const lines = toUsefulLines(text);
  const listings = [];
  const queryBrand = detectBrand(query);

  for (let index = 0; index < lines.length; index += 1) {
    const line = cleanText(lines[index]);

    if (!looksLikeVehicleTitle(line, query)) {
      continue;
    }

    const blockText = lines.slice(index, index + 20).join(" ");
    const price = extractPrice(blockText);
    const mileage = extractMileage(blockText);
    const year = extractYear(blockText);
    const powerKw = extractPowerKw(blockText);
    const fuelType = detectFuelType(blockText);

    if (!price || !mileage || !year) {
      continue;
    }

    const validation = validateVehicleCompatibility({
      query,
      semantic,
      price,
      mileage,
      year,
      fuelType,
      powerKw,
      maxBudget,
    });

    if (!validation.isCompatible) {
      continue;
    }

    listings.push({
      id: buildListingId({ source, country, line, price, mileage, year }),
      title: cleanTitle(line),
      brand: detectBrand(line) || queryBrand,
      model: detectModel(line, query),
      price,
      km: mileage,
      mileage,
      year,
      country,
      fuelType,
      drivetrain: detectDrivetrain(blockText),
      bodyType: detectBodyType(blockText),
      performancePackage: detectPerformancePackage(blockText),
      electrified: isElectrified(blockText),
      marketMultiplier: estimateMarketMultiplier({ price, mileage, year }),
      source,
      url: extractFirstUrl(blockText),
      isRealData: true,
      semanticScore: validation.score,
      semanticWarnings: validation.warnings,
      dataQuality: {
        hasPrice: true,
        hasMileage: true,
        hasYear: true,
        hasPower: Boolean(powerKw),
        estimatedMileage: false,
        estimatedYear: false,
        sourceFormat: "generic-r-jina",
      },
    });
  }

  return listings;
}

function validateVehicleCompatibility({
  query,
  semantic,
  price,
  mileage,
  year,
  fuelType,
  powerKw,
  maxBudget,
}) {
  const text = normalize(query);
  const warnings = [];
  const budget = Number(maxBudget || 0);

  if (budget > 0 && price > budget) {
    return {
      isCompatible: false,
      score: 0,
      warnings: [`Precio ${price} por encima del presupuesto ${budget}.`],
    };
  }

  let score = 40;

  if (detectBrand(text)) score += 20;

  const targetModel = detectModel(text, text);
  if (targetModel && text.includes(normalize(targetModel))) score += 20;

  if (semantic?.isPremium) score += 5;
  if (semantic?.isSuv) score += 5;
  if (semantic?.isPhev) score += 5;

  if (price > 0) score += 5;
  if (mileage > 0) score += 5;
  if (year >= 2012) score += 5;

  if (mileage > 250000) {
    warnings.push("Kilometraje alto.");
    score -= 20;
  }

  if (
    text.includes("45e") ||
    text.includes("50e") ||
    text.includes("300de") ||
    text.includes("tfsie") ||
    text.includes("tfsi e")
  ) {
    if (fuelType === "PHEV") {
      score += 20;
    } else {
      warnings.push(`Motorización PHEV no confirmada: ${fuelType || "desconocida"}.`);
      score -= 30;
    }
  }

  return {
    isCompatible: clamp(score, 0, 100) >= 55,
    score: clamp(score, 0, 100),
    warnings,
  };
}

function toUsefulLines(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !isBlockedLine(line));
}

function isBlockedLine(line) {
  const text = normalize(line);

  const blocked = [
    "cookie",
    "privacy",
    "login",
    "register",
    "javascript",
    "imprint",
    "terms",
    "newsletter",
    "advertising",
    "consent",
  ];

  return blocked.some((item) => text.includes(item));
}

function isEquipmentLine(line) {
  const text = normalize(line);

  const equipmentTerms = [
    "airbag",
    "airbags",
    "abs",
    "bluetooth",
    "sensor",
    "llantas",
    "climatizador",
    "cierre centralizado",
    "direccion asistida",
    "camara",
    "control de traccion",
    "volante multifuncion",
    "ventanas tintadas",
    "faros",
    "asistente",
    "ordenador",
    "esp",
    "aire acondicionado",
  ];

  return equipmentTerms.some((term) => text.includes(term));
}

function isDealerLine(line) {
  const text = normalize(line);

  const dealerTerms = [
    "concesionario",
    "vendedor",
    "servicepartner",
    "vertragshandler",
    "vehiculos de ocasion",
    "financiacion",
    "stock fuera",
    "garantia",
    "dto",
    "oferta",
    "precio justo",
    "super oferta",
    "sin comparacion",
  ];

  return dealerTerms.some((term) => text.includes(term));
}

function isGenericOrDealerTitle(title) {
  const text = normalize(title);

  if (!text) return true;

  const genericTerms = [
    "title:",
    "markdown content",
    "anuncios de",
    "autoscout24",
    "url source",
    "image",
    "precio justo",
    "super oferta",
    "sin comparacion",
    "stock fuera",
    "financiacion",
  ];

  return genericTerms.some((term) => text.includes(term));
}

function cleanTitle(value) {
  return cleanText(value)
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
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
  const match = String(text).match(/(\d{2,4})\s?kW\s?\((\d{2,4})\s?(hp|cv|ps)\)/i);

  if (!match) return "";

  return `${safeNumber(match[1])} kW / ${safeNumber(match[2])} hp`;
}

function extractPowerKw(text) {
  const match = String(text).match(/(\d{2,4})\s?kW/i);

  return match?.[1] ? safeNumber(match[1]) : 0;
}

function extractFirstUrl(text) {
  const match = String(text).match(/https?:\/\/[^\s)]+/i);
  return match?.[0] || "";
}

function extractFirstImageUrl(text) {
  const match = String(text).match(/!\[Image[^\]]*\]\(([^)]+)\)/i);
  return match?.[1] || "";
}

function looksLikeVehicleTitle(line, query) {
  const text = normalize(line);
  const queryText = normalize(query);

  if (line.length < 4 || line.length > 160) return false;
  if (!queryText) return false;
  if (isBlockedLine(line)) return false;
  if (isEquipmentLine(line)) return false;
  if (isDealerLine(line)) return false;
  if (isGenericOrDealerTitle(line)) return false;

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
    if (match?.[1]) return safeNumber(match[1]);
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
    if (match?.[1]) return safeNumber(match[1]);
  }

  return 0;
}

function extractYear(text) {
  const currentYear = new Date().getFullYear();
  const earliestYear = 1990;
  const match = String(text).match(/\b(19\d{2}|20\d{2})\b/);
  const year = match?.[0] ? safeNumber(match[0]) : 0;

  return year >= earliestYear && year <= currentYear + 1 ? year : 0;
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
  if (text.includes("mini")) return "MINI";
  if (text.includes("hyundai")) return "Hyundai";
  if (text.includes("kia")) return "Kia";
  if (text.includes("nissan")) return "Nissan";

  return "";
}

function detectModel(title, query) {
  const text = normalize(`${title} ${query}`);

  const models = [
    "a1",
    "a3",
    "a4",
    "a5",
    "a6",
    "a7",
    "q2",
    "q3",
    "q5",
    "q7",
    "q8",
    "x1",
    "x3",
    "x5",
    "x6",
    "serie 1",
    "serie 3",
    "serie 5",
    "panamera",
    "boxster",
    "cayman",
    "macan",
    "cayenne",
    "911",
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
    "5008",
    "golf",
    "tiguan",
    "passat",
    "polo",
    "octavia",
    "fabia",
    "leon",
    "ibiza",
    "clio",
    "megane",
    "tucson",
    "sportage",
    "qashqai",
  ];

  const detected = models.find((model) => text.includes(model));

  if (detected) return detected;

  const cleanedQuery = cleanText(query);
  const normalizedQuery = normalize(cleanedQuery);

  if (
    normalizedQuery &&
    !["audi", "bmw", "porsche", "volvo", "mercedes", "volkswagen"].includes(
      normalizedQuery
    )
  ) {
    return cleanedQuery;
  }

  return "";
}

function detectFuelType(text) {
  const value = normalize(text);

  if (value.includes("electric/gasoline")) return "PHEV";
  if (value.includes("electric/diesel")) return "PHEV";
  if (value.includes("plug-in") || value.includes("plug in")) return "PHEV";
  if (value.includes("hybrid") || value.includes("híbrido") || value.includes("phev")) return "PHEV";
  if (value.includes("diesel") || value.includes("tdi") || value.includes("dci")) return "Diesel";
  if (value.includes("electric") || value.includes("eléctrico")) return "Electric";
  if (value.includes("petrol") || value.includes("gasoline") || value.includes("gasolina") || value.includes("tsi")) return "Gasolina";

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
    const key = [
      normalize(listing.brand),
      normalize(listing.model),
      listing.price,
      listing.km,
      listing.year,
      normalize(listing.fuelType),
    ].join("-");

    if (seen.has(key)) return false;

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

function clamp(value, min, max) {
  return Math.min(Math.max(Math.round(Number(value || 0)), min), max);
}

function cleanText(value) {
  return String(value || "").trim();
}

function normalize(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}