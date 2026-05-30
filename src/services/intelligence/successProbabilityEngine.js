export function buildSuccessProbability({
  opportunity = {},
  prediction = {},
  learning = {},
} = {}) {
  const executiveScore = safeNumber(
    opportunity.executiveScore ||
      opportunity.priorityScore ||
      opportunity.score
  );

  const roi = safeNumber(
    prediction.expectedROI ||
      opportunity.historicalAverageROI ||
      opportunity.roi
  );

  const profit = safeNumber(
    prediction.expectedProfit ||
      opportunity.historicalAverageProfit ||
      opportunity.profit
  );

  const confidenceScore = safeNumber(
    prediction.confidenceScore ||
      opportunity.historicalConfidenceScore ||
      learning.confidenceScore
  );

  const learningBonus = safeNumber(
    opportunity.learningBonus ||
      learning.learningBonus
  );

  let successProbability = 0;

  successProbability += executiveScore * 0.42;
  successProbability += Math.min(roi * 1.4, 24);
  successProbability += Math.min(profit / 1000, 18);
  successProbability += confidenceScore * 0.22;
  successProbability += learningBonus * 1.2;

  successProbability = clamp(Math.round(successProbability), 0, 100);

  return {
    successProbability,
    buySignal: getBuySignal(successProbability),
    estimatedSellDays: estimateSellDays(successProbability, confidenceScore),
    expectedROI: roi,
    expectedProfit: profit,
    confidenceScore,
    learningBonus,
    riskLabel: getRiskLabel(successProbability, confidenceScore),
    summary: buildSummary({
      successProbability,
      roi,
      profit,
      confidenceScore,
      learningBonus,
    }),
  };
}

export function enrichOpportunitiesWithSuccessProbability(items = []) {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const prediction = item.opportunityPrediction || {};
    const learning = {
      learningBonus: item.learningBonus,
      confidenceScore: item.historicalConfidenceScore,
    };

    return {
      ...item,
      successEngine: buildSuccessProbability({
        opportunity: item,
        prediction,
        learning,
      }),
    };
  });
}

function getBuySignal(probability) {
  if (probability >= 85) return "FUERTE";
  if (probability >= 72) return "INTERESANTE";
  if (probability >= 58) return "VIGILAR";
  return "DÉBIL";
}

function estimateSellDays(probability, confidenceScore) {
  if (confidenceScore < 50) return 75;
  if (probability >= 85) return 28;
  if (probability >= 72) return 42;
  if (probability >= 58) return 60;
  return 90;
}

function getRiskLabel(probability, confidenceScore) {
  if (confidenceScore < 50) return "Desconocido";
  if (probability >= 85) return "Bajo";
  if (probability >= 72) return "Medio-bajo";
  if (probability >= 58) return "Medio";
  return "Alto";
}

function buildSummary({
  successProbability,
  roi,
  profit,
  confidenceScore,
  learningBonus,
}) {
  return `Probabilidad de éxito ${successProbability}/100, ROI esperado ${roi}%, beneficio esperado ${profit} €, confianza histórica ${confidenceScore}/100 y ajuste learning ${formatBonus(learningBonus)}.`;
}

function formatBonus(value) {
  const number = safeNumber(value);
  if (number > 0) return `+${number}`;
  return String(number);
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}