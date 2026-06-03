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
    .map((item) => {
      const action = item.decision?.action || "REJECT";
      const decisionScore = Number(item.decision?.decisionScore || 0);
      const score =
        Number(
          item.opportunity?.scoreV2 ??
            item.opportunity?.opportunityScoreV2 ??
            item.opportunity?.opportunityScore ??
            0
        );

      const roi = Number(
        item.valuation?.roi ??
          item.roi ??
          0
      );

      const profit = Number(
        item.valuation?.profit ??
          item.profit ??
          0
      );

      const confidence = Number(
        item.decision?.confidence?.score ??
          item.vehicleValuation?.confidence ??
          0
      );

      const comparableCount = Number(
        item.comparables?.totalComparables ??
          item.vehicleValuation?.comparableCount ??
          0
      );

      const radarPriority = calculateRadarPriority({
        action,
        decisionScore,
        score,
        roi,
        profit,
        confidence,
        comparableCount,
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
        radarPriority,
        reason: buildRadarReason({
          action,
          decisionScore,
          score,
          confidence,
          comparableCount,
        }),
      };
    })
    .filter((item) => item.action !== "REJECT")
    .sort((a, b) => b.radarPriority - a.radarPriority)
    .slice(0, 12);

  const radarScore = calculateRadarScore(priorityOpportunities);
  const radarLevel = buildRadarLevel(radarScore);
  const radarInsights = buildRadarInsights(
    priorityOpportunities,
    radarScore
  );

  return {
    radarScore,
    radarLevel,
    priorityOpportunities,
    radarInsights,
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
}) {
  let priority =
    decisionScore * 0.50 +
    score * 0.25 +
    confidence * 0.15;

  if (roi > 0) {
    priority += Math.min(10, roi * 0.30);
  }

  if (profit > 0) {
    priority += Math.min(10, profit / 1000);
  }

  if (comparableCount >= 2) {
    priority += 5;
  }

  if (action === "BUY") {
    priority += 10;
  }

  return clampScore(priority);
}

function calculateRadarScore(opportunities = []) {
  if (!opportunities.length) {
    return 0;
  }

  const average =
    opportunities.reduce(
      (acc, item) => acc + item.radarPriority,
      0
    ) / opportunities.length;

  return clampScore(average);
}

function buildRadarLevel(score) {
  if (score >= 85) return "Alto";
  if (score >= 65) return "Medio";
  return "Inicial";
}

function buildRadarInsights(opportunities = [], radarScore = 0) {
  const insights = [];

  const buyCount = opportunities.filter(
    (item) => item.action === "BUY"
  ).length;

  const watchCount = opportunities.filter(
    (item) => item.action === "WATCH"
  ).length;

  if (buyCount > 0) {
    insights.push(
      `🚀 ${buyCount} oportunidad(es) BUY detectadas por el motor de decisión.`
    );
  }

  if (watchCount > 0) {
    insights.push(
      `👀 ${watchCount} oportunidad(es) requieren validación adicional.`
    );
  }

  if (radarScore >= 85) {
    insights.push(
      "🔥 El radar muestra un mercado especialmente atractivo."
    );
  }

  if (!opportunities.length) {
    insights.push(
      "📡 No existen oportunidades válidas tras aplicar los filtros del motor."
    );
  }

  return insights;
}

function buildRadarReason({
  action,
  decisionScore,
  score,
  confidence,
  comparableCount,
}) {
  if (action === "BUY") {
    return `BUY confirmado. Decision Score ${decisionScore}/100, Opportunity Score ${score}/100 y evidencia suficiente de mercado.`;
  }

  return `WATCH. Score alto, pero requiere validación adicional. Confianza ${confidence}/100 y ${comparableCount} comparable(s).`;
}

function clampScore(value) {
  if (!Number.isFinite(Number(value))) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}