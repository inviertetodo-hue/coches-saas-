export function buildOpportunityRanking(items = [], options = {}) {
  const maxItems = normalizePositiveNumber(options.maxItems, 10);
  const minScore = normalizeNumber(options.minScore, 0);

  const rankedItems = items
    .filter(Boolean)
    .map((item) => {
      const opportunityScore = resolveOpportunityScore(item);
      const decisionScore = resolveDecisionScore(item);
      const rankingScore = resolveRankingScore({
        opportunityScore,
        decisionScore,
        valuationScore: resolveValuationScore(item),
        roi: resolveROI(item),
        profit: resolveProfit(item),
        confidence: resolveConfidence(item),
        comparableCount: resolveComparableCount(item),
      });

      return {
        ...item,
        opportunityScore,
        decisionScore,
        rankingScore,
        opportunityDecision:
          item.decision?.label ||
          item.decision?.action ||
          item.opportunity?.opportunityLevelV2 ||
          item.opportunity?.decision ||
          "Sin decisión",
        opportunityRiskLevel:
          item.decision?.confidence?.level ||
          item.opportunity?.riskLevel ||
          "unknown",
      };
    })
    .filter((item) => item.rankingScore >= minScore)
    .sort(compareOpportunities);

  const topItems = rankedItems.slice(0, maxItems);

  return {
    totalInput: items.filter(Boolean).length,
    totalRanked: rankedItems.length,
    totalReturned: topItems.length,
    maxItems,
    minScore,
    bestOpportunity: topItems[0] || null,
    worstOpportunity: topItems[topItems.length - 1] || null,
    items: topItems,
    summary: buildSummary({
      totalInput: items.filter(Boolean).length,
      totalRanked: rankedItems.length,
      totalReturned: topItems.length,
      bestOpportunity: topItems[0] || null,
    }),
    insights: buildInsights({
      totalInput: items.filter(Boolean).length,
      totalRanked: rankedItems.length,
      totalReturned: topItems.length,
      bestOpportunity: topItems[0] || null,
    }),
  };
}

function resolveOpportunityScore(item = {}) {
  return normalizeNumber(
    item.opportunity?.scoreV2 ??
      item.opportunity?.opportunityScoreV2 ??
      item.opportunity?.opportunityScore ??
      item.opportunityScore ??
      0
  );
}

function resolveDecisionScore(item = {}) {
  return normalizeNumber(
    item.decision?.decisionScore ??
      item.decisionScore ??
      0
  );
}

function resolveValuationScore(item = {}) {
  return normalizeNumber(
    item.valuation?.valuationScore ??
      item.marketValuation?.valuationScore ??
      item.valuationScore ??
      0
  );
}

function resolveROI(item = {}) {
  return normalizeNumber(
    item.valuation?.roi ??
      item.roi ??
      item.netRoi ??
      0
  );
}

function resolveProfit(item = {}) {
  return normalizeNumber(
    item.valuation?.profit ??
      item.profit ??
      item.netProfit ??
      0
  );
}

function resolveConfidence(item = {}) {
  return normalizeNumber(
    item.decision?.confidence?.score ??
      item.vehicleValuation?.confidence ??
      item.valuation?.valuationConfidence ??
      item.confidenceScore ??
      item.comparableConfidence ??
      0
  );
}

function resolveComparableCount(item = {}) {
  return normalizeNumber(
    item.comparables?.totalComparables ??
      item.vehicleValuation?.comparableCount ??
      item.valuation?.comparableCount ??
      0
  );
}

function resolveRankingScore({
  opportunityScore,
  decisionScore,
  valuationScore,
  roi,
  profit,
  confidence,
  comparableCount,
}) {
  let score =
    decisionScore > 0
      ? decisionScore * 0.55 + opportunityScore * 0.30 + valuationScore * 0.15
      : opportunityScore * 0.55 + valuationScore * 0.25 + confidence * 0.20;

  if (roi > 0) score += Math.min(10, roi * 0.5);
  if (profit > 0) score += Math.min(10, profit / 1000);

  if (comparableCount >= 1) score += 3;
  if (comparableCount >= 3) score += 4;

  if (confidence >= 75) score += 4;
  if (confidence > 0 && confidence < 50) score -= 10;

  if (roi < 0) score -= 12;
  if (profit < 0) score -= 12;

  return clampScore(score);
}

function compareOpportunities(a, b) {
  if (b.rankingScore !== a.rankingScore) {
    return b.rankingScore - a.rankingScore;
  }

  if (b.decisionScore !== a.decisionScore) {
    return b.decisionScore - a.decisionScore;
  }

  if (b.opportunityScore !== a.opportunityScore) {
    return b.opportunityScore - a.opportunityScore;
  }

  const bProfit = resolveProfit(b);
  const aProfit = resolveProfit(a);

  if (bProfit !== aProfit) {
    return bProfit - aProfit;
  }

  const bRoi = resolveROI(b);
  const aRoi = resolveROI(a);

  if (bRoi !== aRoi) {
    return bRoi - aRoi;
  }

  return resolveConfidence(b) - resolveConfidence(a);
}

function buildSummary({ totalInput, totalRanked, totalReturned, bestOpportunity }) {
  if (totalInput === 0) {
    return "No hay vehículos disponibles para ordenar por oportunidad.";
  }

  if (totalRanked === 0) {
    return "Ningún vehículo supera el filtro mínimo de oportunidad.";
  }

  const bestLabel = bestOpportunity
    ? `${bestOpportunity.brand || "Marca desconocida"} ${bestOpportunity.model || "Modelo desconocido"}`
    : "sin mejor oportunidad";

  return `${totalRanked} de ${totalInput} vehículos han sido ordenados por ranking v2. Se devuelven ${totalReturned}. Mejor oportunidad actual: ${bestLabel}.`;
}

function buildInsights({ totalInput, totalRanked, totalReturned, bestOpportunity }) {
  const insights = [];

  if (totalInput === 0) {
    insights.push("No hay datos suficientes para construir un ranking.");
    return insights;
  }

  insights.push(`${totalInput} vehículos recibidos para evaluación.`);

  if (totalRanked === 0) {
    insights.push("Ningún vehículo supera el filtro mínimo configurado.");
    return insights;
  }

  insights.push(`${totalRanked} vehículos han pasado el filtro de ranking v2.`);
  insights.push(`${totalReturned} vehículos se muestran como ranking final.`);

  if (bestOpportunity) {
    insights.push(
      `La mejor oportunidad tiene un Ranking Score de ${bestOpportunity.rankingScore}/100.`
    );

    if (bestOpportunity.opportunityScore !== undefined) {
      insights.push(
        `Opportunity Score V2 de la mejor oportunidad: ${normalizeNumber(bestOpportunity.opportunityScore)}/100.`
      );
    }

    if (bestOpportunity.decisionScore !== undefined) {
      insights.push(
        `Decision Score de la mejor oportunidad: ${normalizeNumber(bestOpportunity.decisionScore)}/100.`
      );
    }

    const profit = resolveProfit(bestOpportunity);

    if (profit !== 0) {
      insights.push(
        `Margen estimado de la mejor oportunidad: ${profit} €.`
      );
    }

    const roi = resolveROI(bestOpportunity);

    if (roi !== 0) {
      insights.push(
        `ROI estimado de la mejor oportunidad: ${roi}%.`
      );
    }
  }

  return insights;
}

function normalizePositiveNumber(value, fallback) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return fallback;
  }

  return Math.round(numericValue);
}

function normalizeNumber(value, fallback = 0) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return numericValue;
}

function clampScore(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numericValue)));
}