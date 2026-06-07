export function buildCapitalEfficiency({
  price = 0,
  profit = 0,
  roi = 0,
  estimatedSellDays = 60,
  successProbability = 0,
  executiveBuySignalScore = 0,
} = {}) {
  const capitalRequired = safeNumber(price);
  const expectedProfit = safeNumber(profit);
  const expectedROI = safeNumber(roi);
  const sellDays = Math.max(safeNumber(estimatedSellDays), 1);
  const successScore = safeNumber(successProbability);
  const executiveScore = safeNumber(executiveBuySignalScore);

  const capitalVelocity = calculateCapitalVelocity(sellDays);
  const profitPerDay = expectedProfit / sellDays;
  const profitPerThousand = capitalRequired > 0
    ? (expectedProfit / capitalRequired) * 1000
    : 0;

  const annualizedProfitPotential = Math.round(profitPerDay * 365);

  let capitalEfficiencyScore = 0;

  capitalEfficiencyScore += Math.min(expectedROI * 2.2, 28);
  capitalEfficiencyScore += Math.min(profitPerThousand * 2.6, 24);
  capitalEfficiencyScore += capitalVelocity * 0.22;
  capitalEfficiencyScore += successScore * 0.18;
  capitalEfficiencyScore += executiveScore * 0.12;

  capitalEfficiencyScore = clamp(
    Math.round(capitalEfficiencyScore),
    0,
    100
  );

  return {
    capitalRequired,
    expectedProfit,
    expectedROI,
    estimatedSellDays: sellDays,
    profitPerDay: round(profitPerDay),
    profitPerThousand: round(profitPerThousand),
    capitalVelocity,
    annualizedProfitPotential,
    capitalEfficiencyScore,
    capitalEfficiencyLabel: getCapitalEfficiencyLabel(capitalEfficiencyScore),
    capitalRisk: getCapitalRisk({
      capitalRequired,
      sellDays,
      successScore,
    }),
    summary: buildSummary({
      capitalEfficiencyScore,
      capitalRequired,
      expectedProfit,
      sellDays,
      annualizedProfitPotential,
    }),
  };
}

function calculateCapitalVelocity(days) {
  if (days <= 14) return 100;
  if (days <= 21) return 92;
  if (days <= 30) return 82;
  if (days <= 45) return 68;
  if (days <= 60) return 55;
  if (days <= 90) return 38;
  return 20;
}

function getCapitalEfficiencyLabel(score) {
  if (score >= 85) return "CAPITAL_STAR";
  if (score >= 72) return "EFFICIENT";
  if (score >= 58) return "ACCEPTABLE";
  if (score >= 42) return "WEAK";
  return "POOR";
}

function getCapitalRisk({
  capitalRequired,
  sellDays,
  successScore,
}) {
  if (capitalRequired >= 70000 && sellDays >= 60) return "Alto";
  if (successScore < 55 && sellDays >= 60) return "Alto";
  if (capitalRequired >= 50000 && sellDays >= 45) return "Medio-alto";
  if (sellDays <= 30 && successScore >= 75) return "Bajo";
  return "Medio";
}

function buildSummary({
  capitalEfficiencyScore,
  capitalRequired,
  expectedProfit,
  sellDays,
  annualizedProfitPotential,
}) {
  return `Eficiencia de capital ${capitalEfficiencyScore}/100: requiere ${formatMoney(
    capitalRequired
  )}, beneficio esperado ${formatMoney(
    expectedProfit
  )}, rotación estimada ${sellDays} días y potencial anualizado ${formatMoney(
    annualizedProfitPotential
  )}.`;
}

function formatMoney(value) {
  return `${safeNumber(value).toLocaleString("es-ES")} €`;
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}