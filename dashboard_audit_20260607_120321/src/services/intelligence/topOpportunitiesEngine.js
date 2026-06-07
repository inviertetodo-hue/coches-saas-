import { buildOpportunityRanking } from "./opportunityRankingEngine";

export function buildTopOpportunities(items = [], options = {}) {
  const topLimit = normalizePositiveNumber(options.topLimit, 10);

  const ranking = buildOpportunityRanking(items, {
    maxItems: topLimit,
    minScore: options.minScore ?? 0,
  });

  const bestOpportunity = ranking.items[0] || null;

  const top3 = ranking.items.slice(0, 3);
  const top5 = ranking.items.slice(0, 5);
  const top10 = ranking.items.slice(0, 10);

  return {
    totalCandidates: ranking.totalInput,
    rankedCandidates: ranking.totalRanked,
    bestOpportunity,
    top3,
    top5,
    top10,
    executiveSummary: buildExecutiveSummary({
      bestOpportunity,
      rankedCandidates: ranking.totalRanked,
    }),
    buyingRecommendation: buildBuyingRecommendation(bestOpportunity),
    ranking,
  };
}

function buildExecutiveSummary({
  bestOpportunity,
  rankedCandidates,
}) {
  if (!bestOpportunity) {
    return "No existen oportunidades suficientemente atractivas para recomendar compra.";
  }

  return [
    `${rankedCandidates} vehículos han sido evaluados.`,
    `La mejor oportunidad actual es ${buildVehicleName(bestOpportunity)}.`,
    `Opportunity Score: ${bestOpportunity.opportunityScore}/100.`,
    `ROI estimado: ${normalizeNumber(bestOpportunity.roi)}%.`,
    `Margen estimado: ${normalizeNumber(bestOpportunity.profit)} €.`,
  ].join(" ");
}

function buildBuyingRecommendation(bestOpportunity) {
  if (!bestOpportunity) {
    return {
      action: "wait",
      label: "Esperar",
      reason: "No existen oportunidades suficientemente sólidas.",
    };
  }

  const score = normalizeNumber(bestOpportunity.opportunityScore);

  if (score >= 85) {
    return {
      action: "buy",
      label: "Comprar",
      reason: "Oportunidad excepcional frente al mercado.",
    };
  }

  if (score >= 70) {
    return {
      action: "review",
      label: "Analizar",
      reason: "Oportunidad interesante que merece revisión.",
    };
  }

  return {
    action: "wait",
    label: "Esperar",
    reason: "No destaca suficientemente frente a otras alternativas.",
    };
}

function buildVehicleName(vehicle) {
  return [
    vehicle.brand,
    vehicle.model,
  ]
    .filter(Boolean)
    .join(" ");
}

function normalizePositiveNumber(value, fallback) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return fallback;
  }

  return Math.round(numericValue);
}

function normalizeNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return numericValue;
}