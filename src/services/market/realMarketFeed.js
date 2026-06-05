import { VEHICLE_CATALOG } from "../vehicleCatalog";

const REAL_FEED_TIMEOUT_MS = 7000;
const MAX_LINKS_TO_TRY = 3;

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
  const allRecoverableListings = [];
  const errors = [];
  const diagnostics = [];

  for (const link of searchLinks.slice(0, MAX_LINKS_TO_TRY)) {
    const startedAt = Date.now();

    try {
      const readerUrl = buildReaderUrl(link.url);
      const text = await fetchSearchText(link.url);

      const { listings: parsedListings, recoverableListings = [], rejectionLog } = parseListingsFromText({
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
        rejectionSummary: buildRejectionSummary(rejectionLog),
        healthMetrics: buildFeedHealthMetrics(rejectionLog),
        nearMissSummary: buildNearMissSummary(rejectionLog),
        message:
          parsedListings.length > 0
            ? `${parsedListings.length} anuncios normalizados detectados.`
            : buildNoResultsMessage(rejectionLog),
      });

      allListings.push(...parsedListings);
      allRecoverableListings.push(...recoverableListings);

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
  const recoveryQueue = dedupeListings(allRecoverableListings).slice(0, maxListings);

  return {
    mode: listings.length > 0 ? "real-feed" : "real-feed-failed",
    listings,
    recoveryQueue,
    recoveryQueueTotal: recoveryQueue.length,
    errors,
    diagnostics,
  };
}

function buildNearMissSummary(rejectionLog) {
  const reasons = rejectionLog?.incompatibleReasons || [];

  const summary = {
    budgetNearMiss: 0,
    scoreNearMiss: 0,
    mileageNearMiss: 0,
  };

  reasons.forEach((reason) => {
    const text = String(reason || "");

    if (text.startsWith("precio_sobre_presupuesto")) {
      const match = text.match(/precio_sobre_presupuesto:\s*(\d+)\s*>\s*(\d+)/);
      const price = Number(match?.[1] || 0);
      const budget = Number(match?.[2] || 0);

      if (price > 0 && budget > 0 && price <= budget * 1.1) {
        summary.budgetNearMiss += 1;
      }
    }

    if (text.startsWith("score_bajo")) {
      const match = text.match(/score_bajo:\s*(\d+)\/100/);
      const score = Number(match?.[1] || 0);

      if (score >= 45 && score < 55) {
        summary.scoreNearMiss += 1;
      }
    }

    if (text.startsWith("km_alto")) {
      const match = text.match(/km_alto:\s*(\d+)/);
      const mileage = Number(match?.[1] || 0);

      if (mileage > 250000 && mileage <= 287500) {
        summary.mileageNearMiss += 1;
      }
    }
  });

  summary.total =
    summary.budgetNearMiss + summary.scoreNearMiss + summary.mileageNearMiss;

  return summary;
}

function buildFeedHealthMetrics(rejectionLog) {
  const totalBlocks = Number(rejectionLog?.totalBlocks || 0);
  const accepted = Number(rejectionLog?.accepted || 0);
  const noData = Number(rejectionLog?.noData || 0);
  const incompatible = Number(rejectionLog?.incompatible || 0);
  const genericTitle = Number(rejectionLog?.genericTitle || 0);
  const rejected = noData + incompatible + genericTitle;

  const acceptanceRate =
    totalBlocks > 0 ? Math.round((accepted / totalBlocks) * 100) : 0;

  const rejectionRate =
    totalBlocks > 0 ? Math.round((rejected / totalBlocks) * 100) : 0;

  const rejectionSummary = buildRejectionSummary(rejectionLog);
  const [topBlockingFilter, topBlockingCount] =
    Object.entries(rejectionSummary).sort((a, b) => b[1] - a[1])[0] || [];

  return {
    totalBlocks,
    accepted,
    rejected,
    noData,
    incompatible,
    genericTitle,
    acceptanceRate,
    rejectionRate,
    topBlockingFilter: topBlockingFilter || "",
    topBlockingCount: topBlockingCount || 0,
  };
}

function buildRejectionSummary(rejectionLog) {
  const summary = {};

  const reasons = rejectionLog?.incompatibleReasons || [];

  reasons.forEach((reason) => {
    const key = String(reason).split(":")[0].trim();

    summary[key] = (summary[key] || 0) + 1;
  });

  return summary;
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

    const summary = buildRejectionSummary(rejectionLog);

    const topReasons = Object.entries(summary)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (topReasons.length > 0) {
      parts.push(
        "Motivos principales: " +
          topReasons
            .map(([reason, count]) => `${reason} (${count})`)
            .join(", ")
      );
    }
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

  // r.jina.ai acepta la URL completa incluyendo el esquema original.
  // No degradar https:// a http:// — AutoScout y otros portales redirigen o bloquean http.
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

  if (normalizedSource.includes("mobile")) {
    return parseMobileDeListingsFromText({
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

// ---------------------------------------------------------------------------
// Parser específico para mobile.de (vía r.jina.ai)
// El texto de mobile.de via jina viene en bloques separados por líneas en blanco.
// Formato típico por anuncio:
//   Audi A3 Sportback 1.4 TSI Navi/Xenon
//   150 PS | Benzin | 05/2017 | 57.070 km
//   14.650 €
//   Händler · Goslar · ohne Unfallschaden
// ---------------------------------------------------------------------------

function parseMobileDeListingsFromText({
  text,
  source,
  country,
  query,
  maxBudget,
  semantic,
}) {
  const blocks = splitMobileDeTextIntoBlocks(text);
  const queryBrand = detectBrand(query);
  const queryModel = detectModelFromQuery(query);
  const listings = [];
  const recoverableListings = [];

  const rejectionLog = {
    totalBlocks: blocks.length,
    noData: 0,
    incompatible: 0,
    genericTitle: 0,
    accepted: 0,
    incompatibleReasons: [],
  };

  blocks.forEach((block, index) => {
    const blockText = block.join(" ");

    const price = extractPrice(blockText);
    const mileage = extractMileage(blockText);
    const registration = extractRegistration(blockText);
    const year = registration?.year || extractYear(blockText);
    const fuelType = detectFuelType(blockText);
    const powerKw = extractPowerKw(blockText);
    const power = extractPower(blockText);
    const sourceUrl = extractFirstMobileDeUrl(blockText);

    if (!price || !mileage || !year) {
      rejectionLog.noData += 1;
      return;
    }

    const brandFromBlock = detectBrand(blockText);
    const modelFromBlock = detectModelFromText(blockText, query);
    const brand = brandFromBlock || queryBrand;
    const model = modelFromBlock || queryModel;

    const title =
      findMobileDeTitle({ block, brand, model, query }) ||
      buildMobileDeTitle({ brand, model, fuelType, year, power, index });

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
      blockText: title,
    });

    if (!validation.isCompatible) {
      rejectionLog.incompatible += 1;
      if (validation.rejectionReason) {
        rejectionLog.incompatibleReasons.push(validation.rejectionReason);
      }

      if (validation.recoveryStatus === "RECOVERABLE") {
        recoverableListings.push(buildRecoverableListing({
          source,
          country,
          title,
          brand,
          model,
          price,
          mileage,
          year,
          fuelType,
          powerKw,
          blockText,
          sourceUrl,
          validation,
          sourceFormat: "mobile-de-r-jina-v1",
        }));
      }

      return;
    }

    rejectionLog.accepted += 1;

    listings.push({
      id: buildListingId({ source, country, line: title, price, mileage, year }),
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
      imageUrl: "",
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
        sourceFormat: "mobile-de-r-jina-v1",
      },
      raw: { block },
    });
  });

  return { listings, recoverableListings, rejectionLog };
}

function splitMobileDeTextIntoBlocks(text) {
  // mobile.de via r.jina.ai separa anuncios por líneas en blanco consecutivas
  // o por patrones de precio (€) que inician un nuevo contexto.
  const rawBlocks = String(text || "").split(/\n{2,}/);

  return rawBlocks
    .map((block) =>
      block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
    )
    .filter((block) => {
      // Un bloque válido debe tener precio y kilometraje
      const joined = block.join(" ");
      return (
        block.length >= 2 &&
        extractPrice(joined) > 0 &&
        extractMileage(joined) > 0
      );
    });
}

function findMobileDeTitle({ block, brand, model, query }) {
  // La primera línea del bloque que mencione marca o modelo es el título
  for (const line of block) {
    if (line.length < 4 || line.length > 200) continue;
    if (isBlockedLine(line)) continue;
    if (isGenericOrDealerTitle(line)) continue;
    if (/^\d/.test(line)) continue; // evitar líneas que empiecen por precio/km

    const text = normalize(line);
    const nb = normalize(brand);
    const nm = normalize(model);
    const nq = normalize(query);

    if (nb && text.includes(nb)) return cleanTitle(line);
    if (nm && nm.length >= 2 && text.includes(nm)) return cleanTitle(line);
    if (nq.split(" ").filter((p) => p.length >= 3).some((p) => text.includes(p))) {
      return cleanTitle(line);
    }
  }
  return "";
}

function buildMobileDeTitle({ brand, model, fuelType, year, power, index }) {
  const parts = [brand, model].filter(Boolean);
  if (year) parts.push(String(year));
  if (fuelType) parts.push(fuelType);
  if (power) parts.push(power);
  return parts.length > 0 ? parts.join(" · ") : `Vehículo ${index + 1}`;
}

function extractFirstMobileDeUrl(text) {
  // mobile.de usa URLs del tipo https://suchen.mobile.de/fahrzeuge/details.html?...
  const match = String(text).match(/https?:\/\/[^\s)]*mobile\.de[^\s)]*/i);
  return match?.[0] || extractFirstUrl(text);
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

  // Contadores de rechazo para diagnóstico
  const rejectionLog = {
    totalBlocks: blocks.length,
    noData: 0,
    incompatible: 0,
    genericTitle: 0,
    accepted: 0,
    incompatibleReasons: [],  // motivos exactos para debugging
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

    // Datos básicos son obligatorios — sin estos no podemos valorar el coche
    if (!price || !mileage || !year) {
      rejectionLog.noData += 1;
      return;
    }

    // Construir identidad: intentar detectar del bloque, fallback al query
    const brandFromBlock = detectBrand(blockText);
    const modelFromBlock = detectModelFromText(blockText, query);

    // FIX CRÍTICO: si no detectamos marca/modelo del bloque, usamos los del query.
    // Antes esto rechazaba anuncios válidos. Ahora los acepta con confianza reducida.
    const brand = brandFromBlock || queryBrand;
    const model = modelFromBlock || queryModel;

    // Construir título desde el bloque o sintético desde los datos disponibles
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
      blockText: title,
    });

    if (!validation.isCompatible) {
      rejectionLog.incompatible += 1;
      if (validation.rejectionReason) {
        rejectionLog.incompatibleReasons.push(validation.rejectionReason);
      }

      if (validation.recoveryStatus === "RECOVERABLE") {
        recoverableListings.push(buildRecoverableListing({
          source,
          country,
          title,
          brand,
          model,
          price,
          mileage,
          year,
          fuelType,
          powerKw,
          blockText,
          sourceUrl,
          imageUrl,
          validation,
          sourceFormat: "autoscout-r-jina-block-v2",
        }));
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
      // Indica si la identidad vino del bloque o fue heredada del query
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

  return { listings, recoverableListings, rejectionLog };
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

  // Excluir logos, sellos y banners — no son anuncios de vehículos
  const lowerFirst = firstLine.toLowerCase();
  if (lowerFirst.includes("seal-images")) return false;
  if (lowerFirst.includes("logo")) return false;
  if (lowerFirst.includes("banner")) return false;

  // FIX: antes se requería "listing-images" que es frágil ante cambios de CDN.
  // Ahora solo verificamos que el bloque tenga datos de precio y km.
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
  // FIX: antes se rechazaban líneas que contenían año o tipo de combustible.
  // Los títulos reales de AutoScout SUELEN incluirlos: "BMW X5 xDrive45e 2021 Hybrid"
  // Ahora el criterio es: la línea menciona marca o modelo y no es basura.
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

  // La línea debe mencionar la marca, el modelo o alguna palabra del query
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
  const recoverableListings = [];
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
      blockText: line,
    });

    if (!validation.isCompatible) {
      rejectionLog.incompatible += 1;

      if (validation.rejectionReason) {
        rejectionLog.incompatibleReasons = rejectionLog.incompatibleReasons || [];
        rejectionLog.incompatibleReasons.push(validation.rejectionReason);
      }

      if (validation.recoveryStatus === "RECOVERABLE") {
        recoverableListings.push(buildRecoverableListing({
          source,
          country,
          title: line,
          brand: detectBrand(line) || queryBrand,
          model: detectModelFromText(line, query),
          price,
          mileage,
          year,
          fuelType,
          powerKw,
          blockText,
          sourceUrl: extractFirstUrl(blockText),
          validation,
          sourceFormat: "generic-r-jina",
        }));
      }

      continue;
    }

    rejectionLog.accepted += 1;

    listings.push({
      id: buildListingId({ source, country, line, price, mileage, year }),
      title: cleanTitle(line),
      brand: detectBrand(line) || queryBrand,
      model: detectModelFromText(line, query),
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
      identitySource: "block",
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

  return { listings, recoverableListings, rejectionLog };
}

function buildRecoverableListing({
  source,
  country,
  title,
  brand,
  model,
  price,
  mileage,
  year,
  fuelType,
  powerKw,
  blockText,
  sourceUrl,
  imageUrl = "",
  validation,
  sourceFormat,
}) {
  return {
    id: buildListingId({
      source,
      country,
      line: `${title || "recoverable"}-${validation.recoverableReason}`,
      price,
      mileage,
      year,
    }),
    title: cleanTitle(title),
    brand,
    model,
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
    url: sourceUrl,
    imageUrl,
    isRealData: true,
    recoveryStatus: validation.recoveryStatus,
    recoverableReason: validation.recoverableReason,
    semanticScore: validation.score,
    semanticWarnings: validation.warnings,
    rejectionReason: validation.rejectionReason,
    dataQuality: {
      hasPrice: true,
      hasMileage: true,
      hasYear: true,
      hasPower: Boolean(powerKw),
      estimatedMileage: false,
      estimatedYear: false,
      sourceFormat,
    },
  };
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
  blockText = "",
}) {
  const text = normalize(query);
  const warnings = [];
  const rejectionReasons = [];
  const budget = Number(maxBudget || 0);

  if (budget > 0 && price > budget) {
    const budgetExcessPercent = Math.round(((price - budget) / budget) * 100);
    const isRecoverable = budgetExcessPercent <= 10;

    return {
      isCompatible: false,
      recoveryStatus: isRecoverable ? "RECOVERABLE" : "HARD_REJECT",
      recoverableReason: isRecoverable ? "budget_near_miss" : "",
      score: isRecoverable ? 50 : 0,
      warnings: [`Precio ${price} > presupuesto ${budget}.`],
      rejectionReason: `precio_sobre_presupuesto: ${price} > ${budget}`,
    };
  }

  let score = 40;

  if (detectBrand(text)) score += 20;

  const targetModel = detectModelFromQuery(text);
  const detectedModel = detectModelFromTextOnly(blockText);

  if (targetModel) {
    const targetBaseModel = normalizeModelForStrictMatch(targetModel);
    const detectedBaseModel = normalizeModelForStrictMatch(detectedModel);

    if (!detectedBaseModel) {
      score -= 15;
      warnings.push(`Modelo no confirmado en anuncio: objetivo="${targetModel}".`);
      rejectionReasons.push(`modelo_no_confirmado: objetivo="${targetModel}"`);
    } else if (targetBaseModel && detectedBaseModel !== targetBaseModel) {
      return {
        isCompatible: false,
        recoveryStatus: "HARD_REJECT",
        recoverableReason: "",
        score: 0,
        warnings: [
          `Modelo incompatible: objetivo="${targetModel}", detectado="${detectedModel}".`,
        ],
        rejectionReason: `modelo_incompatible: objetivo="${targetModel}", detectado="${detectedModel}"`,
      };
    } else {
      score += 25;
    }
  }

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

  const recoveryStatus = isCompatible
    ? "ACCEPTED"
    : finalScore >= 50
      ? "RECOVERABLE"
      : "HARD_REJECT";

  const recoverableReason =
    recoveryStatus === "RECOVERABLE"
      ? detectRecoverableReason(rejectionReasons, finalScore)
      : "";

  return {
    isCompatible,
    recoveryStatus,
    recoverableReason,
    score: finalScore,
    warnings,
    rejectionReason: rejectionReasons.join("; ") || null,
  };
}

// ---------------------------------------------------------------------------
// Detección de modelo — dos funciones separadas:
//   detectModelFromQuery: extrae el modelo de la búsqueda del usuario
//   detectModelFromText: intenta detectar el modelo dentro del texto de un bloque
// ---------------------------------------------------------------------------

function detectRecoverableReason(rejectionReasons = [], score = 0) {
  const reasons = rejectionReasons.map((reason) => String(reason || ""));

  if (reasons.some((reason) => reason.startsWith("score_bajo")) && score >= 50) {
    return "score_near_miss";
  }

  if (reasons.some((reason) => reason.startsWith("modelo_no_confirmado"))) {
    return "model_unconfirmed";
  }

  if (reasons.some((reason) => reason.startsWith("fuel_no_phev"))) {
    return "fuel_unconfirmed";
  }

  if (reasons.some((reason) => reason.startsWith("km_alto"))) {
    return "mileage_near_miss";
  }

  return "general_near_miss";
}

function detectModelFromQuery(query) {
  const text = normalize(query);

  const variantModel = detectVariantModel(text);
  if (variantModel) return variantModel;

  const catalogModel = detectCatalogModel(text);
  if (catalogModel) return catalogModel;

  const cleanedQuery = cleanText(query);
  const onlyBrand = getCatalogBrands()
    .map(normalize)
    .includes(normalize(cleanedQuery));

  if (!onlyBrand && cleanedQuery) return cleanedQuery;

  return "";
}

function detectModelFromText(text, query) {
  return detectModelFromTextOnly(text) || detectModelFromQuery(query);
}

function detectModelFromTextOnly(text) {
  const combined = normalize(text);

  const variantModel = detectVariantModel(combined);
  if (variantModel) return variantModel;

  return detectCatalogModel(combined);
}

// Legacy alias — mantener compatibilidad con código que llame a detectModel
function detectModel(title, query) {
  return detectModelFromTextOnly(title) || detectModelFromQuery(query);
}

function detectVariantModel(text) {
  const normalizedText = normalize(text);

  const variantPatterns = [
    { pattern: /x5\s*(xdrive)?\s*45e/, result: "X5 xDrive45e" },
    { pattern: /x5\s*(xdrive)?\s*30e/, result: "X5 xDrive30e" },
    { pattern: /x5\s*(xdrive)?\s*50e/, result: "X5 xDrive50e" },
    { pattern: /x3\s*(xdrive)?\s*30e/, result: "X3 xDrive30e" },
    { pattern: /q7\s*tfsi\s*e/, result: "Q7 TFSI e" },
    { pattern: /q7\s*tfsie/, result: "Q7 TFSI e" },
    { pattern: /glc\s*300\s*de/, result: "GLC 300de" },
    { pattern: /glc\s*300\s*e/, result: "GLC 300e" },
    { pattern: /serie\s*[135]/, result: normalizedText.match(/serie\s*([135])/)?.[0] || "" },
  ];

  return variantPatterns.find((item) => item.pattern.test(normalizedText))?.result || "";
}

function detectCatalogModel(text) {
  const normalizedText = normalize(text);

  const models = getCatalogModels();

  const detected = models.find((model) => {
    const normalizedModel = normalize(model);

    return normalizedModel && normalizedText.includes(normalizedModel);
  });

  return detected || "";
}

function getCatalogBrands() {
  return Object.keys(VEHICLE_CATALOG);
}

function getCatalogModels() {
  return Object.values(VEHICLE_CATALOG)
    .flat()
    .sort((a, b) => normalize(b).length - normalize(a).length);
}

function normalizeModelForStrictMatch(value) {
  const text = normalize(value);

  const catalogModel = detectCatalogModel(text);
  if (catalogModel) return normalize(catalogModel);

  return text;
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

    "haufige fragen",
    "häufige fragen",
    "faq",
    "preguntas frecuentes",
    "frequently asked questions",

    "coches similares",
    "vehiculos similares",
    "vehículos similares",
    "anuncios similares",

    "compare",
    "comparar",
    "vergleich",
    "vergleichen",

    "dealer page",
    "concesionario",
    "about this dealer",
    "sobre este concesionario",
  ];

  return genericTerms.some((term) => text.includes(term));
}

function cleanTitle(value) {
  return cleanText(value)
    .replace(/^#+\s*/, "")   // quita "### " del inicio
    .replace(/\*\*/g, "")    // quita negrita markdown
    .replace(/\s+/g, " ")
    .trim();
}

function extractRegistration(text) {
  // AutoScout Alemania usa MM-YYYY (ej: "10-2022"), no MM/YYYY
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

    if (match?.[1]) {
      const price = safeNumber(match[1]);

      // Sanity check: precios de coches entre 1.000 y 500.000
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

  // PHEV — AutoScout Alemania usa "Elektro/Benzin" o "Elektro/Diesel"
  if (value.includes("elektro/benzin")) return "PHEV";
  if (value.includes("elektro/diesel")) return "PHEV";
  if (value.includes("electric/gasoline")) return "PHEV";
  if (value.includes("electric/diesel")) return "PHEV";
  if (value.includes("plug-in") || value.includes("plug in")) return "PHEV";
  if (value.includes("phev")) return "PHEV";
  if (value.includes("hybrid") || value.includes("hibrid")) return "PHEV";

  // Diesel
  if (value.includes("diesel") || value.includes("tdi") || value.includes("dci")) return "Diesel";

  // Eléctrico puro
  if (value.includes("elektro") || value.includes("electric") || value.includes("electrico")) return "Electric";

  // Gasolina
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
    .replace(/[̀-ͯ]/g, "");
}
