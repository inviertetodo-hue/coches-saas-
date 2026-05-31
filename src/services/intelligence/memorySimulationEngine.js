export function buildMemorySimulation({
  approvedImport = {},
  maxRecords = 50,
} = {}) {
  const approvedItems = Array.isArray(approvedImport.approvedItems)
    ? approvedImport.approvedItems
    : [];

  const memoryRecords = approvedItems
    .slice(0, maxRecords)
    .map((item, index) => buildMemoryRecord(item, approvedImport, index));

  const positiveRecords = memoryRecords.filter(
    (item) => item.roi > 0 && item.profit > 0
  );

  const negativeRecords = memoryRecords.filter(
    (item) => item.roi < 0 || item.profit < 0
  );

  const averageROI = calculateAverage(memoryRecords, "roi");
  const averageProfit = calculateAverage(memoryRecords, "profit");
  const averageQuality = calculateAverage(memoryRecords, "dataQualityScore");

  return {
    source: approvedImport.source || "unknown",
    sourceUrl: approvedImport.sourceUrl || "",
    totalApproved: approvedItems.length,
    totalSimulated: memoryRecords.length,
    maxRecords,
    positiveRecords: positiveRecords.length,
    negativeRecords: negativeRecords.length,
    averageROI,
    averageProfit,
    averageQuality,
    canCreateMemory:
      memoryRecords.length > 0 && averageQuality >= 75,
    memoryRecords,
    summary: buildSummary({
      totalSimulated: memoryRecords.length,
      positiveRecords: positiveRecords.length,
      negativeRecords: negativeRecords.length,
      averageROI,
      averageProfit,
      averageQuality,
    }),
    insights: buildInsights({
      memoryRecords,
      positiveRecords,
      negativeRecords,
      averageROI,
      averageProfit,
      averageQuality,
    }),
  };
}

function buildMemoryRecord(item, approvedImport, index) {
  return {
    id: item.id || `memory-simulation-${index + 1}`,
    memoryType: "bulk_import_market_observation",
    source: item.source || approvedImport.source || "unknown",
    sourceUrl: item.sourceUrl || approvedImport.sourceUrl || "",

    title: item.title || "Vehículo sin título",
    brand: item.brand || "",
    model: item.model || "",
    year: safeNumber(item.year),
    price: safeNumber(item.price),
    mileage: safeNumber(item.mileage),
    roi: safeNumber(item.roi),
    profit: safeNumber(item.profit),

    dataQualityScore: safeNumber(item.dataQualityScore),
    dataQualityLabel: item.dataQualityLabel || "UNKNOWN",
    memoryEligible: item.memoryEligible === true,
    canSaveAnalysis: item.canSaveAnalysis === true,

    opportunityType:
      safeNumber(item.roi) > 0 && safeNumber(item.profit) > 0
        ? "positive_market_signal"
        : "negative_market_signal",

    shouldTrainOpportunity:
      safeNumber(item.roi) > 0 &&
      safeNumber(item.profit) > 0 &&
      safeNumber(item.dataQualityScore) >= 75,

    shouldTrainMarketMemory:
      item.memoryEligible === true &&
      safeNumber(item.dataQualityScore) >= 75,

    simulated: true,
    wouldSaveToSupabase: false,
  };
}

function buildSummary({
  totalSimulated,
  positiveRecords,
  negativeRecords,
  averageROI,
  averageProfit,
  averageQuality,
}) {
  if (totalSimulated === 0) {
    return "No hay registros aprobados para simular memoria.";
  }

  return `${totalSimulated} registros se podrían crear en memoria. ${positiveRecords} señales positivas, ${negativeRecords} señales negativas. Calidad media ${averageQuality}/100, ROI medio ${averageROI}% y beneficio medio ${averageProfit} €.`;
}

function buildInsights({
  memoryRecords,
  positiveRecords,
  negativeRecords,
  averageROI,
  averageProfit,
  averageQuality,
}) {
  const insights = [];

  if (memoryRecords.length === 0) {
    insights.push("No hay registros simulados.");
    return insights;
  }

  insights.push(
    `${memoryRecords.length} registros quedarían listos para memoria histórica.`
  );

  insights.push(
    `${positiveRecords.length} registros entrenarían señales de oportunidad.`
  );

  if (negativeRecords.length > 0) {
    insights.push(
      `${negativeRecords.length} registros negativos se guardarían como observaciones de mercado, no como oportunidades.`
    );
  }

  if (averageQuality >= 90) {
    insights.push(
      "La calidad media es alta: la importación parece segura para memoria."
    );
  } else if (averageQuality >= 75) {
    insights.push(
      "La calidad media es suficiente: conviene guardar con peso moderado."
    );
  } else {
    insights.push(
      "La calidad media es baja: no conviene guardar esta importación."
    );
  }

  if (averageROI < 0 || averageProfit < 0) {
    insights.push(
      "La muestra tiene rentabilidad media negativa: útil para aprender mercado, pero no para comprar."
    );
  }

  return insights;
}

function calculateAverage(items, field) {
  if (!Array.isArray(items) || items.length === 0) return 0;

  const values = items
    .map((item) => safeNumber(item[field]))
    .filter((value) => Number.isFinite(value));

  if (!values.length) return 0;

  const total = values.reduce((sum, value) => sum + value, 0);

  return Math.round((total / values.length) * 100) / 100;
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}