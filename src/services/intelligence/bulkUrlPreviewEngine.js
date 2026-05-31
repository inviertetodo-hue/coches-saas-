import { buildDataQualityGate } from "./dataQualityGate";

export function buildBulkUrlPreview({
  url = "",
  source = "unknown",
  candidates = [],
  limit = 20,
} = {}) {
  const normalizedUrl = String(url || "").trim();
  const safeCandidates = Array.isArray(candidates) ? candidates : [];
  const limitedCandidates = safeCandidates.slice(0, limit);

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

  return {
    url: normalizedUrl,
    source,
    requested: safeCandidates.length,
    previewed: previewItems.length,
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
      previewed: previewItems.length,
      memoryEligibleCount,
      rejectedCount,
      trustedCount,
      goodCount,
      reviewCount,
    }),
  };
}

function buildInsights({
  previewed,
  memoryEligibleCount,
  rejectedCount,
  trustedCount,
  goodCount,
  reviewCount,
}) {
  const insights = [];

  if (previewed === 0) {
    insights.push("No hay candidatos suficientes para previsualizar.");
    return insights;
  }

  insights.push(
    `Vista previa generada sobre ${previewed} candidatos.`
  );

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

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}