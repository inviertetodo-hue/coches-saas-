export function buildMarketTiming({
  successProbability = 0,
  sellSpeedScore = 50,
  capitalEfficiencyScore = 50,
  inventoryRiskScore = 50,
  confidenceScore = 50,
} = {}) {
  let score = 0;

  score += successProbability * 0.35;
  score += sellSpeedScore * 0.25;
  score += capitalEfficiencyScore * 0.20;
  score += confidenceScore * 0.10;
  score += Math.max(0, 100 - inventoryRiskScore) * 0.10;

  score = clamp(Math.round(score), 0, 100);

  return {
    marketTimingScore: score,
    marketTimingLabel: getLabel(score),
    summary: buildSummary(score),
  };
}

function getLabel(score) {
  if (score >= 85) return "STRONG_ENTRY";
  if (score >= 70) return "GOOD_ENTRY";
  if (score >= 55) return "WAIT";
  return "AVOID";
}

function buildSummary(score) {
  if (score >= 85) {
    return "Momento de entrada muy favorable.";
  }

  if (score >= 70) {
    return "Buen momento para estudiar compra.";
  }

  if (score >= 55) {
    return "Conviene esperar confirmación adicional.";
  }

  return "Momento de entrada poco favorable.";
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}