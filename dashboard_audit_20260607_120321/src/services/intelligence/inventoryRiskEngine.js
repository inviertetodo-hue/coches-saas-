export function buildInventoryRisk({
  estimatedSellDays = 60,
  successProbability = 0,
  capitalEfficiencyScore = 50,
  historicalConfidenceScore = 50,
  price = 0,
} = {}) {
  const sellDays = safeNumber(estimatedSellDays);
  const success = safeNumber(successProbability);
  const capitalEfficiency = safeNumber(capitalEfficiencyScore);
  const confidence = safeNumber(historicalConfidenceScore);
  const capital = safeNumber(price);

  let riskScore = 0;

  riskScore += sellDays * 0.55;
  riskScore += Math.max(0, 100 - success) * 0.25;
  riskScore += Math.max(0, 100 - capitalEfficiency) * 0.12;
  riskScore += Math.max(0, 100 - confidence) * 0.08;

  if (capital >= 60000) {
    riskScore += 8;
  }

  if (capital >= 90000) {
    riskScore += 10;
  }

  riskScore = clamp(Math.round(riskScore), 0, 100);

  return {
    inventoryRiskScore: riskScore,
    inventoryRiskLabel: getInventoryRiskLabel(riskScore),
    immobilizedCapitalRisk: getImmobilizedCapitalRisk(
      riskScore,
      sellDays,
      capital
    ),
    summary: buildSummary({
      riskScore,
      sellDays,
      capital,
    }),
  };
}

function getInventoryRiskLabel(score) {
  if (score <= 25) return "LOW_RISK";
  if (score <= 50) return "MODERATE_RISK";
  if (score <= 75) return "HIGH_RISK";
  return "CRITICAL_RISK";
}

function getImmobilizedCapitalRisk(score, sellDays, capital) {
  if (score >= 75) return "Crítico";
  if (score >= 50) return "Alto";
  if (sellDays <= 30 && capital <= 30000) return "Bajo";
  return "Medio";
}

function buildSummary({
  riskScore,
  sellDays,
  capital,
}) {
  return `Riesgo de inventario ${riskScore}/100. Capital estimado inmovilizado ${formatMoney(
    capital
  )} durante aproximadamente ${sellDays} días.`;
}

function formatMoney(value) {
  return `${safeNumber(value).toLocaleString("es-ES")} €`;
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}