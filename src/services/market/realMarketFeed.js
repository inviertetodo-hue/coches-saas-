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

      const { listings: parsedListings, rejectionLog } = parseListingsFromText({
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
        rejectionLog,
        message:
          parsedListings.length > 0
            ? `${parsedListings.length} anuncios normalizados detectados.`
            : buildNoResultsMessage(rejectionLog),
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
        rejectionLog: null,
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

function buildNoResultsMessage(rejectionLog) {
  if (!rejectionLog) return "Fetch correcto, pero el normalizador no encontró anuncios completos.";

  const parts = [];

  if (rejectionLog.totalBlocks === 0) {
    parts.push("No se detectaron bloques de anuncios en el texto.");
    parts.push("Posible causa: AutoScout cambió el formato de imágenes o r.jina.ai devolvió texto sin bloques.");
  } else {
    parts.push(`${rejectionLog.totalBlocks} bloques detectados.`);
    if (rejectionLog.noData > 0) parts.push(`${rejectionLog.noData} sin precio/km/año.`);
    if (rejectionLog.incompatible > 0) parts.push(`${rejectionLog.incompatible} incompatibles con la búsqueda.`);
    if (rejectionLog.genericTitle > 0) parts.push(`${rejectionLog.genericTitle} con título genérico/dealer.`);
  }

  return parts.join(" ");
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

  if (cleanUrl.startsWith("https://") || cleanUrl.startsWith("http://")) {
    return `https://r.jina.ai/${cleanUrl}`;
  }

  return `https://r.jina.ai/https://${cleanUrl}`;
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
  const queryModel = detectModelFromQuery(query);
  const listings = [];

  const rejectionLog = {
    totalBlocks: blocks.length,
    noData: 0,
    incompatible: 0,
    genericTitle: 0,
    accepted: 0,
    incompatibleReasons: [],
  };

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
      rejectionLog.noData += 1;
      return;
    }

    const brandFromBlock = detectBrand(blockText);
    const modelFromBlock = detectModelFromText(blockText, query);

    const brand = brandFromBlock || queryBrand;
    const model = modelFromBlock || queryModel;

    const titleFromBlock = findBestTitleLine({ block: normalizedBlock, brand, model, query });
    const title =
      titleFromBlock ||
      buildAutoscoutTitle({ brand, model, fuelType, year, power, index });

    if (isGenericOrDealerTitle(title)) {
      rejectionLog.genericTitle += 1;
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
      rejectionLog.incompatible += 1;
      if (validation.rejectionReason) {
        rejectionLog.incompatibleReasons.push(validation.rejectionReason);
      }
      return;
    }

    rejectionLog.accepted += 1;

    listings.push({
      id: buildListingId({
        source,
        country,
        line: title,
        price,
        mileage,
        year,
      }),
      title,
      brand,
      model,
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
      identitySource: brandFromBlock && modelFromBlock ? "block" : "query-fallback",
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

  return { listings, rejectionLog };
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

  const lowerFirst = firstLine.toLowerCase();
  if (lowerFirst.includes("seal-images")) return false;
  if (lowerFirst.includes("logo")) return false;
  if (lowerFirst.includes("banner")) return false;

  const blockText = block.join(" ");
  return Boolean(extractPrice(blockText) && extractMileage(blockText));
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

  const withBrand = candidates.find((line) => {
    const text = normalize(line);
    return normalize(brand) ? text.includes(normalize(brand)) : false;
  });

  if (withBrand) return cleanTitle(withBrand);

  return "";
}

function looksLikePotentialListingTitle({ line, brand, model, query }) {
  const text = normalize(line);

  if (!line || line.length < 4 || line.length > 200) return false;
  if (isBlockedLine(line)) return false;
  if (isDealerLine(line)) return false;
  if (isGenericOrDealerTitle(line)) return false;
  if (text.includes("http")) return false;

  const normalizedBrand = normalize(brand);
  const normalizedModel = normalize(model);
  const normalizedQuery = normalize(query);

  if (normalizedBrand && text.includes(normalizedBrand)) return true;
  if (normalizedModel && normalizedModel.length >= 2 && text.includes(normalizedModel)) return true;

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
  const rejectionLog = {
    totalBlocks: 0,
    noData: 0,
    incompatible: 0,
    genericTitle: 0,
    accepted: 0,
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = cleanText(lines[index]);

    if (!looksLikeVehicleTitle(line, query)) {
      continue;
    }

    rejectionLog.totalBlocks += 1;

    const blockText = lines.slice(index, index + 20).join(" ");
    const price = extractPrice(blockText);
    const mileage = extractMileage(blockText);
    const year = extractYear(blockText);
    const powerKw = extractPowerKw(blockText);
    const fuelType = detectFuelType(blockText);

    if (!price || !mileage || !year) {
      rejectionLog.noData += 1;
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
      rejectionLog.incompatible += 1;
      continue;
    }

    rejectionLog.accepted += 1;

    const detectedBrand = detectBrand(line) || detectBrand(blockText) || queryBrand;
    const detectedModel =
      detectModelFromTitle(line, detectedBrand) ||
      detectModelFromText(blockText, query) ||
      detectModelFromQuery(query);

    listings.push({
      id: buildListingId({ source, country, line, price, mileage, year }),
      title: cleanTitle(line),
      brand: detectedBrand,
      model: detectedModel,
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
      identitySource: detectedBrand && detectedModel ? "block" : "query-fallback",
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

  return { listings, rejectionLog };
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
  const rejectionReasons = [];
  const budget = Number(maxBudget || 0);

  if (budget > 0 && price > budget) {
    return {
      isCompatible: false,
      score: 0,
      warnings: [`Precio ${price} > presupuesto ${budget}.`],
      rejectionReason: `precio_sobre_presupuesto: ${price} > ${budget}`,
    };
  }

  let score = 40;

  if (detectBrand(text)) score += 20;

  const targetModel = detectModelFromQuery(text);
  if (targetModel && hasModelToken(text, targetModel)) score += 20;

  if (semantic?.isPremium) score += 5;
  if (semantic?.isSuv) score += 5;
  if (semantic?.isPhev) score += 5;

  if (price > 0) score += 5;
  if (mileage > 0) score += 5;
  if (year >= 2012) score += 5;

  if (mileage > 250000) {
    warnings.push("Kilometraje alto.");
    rejectionReasons.push(`km_alto: ${mileage}`);
    score -= 20;
  }

  if (
    text.includes("45e") ||
    text.includes("50e") ||
    text.includes("30e") ||
    text.includes("300de") ||
    text.includes("tfsie") ||
    text.includes("tfsi e")
  ) {
    if (fuelType === "PHEV") {
      score += 20;
    } else {
      warnings.push(`PHEV no confirmado: fuelType="${fuelType || "vacío"}".`);
      rejectionReasons.push(`fuel_no_phev: detectado="${fuelType || "vacío"}"`);
      score -= 30;
    }
  }

  const finalScore = clamp(score, 0, 100);
  const isCompatible = finalScore >= 55;

  if (!isCompatible && rejectionReasons.length === 0) {
    rejectionReasons.push(`score_bajo: ${finalScore}/100`);
  }

  return {
    isCompatible,
    score: finalScore,
    warnings,
    rejectionReason: rejectionReasons.join("; ") || null,
  };
}

function detectModelFromQuery(query) {
  const text = normalizeForModel(query);

  const variantPatterns = [
    { pattern: /\bx5\s*xdrive\s*45e\b|\bx5\s*45e\b/, result: "X5 xDrive45e" },
    { pattern: /\bx5\s*xdrive\s*30e\b|\bx5\s*30e\b/, result: "X5 xDrive30e" },
    { pattern: /\bx5\s*xdrive\s*50e\b|\bx5\s*50e\b/, result: "X5 xDrive50e" },
    { pattern: /\bx3\s*xdrive\s*30e\b|\bx3\s*30e\b/, result: "X3 xDrive30e" },
    { pattern: /\bq7\s*tfsi\s*e\b|\bq7\s*tfsie\b/, result: "Q7 TFSI e" },
    { pattern: /\bglc\s*300\s*de\b/, result: "GLC 300de" },
    { pattern: /\bglc\s*300\s*e\b/, result: "GLC 300e" },
    { pattern: /\bserie\s*1\b/, result: "Serie 1" },
    { pattern: /\bserie\s*2\b/, result: "Serie 2" },
    { pattern: /\bserie\s*3\b/, result: "Serie 3" },
    { pattern: /\bserie\s*4\b/, result: "Serie 4" },
    { pattern: /\bserie\s*5\b/, result: "Serie 5" },
    { pattern: /\bserie\s*6\b/, result: "Serie 6" },
    { pattern: /\bserie\s*7\b/, result: "Serie 7" },
  ];

  for (const { pattern, result } of variantPatterns) {
    if (pattern.test(text)) return result;
  }

  const detected = findModelInText(text, detectBrand(query));
  if (detected) return detected;

  const cleanedQuery = cleanText(query);
  const onlyBrand = [
    "audi",
    "bmw",
    "porsche",
    "volvo",
    "mercedes",
    "volkswagen",
    "renault",
    "peugeot",
    "skoda",
    "seat",
    "toyota",
    "hyundai",
    "kia",
    "nissan",
    "ford",
    "opel",
  ].includes(normalize(cleanedQuery));

  if (!onlyBrand && cleanedQuery) return cleanedQuery;

  return "";
}

function detectModelFromText(text, query) {
  const brandFromText = detectBrand(text);
  const brandFromQuery = detectBrand(query);
  const brand = brandFromText || brandFromQuery;

  const titleModel = detectModelFromTitle(text, brand);
  if (titleModel) return titleModel;

  const combined = normalizeForModel(`${text} ${query}`);

  const variantPatterns = [
    { pattern: /\bx5\s*xdrive\s*45e\b|\bx5\s*45e\b/, result: "X5 xDrive45e" },
    { pattern: /\bx5\s*xdrive\s*30e\b|\bx5\s*30e\b/, result: "X5 xDrive30e" },
    { pattern: /\bx5\s*xdrive\s*50e\b|\bx5\s*50e\b/, result: "X5 xDrive50e" },
    { pattern: /\bx3\s*xdrive\s*30e\b|\bx3\s*30e\b/, result: "X3 xDrive30e" },
    { pattern: /\bq7\s*tfsi\s*e\b|\bq7\s*tfsie\b/, result: "Q7 TFSI e" },
    { pattern: /\bglc\s*300\s*de\b/, result: "GLC 300de" },
    { pattern: /\bglc\s*300\s*e\b/, result: "GLC 300e" },
  ];

  for (const { pattern, result } of variantPatterns) {
    if (pattern.test(combined)) return result;
  }

  return findModelInText(combined, brand);
}

function detectModelFromTitle(title, brand = "") {
  const text = normalizeForModel(title);
  const normalizedBrand = normalizeForModel(brand);

  if (!text) return "";

  if (normalizedBrand === "volkswagen" || text.includes("volkswagen") || text.includes(" vw ")) {
    if (hasAnyModelToken(text, ["t roc", "troc"])) return "T-Roc";
    if (hasAnyModelToken(text, ["t cross", "tcross"])) return "T-Cross";
  }

  return findModelInText(text, brand);
}

function findModelInText(text, brand = "") {
  const normalizedText = normalizeForModel(text);
  const normalizedBrand = normalizeForModel(brand);

  const catalog = [
    { brand: "BMW", models: [
      ["X7", ["x7"]],
      ["X6", ["x6"]],
      ["X5", ["x5"]],
      ["X4", ["x4"]],
      ["X3", ["x3"]],
      ["X2", ["x2"]],
      ["X1", ["x1"]],
      ["Serie 7", ["serie 7", "7 series"]],
      ["Serie 6", ["serie 6", "6 series"]],
      ["Serie 5", ["serie 5", "5 series"]],
      ["Serie 4", ["serie 4", "4 series"]],
      ["Serie 3", ["serie 3", "3 series"]],
      ["Serie 2", ["serie 2", "2 series"]],
      ["Serie 1", ["serie 1", "1 series"]],
    ] },
    { brand: "Audi", models: [
      ["Q8", ["q8"]],
      ["Q7", ["q7"]],
      ["Q5", ["q5"]],
      ["Q3", ["q3"]],
      ["Q2", ["q2"]],
      ["A8", ["a8"]],
      ["A7", ["a7"]],
      ["A6", ["a6"]],
      ["A5", ["a5"]],
      ["A4", ["a4"]],
      ["A3", ["a3"]],
      ["A1", ["a1"]],
    ] },
    { brand: "Mercedes-Benz", models: [
      ["GLS", ["gls"]],
      ["GLE", ["gle"]],
      ["GLC", ["glc"]],
      ["GLB", ["glb"]],
      ["GLA", ["gla"]],
      ["Clase E", ["clase e", "e klasse", "e class"]],
      ["Clase C", ["clase c", "c klasse", "c class"]],
      ["Clase A", ["clase a", "a klasse", "a class"]],
    ] },
    { brand: "Volvo", models: [
      ["XC90", ["xc90"]],
      ["XC60", ["xc60"]],
      ["XC40", ["xc40"]],
      ["V90", ["v90"]],
      ["V60", ["v60"]],
      ["S90", ["s90"]],
      ["S60", ["s60"]],
    ] },
    { brand: "Porsche", models: [
      ["Panamera", ["panamera"]],
      ["Cayenne", ["cayenne"]],
      ["Macan", ["macan"]],
      ["Taycan", ["taycan"]],
      ["911", ["911"]],
    ] },
    { brand: "Volkswagen", models: [
      ["T-Roc", ["t roc", "troc"]],
      ["T-Cross", ["t cross", "tcross"]],
      ["Touareg", ["touareg"]],
      ["Tiguan", ["tiguan"]],
      ["Passat", ["passat"]],
      ["Arteon", ["arteon"]],
      ["Golf", ["golf"]],
      ["Polo", ["polo"]],
    ] },
    { brand: "Skoda", models: [
      ["Kodiaq", ["kodiaq"]],
      ["Octavia", ["octavia"]],
      ["Superb", ["superb"]],
      ["Fabia", ["fabia"]],
      ["Kamiq", ["kamiq"]],
      ["Karoq", ["karoq"]],
    ] },
    { brand: "SEAT", models: [
      ["Tarraco", ["tarraco"]],
      ["Ateca", ["ateca"]],
      ["León", ["leon"]],
      ["Ibiza", ["ibiza"]],
      ["Arona", ["arona"]],
    ] },
    { brand: "Renault", models: [
      ["Koleos", ["koleos"]],
      ["Kadjar", ["kadjar"]],
      ["Megane", ["megane"]],
      ["Clio", ["clio"]],
      ["Captur", ["captur"]],
    ] },
    { brand: "Peugeot", models: [
      ["5008", ["5008"]],
      ["3008", ["3008"]],
      ["2008", ["2008"]],
      ["308", ["308"]],
      ["208", ["208"]],
    ] },
    { brand: "Hyundai", models: [
      ["Santa Fe", ["santa fe"]],
      ["Tucson", ["tucson"]],
      ["Kona", ["kona"]],
      ["i30", ["i30"]],
    ] },
    { brand: "Kia", models: [
      ["Sportage", ["sportage"]],
      ["Sorento", ["sorento"]],
      ["Niro", ["niro"]],
      ["Ceed", ["ceed"]],
    ] },
    { brand: "Nissan", models: [
      ["Qashqai", ["qashqai"]],
      ["Juke", ["juke"]],
      ["X-Trail", ["x trail", "xtrail"]],
    ] },
    { brand: "Ford", models: [
      ["Kuga", ["kuga"]],
      ["Focus", ["focus"]],
      ["Fiesta", ["fiesta"]],
      ["Puma", ["puma"]],
    ] },
    { brand: "Opel", models: [
      ["Grandland", ["grandland"]],
      ["Astra", ["astra"]],
      ["Corsa", ["corsa"]],
      ["Mokka", ["mokka"]],
    ] },
  ];

  const brandScopedCatalog = normalizedBrand
    ? catalog.filter((entry) => normalizeForModel(entry.brand) === normalizedBrand)
    : catalog;

  for (const entry of brandScopedCatalog) {
    for (const [modelName, aliases] of entry.models) {
      if (hasAnyModelToken(normalizedText, aliases)) return modelName;
    }
  }

  if (!normalizedBrand) {
    for (const entry of catalog) {
      for (const [modelName, aliases] of entry.models) {
        if (hasAnyModelToken(normalizedText, aliases)) return modelName;
      }
    }
  }

  return "";
}

function hasModelToken(text, model) {
  return hasAnyModelToken(normalizeForModel(text), [model]);
}

function hasAnyModelToken(text, aliases = []) {
  const normalizedText = ` ${normalizeForModel(text)} `;

  return aliases.some((alias) => {
    const normalizedAlias = normalizeForModel(alias);

    if (!normalizedAlias) return false;

    const safeAlias = normalizedAlias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(^|\\s)${safeAlias}(\\s|$)`, "i");

    return pattern.test(normalizedText);
  });
}

function normalizeForModel(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectModel(title, query) {
  return detectModelFromText(title, query) || detectModelFromQuery(query);
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
    .replace(/^#+\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractRegistration(text) {
  const match = String(text).match(/\b(0[1-9]|1[0-2])[-/](20\d{2})\b/);

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

  if (line.length < 4 || line.length > 200) return false;
  if (isBlockedLine(line)) return false;
  if (isEquipmentLine(line)) return false;
  if (isDealerLine(line)) return false;
  if (isGenericOrDealerTitle(line)) return false;

  const brandFromLine = detectBrand(line);
  const brandFromQuery = detectBrand(queryText);

  if (brandFromLine) return true;
  if (brandFromQuery && text.includes(normalize(brandFromQuery))) return true;

  if (!queryText) {
    return Boolean(detectBrand(line) && detectModelFromTitle(line, detectBrand(line)));
  }

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
      const price = safeNumber(match[1]);

      if (price >= 1000 && price <= 500000) return price;
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
  if (text.includes("ford")) return "Ford";
  if (text.includes("opel")) return "Opel";
  if (text.includes("citroen") || text.includes("citroën")) return "Citroën";
  if (text.includes("fiat")) return "Fiat";
  if (text.includes("alfa romeo") || text.includes("alfaromeo")) return "Alfa Romeo";
  if (text.includes("mazda")) return "Mazda";
  if (text.includes("honda")) return "Honda";
  if (text.includes("subaru")) return "Subaru";
  if (text.includes("mitsubishi")) return "Mitsubishi";
  if (text.includes("lexus")) return "Lexus";
  if (text.includes("land rover") || text.includes("landrover")) return "Land Rover";
  if (text.includes("jaguar")) return "Jaguar";
  if (text.includes("tesla")) return "Tesla";

  return "";
}

function detectFuelType(text) {
  const value = normalize(text);

  if (value.includes("elektro/benzin")) return "PHEV";
  if (value.includes("elektro/diesel")) return "PHEV";
  if (value.includes("electric/gasoline")) return "PHEV";
  if (value.includes("electric/diesel")) return "PHEV";
  if (value.includes("plug-in") || value.includes("plug in")) return "PHEV";
  if (value.includes("phev")) return "PHEV";
  if (value.includes("hybrid") || value.includes("hibrid")) return "PHEV";

  if (value.includes("diesel") || value.includes("tdi") || value.includes("dci")) return "Diesel";

  if (value.includes("elektro") || value.includes("electric") || value.includes("electrico")) return "Electric";

  if (value.includes("benzin") || value.includes("petrol") || value.includes("gasoline") || value.includes("gasolina") || value.includes("tsi")) return "Gasolina";

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