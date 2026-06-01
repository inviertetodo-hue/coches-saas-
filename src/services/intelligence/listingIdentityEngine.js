export function buildListingIdentity(item = {}) {
  const sourceSite = normalizeSourceSite(item.sourceSite || item.source || "");
  const sourceUrl = String(item.sourceUrl || item.url || "").trim();
  const listingId = extractListingId({ sourceSite, sourceUrl, item });

  const stableFingerprint = buildStableFingerprint({
    sourceSite,
    sourceUrl,
    listingId,
    item,
  });

  return {
    sourceSite,
    sourceUrl,
    listingId,
    fingerprint: stableFingerprint,
    fingerprintVersion: "v2",
    identityConfidence: buildIdentityConfidence({
      sourceSite,
      sourceUrl,
      listingId,
      item,
    }),
  };
}

function buildStableFingerprint({ sourceSite, sourceUrl, listingId, item }) {
  if (sourceSite && listingId) {
    return [sourceSite, listingId].join("|");
  }

  if (sourceSite && sourceUrl) {
    return [sourceSite, normalizeUrl(sourceUrl)].join("|");
  }

  return [
    normalizeText(item.brand),
    normalizeText(item.model),
    normalizeText(item.year),
    normalizeNumber(item.price),
    normalizeNumber(item.km ?? item.mileage),
  ]
    .filter(Boolean)
    .join("|");
}

function extractListingId({ sourceSite, sourceUrl, item }) {
  if (item.listingId) {
    return normalizeId(item.listingId);
  }

  if (!sourceUrl) {
    return "";
  }

  const normalizedUrl = normalizeUrl(sourceUrl);

  if (sourceSite === "autoscout24") {
    return extractAutoscoutId({ normalizedUrl, item });
  }

  if (sourceSite === "mobile") {
    return extractMobileId(normalizedUrl);
  }

  return "";
}

function extractAutoscoutId({ normalizedUrl, item }) {
  if (isAutoscoutSearchUrl(normalizedUrl)) {
    return buildSearchListingId(item);
  }

  const blockedGenericIds = new Set([
    "homepage-search-mask",
    "autocatalog",
    "standard",
    "source",
    "sort-standard",
  ]);

  const parts = normalizedUrl.split("-").filter(Boolean);
  const candidate = parts.slice(-3).join("-");

  if (!candidate || blockedGenericIds.has(candidate)) {
    return buildSearchListingId(item);
  }

  return normalizeId(candidate);
}

function isAutoscoutSearchUrl(normalizedUrl) {
  return (
    normalizedUrl.includes("autoscout24-es-lst") ||
    normalizedUrl.includes("autoscout24-es-coches")
  );
}

function buildSearchListingId(item = {}) {
  const parts = [
    "search",
    normalizeText(item.brand),
    normalizeText(item.model),
    normalizeText(item.year),
    normalizeNumber(item.price),
    normalizeNumber(item.km ?? item.mileage),
  ].filter(Boolean);

  if (parts.length <= 1) {
    return "search-unresolved";
  }

  return normalizeId(parts.join("-"));
}

function extractMobileId(normalizedUrl) {
  const match = normalizedUrl.match(/id([a-z0-9]+)/i);

  if (match?.[1]) {
    return normalizeId(match[1]);
  }

  return "";
}

function buildIdentityConfidence({ sourceSite, sourceUrl, listingId, item }) {
  let score = 20;

  if (sourceSite) score += 20;
  if (sourceUrl) score += 20;
  if (listingId && listingId !== "search-unresolved") score += 30;
  if (item.brand && item.model) score += 10;

  return Math.max(0, Math.min(100, score));
}

function normalizeSourceSite(value) {
  const normalized = normalizeText(value);

  if (normalized.includes("autoscout")) return "autoscout24";
  if (normalized.includes("mobile")) return "mobile";

  return normalized || "unknown";
}

function normalizeUrl(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return "";
  }

  return String(Math.round(numericValue));
}