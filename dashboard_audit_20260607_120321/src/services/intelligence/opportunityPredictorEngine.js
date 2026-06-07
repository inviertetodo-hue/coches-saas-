export function buildOpportunityPredictor({
  vehicle = {},
  historicalModelMemory = [],
} = {}) {
  const match = findHistoricalMatch(vehicle, historicalModelMemory);

  if (!match) {
    return {
      active: false,
      model: null,
      expectedROI: 0,
      expectedProfit: 0,
      expectedScore: 0,
      expectedRisk: "Sin datos",
      expectedLiquidity: "Sin datos",
      successProbability: 0,
      confidence: "Sin datos",
      confidenceScore: 0,
      signals: ["Sin histórico suficiente para predicción fiable."],
    };
  }

  const expectedROI = safeNumber(match.averageROI);
  const expectedProfit = safeNumber(match.averageProfit);
  const expectedScore = safeNumber(match.averageScore);
  const confidenceScore = safeNumber(match.confidenceScore);

  const successProbability = clamp(
    Math.round(
      expectedScore * 0.42 +
        expectedROI * 1.4 +
        confidenceScore * 0.28 +
        Math.min(expectedProfit / 1000, 20)
    ),
    0,
    100
  );

  return {
    active: true,
    model: match.model,
    analyses: match.analyses,
    expectedROI,
    expectedProfit,
    expectedScore,
    expectedRisk: estimateExpectedRisk({
      expectedROI,
      expectedProfit,
      expectedScore,
      confidenceScore,
    }),
    expectedLiquidity: estimateExpectedLiquidity({
      expectedROI,
      expectedScore,
      confidenceScore,
    }),
    successProbability,
    confidence: match.confidence,
    confidenceScore,
    signals: buildPredictionSignals({
      match,
      expectedROI,
      expectedProfit,
      expectedScore,
      successProbability,
    }),
  };
}

export function buildBatchOpportunityPredictions({
  opportunities = [],
  historicalModelMemory = [],
} = {}) {
  if (!Array.isArray(opportunities)) return [];

  return opportunities.map((item) => ({
    ...item,
    opportunityPrediction: buildOpportunityPredictor({
      vehicle: item,
      historicalModelMemory,
    }),
  }));
}

function findHistoricalMatch(vehicle, historicalModelMemory) {
  if (!Array.isArray(historicalModelMemory)) return null;

  const vehicleText = normalize(
    [vehicle.title, vehicle.brand, vehicle.model, vehicle.engine]
      .filter(Boolean)
      .join(" ")
  );

  return (
    historicalModelMemory.find((item) => {
      const modelText = normalize(item.model || item.label || "");
      return modelText && vehicleText.includes(modelText);
    }) || null
  );
}

function estimateExpectedRisk({
  expectedROI,
  expectedProfit,
  expectedScore,
  confidenceScore,
}) {
  if (confidenceScore < 50) return "Desconocido";
  if (expectedScore >= 80 && expectedROI >= 12 && expectedProfit >= 3000) {
    return "Bajo";
  }
  if (expectedScore >= 65 && expectedROI >= 7) return "Medio";
  return "Alto";
}

function estimateExpectedLiquidity({
  expectedROI,
  expectedScore,
  confidenceScore,
}) {
  if (confidenceScore < 50) return "Sin confirmar";
  if (expectedScore >= 80 && expectedROI >= 12) return "Alta";
  if (expectedScore >= 65 && expectedROI >= 7) return "Media";
  return "Baja";
}

function buildPredictionSignals({
  match,
  expectedROI,
  expectedProfit,
  expectedScore,
  successProbability,
}) {
  return [
    `${match.model}: ${match.analyses} análisis históricos.`,
    `ROI esperado: ${expectedROI}%.`,
    `Beneficio esperado: ${expectedProfit} €.`,
    `Score histórico medio: ${expectedScore}/100.`,
    `Probabilidad estimada de éxito: ${successProbability}/100.`,
    `Confianza histórica: ${match.confidence}.`,
  ];
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_/+.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}