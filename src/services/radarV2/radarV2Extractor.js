import {
  buildListingTitle,
  cleanText,
  detectBrand,
  detectFuelType,
  detectModel,
  estimateMarketMultiplier,
  extractMileage,
  extractPowerKw,
  extractPrice,
  extractYear,
  normalizeText,
  uniqueBy,
} from "./radarV2Utils";

export function extractListingsFromText({
  text = "",
  source = "",
  country = "",
  query = "",
  sourceSearchUrl = "",
  autoscoutDirectUrlMap = new Map(),
}) {
  const normalizedSource = normalizeText(source);

  if (normalizedSource.includes("autoscout")) {
    return extractAutoscoutListings({
      text,
      source,
      country,
      query,
      sourceSearchUrl,
      autoscoutDirectUrlMap,
    });
  }

  if (normalizedSource.includes("mobile")) {
    return extractMobileListings({
      text,
      source,
      country,
      query,
      sourceSearchUrl,
    });
  }

  return extractGenericListings({
    text,
    source,
    country,
    query,
    sourceSearchUrl,
  });
}

function extractAutoscoutListings({
  text,
  source,
  country,
  query,
  sourceSearchUrl,
  autoscoutDirectUrlMap,
}) {
  const blocks = splitIntoListingBlocks(text);
  const candidates = [];

  for (const block of blocks) {
    const rawBlock = block.join("\n");
    const blockText = block.join(" ");

    const price = extractPrice(blockText);
    const mileage = extractMileage(blockText);
    const year = extractYear(blockText);
    const fuelType = detectFuelType(blockText);
    const powerKw = extractPowerKw(blockText);
    const imageUrl = extractFirstImageUrl(rawBlock);
    const guid = extractAutoscoutGuidFromImageUrl(imageUrl);
    const originalUrl =
      extractAutoscoutOfferUrl(blockText) ||
      autoscoutDirectUrlMap.get(guid) ||
      "";

    const identityText = `${blockText} ${query}`;
    const brandFromBlock = detectBrand(blockText);
    const modelFromBlock = detectModel(blockText, brandFromBlock);
    const queryBrand = detectBrand(query);
    const queryModel = detectModel(query, queryBrand);

    const brand = brandFromBlock || queryBrand;
    const model = modelFromBlock || queryModel;
    const identitySource = brandFromBlock && modelFromBlock ? "block" : "query-fallback";

    const title = cleanText(
      findTitleLine({ block, brand, model, query }) ||
        buildListingTitle({ brand, model, year, fuelType, powerKw })
    );

    if (!price && !mileage && !year) continue;

    candidates.push(normalizeCandidate({
      source,
      country,
      sourceSearchUrl,
      originalUrl,
      imageUrl,
      title,
      brand,
      model,
      price,
      mileage,
      year,
      fuelType,
      powerKw,
      identitySource,
      rawBlock,
      sourceFormat: "autoscout-radar-v2",
    }));
  }

  return uniqueBy(candidates, (item) =>
    [item.source, item.country, item.originalUrl || item.title, item.price, item.mileage, item.year].join("|")
  );
}

function extractMobileListings({ text, source, country, query, sourceSearchUrl }) {
  const blocks = splitIntoListingBlocks(text);
  const candidates = [];

  for (const block of blocks) {
    const rawBlock = block.join("\n");
    const blockText = block.join(" ");

    const price = extractPrice(blockText);
    const mileage = extractMileage(blockText);
    const year = extractYear(blockText);
    const fuelType = detectFuelType(blockText);
    const powerKw = extractPowerKw(blockText);
    const originalUrl = extractMobileUrl(blockText);
    const imageUrl = extractFirstImageUrl(rawBlock);

    const brandFromBlock = detectBrand(blockText);
    const modelFromBlock = detectModel(blockText, brandFromBlock);
    const queryBrand = detectBrand(query);
    const queryModel = detectModel(query, queryBrand);

    const brand = brandFromBlock || queryBrand;
    const model = modelFromBlock || queryModel;
    const identitySource = brandFromBlock && modelFromBlock ? "block" : "query-fallback";

    const title = cleanText(
      findTitleLine({ block, brand, model, query }) ||
        buildListingTitle({ brand, model, year, fuelType, powerKw })
    );

    if (!price && !mileage && !year) continue;

    candidates.push(normalizeCandidate({
      source,
      country,
      sourceSearchUrl,
      originalUrl,
      imageUrl,
      title,
      brand,
      model,
      price,
      mileage,
      year,
      fuelType,
      powerKw,
      identitySource,
      rawBlock,
      sourceFormat: "mobile-radar-v2",
    }));
  }

  return uniqueBy(candidates, (item) =>
    [item.source, item.country, item.originalUrl || item.title, item.price, item.mileage, item.year].join("|")
  );
}

function extractGenericListings({ text, source, country, query, sourceSearchUrl }) {
  const lines = toUsefulLines(text);
  const candidates = [];

  lines.forEach((line, index) => {
    const block = lines.slice(index, index + 12);
    const rawBlock = block.join("\n");
    const blockText = block.join(" ");

    const price = extractPrice(blockText);
    const mileage = extractMileage(blockText);
    const year = extractYear(blockText);

    if (!price && !mileage && !year) return;

    const fuelType = detectFuelType(blockText);
    const powerKw = extractPowerKw(blockText);
    const originalUrl = extractFirstUrl(blockText);
    const imageUrl = extractFirstImageUrl(rawBlock);
    const brand = detectBrand(blockText) || detectBrand(query);
    const model = detectModel(blockText, brand) || detectModel(query, detectBrand(query));

    candidates.push(normalizeCandidate({
      source,
      country,
      sourceSearchUrl,
      originalUrl,
      imageUrl,
      title: cleanText(line) || buildListingTitle({ brand, model, year, fuelType, powerKw }),
      brand,
      model,
      price,
      mileage,
      year,
      fuelType,
      powerKw,
      identitySource: brand && model ? "block" : "query-fallback",
      rawBlock,
      sourceFormat: "generic-radar-v2",
    }));
  });

  return uniqueBy(candidates, (item) =>
    [item.source, item.country, item.originalUrl || item.title, item.price, item.mileage, item.year].join("|")
  );
}

function normalizeCandidate({
  source,
  country,
  sourceSearchUrl,
  originalUrl,
  imageUrl,
  title,
  brand,
  model,
  price,
  mileage,
  year,
  fuelType,
  powerKw,
  identitySource,
  rawBlock,
  sourceFormat,
}) {
  return {
    id: buildCandidateId({ source, country, title, price, mileage, year, originalUrl }),
    source,
    country,
    sourceSearchUrl,
    originalUrl,
    url: originalUrl,
    imageUrl,
    title,
    brand,
    model,
    price,
    km: mileage,
    mileage,
    year,
    fuelType,
    powerKw,
    power: powerKw ? `${powerKw} kW / ${Math.round(powerKw * 1.35962)} hp` : "",
    drivetrain: "",
    bodyType: "",
    performancePackage: "",
    electrified: fuelType === "Electric" || fuelType === "PHEV" || fuelType === "Hybrid",
    marketMultiplier: estimateMarketMultiplier({ price, mileage, year }),
    isRealData: true,
    identitySource,
    sourceFormat,
    raw: {
      block: rawBlock,
    },
  };
}

function splitIntoListingBlocks(text = "") {
  const lines = toUsefulLines(text);
  const blocks = [];
  let current = [];

  const flush = () => {
    if (current.length > 0) {
      const joined = current.join(" ");
      if (looksLikeListingBlock(joined)) blocks.push(current);
      current = [];
    }
  };

  lines.forEach((line) => {
    const startsNew =
      current.length > 0 &&
      (
        isImageLine(line) ||
        (extractPrice(line) > 0 && current.some((item) => extractMileage(item) > 0)) ||
        (extractMileage(line) > 0 && current.some((item) => extractPrice(item) > 0))
      );

    if (startsNew) flush();

    current.push(line);

    if (current.length >= 28) flush();
  });

  flush();

  return blocks.length > 0 ? blocks : fallbackBlocks(lines);
}

function fallbackBlocks(lines = []) {
  const blocks = [];

  for (let index = 0; index < lines.length; index += 12) {
    const block = lines.slice(index, index + 12);
    if (looksLikeListingBlock(block.join(" "))) blocks.push(block);
  }

  return blocks;
}

function looksLikeListingBlock(text = "") {
  return extractPrice(text) > 0 && extractMileage(text) > 0;
}

function toUsefulLines(text = "") {
  return String(text || "")
    .split(/\r?\n/)
    .map(cleanText)
    .filter(Boolean)
    .filter((line) => !isBlockedLine(line));
}

function isBlockedLine(line = "") {
  const text = normalizeText(line);

  if (!text) return true;
  if (text.includes("title markdown content")) return true;
  if (text.includes("url source")) return true;
  if (text.includes("privacy")) return true;
  if (text.includes("cookie")) return true;
  if (text.includes("javascript")) return true;
  if (text.includes("autoscout24 marketplace")) return true;
  if (text.includes("was kosten")) return true;
  if (text.includes("haeufige fragen")) return true;
  if (text.includes("faq")) return true;

  return false;
}

function findTitleLine({ block = [], brand = "", model = "", query = "" }) {
  const normalizedBrand = normalizeText(brand);
  const normalizedModel = normalizeText(model);
  const normalizedQueryParts = normalizeText(query).split(" ").filter((part) => part.length >= 3);

  return block.find((line) => {
    const text = normalizeText(line);

    if (line.length < 4 || line.length > 220) return false;
    if (extractPrice(line) || extractMileage(line)) return false;
    if (text.includes("http")) return false;

    if (normalizedBrand && text.includes(normalizedBrand)) return true;
    if (normalizedModel && text.includes(normalizedModel)) return true;

    return normalizedQueryParts.some((part) => text.includes(part));
  }) || "";
}

function extractFirstImageUrl(text = "") {
  const matches = [
    ...String(text || "").matchAll(/https?:\/\/[^\s)"']+(?:pictures\.autoscout24|listing-images|img\.mobile\.de)[^\s)"']*/gi),
  ].map((match) => cleanUrl(match[0]));

  return matches.find((url) =>
    url.includes("1920") ||
    url.includes("1024") ||
    url.includes("800") ||
    url.includes("pictures.autoscout24") ||
    url.includes("listing-images") ||
    url.includes("img.mobile.de")
  ) || matches[0] || "";
}

function extractAutoscoutGuidFromImageUrl(imageUrl = "") {
  const match = String(imageUrl || "").match(
    /listing-images\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i
  );

  return match?.[1] || "";
}

function extractAutoscoutOfferUrl(text = "") {
  const direct = String(text || "").match(/https?:\/\/[^\s)"']*autoscout24\.[^\s)"']*\/(?:angebote|aanbod|offerta|annonces|anuncio)\/[^\s)"']+/i);
  if (direct?.[0]) return cleanUrl(direct[0]);

  const relative = String(text || "").match(/\/(?:angebote|aanbod|offerta|annonces|anuncio)\/[^\s)"']+/i);
  if (relative?.[0]) return `https://www.autoscout24.de${cleanUrl(relative[0])}`;

  return "";
}

function extractMobileUrl(text = "") {
  const direct = String(text || "").match(/https?:\/\/[^\s)"']*mobile\.de[^\s)"']*\/fahrzeuge\/details\.html[^\s)"']*/i);
  if (direct?.[0]) return cleanUrl(direct[0]);

  return extractFirstUrl(text);
}

function extractFirstUrl(text = "") {
  const match = String(text || "").match(/https?:\/\/[^\s)"']+/i);
  return match?.[0] ? cleanUrl(match[0]) : "";
}

function cleanUrl(value = "") {
  return String(value || "")
    .replace(/[)\].,;]+$/g, "")
    .replace(/&amp;/g, "&")
    .trim();
}

function isImageLine(line = "") {
  const text = String(line || "");
  return text.includes("pictures.autoscout24") || text.includes("listing-images") || text.includes("img.mobile.de");
}

function buildCandidateId({ source, country, title, price, mileage, year, originalUrl }) {
  return [
    normalizeText(source),
    normalizeText(country),
    normalizeText(originalUrl || title),
    price,
    mileage,
    year,
  ].join("|");
}
