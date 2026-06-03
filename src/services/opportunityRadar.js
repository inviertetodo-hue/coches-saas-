export function generateOpportunityRadar(analyses = []) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    return {
      radarScore: 0,
      radarLevel: "Sin datos",
      priorityOpportunities: [],
      radarInsights: [],
    };
  }

  const priorityOpportunities = analyses
    .filter(Boolean)
    .map(buildRadarOpportunity)
    .filter((item) => item.action !== "REJECT")
    .filter((item) => item.radarPriority >= 45)
    .sort((a, b) => b.radarPriority - a.radarPriority)
    .slice(0, 12);

  const radarScore = calculateRadarScore(priorityOpportunities);
  const radarLevel = buildRadarLevel(radarScore);
  const radarInsights = buildRadarInsights(priorityOpportunities, radarScore);

  return {
    radarScore,
    radarLevel,
    priorityOpportunities,
    radarInsights,
  };
}

function buildRadarOpportunity(item = {}) {
  const action = item.decision?.action || item.action || "REJECT";

  const decisionScore = Number(
    item.decision?.decisionScore ||
      item.decisionScore ||
      0
  );

  const score = Number(
    item.opportunity?.scoreV2 ??
      item.opportunity?.opportunityScoreV2 ??
      item.opportunity?.opportunityScore ??
      item.score ??
      0
  );

  const roi = Number(item.valuation?.roi ?? item.roi ?? 0);
  const profit = Number(item.valuation?.profit ?? item.profit ?? 0);

  const confidence = Number(
    item.decision?.confidence?.score ??
      item.vehicleValuation?.confidence ??
      item.confidence ??
      0
  );

  const comparableCount = Number(
    item.comparables?.totalComparables ??
      item.vehicleValuation?.comparableCount ??
      item.comparableCount ??
      0
  );

  const sellSpeedScore = Number(
    item.sellSpeed?.sellSpeedScore ??
      item.sellSpeedScore ??
      0
  );

  const estimatedSellDays = Number(
    item.sellSpeed?.estimatedSellDays ??
      item.estimatedSellDays ??
      0
  );

  const discountPercent = Number(
    item.vehicleValuation?.discountPercent ??
      item.opportunity?.discountPercent ??
      item.discountPercent ??
      0
  );

  const discoverySignals = buildDiscoverySignals({
    action,
    decisionScore,
    score,
    roi,
    profit,
    confidence,
    comparableCount,
    sellSpeedScore,
    estimatedSellDays,
    discountPercent,
  });

  const radarPriority = calculateRadarPriority({
    action,
    decisionScore,
    score,
    roi,
    profit,
    confidence,
    comparableCount,
    sellSpeedScore,
    estimatedSellDays,
    discountPercent,
    discoverySignals,
  });

  return {
    id: item.id,
    title:
      item.title ||
      `${item.brand || ""} ${item.model || ""}`.trim() ||
      "Vehículo IA",
    action,
    decisionScore,
    score,
    roi,
    profit,
    confidence,
    comparableCount,
    sellSpeedScore,
    estimatedSellDays,
    discountPercent,
    radarPriority,
    discoverySignals,
    discoveryLevel: buildDiscoveryLevel(radarPriority),
    reason: buildRadarReason({
      action,
      decisionScore,
      score,
      confidence,
      comparableCount,
      sellSpeedScore,
      estimatedSellDays,
      discountPercent,
      discoverySignals,
    }),
  };
}

function calculateRadarPriority({
  action,
  decisionScore,
  score,
  roi,
  profit,
  confidence,
  comparableCount,
  sellSpeedScore,
  estimatedSellDays,
  discountPercent,
  discoverySignals,
}) {
  let priority =
    decisionScore * 0.42 +
    score * 0.22 +
    confidence * 0.14 +
    sellSpeedScore * 0.12;

  if (roi > 0) priority += Math.min(9, roi * 0.28);
  if (profit > 0) priority += Math.min(9, profit / 1000);

  if (discountPercent > 0) priority += Math.min(10, discountPercent * 0.9);

  if (comparableCount >= 2) priority += 5;
  if (comparableCount >= 5) priority += 4;

  if (estimatedSellDays > 0 && estimatedSellDays <= 30) priority += 6;
  if (estimatedSellDays > 60) priority -= 6;

  if (action === "BUY") priority += 10;
  if (action === "WATCH") priority += 3;

  const strongSignals = discoverySignals.filter(
    (signal) => signal.importance === "HIGH"
  ).length;

  priority += strongSignals * 4;

  return clampScore(priority);
}

function buildDiscoverySignals({
  action,
  decisionScore,
  score,
  roi,
  profit,
  confidence,
  comparableCount,
  sellSpeedScore,
  estimatedSellDays,
  discountPercent,
}) {
  const signals = [];

  if (action === "BUY") {
    signals.push({
      type: "BUY_SIGNAL",
      importance: "HIGH",
      label: "BUY confirmado por motor de decisión.",
    });
  }

  if (decisionScore >= 85) {
    signals.push({
      type: "HIGH_DECISION_SCORE",
      importance: "HIGH",
      label: `Decision Score alto: ${decisionScore}/100.`,
    });
  }

  if (score >= 85) {
    signals.push({
      type: "HIGH_OPPORTUNITY_SCORE",
      importance: "MEDIUM",
      label: `Opportunity Score alto: ${score}/100.`,
    });
  }

  if (confidence >= 80 && comparableCount >= 2) {
    signals.push({
      type: "MARKET_EVIDENCE",
      importance: "HIGH",
      label: `Evidencia de mercado fuerte: confianza ${confidence}/100 y ${comparableCount} comparable(s).`,
    });
  }

  if (discountPercent >= 8) {
    signals.push({
      type: "VALUATION_DISCOUNT",
      importance: "HIGH",
      label: `Descuento relevante frente a valoración: ${discountPercent}%.`,
    });
  }

  if (roi >= 12 && profit > 0) {
    signals.push({
      type: "ROI_PROFIT_SIGNAL",
      importance: "MEDIUM",
      label: `ROI ${roi}% con margen positivo.`,
    });
  }

  if (sellSpeedScore >= 80 || (estimatedSellDays > 0 && estimatedSellDays <= 30)) {
    signals.push({
      type: "FAST_SELL_SIGNAL",
      importance: "HIGH",
      label: `Alta rotación prevista: venta estimada en ${estimatedSellDays || "pocos"} días.`,
    });
  }

  if (signals.length === 0) {
    signals.push({
      type: "OBSERVATION",
      importance: "LOW",
      label: "Candidato en observación sin señal dominante.",
    });
  }

  return signals;
}

function calculateRadarScore(opportunities = []) {
  if (!opportunities.length) return 0;

  const average =
    opportunities.reduce((acc, item) => acc + item.radarPriority, 0) /
    opportunities.length;

  return clampScore(average);
}

function buildRadarLevel(score) {
  if (score >= 85) return "Alto";
  if (score >= 65) return "Medio";
  return "Inicial";
}

function buildDiscoveryLevel(priority) {
  if (priority >= 85) return "DISCOVER_NOW";
  if (priority >= 70) return "HIGH_PRIORITY";
  if (priority >= 55) return "WATCH_CLOSELY";
  return "OBSERVE";
}

function buildRadarInsights(opportunities = [], radarScore = 0) {
  const insights = [];

  const buyCount = opportunities.filter((item) => item.action === "BUY").length;
  const fastSellCount = opportunities.filter(
    (item) => item.sellSpeedScore >= 80 || item.estimatedSellDays <= 30
  ).length;
  const strongDiscoveryCount = opportunities.filter(
    (item) => item.discoveryLevel === "DISCOVER_NOW"
  ).length;

  if (buyCount > 0) {
    insights.push(`🚀 ${buyCount} oportunidad(es) BUY detectadas por el motor.`);
  }

  if (strongDiscoveryCount > 0) {
    insights.push(`🔥 ${strongDiscoveryCount} oportunidad(es) requieren revisión inmediata.`);
  }

  if (fastSellCount > 0) {
    insights.push(`⚡ ${fastSellCount} candidato(s) tienen señal de rotación rápida.`);
  }

  if (radarScore >= 85) {
    insights.push("🏆 El radar detecta un mercado especialmente atractivo.");
  }

  if (!opportunities.length) {
    insights.push("📡 No existen oportunidades válidas tras aplicar los filtros del motor.");
  }

  return insights;
}

function buildRadarReason({
  action,
  decisionScore,
  score,
  confidence,
  comparableCount,
  sellSpeedScore,
  estimatedSellDays,
  discountPercent,
  discoverySignals,
}) {
  const mainSignal = discoverySignals[0]?.label || "Señal de radar pendiente.";

  if (action === "BUY") {
    return `BUY confirmado. Decision Score ${decisionScore}/100, Opportunity Score ${score}/100, confianza ${confidence}/100, ${comparableCount} comparable(s), Sell Speed ${sellSpeedScore}/100 y descuento ${discountPercent}%. ${mainSignal}`;
  }

  return `WATCH. Requiere validación adicional. Confianza ${confidence}/100, ${comparableCount} comparable(s), venta estimada ${estimatedSellDays || 0} días. ${mainSignal}`;
}

function clampScore(value) {
  if (!Number.isFinite(Number(value))) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}