import { buildOpportunityScore } from "./opportunityScoreEngine";

export function buildOpportunityRanking(items = [], options = {}) {
  const maxItems = normalizePositiveNumber(options.maxItems, 10);
  const minScore = normalizeNumber(options.minScore, 0);

  const rankedItems = items
    .filter(Boolean)
    .map((item) => {
      const opportunity = buildOpportunityScore(item);

      return {
        ...item,
        opportunity,
        opportunityScore: opportunity.opportunityScore,
        opportunityDecision: opportunity.decision,
        opportunityRiskLevel: opportunity.riskLevel,
      };
    })
    .filter((item) => item.opportunityScore >= minScore)
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

function compareOpportunities(a, b) {
  if (b.opportunityScore !== a.opportunityScore) {
    return b.opportunityScore - a.opportunityScore;
  }

  const bProfit = normalizeNumber(b.profit);
  const aProfit = normalizeNumber(a.profit);

  if (bProfit !== aProfit) {
    return bProfit - aProfit;
  }

  const bRoi = normalizeNumber(b.roi);
  const aRoi = normalizeNumber(a.roi);

  if (bRoi !== aRoi) {
    return bRoi - aRoi;
  }

  const bQuality = normalizeNumber(b.qualityScore ?? b.quality);
  const aQuality = normalizeNumber(a.qualityScore ?? a.quality);

  return bQuality - aQuality;
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

  return `${totalRanked} de ${totalInput} vehículos han sido ordenados por oportunidad. Se devuelven ${totalReturned}. Mejor oportunidad actual: ${bestLabel}.`;
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

  insights.push(`${totalRanked} vehículos han pasado el filtro de oportunidad.`);
  insights.push(`${totalReturned} vehículos se muestran como ranking final.`);

  if (bestOpportunity) {
    insights.push(
      `La mejor oportunidad tiene un Opportunity Score de ${bestOpportunity.opportunityScore}/100.`
    );

    if (bestOpportunity.profit !== undefined) {
      insights.push(
        `Margen estimado de la mejor oportunidad: ${normalizeNumber(bestOpportunity.profit)} €.`
      );
    }

    if (bestOpportunity.roi !== undefined) {
      insights.push(
        `ROI estimado de la mejor oportunidad: ${normalizeNumber(bestOpportunity.roi)}%.`
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