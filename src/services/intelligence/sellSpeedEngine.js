export function buildSellSpeed({
  successProbability = 0,
  executiveScore = 0,
  roi = 0,
  profit = 0,
  confidenceScore = 0,
} = {}) {
  const normalizedSuccess = clamp(successProbability, 0, 100);
  const normalizedExecutive = clamp(executiveScore, 0, 100);
  const normalizedConfidence = clamp(confidenceScore, 0, 100);
  const normalizedROI = Number(roi) || 0;
  const normalizedProfit = Number(profit) || 0;

  let score = 45;

  score += normalizedSuccess * 0.25;
  score += normalizedExecutive * 0.20;
  score += normalizedConfidence * 0.20;

  if (normalizedROI >= 8) score += 4;
  if (normalizedROI >= 15) score += 5;
  if (normalizedROI >= 25) score += 4;

  if (normalizedProfit >= 1500) score += 4;
  if (normalizedProfit >= 3000) score += 5;
  if (normalizedProfit >= 6000) score += 4;

  if (normalizedConfidence < 50) score -= 18;
  if (normalizedConfidence < 65) score -= 8;

  if (normalizedROI < 0) score -= 15;
  if (normalizedProfit < 0) score -= 15;

  score = clamp(Math.round(score), 0, 100);

  const estimatedSellDays = estimateDays(score);

  return {
    sellSpeedScore: score,
    estimatedSellDays,
    speedLabel: getSpeedLabel(score),
    liquiditySignal: getLiquiditySignal(score),
    summary: buildSummary(score, estimatedSellDays),
  };
}

function estimateDays(score) {
  if (score >= 90) return 14;
  if (score >= 80) return 21;
  if (score >= 70) return 30;
  if (score >= 60) return 45;
  if (score >= 50) return 60;
  if (score >= 40) return 75;
  return 90;
}

function getSpeedLabel(score) {
  if (score >= 85) return "FAST_SELLER";
  if (score >= 60) return "NORMAL_SELLER";
  return "SLOW_SELLER";
}

function getLiquiditySignal(score) {
  if (score >= 85) return "HIGH_LIQUIDITY";
  if (score >= 60) return "NORMAL_LIQUIDITY";
  return "LOW_LIQUIDITY";
}

function buildSummary(score, days) {
  if (score >= 85) {
    return `Alta rotación prevista. Venta estimada en ${days} días.`;
  }

  if (score >= 60) {
    return `Rotación normal prevista. Venta estimada en ${days} días.`;
  }

  return `Riesgo de inmovilización. Venta estimada en ${days} días.`;
}

function clamp(value, min, max) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return min;
  }

  return Math.min(Math.max(numericValue, min), max);
}