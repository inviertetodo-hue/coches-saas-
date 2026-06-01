import { buildOpportunityScore } from "./opportunityScoreEngine";
import { buildMarketValuation } from "./marketValuationEngine";
import { buildOpportunityDecision } from "./opportunityDecisionEngine";
import { buildPortfolioOpportunity } from "./portfolioOpportunityEngine";

export function buildMasterOpportunityPipeline(records = []) {
  const enriched = records.map((vehicle) => {
    const opportunity = buildOpportunityScore(vehicle);
    const valuation = buildMarketValuation(vehicle);
    const decision = buildOpportunityDecision(vehicle);

    return {
      ...vehicle,
      opportunity,
      valuation,
      decision,
    };
  });

  const ranked = [...enriched].sort((a, b) => {
    const aScore = Number(a.decision?.decisionScore || 0);
    const bScore = Number(b.decision?.decisionScore || 0);

    return bScore - aScore;
  });

  const topOpportunities = ranked.slice(0, 20);

  const portfolio = buildPortfolioOpportunity(ranked);

  return {
    totalRecords: ranked.length,
    topOpportunities,
    portfolio,
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
    },
  };
}