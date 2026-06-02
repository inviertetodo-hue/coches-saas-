export function buildMemoryAnalytics(records = []) {
  const validRecords = records.filter(Boolean);

  const totalRecords = validRecords.length;

  const brands = [
    ...new Set(validRecords.map((item) => item.brand).filter(Boolean)),
  ];

  const models = [
    ...new Set(
      validRecords
        .map((item) => `${item.brand || ""} ${item.model || ""}`.trim())
        .filter(Boolean)
    ),
  ];

  const avgROI = calculateAverage(
    validRecords.map((item) => Number(item.roi || 0))
  );

  const avgProfit = calculateAverage(
    validRecords.map((item) => Number(item.profit || 0))
  );

  const confidenceScores = validRecords.map((item) =>
    Number(item.confidence_score ?? item.dataQualityScore ?? item.qualityScore ?? 0)
  );

  const verifiedRecords = validRecords.filter(
    (item) =>
      item.verification_level === "VERIFIED_SOURCE_DATA" ||
      item.data_truth_status === "FACT"
  );

  const rejectedRecords = validRecords.filter(
    (item) =>
      item.verification_level === "REJECTED_UNVERIFIED_DATA" ||
      item.data_truth_status === "REJECTED"
  );

  const inferredRecords = validRecords.filter(
    (item) =>
      item.data_truth_status === "INFERRED" ||
      item.verification_level === "INFERRED_DATA"
  );

  const sourceList = [
    ...new Set(
      validRecords
        .map((item) => item.source || item.sourceSite || extractSourceFromUrl(item.source_url || item.sourceUrl))
        .filter(Boolean)
    ),
  ];

  const bestOpportunity = [...validRecords].sort(
    (a, b) => Number(b.profit || 0) - Number(a.profit || 0)
  )[0];

  const worstOpportunity = [...validRecords].sort(
    (a, b) => Number(a.profit || 0) - Number(b.profit || 0)
  )[0];

  return {
    totalRecords,
    brandsCount: brands.length,
    modelsCount: models.length,
    avgROI: Math.round(avgROI),
    avgProfit: Math.round(avgProfit),
    bestOpportunity,
    worstOpportunity,

    verifiedRecordsCount: verifiedRecords.length,
    rejectedRecordsCount: rejectedRecords.length,
    inferredRecordsCount: inferredRecords.length,
    unverifiedRecordsCount:
      totalRecords -
      verifiedRecords.length -
      rejectedRecords.length -
      inferredRecords.length,
    verifiedShare: calculatePercentage(verifiedRecords.length, totalRecords),
    avgConfidenceScore: Math.round(calculateAverage(confidenceScores)),
    sourcesCount: sourceList.length,
    sources: sourceList,
    marketTruthHealth: buildMarketTruthHealth({
      totalRecords,
      verifiedCount: verifiedRecords.length,
      rejectedCount: rejectedRecords.length,
      inferredCount: inferredRecords.length,
      avgConfidenceScore: calculateAverage(confidenceScores),
    }),
  };
}

function calculateAverage(values = []) {
  const cleanValues = values
    .map((value) => Number(value || 0))
    .filter((value) => Number.isFinite(value));

  if (!cleanValues.length) return 0;

  const total = cleanValues.reduce((sum, value) => sum + value, 0);

  return total / cleanValues.length;
}

function calculatePercentage(part, total) {
  if (!total) return 0;

  return Math.round((Number(part || 0) / Number(total || 1)) * 100);
}

function buildMarketTruthHealth({
  totalRecords,
  verifiedCount,
  rejectedCount,
  inferredCount,
  avgConfidenceScore,
}) {
  if (!totalRecords) {
    return {
      score: 0,
      label: "EMPTY_MEMORY",
      description: "La memoria todavía no contiene registros.",
    };
  }

  const verifiedShare = verifiedCount / totalRecords;
  const rejectedShare = rejectedCount / totalRecords;
  const inferredShare = inferredCount / totalRecords;

  const score = Math.round(
    verifiedShare * 70 +
      Math.min(Number(avgConfidenceScore || 0), 100) * 0.25 -
      rejectedShare * 20 -
      inferredShare * 10
  );

  if (score >= 80) {
    return {
      score,
      label: "HIGH_TRUST",
      description: "Memoria con alta proporción de datos verificables.",
    };
  }

  if (score >= 60) {
    return {
      score,
      label: "MEDIUM_TRUST",
      description: "Memoria útil, pero todavía necesita más registros verificados.",
    };
  }

  return {
    score,
    label: "LOW_TRUST",
    description: "Memoria insuficiente para decisiones comerciales sensibles.",
  };
}

function extractSourceFromUrl(value) {
  if (!value) return "";

  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}