import { buildComparableVehicles } from "./comparableVehiclesEngine";
import { buildMarketValuation } from "./marketValuationEngine";
import { buildOpportunityDecision } from "./opportunityDecisionEngine";
import { buildOpportunityScore } from "./opportunityScoreEngine";
import { buildPortfolioOpportunity } from "./portfolioOpportunityEngine";
import { buildVehicleValuation } from "./vehicleValuationEngine";

export function buildMasterOpportunityPipeline(records = [], options = {}) {
  const memoryRecords = options.memoryRecords || records;

  const enriched = records.filter(Boolean).map((vehicle) => {
    const comparables = buildComparableVehicles(vehicle, memoryRecords);
    const vehicleValuation = buildVehicleValuation(vehicle, memoryRecords);
    const baseOpportunity = buildOpportunityScore(vehicle);

    const opportunity = buildOpportunityScoreV2({
      vehicle,
      baseOpportunity,
      comparables,
      vehicleValuation,
    });

    const valuation = {
      ...buildMarketValuation(vehicle),
      memoryValuation: vehicleValuation,
      comparables,
    };

    const decision = buildOpportunityDecision({
      ...vehicle,
      opportunity,
      valuation,
      vehicleValuation,
      comparables,
    });

    return {
      ...vehicle,
      comparables,
      vehicleValuation,
      opportunity,
      valuation,
      decision,
    };
  });

  const ranked = [...enriched].sort((a, b) => {
    const aScore = Number(a.opportunity?.scoreV2 || a.decision?.decisionScore || 0);
    const bScore = Number(b.opportunity?.scoreV2 || b.decision?.decisionScore || 0);

    if (bScore !== aScore) {
      return bScore - aScore;
    }

    const aDiscount = Number(a.vehicleValuation?.discountPercent || 0);
    const bDiscount = Number(b.vehicleValuation?.discountPercent || 0);

    return bDiscount - aDiscount;
  });

  const topOpportunities = ranked.slice(0, 20);
  const portfolio = buildPortfolioOpportunity(ranked);
  const valuationSummary = buildValuationSummary(ranked);

  return {
    totalRecords: ranked.length,
    topOpportunities,
    portfolio,
    valuationSummary,
    buyCount: portfolio.buyCount,
    watchCount: portfolio.watchCount,
    rejectCount: portfolio.rejectCount,
    summary: {
      totalRecords: ranked.length,
      buyCount: portfolio.buyCount,
      watchCount: portfolio.watchCount,
      rejectCount: portfolio.rejectCount,
      requiredCapital: portfolio.requiredCapital,
      expectedProfit: portfolio.expectedProfit,
      averageROI: portfolio.averageROI,
      averageValuationConfidence: valuationSummary.averageConfidence,
      averageDiscountPercent: valuationSummary.averageDiscountPercent,
      totalComparables: valuationSummary.totalComparables,
      averageOpportunityScoreV2: valuationSummary.averageOpportunityScoreV2,
    },
  };
}

function buildOpportunityScoreV2({
  vehicle,
  baseOpportunity,
  comparables,
  vehicleValuation,
}) {
  const baseScore = Number(
    baseOpportunity?.score ??
      baseOpportunity?.opportunityScore ??
      baseOpportunity?.totalScore ??
      0
  );

  const roi = Number(vehicle.roi || 0);
  const profit = Number(vehicle.profit || 0);
  const comparableCount = Number(comparables?.totalComparables || 0);
  const confidence = Number(vehicleValuation?.confidence || 0);
  const discountPercent = Number(vehicleValuation?.discountPercent || 0);

  let score = baseScore || 40;

  score += Math.min(18, Math.max(-18, roi * 2));
  score += Math.min(15, Math.max(-15, discountPercent * 1.4));

  if (profit > 0) score += 8;
  if (profit >= 1000) score += 6;
  if (profit >= 2000) score += 6;

  if (comparableCount >= 1) score += 5;
  if (comparableCount >= 2) score += 5;
  if (comparableCount >= 5) score += 5;

  if (confidence >= 60) score += 5;
  if (confidence >= 75) score += 7;
  if (confidence >= 90) score += 5;

  if (confidence < 50) score -= 15;
  if (comparableCount === 0) score -= 10;
  if (roi < 0) score -= 18;
  if (profit < 0) score -= 18;

  const scoreV2 = clampScore(score);

  return {
    ...baseOpportunity,
    scoreV2,
    opportunityScoreV2: scoreV2,
    opportunityLevelV2: buildOpportunityLevel(scoreV2),
    opportunityReasonsV2: buildOpportunityReasons({
      roi,
      profit,
      comparableCount,
      confidence,
      discountPercent,
      scoreV2,
    }),
    valuationConfidence: confidence,
    comparableCount,
    discountPercent,
    estimatedMarketValue: vehicleValuation?.estimatedMarketValue || 0,
  };
}

function buildOpportunityLevel(score) {
  if (score >= 85) return "BUY";
  if (score >= 65) return "WATCH";
  return "REJECT";
}

function buildOpportunityReasons({
  roi,
  profit,
  comparableCount,
  confidence,
  discountPercent,
  scoreV2,
}) {
  const reasons = [];

  if (scoreV2 >= 85) {
    reasons.push("Alta oportunidad según score v2.");
  }

  if (scoreV2 >= 65 && scoreV2 < 85) {
    reasons.push("Oportunidad interesante, requiere revisión.");
  }

  if (scoreV2 < 65) {
    reasons.push("Oportunidad insuficiente para compra directa.");
  }

  if (roi > 0) {
    reasons.push(`ROI positivo estimado: ${roi}%.`);
  }

  if (profit > 0) {
    reasons.push(`Margen positivo estimado: ${formatNumber(profit)} €.`);
  }

  if (discountPercent > 0) {
    reasons.push(`Descuento frente a valoración: ${discountPercent}%.`);
  }

  if (comparableCount > 0) {
    reasons.push(`${comparableCount} comparable(s) encontrados en memoria.`);
  }

  if (confidence >= 75) {
    reasons.push(`Confianza de valoración alta: ${confidence}/100.`);
  }

  if (confidence < 50) {
    reasons.push("Confianza de valoración todavía baja.");
  }

  if (comparableCount === 0) {
    reasons.push("Sin comparables suficientes en memoria.");
  }

  return reasons;
}

function buildValuationSummary(records = []) {
  const totalComparables = records.reduce(
    (sum, item) => sum + Number(item.comparables?.totalComparables || 0),
    0
  );

  const confidenceValues = records
    .map((item) => Number(item.vehicleValuation?.confidence || 0))
    .filter((value) => value > 0);

  const discountValues = records
    .map((item) => Number(item.vehicleValuation?.discountPercent || 0))
    .filter((value) => Number.isFinite(value));

  const scoreV2Values = records
    .map((item) => Number(item.opportunity?.scoreV2 || 0))
    .filter((value) => value > 0);

  return {
    totalComparables,
    averageConfidence: average(confidenceValues),
    averageDiscountPercent: average(discountValues),
    averageOpportunityScoreV2: average(scoreV2Values),
    vehiclesWithComparables: records.filter(
      (item) => Number(item.comparables?.totalComparables || 0) > 0
    ).length,
  };
}

function average(values = []) {
  if (!values.length) {
    return 0;
  }

  return Number(
    (
      values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length
    ).toFixed(2)
  );
}

function clampScore(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numericValue)));
}

function formatNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  return numericValue.toLocaleString("es-ES", {
    maximumFractionDigits: 0,
  });
}