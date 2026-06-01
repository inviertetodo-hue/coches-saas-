import { buildOpportunityScore } from "./opportunityScoreEngine";
import { buildMarketValuation } from "./marketValuationEngine";

export function buildOpportunityDecision(vehicle = {}) {
  const opportunity = vehicle.opportunity || buildOpportunityScore(vehicle);
  const marketValuation =
    vehicle.valuation?.memoryValuation ||
    vehicle.marketValuation ||
    buildMarketValuation(vehicle);

  const vehicleValuation = vehicle.vehicleValuation || vehicle.valuation?.memoryValuation || null;
  const comparables = vehicle.comparables || vehicle.valuation?.comparables || null;
  const sellSpeed = vehicle.sellSpeed || null;

  const opportunityScoreV2 = normalizeNumber(
    opportunity.scoreV2 ??
      opportunity.opportunityScoreV2 ??
      opportunity.opportunityScore
  );

  const opportunityScore = normalizeNumber(opportunity.opportunityScore);
  const valuationScore = normalizeNumber(
    vehicle.valuation?.valuationScore ??
      marketValuation.valuationScore
  );

  const qualityScore = normalizeNumber(vehicle.qualityScore ?? vehicle.quality);
  const comparableConfidence = normalizeNumber(
    vehicleValuation?.confidence ??
      vehicle.comparableConfidence
  );

  const roi = normalizeNumber(vehicle.roi);
  const profit = normalizeNumber(vehicle.profit);
  const comparableCount = normalizeNumber(
    comparables?.totalComparables ??
      vehicleValuation?.comparableCount
  );

  const sellSpeedScore = normalizeNumber(sellSpeed?.sellSpeedScore);
  const estimatedSellDays = normalizeNumber(sellSpeed?.estimatedSellDays);
  const discountPercent = normalizeNumber(
    vehicleValuation?.discountPercent ??
      vehicle.valuation?.discountPercent ??
      marketValuation.discountPercent
  );

  const decisionScore = calculateDecisionScoreV2({
    opportunityScoreV2,
    valuationScore,
    qualityScore,
    comparableConfidence,
    comparableCount,
    sellSpeedScore,
    roi,
    profit,
    discountPercent,
  });

  const action = buildActionV2({
    decisionScore,
    opportunityScoreV2,
    qualityScore,
    comparableConfidence,
    comparableCount,
    roi,
    profit,
  });

  return {
    action: action.action,
    label: action.label,
    decisionScore,
    confidence: buildDecisionConfidenceV2({
      qualityScore,
      comparableConfidence,
      opportunityScoreV2,
      valuationScore,
      comparableCount,
    }),
    reasons: buildReasonsV2({
      action: action.action,
      opportunityScoreV2,
      valuationScore,
      qualityScore,
      comparableConfidence,
      comparableCount,
      roi,
      profit,
      discountPercent,
      sellSpeedScore,
      estimatedSellDays,
      vehicleValuation,
      marketValuation,
    }),
    risks: buildRisksV2({
      qualityScore,
      comparableConfidence,
      comparableCount,
      roi,
      profit,
      discountPercent,
      sellSpeedScore,
      marketValuation,
    }),
    opportunity,
    marketValuation,
    vehicleValuation,
    comparables,
    sellSpeed,
    summary: buildSummaryV2({
      action,
      decisionScore,
      opportunityScoreV2,
      valuationScore,
      roi,
      profit,
      discountPercent,
      comparableCount,
      comparableConfidence,
      sellSpeed,
      marketValuation,
    }),
  };
}

export function enrichWithOpportunityDecision(items = []) {
  return items
    .filter(Boolean)
    .map((item) => ({
      ...item,
      decision: item.decision || buildOpportunityDecision(item),
    }));
}

function calculateDecisionScoreV2({
  opportunityScoreV2,
  valuationScore,
  qualityScore,
  comparableConfidence,
  comparableCount,
  sellSpeedScore,
  roi,
  profit,
  discountPercent,
}) {
  let score = opportunityScoreV2 || 0;

  if (!score) {
    score = Math.round(
      valuationScore * 0.35 +
        qualityScore * 0.20 +
        comparableConfidence * 0.25 +
        sellSpeedScore * 0.20
    );
  }

  if (comparableCount >= 1) score += 3;
  if (comparableCount >= 3) score += 4;

  if (sellSpeedScore >= 80) score += 4;
  if (sellSpeedScore < 50 && sellSpeedScore > 0) score -= 8;

  if (discountPercent >= 5) score += 4;
  if (discountPercent < 0) score -= 12;

  if (roi < 0) score -= 15;
  if (profit < 0) score -= 15;

  if (qualityScore > 0 && qualityScore < 60) score -= 20;
  if (comparableConfidence > 0 && comparableConfidence < 55) score -= 12;

  return clampScore(score);
}

function buildActionV2({
  decisionScore,
  opportunityScoreV2,
  qualityScore,
  comparableConfidence,
  comparableCount,
  roi,
  profit,
}) {
  if (qualityScore > 0 && qualityScore < 60) {
    return { action: "REJECT", label: "Descartar" };
  }

  if (roi < 0 || profit < 0) {
    return { action: "WATCH", label: "Observar mercado" };
  }

  if (opportunityScoreV2 >= 85 && decisionScore >= 80) {
    return { action: "BUY", label: "Comprar" };
  }

  if (opportunityScoreV2 >= 65 || decisionScore >= 65) {
    return { action: "WATCH", label: "Vigilar / revisar" };
  }

  if (comparableCount === 0 && comparableConfidence < 60) {
    return { action: "REJECT", label: "Descartar" };
  }

  return { action: "REJECT", label: "Descartar" };
}

function buildDecisionConfidenceV2({
  qualityScore,
  comparableConfidence,
  opportunityScoreV2,
  valuationScore,
  comparableCount,
}) {
  let score = Math.round(
    qualityScore * 0.25 +
      comparableConfidence * 0.30 +
      opportunityScoreV2 * 0.25 +
      valuationScore * 0.20
  );

  if (comparableCount >= 1) score += 5;
  if (comparableCount >= 3) score += 5;

  score = clampScore(score);

  if (score >= 85) {
    return { level: "high", label: "Alta", score };
  }

  if (score >= 70) {
    return { level: "medium", label: "Media", score };
  }

  return { level: "low", label: "Baja", score };
}

function buildReasonsV2({
  action,
  opportunityScoreV2,
  valuationScore,
  qualityScore,
  comparableConfidence,
  comparableCount,
  roi,
  profit,
  discountPercent,
  sellSpeedScore,
  estimatedSellDays,
  vehicleValuation,
  marketValuation,
}) {
  const reasons = [];

  if (opportunityScoreV2 >= 85) {
    reasons.push(`Score V2 fuerte: ${opportunityScoreV2}/100.`);
  }

  if (opportunityScoreV2 >= 65 && opportunityScoreV2 < 85) {
    reasons.push(`Score V2 interesante: ${opportunityScoreV2}/100.`);
  }

  if (valuationScore >= 70) {
    reasons.push(`Valoración de mercado favorable: ${valuationScore}/100.`);
  }

  const discountValue = normalizeNumber(
    vehicleValuation?.discountAmount ??
      marketValuation.discountValue
  );

  if (discountValue > 0) {
    reasons.push(
      `Ventaja estimada frente a mercado: ${formatCurrency(discountValue)}.`
    );
  }

  if (discountPercent > 0) {
    reasons.push(`Descuento frente a valoración: ${formatNumber(discountPercent)}%.`);
  }

  if (roi > 0) {
    reasons.push(`ROI positivo estimado: ${formatNumber(roi)}%.`);
  }

  if (profit > 0) {
    reasons.push(`Margen estimado positivo: ${formatCurrency(profit)}.`);
  }

  if (comparableCount > 0) {
    reasons.push(`${comparableCount} comparable(s) usados para la valoración.`);
  }

  if (comparableConfidence >= 75) {
    reasons.push(`Confianza de valoración alta: ${comparableConfidence}/100.`);
  }

  if (sellSpeedScore >= 80) {
    reasons.push(
      `Rotación prevista alta: venta estimada en ${estimatedSellDays || 0} días.`
    );
  }

  if (qualityScore >= 80) {
    reasons.push("Calidad de datos alta.");
  }

  if (action === "WATCH" && reasons.length === 0) {
    reasons.push("El vehículo puede aportar información útil de mercado.");
  }

  if (reasons.length === 0) {
    reasons.push("No existen señales suficientes para recomendar compra.");
  }

  return reasons;
}

function buildRisksV2({
  qualityScore,
  comparableConfidence,
  comparableCount,
  roi,
  profit,
  discountPercent,
  sellSpeedScore,
}) {
  const risks = [];

  if (qualityScore > 0 && qualityScore < 70) {
    risks.push("Calidad de datos por debajo del umbral recomendado.");
  }

  if (comparableCount === 0) {
    risks.push("Sin comparables suficientes para defender la valoración.");
  }

  if (comparableConfidence > 0 && comparableConfidence < 70) {
    risks.push("Confianza de valoración baja.");
  }

  if (roi < 0) {
    risks.push("ROI negativo.");
  }

  if (profit < 0) {
    risks.push("Margen estimado negativo.");
  }

  if (discountPercent <= 0) {
    risks.push("No existe descuento claro frente al valor estimado.");
  }

  if (sellSpeedScore > 0 && sellSpeedScore < 55) {
    risks.push("Riesgo de rotación lenta.");
  }

  if (risks.length === 0) {
    risks.push("No se detectan riesgos críticos en la evaluación inicial.");
  }

  return risks;
}

function buildSummaryV2({
  action,
  decisionScore,
  opportunityScoreV2,
  valuationScore,
  roi,
  profit,
  discountPercent,
  comparableCount,
  comparableConfidence,
  sellSpeed,
}) {
  return [
    `Decisión: ${action.label}.`,
    `Decision Score V2: ${decisionScore}/100.`,
    `Opportunity Score V2: ${opportunityScoreV2}/100.`,
    `Valuation Score: ${valuationScore}/100.`,
    `ROI estimado: ${formatNumber(roi)}%.`,
    `Margen estimado: ${formatCurrency(profit)}.`,
    `Descuento frente a valoración: ${formatNumber(discountPercent)}%.`,
    `Comparables: ${comparableCount}.`,
    `Confianza: ${comparableConfidence}/100.`,
    sellSpeed?.estimatedSellDays
      ? `Venta estimada: ${sellSpeed.estimatedSellDays} días.`
      : "Venta estimada: sin dato.",
  ].join(" ");
}

function normalizeNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return numericValue;
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatCurrency(value) {
  return `${Math.round(normalizeNumber(value)).toLocaleString("es-ES")} €`;
}

function formatNumber(value) {
  return normalizeNumber(value).toLocaleString("es-ES", {
    maximumFractionDigits: 2,
  });
}