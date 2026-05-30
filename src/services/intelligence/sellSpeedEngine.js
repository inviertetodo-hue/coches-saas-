export function buildSellSpeed({
  successProbability = 0,
  executiveScore = 0,
  roi = 0,
  profit = 0,
  confidenceScore = 0,
} = {}) {
  let score = 50;

  score += successProbability * 0.25;
  score += executiveScore * 0.20;
  score += confidenceScore * 0.15;

  if (roi >= 15) score += 8;
  if (roi >= 25) score += 5;

  if (profit >= 3000) score += 6;
  if (profit >= 6000) score += 4;

  score = clamp(score, 0, 100);

  const estimatedSellDays = estimateDays(score);

  return {
    sellSpeedScore: score,
    estimatedSellDays,
    speedLabel: getSpeedLabel(score),
    summary: buildSummary(score, estimatedSellDays),
  };
}

function estimateDays(score) {
  if (score >= 90) return 14;
  if (score >= 80) return 21;
  if (score >= 70) return 30;
  if (score >= 60) return 45;
  if (score >= 50) return 60;
  return 90;
}

function getSpeedLabel(score) {
  if (score >= 85) return "FAST_SELLER";
  if (score >= 60) return "NORMAL_SELLER";
  return "SLOW_SELLER";
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
  return Math.min(Math.max(value, min), max);
}