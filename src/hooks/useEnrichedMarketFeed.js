import { useMemo } from "react";

import { generateMockMarketFeed } from "../services/mockMarketFeed";
import { analyzeDealRisk } from "../services/dealRiskEngine";
import { buildLiquidityProfile } from "../services/liquidityEngine";
import { buildFinalDealDecision } from "../services/finalDecisionEngine";

export function useEnrichedMarketFeed({ searchTriggered, scan, form }) {
  return useMemo(() => {
    if (!searchTriggered) return null;

    const rawFeed = generateMockMarketFeed(scan);

    function enrichDeal(item) {
      const dealRisk = analyzeDealRisk(item);

      const liquidity = buildLiquidityProfile({
        query: item.title || form.query,
        item,
        semantic: scan.semantic,
      });

      const finalDecision = buildFinalDealDecision({
        ...item,
        dealRisk,
        liquidity,
      });

      return {
        ...item,
        dealRisk,
        liquidity,
        finalDecision,
      };
    }

    const opportunities = rawFeed.opportunities
      .map(enrichDeal)
      .sort((a, b) => b.finalDecision.finalScore - a.finalDecision.finalScore);

    const best = opportunities[0] || null;

    return {
      ...rawFeed,
      opportunities,
      best,
    };
  }, [form.query, scan, searchTriggered]);
}