import { scanMarket } from "./marketScanner";
import { findOpportunities } from "./opportunityFinder";

export async function runOpportunityEngine(searchInput = {}) {
  const marketResult = await scanMarket(searchInput);

  const opportunities = findOpportunities(
    marketResult.listings || []
  );

  return {
    status: "ready",
    search: marketResult.search,
    totalListings: marketResult.summary?.totalListings || 0,
    totalOpportunities: opportunities.length,
    opportunities,
    generatedAt: new Date().toISOString(),
  };
}