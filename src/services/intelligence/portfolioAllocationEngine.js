export function buildPortfolioAllocation({
  executiveBuySignalScore = 0,
  marketTimingScore = 0,
  capitalEfficiencyScore = 0,
  inventoryRiskScore = 50,
  successProbability = 0,
  price = 0,
  profit = 0,
} = {}) {
  let score = 0;

  score += executiveBuySignalScore * 0.30;
  score += marketTimingScore * 0.25;
  score += capitalEfficiencyScore * 0.20;
  score += successProbability * 0.15;
  score += Math.max(0, 100 - inventoryRiskScore) * 0.10;

  if (profit >= 5000) score += 3;
  if (profit >= 10000) score += 2;

  if (price >= 60000) score -= 2;
  if (price >= 100000) score -= 3;

  score = clamp(Math.round(score), 0, 100);

  return {
    allocationScore: score,
    allocationTier: getTier(score),
    summary: buildSummary(score),
  };
}

function getTier(score) {
  if (score >= 85) return "TIER_1";
  if (score >= 70) return "TIER_2";
  if (score >= 55) return "TIER_3";
  return "AVOID";
}

function buildSummary(score) {
  if (score >= 85) {
    return "Prioridad máxima de asignación de capital.";
  }

  if (score >= 70) {
    return "Buena utilización potencial del capital.";
  }

  if (score >= 55) {
    return "Oportunidad aceptable, pero no prioritaria.";
  }

  return "No recomendable para asignación de capital.";
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}