import { buildOpportunityScore } from "./opportunityScoreEngine";
import { buildMarketValuation } from "./marketValuationEngine";

export function buildOpportunityDecision(vehicle = {}) {
  const opportunity = buildOpportunityScore(vehicle);
  const marketValuation = buildMarketValuation(vehicle);

  const opportunityScore = normalizeNumber(opportunity.opportunityScore);
  const valuationScore = normalizeNumber(marketValuation.valuationScore);
  const qualityScore = normalizeNumber(vehicle.qualityScore ?? vehicle.quality);
  const comparableConfidence = normalizeNumber(vehicle.comparableConfidence);
  const roi = normalizeNumber(vehicle.roi);
  const profit = normalizeNumber(vehicle.profit);

  const decisionScore = calculateDecisionScore({
    opportunityScore,
    valuationScore,
    qualityScore,
    comparableConfidence,
    roi,
    profit,
  });

  const action = buildAction({
    decisionScore,
    opportunityScore,
    valuationScore,
    qualityScore,
    comparableConfidence,
    roi,
    profit,
  });

  return {
    action: action.action,
    label: action.label,
    decisionScore,
    confidence: buildDecisionConfidence({
      qualityScore,
      comparableConfidence,
      opportunityScore,
      valuationScore,
    }),
    reasons: buildReasons({
      action: action.action,
      opportunityScore,
      valuationScore,
      qualityScore,
      comparableConfidence,
      roi,
      profit,
      marketValuation,
    }),
    risks: buildRisks({
      qualityScore,
      comparableConfidence,
      roi,
      profit,
      marketValuation,
    }),
    opportunity,
    marketValuation,
    summary: buildSummary({
      action,
      decisionScore,
      opportunityScore,
      valuationScore,
      roi,
      profit,
      marketValuation,
    }),
  };
}

export function enrichWithOpportunityDecision(items = []) {
  return items
    .filter(Boolean)
    .map((item) => ({
      ...item,
      decision: buildOpportunityDecision(item),
    }));
}

function calculateDecisionScore({
  opportunityScore,
  valuationScore,
  qualityScore,
  comparableConfidence,
  roi,
  profit,
}) {
  let score = Math.round(
    opportunityScore * 0.35 +
      valuationScore * 0.30 +
      qualityScore * 0.15 +
      comparableConfidence * 0.15
  );

  if (roi > 0) {
    score += 5;
  }

  if (profit > 0) {
    score += 5;
  }

  if (roi < 0 || profit < 0) {
    score -= 20;
  }

  if (qualityScore < 60 || comparableConfidence < 60) {
    score -= 20;
  }

  return clampScore(score);
}

function buildAction({
  decisionScore,
  opportunityScore,
  valuationScore,
  qualityScore,
  comparableConfidence,
  roi,
  profit,
}) {
  if (qualityScore < 60 || comparableConfidence < 60) {
    return {
      action: "REJECT",
      label: "Descartar",
    };
  }

  if (roi < 0 || profit < 0) {
    return {
      action: "WATCH",
      label: "Observar mercado",
    };
  }

  if (
    decisionScore >= 82 &&
    opportunityScore >= 75 &&
    valuationScore >= 70
  ) {
    return {
      action: "BUY",
      label: "Comprar",
    };
  }

  if (decisionScore >= 65) {
    return {
      action: "WATCH",
      label: "Vigilar / revisar",
    };
  }

  return {
    action: "REJECT",
    label: "Descartar",
  };
}

function buildDecisionConfidence({
  qualityScore,
  comparableConfidence,
  opportunityScore,
  valuationScore,
}) {
  const score = clampScore(
    Math.round(
      qualityScore * 0.30 +
        comparableConfidence * 0.30 +
        opportunityScore * 0.20 +
        valuationScore * 0.20
    )
  );

  if (score >= 85) {
    return {
      level: "high",
      label: "Alta",
      score,
    };
  }

  if (score >= 70) {
    return {
      level: "medium",
      label: "Media",
      score,
    };
  }

  return {
    level: "low",
    label: "Baja",
    score,
  };
}

function buildReasons({
  action,
  opportunityScore,
  valuationScore,
  qualityScore,
  comparableConfidence,
  roi,
  profit,
  marketValuation,
}) {
  const reasons = [];

  if (opportunityScore >= 75) {
    reasons.push(`Opportunity Score atractivo: ${opportunityScore}/100.`);
  }

  if (valuationScore >= 70) {
    reasons.push(`Valoración de mercado favorable: ${valuationScore}/100.`);
  }

  if (marketValuation.discountValue > 0) {
    reasons.push(
      `Ventaja estimada frente a mercado: ${formatCurrency(marketValuation.discountValue)}.`
    );
  }

  if (roi > 0) {
    reasons.push(`ROI positivo estimado: ${formatNumber(roi)}%.`);
  }

  if (profit > 0) {
    reasons.push(`Margen estimado positivo: ${formatCurrency(profit)}.`);
  }

  if (qualityScore >= 80) {
    reasons.push("Calidad de datos alta.");
  }

  if (comparableConfidence >= 75) {
    reasons.push("Confianza de comparables suficiente.");
  }

  if (action === "WATCH" && reasons.length === 0) {
    reasons.push("El vehículo puede aportar información útil de mercado.");
  }

  if (reasons.length === 0) {
    reasons.push("No existen señales suficientes para recomendar compra.");
  }

  return reasons;
}

function buildRisks({
  qualityScore,
  comparableConfidence,
  roi,
  profit,
  marketValuation,
}) {
  const risks = [];

  if (qualityScore < 70) {
    risks.push("Calidad de datos por debajo del umbral recomendado.");
  }

  if (comparableConfidence < 70) {
    risks.push("Confianza de comparables baja.");
  }

  if (roi < 0) {
    risks.push("ROI negativo.");
  }

  if (profit < 0) {
    risks.push("Margen estimado negativo.");
  }

  if (marketValuation.discountValue <= 0) {
    risks.push("No existe ventaja clara frente al valor estimado de mercado.");
  }

  if (risks.length === 0) {
    risks.push("No se detectan riesgos críticos en la evaluación inicial.");
  }

  return risks;
}

function buildSummary({
  action,
  decisionScore,
  opportunityScore,
  valuationScore,
  roi,
  profit,
  marketValuation,
}) {
  return [
    `Decisión: ${action.label}.`,
    `Decision Score: ${decisionScore}/100.`,
    `Opportunity Score: ${opportunityScore}/100.`,
    `Valuation Score: ${valuationScore}/100.`,
    `ROI estimado: ${formatNumber(roi)}%.`,
    `Margen estimado: ${formatCurrency(profit)}.`,
    `Diferencia frente a mercado: ${formatCurrency(marketValuation.discountValue)}.`,
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