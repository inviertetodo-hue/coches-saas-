import { useMemo } from "react";

import { generateMockMarketFeed } from "../services/mockMarketFeed";
import { analyzeDealRisk } from "../services/dealRiskEngine";
import { buildLiquidityProfile } from "../services/liquidityEngine";
import { buildFinalDealDecision } from "../services/finalDecisionEngine";
import { findOpportunities } from "../services/search/opportunityFinder";

export function useEnrichedMarketFeed({ searchTriggered, scan, form }) {
  return useMemo(() => {
    if (!searchTriggered) return null;

    const rawFeed = generateMockMarketFeed(scan);
    const maxBudget = Number(form.maxBudget || scan.maxBudget || 0);

    function enrichDeal(item) {
      const dealRisk = analyzeDealRisk(item);

      const liquidity = buildLiquidityProfile({
        query: item.title || form.query,
        item,
        semantic: scan.semantic,
      });

      const normalizedListing = {
        title: item.title,
        url: item.url || "",
        price: item.price,
        mileage: item.km || item.mileage,
        year: item.year,
        location: item.location,
        source: item.source || "mock-market-feed",
        isValid: Boolean(
          item.title &&
            item.price &&
            (item.km || item.mileage) &&
            item.year
        ),
      };

      const opportunityPreview =
        findOpportunities([normalizedListing], { maxBudget })[0] || null;

      const opportunityScore =
        opportunityPreview?.opportunityScore || item.opportunityScore || 0;

      const opportunityLevel =
        opportunityPreview?.opportunityLevel || "NONE";

      const finalDecision = buildFinalDealDecision({
        ...item,
        opportunityScore,
        opportunityLevel,
        dealRisk,
        liquidity,
      });

      return {
        ...item,
        opportunityScore,
        opportunityLevel,
        opportunitySignals: opportunityPreview?.opportunitySignals || null,
        dealRisk,
        liquidity,
        finalDecision,
      };
    }

    const opportunities = rawFeed.opportunities
      .map(enrichDeal)
      .sort((a, b) => b.finalDecision.finalScore - a.finalDecision.finalScore);

    const opportunityEnginePreview = opportunities.map((item) => ({
      title: item.title,
      url: item.url || "",
      price: item.price,
      mileage: item.km || item.mileage,
      year: item.year,
      location: item.location,
      source: item.source || "mock-market-feed",
      isValid: Boolean(
        item.title && item.price && (item.km || item.mileage) && item.year
      ),
      opportunityScore: item.opportunityScore,
      opportunityLevel: item.opportunityLevel,
      opportunitySignals: item.opportunitySignals,
    }));

    const best = opportunities[0] || null;

    return {
      ...rawFeed,
      opportunities,
      best,
      opportunityEnginePreview,
      opportunityEngineSummary: {
        total: opportunityEnginePreview.length,
        bestScore: opportunityEnginePreview[0]?.opportunityScore || 0,
        bestLevel: opportunityEnginePreview[0]?.opportunityLevel || "NONE",
        mode: "budget-aware-ranking",
      },
    };
  }, [form.query, form.maxBudget, scan, searchTriggered]);
}