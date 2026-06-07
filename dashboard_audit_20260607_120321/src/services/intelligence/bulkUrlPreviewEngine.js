import { buildDataQualityGate } from "./dataQualityGate";

const BULK_URL_TYPES = {
  SEARCH_RESULT_SOURCE: "SEARCH_RESULT_SOURCE",
  LISTING_DETAIL: "LISTING_DETAIL",
  UNKNOWN: "UNKNOWN",
};

export function buildBulkUrlPreview({
  url = "",
  source = "unknown",
  candidates = [],
  limit = 20,
} = {}) {
  const normalizedUrl = String(url || "").trim();
  const urlType = detectBulkUrlType(normalizedUrl);
  const safeCandidates = Array.isArray(candidates) ? candidates : [];
  const realCandidates = safeCandidates.filter((item) =>
    isRealVehicleCandidate(item)
  );
  const limitedCandidates = realCandidates.slice(0, limit);

  const previewItems = limitedCandidates.map((item, index) => {
    const price = safeNumber(item.price || item.purchasePrice || item.budget);
    const roi = safeNumber(item.roi);
    const profit = safeNumber(item.profit);

    const quality = buildDataQualityGate({
      sourceMode: item.sourceMode || item.feedMode || item.mode || source,
      sourceStatus: item.sourceStatus || item.feedStatus || item.status,
      title: item.title,
      brand: item.brand,
      model: item.model,
      year: item.year,
      price,
      mileage: item.mileage || item.km || item.kilometers,
      matchScore: item.matchScore || item.match_score || item.confidence,
      comparableConfidence:
        item.comparableConfidence ||
        item.marketConfidence ||
        item.comparable_confidence,
      roi,
      profit,
    });

    return {
      id: item.id || `bulk-preview-${index + 1}`,
      source,
      url: normalizedUrl,
      urlType,
      title: item.title || "Vehículo sin título",
      brand: item.brand || "",
      model: item.model || "",
      year: item.year || null,
      price,
      mileage: item.mileage || item.km || item.kilometers || null,
      roi,
      profit,
      dataQualityScore: quality.dataQualityScore,
      dataQualityLabel: quality.dataQualityLabel,
      memoryEligible: quality.memoryEligible,
      canSaveAnalysis: quality.canSaveAnalysis,
      dataQualityReasons: quality.reasons,
      dataQualitySummary: quality.summary,
      raw: item,
    };
  });

  const trustedCount = previewItems.filter(
    (item) => item.dataQualityLabel === "TRUSTED"
  ).length;

  const goodCount = previewItems.filter(
    (item) => item.dataQualityLabel === "GOOD"
  ).length;

  const reviewCount = previewItems.filter(
    (item) => item.dataQualityLabel === "REVIEW"
  ).length;

  const rejectedCount = previewItems.filter(
    (item) => item.dataQualityLabel === "REJECT"
  ).length;

  const memoryEligibleCount = previewItems.filter(
    (item) => item.memoryEligible
  ).length;

  const blockedSyntheticCount = safeCandidates.length - realCandidates.length;

  return {
    url: normalizedUrl,
    source,
    urlType,
    requested: safeCandidates.length,
    previewed: previewItems.length,
    blockedSyntheticCount,
    limit,
    memoryEligibleCount,
    rejectedCount,
    qualitySummary: {
      trusted: trustedCount,
      good: goodCount,
      review: reviewCount,
      rejected: rejectedCount,
    },
    canBulkSave: memoryEligibleCount > 0,
    shouldProceed:
      previewItems.length > 0 &&
      memoryEligibleCount / previewItems.length >= 0.5,
    items: previewItems,
    insights: buildInsights({
      urlType,
      requested: safeCandidates.length,
      previewed: previewItems.length,
      blockedSyntheticCount,
      memoryEligibleCount,
      rejectedCount,
      trustedCount,
      goodCount,
      reviewCount,
    }),
  };
}

function buildInsights({
  urlType,
  requested,
  previewed,
  blockedSyntheticCount,
  memoryEligibleCount,
  rejectedCount,
  trustedCount,
  goodCount,
  reviewCount,
}) {
  const insights = [];

  if (urlType === BULK_URL_TYPES.SEARCH_RESULT_SOURCE) {
    insights.push(
      "La URL detectada es una búsqueda/listado. No se guardará como coche real hasta extraer anuncios concretos."
    );
  }

  if (blockedSyntheticCount > 0) {
    insights.push(
      `${blockedSyntheticCount} candidatos incompletos han sido bloqueados para evitar contaminar la memoria.`
    );
  }

  if (previewed === 0) {
    if (requested > 0) {
      insights.push(
        "No hay candidatos reales con precio, año y kilómetros suficientes para previsualizar."
      );
    } else {
      insights.push("No hay candidatos suficientes para previsualizar.");
    }

    return insights;
  }

  insights.push(`Vista previa generada sobre ${previewed} candidatos reales.`);

  insights.push(
    `${memoryEligibleCount} candidatos son aptos para memoria histórica.`
  );

  if (trustedCount > 0 || goodCount > 0) {
    insights.push(
      `Hay ${trustedCount + goodCount} candidatos con calidad alta o buena.`
    );
  }

  if (reviewCount > 0) {
    insights.push(
      `${reviewCount} candidatos pueden analizarse, pero no deberían entrenar memoria fuerte.`
    );
  }

  if (rejectedCount > 0) {
    insights.push(
      `${rejectedCount} candidatos han sido rechazados para proteger la base de datos.`
    );
  }

  if (memoryEligibleCount / previewed >= 0.5) {
    insights.push(
      "La URL parece útil para construir base de datos si se importa por lotes controlados."
    );
  } else {
    insights.push(
      "La URL necesita revisión: demasiados candidatos no son aptos para memoria."
    );
  }

  return insights;
}

function isRealVehicleCandidate(item) {
  if (!item) return false;

  const price = safeNumber(item.price || item.purchasePrice || item.budget);
  const year = safeNumber(item.year);
  const mileage = safeNumber(item.mileage || item.km || item.kilometers);

  const hasIdentity = Boolean(item.brand && item.model);
  const hasRealMarketFacts = price > 0 && year > 0 && mileage > 0;

  return hasIdentity && hasRealMarketFacts;
}

function detectBulkUrlType(url) {
  const normalized = String(url || "").toLowerCase();

  if (!normalized) {
    return BULK_URL_TYPES.UNKNOWN;
  }

  if (
    normalized.includes("/lst/") ||
    normalized.includes("/results") ||
    normalized.includes("/search") ||
    normalized.includes("homepage_search-mask") ||
    normalized.includes("sort=") ||
    normalized.includes("ustate=") ||
    normalized.includes("atype=")
  ) {
    return BULK_URL_TYPES.SEARCH_RESULT_SOURCE;
  }

  if (
    normalized.includes("/offer/") ||
    normalized.includes("/anuncio/") ||
    normalized.includes("/coches/") ||
    normalized.includes("/vehicle/") ||
    normalized.includes("adid=") ||
    normalized.includes("id=")
  ) {
    return BULK_URL_TYPES.LISTING_DETAIL;
  }

  return BULK_URL_TYPES.UNKNOWN;
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}