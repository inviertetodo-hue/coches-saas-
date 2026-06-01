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

    const opportunity = buildOpportunityScore({
      ...vehicle,
      comparableCount: comparables.totalComparables,
      valuationConfidence: vehicleValuation.confidence,
      discountPercent: vehicleValuation.discountPercent,
      estimatedMarketValue: vehicleValuation.estimatedMarketValue,
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
    const aScore = Number(a.decision?.decisionScore || 0);
    const bScore = Number(b.decision?.decisionScore || 0);

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
    },
  };
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

  return {
    totalComparables,
    averageConfidence: average(confidenceValues),
    averageDiscountPercent: average(discountValues),
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