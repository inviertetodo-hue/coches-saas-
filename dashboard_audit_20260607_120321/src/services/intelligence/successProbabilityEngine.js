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
    opportunity.roi ??
      prediction.expectedROI ??
      opportunity.historicalAverageROI
  );

  const profit = safeNumber(
    opportunity.profit ??
      prediction.expectedProfit ??
      opportunity.historicalAverageProfit
  );

  const confidenceScore = safeNumber(
    opportunity.historicalConfidenceScore ??
      prediction.confidenceScore ??
      learning.confidenceScore
  );

  const learningBonus = safeNumber(
    opportunity.learningBonus ||
      learning.learningBonus
  );

  let successProbability = 0;

  successProbability += executiveScore * 0.22;
  successProbability += buildRoiScore(roi) * 0.36;
  successProbability += buildProfitScore(profit) * 0.32;
  successProbability += confidenceScore * 0.08;
  successProbability += learningBonus * 0.8;

  if (roi >= 8 && profit >= 4000) successProbability += 12;
  if (roi >= 10 && profit >= 5000) successProbability += 10;
  if (roi <= 0 || profit <= 0) successProbability -= 18;
  if (roi > 0 && roi < 3) successProbability -= 8;
  if (profit > 0 && profit < 1000) successProbability -= 8;

  successProbability = clamp(Math.round(successProbability), 0, 100);

  return {
    successProbability,
    buySignal: getBuySignal(successProbability),
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

function buildRoiScore(roi) {
  if (roi <= 0) return 0;
  if (roi >= 15) return 100;
  if (roi >= 12) return 92;
  if (roi >= 10) return 84;
  if (roi >= 8) return 74;
  if (roi >= 6) return 64;
  if (roi >= 5) return 56;
  if (roi >= 3) return 42;
  return 24;
}

function buildProfitScore(profit) {
  if (profit <= 0) return 0;
  if (profit >= 8000) return 100;
  if (profit >= 6000) return 88;
  if (profit >= 5000) return 78;
  if (profit >= 4000) return 68;
  if (profit >= 3000) return 56;
  if (profit >= 2000) return 44;
  if (profit >= 1000) return 30;
  return 16;
}

function getBuySignal(probability) {
  if (probability >= 85) return "FUERTE";
  if (probability >= 72) return "INTERESANTE";
  if (probability >= 58) return "VIGILAR";
  return "DÉBIL";
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
