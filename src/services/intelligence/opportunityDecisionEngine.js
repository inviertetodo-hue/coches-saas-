import { buildOpportunityScore } from "./opportunityScoreEngine";
import { buildMarketValuation } from "./marketValuationEngine";

export function buildOpportunityDecision(vehicle = {}) {
  const opportunity = vehicle.opportunity || buildOpportunityScore(vehicle);
  const marketValuation =
    vehicle.valuation?.memoryValuation ||
    vehicle.marketValuation ||
    buildMarketValuation(vehicle);

  const vehicleValuation =
    vehicle.vehicleValuation || vehicle.valuation?.memoryValuation || null;
  const comparables = vehicle.comparables || vehicle.valuation?.comparables || null;
  const sellSpeed = vehicle.sellSpeed || null;

  const opportunityScoreV2 = normalizeNumber(
    opportunity.scoreV2 ??
      opportunity.opportunityScoreV2 ??
      opportunity.opportunityScore
  );

  const valuationScore = normalizeNumber(
    vehicle.valuation?.valuationScore ?? marketValuation.valuationScore
  );

  const qualityScore = normalizeNumber(vehicle.qualityScore ?? vehicle.quality);
  const comparableConfidence = normalizeNumber(
    vehicleValuation?.confidence ?? vehicle.comparableConfidence
  );

  const roi = normalizeNumber(vehicle.roi);
  const profit = normalizeNumber(vehicle.profit);
  const comparableCount = normalizeNumber(
    comparables?.totalComparables ?? vehicleValuation?.comparableCount
  );

  const sellSpeedScore = normalizeNumber(
    sellSpeed?.sellSpeedScore ?? vehicle.sellSpeedScore
  );
  const estimatedSellDays = normalizeNumber(
    sellSpeed?.estimatedSellDays ?? vehicle.estimatedSellDays
  );
  const discountPercent = normalizeNumber(
    vehicleValuation?.discountPercent ??
      vehicle.valuation?.discountPercent ??
      marketValuation.discountPercent
  );

  const executiveBuySignalScore = normalizeNumber(
    vehicle.executiveBuySignalScore ??
      vehicle.executiveBuySignal?.finalScore
  );

  const executiveBuySignalLabel =
    vehicle.executiveBuySignalLabel ||
    vehicle.executiveBuySignal?.signal ||
    "";

  const timelineMomentumScore = normalizeNumber(vehicle.timelineMomentumScore);
  const timelineMomentumLabel = vehicle.timelineMomentumLabel || "";

  const marketTimingScore = normalizeNumber(vehicle.marketTimingScore);
  const marketTimingLabel = vehicle.marketTimingLabel || "";

  const capitalEfficiencyScore = normalizeNumber(vehicle.capitalEfficiencyScore);
  const capitalEfficiencyLabel = vehicle.capitalEfficiencyLabel || "";

  const inventoryRiskScore = normalizeNumber(vehicle.inventoryRiskScore);
  const inventoryRiskLabel = vehicle.inventoryRiskLabel || "";

  const allocationScore = normalizeNumber(vehicle.allocationScore);
  const allocationTier = vehicle.allocationTier || "";

  const successProbability = normalizeNumber(vehicle.successProbability);

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
    executiveBuySignalScore,
    timelineMomentumScore,
    marketTimingScore,
    capitalEfficiencyScore,
    inventoryRiskScore,
    allocationScore,
    successProbability,
  });

  const action = buildActionV2({
    decisionScore,
    opportunityScoreV2,
    qualityScore,
    comparableConfidence,
    comparableCount,
    roi,
    profit,
    executiveBuySignalScore,
    executiveBuySignalLabel,
    timelineMomentumScore,
    timelineMomentumLabel,
    marketTimingScore,
    marketTimingLabel,
    capitalEfficiencyScore,
    inventoryRiskScore,
    inventoryRiskLabel,
    allocationScore,
    allocationTier,
    successProbability,
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
      executiveBuySignalScore,
      timelineMomentumScore,
      marketTimingScore,
      capitalEfficiencyScore,
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
      executiveBuySignalScore,
      executiveBuySignalLabel,
      timelineMomentumScore,
      timelineMomentumLabel,
      marketTimingScore,
      marketTimingLabel,
      capitalEfficiencyScore,
      capitalEfficiencyLabel,
      inventoryRiskScore,
      inventoryRiskLabel,
      allocationScore,
      allocationTier,
      successProbability,
    }),
    risks: buildRisksV2({
      qualityScore,
      comparableConfidence,
      comparableCount,
      roi,
      profit,
      discountPercent,
      sellSpeedScore,
      executiveBuySignalScore,
      timelineMomentumScore,
      marketTimingScore,
      inventoryRiskScore,
      allocationScore,
    }),
    opportunity,
    marketValuation,
    vehicleValuation,
    comparables,
    sellSpeed,
    executiveBuySignalScore,
    executiveBuySignalLabel,
    timelineMomentumScore,
    timelineMomentumLabel,
    marketTimingScore,
    marketTimingLabel,
    capitalEfficiencyScore,
    capitalEfficiencyLabel,
    inventoryRiskScore,
    inventoryRiskLabel,
    allocationScore,
    allocationTier,
    successProbability,
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
      executiveBuySignalScore,
      executiveBuySignalLabel,
      timelineMomentumScore,
      timelineMomentumLabel,
      marketTimingScore,
      marketTimingLabel,
      capitalEfficiencyScore,
      inventoryRiskScore,
      allocationScore,
      allocationTier,
      successProbability,
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
  executiveBuySignalScore,
  timelineMomentumScore,
  marketTimingScore,
  capitalEfficiencyScore,
  inventoryRiskScore,
  allocationScore,
  successProbability,
}) {
  let score = opportunityScoreV2 || 0;

  if (!score) {
    score = Math.round(
      valuationScore * 0.30 +
        qualityScore * 0.16 +
        comparableConfidence * 0.22 +
        sellSpeedScore * 0.16 +
        successProbability * 0.16
    );
  }

  if (executiveBuySignalScore > 0) {
    score = Math.round(score * 0.72 + executiveBuySignalScore * 0.28);
  }

  if (allocationScore > 0) {
    score = Math.round(score * 0.86 + allocationScore * 0.14);
  }

  if (marketTimingScore > 0) {
    score = Math.round(score * 0.90 + marketTimingScore * 0.10);
  }

  if (capitalEfficiencyScore > 0) {
    score = Math.round(score * 0.91 + capitalEfficiencyScore * 0.09);
  }

  if (timelineMomentumScore > 0) {
    score += Math.round((timelineMomentumScore - 50) * 0.18);
  }

  if (inventoryRiskScore >= 80) score -= 18;
  if (inventoryRiskScore >= 65) score -= 10;

  if (sellSpeedScore < 50 && sellSpeedScore > 0) score -= 8;

  if (discountPercent < 0) score -= 12;

  if (roi < 0) score -= 15;
  if (profit < 0) score -= 15;

  if (qualityScore > 0 && qualityScore < 60) score -= 20;
  if (comparableConfidence > 0 && comparableConfidence < 55) score -= 12;

  let decisionScore = clampScore(score);

  // Cortafuegos económico del Radar
  if (profit < 0 && roi <= 0) {
    decisionScore = Math.min(decisionScore, 35);
  } else if (profit < 0) {
    decisionScore = Math.min(decisionScore, 45);
  } else if (roi <= 0) {
    decisionScore = Math.min(decisionScore, 55);
  }

  // Techo económico: reservar 95-100 para oportunidades excepcionales.
  if (roi > 0 && roi < 3) {
    decisionScore = Math.min(decisionScore, 60);
  } else if (roi >= 3 && roi < 5) {
    decisionScore = Math.min(decisionScore, 75);
  } else if (roi >= 5 && roi < 8) {
    decisionScore = Math.min(decisionScore, 85);
  } else if (roi >= 8 && roi < 12) {
    decisionScore = Math.min(decisionScore, 92);
  }

  if (profit > 0 && profit < 1000) {
    decisionScore = Math.min(decisionScore, 62);
  } else if (profit >= 1000 && profit < 2000) {
    decisionScore = Math.min(decisionScore, 76);
  } else if (profit >= 2000 && profit < 4000) {
    decisionScore = Math.min(decisionScore, 88);
  }

  return decisionScore;
}

function buildActionV2({
  decisionScore,
  opportunityScoreV2,
  qualityScore,
  comparableConfidence,
  comparableCount,
  roi,
  profit,
  executiveBuySignalScore,
  executiveBuySignalLabel,
  timelineMomentumScore,
  timelineMomentumLabel,
  marketTimingScore,
  marketTimingLabel,
  capitalEfficiencyScore,
  inventoryRiskScore,
  inventoryRiskLabel,
  allocationScore,
  allocationTier,
  successProbability,
}) {
  if (qualityScore > 0 && qualityScore < 60) {
    return { action: "REJECT", label: "Descartar" };
  }

  if (roi < 0 || profit < 0) {
    return { action: "WATCH", label: "Observar mercado" };
  }

  if (
    inventoryRiskLabel === "CRITICAL_RISK" ||
    inventoryRiskScore >= 85 ||
    marketTimingLabel === "AVOID" ||
    timelineMomentumLabel === "AVOID_TREND"
  ) {
    return { action: "REJECT", label: "Descartar" };
  }

  const hasExecutiveBuy =
    executiveBuySignalLabel === "STRONG_BUY" ||
    executiveBuySignalLabel === "BUY" ||
    executiveBuySignalScore >= 78;

  const hasStrongScore = opportunityScoreV2 >= 85 && decisionScore >= 80;
  const hasReliableEvidence =
    comparableConfidence >= 70 && comparableCount >= 2;
  const hasPositiveEconomics =
    roi >= 5 &&
    profit >= 1500;

  const hasModernConfirmation =
    successProbability >= 70 ||
    allocationScore >= 70 ||
    allocationTier === "TIER_1" ||
    allocationTier === "TIER_2" ||
    capitalEfficiencyScore >= 70 ||
    marketTimingScore >= 70 ||
    timelineMomentumScore >= 70;

  const hasModernRisk =
    inventoryRiskScore >= 70 ||
    marketTimingLabel === "WAIT" ||
    timelineMomentumLabel === "DETERIORATING";

  if (
    hasExecutiveBuy &&
    hasPositiveEconomics &&
    decisionScore >= 75 &&
    !hasModernRisk
  ) {
    return { action: "BUY", label: "Comprar" };
  }

  if (
    hasStrongScore &&
    hasReliableEvidence &&
    hasPositiveEconomics &&
    hasModernConfirmation &&
    !hasModernRisk
  ) {
    return { action: "BUY", label: "Comprar" };
  }

  if (hasExecutiveBuy || hasStrongScore || hasModernConfirmation) {
    return { action: "WATCH", label: "Validar oportunidad" };
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
  executiveBuySignalScore,
  timelineMomentumScore,
  marketTimingScore,
  capitalEfficiencyScore,
}) {
  let score = Math.round(
    qualityScore * 0.20 +
      comparableConfidence * 0.25 +
      opportunityScoreV2 * 0.20 +
      valuationScore * 0.15 +
      executiveBuySignalScore * 0.08 +
      timelineMomentumScore * 0.04 +
      marketTimingScore * 0.04 +
      capitalEfficiencyScore * 0.04
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
  executiveBuySignalScore,
  executiveBuySignalLabel,
  timelineMomentumScore,
  timelineMomentumLabel,
  marketTimingScore,
  marketTimingLabel,
  capitalEfficiencyScore,
  capitalEfficiencyLabel,
  inventoryRiskScore,
  inventoryRiskLabel,
  allocationScore,
  allocationTier,
  successProbability,
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
    vehicleValuation?.discountAmount ?? marketValuation.discountValue
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

  if (executiveBuySignalScore > 0) {
    reasons.push(
      `Señal ejecutiva moderna: ${executiveBuySignalLabel || "SIN_LABEL"} (${executiveBuySignalScore}/100).`
    );
  }

  if (timelineMomentumScore > 0) {
    reasons.push(
      `Momentum temporal: ${timelineMomentumLabel || "SIN_LABEL"} (${timelineMomentumScore}/100).`
    );
  }

  if (marketTimingScore > 0) {
    reasons.push(
      `Market timing: ${marketTimingLabel || "SIN_LABEL"} (${marketTimingScore}/100).`
    );
  }

  if (capitalEfficiencyScore > 0) {
    reasons.push(
      `Eficiencia de capital: ${capitalEfficiencyLabel || "SIN_LABEL"} (${capitalEfficiencyScore}/100).`
    );
  }

  if (allocationScore > 0) {
    reasons.push(
      `Asignación de capital: ${allocationTier || "SIN_TIER"} (${allocationScore}/100).`
    );
  }

  if (successProbability > 0) {
    reasons.push(`Probabilidad de éxito: ${successProbability}/100.`);
  }

  if (inventoryRiskScore >= 70) {
    reasons.push(
      `Riesgo de inventario elevado: ${inventoryRiskLabel || "SIN_LABEL"} (${inventoryRiskScore}/100).`
    );
  }

  if (
    action === "WATCH" &&
    opportunityScoreV2 >= 85 &&
    (comparableConfidence < 70 || comparableCount < 2)
  ) {
    reasons.push(
      "Score alto, pero falta evidencia suficiente para confirmar compra directa."
    );
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
  executiveBuySignalScore,
  timelineMomentumScore,
  marketTimingScore,
  inventoryRiskScore,
  allocationScore,
}) {
  const risks = [];

  if (qualityScore > 0 && qualityScore < 70) {
    risks.push("Calidad de datos por debajo del umbral recomendado.");
  }

  if (comparableCount === 0) {
    risks.push("Sin comparables suficientes para defender la valoración.");
  }

  if (comparableCount > 0 && comparableCount < 2) {
    risks.push("Pocos comparables para confirmar una compra directa.");
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

  if (executiveBuySignalScore > 0 && executiveBuySignalScore < 62) {
    risks.push("Señal ejecutiva moderna todavía débil.");
  }

  if (timelineMomentumScore > 0 && timelineMomentumScore < 45) {
    risks.push("Momentum temporal negativo.");
  }

  if (marketTimingScore > 0 && marketTimingScore < 50) {
    risks.push("Timing de mercado poco favorable.");
  }

  if (inventoryRiskScore >= 70) {
    risks.push("Riesgo de inventario elevado.");
  }

  if (allocationScore > 0 && allocationScore < 50) {
    risks.push("Baja prioridad de asignación de capital.");
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
  executiveBuySignalScore,
  executiveBuySignalLabel,
  timelineMomentumScore,
  timelineMomentumLabel,
  marketTimingScore,
  marketTimingLabel,
  capitalEfficiencyScore,
  inventoryRiskScore,
  allocationScore,
  allocationTier,
  successProbability,
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
    executiveBuySignalScore > 0
      ? `Señal ejecutiva: ${executiveBuySignalLabel || "SIN_LABEL"} (${executiveBuySignalScore}/100).`
      : "Señal ejecutiva: sin dato.",
    timelineMomentumScore > 0
      ? `Momentum temporal: ${timelineMomentumLabel || "SIN_LABEL"} (${timelineMomentumScore}/100).`
      : "Momentum temporal: sin dato.",
    marketTimingScore > 0
      ? `Market timing: ${marketTimingLabel || "SIN_LABEL"} (${marketTimingScore}/100).`
      : "Market timing: sin dato.",
    capitalEfficiencyScore > 0
      ? `Capital efficiency: ${capitalEfficiencyScore}/100.`
      : "Capital efficiency: sin dato.",
    inventoryRiskScore > 0
      ? `Inventory risk: ${inventoryRiskScore}/100.`
      : "Inventory risk: sin dato.",
    allocationScore > 0
      ? `Allocation: ${allocationTier || "SIN_TIER"} (${allocationScore}/100).`
      : "Allocation: sin dato.",
    successProbability > 0
      ? `Success probability: ${successProbability}/100.`
      : "Success probability: sin dato.",
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