import { scanMarket } from "./marketScanner";
import { buildMasterOpportunityPipeline } from "../intelligence/masterOpportunityPipelineEngine";
import { fetchRealMarketListings } from "../market/realMarketFeed";

export async function runOpportunityEngine(searchInput = {}) {
  const marketResult = await scanMarket(searchInput);

  const realResult = await fetchRealMarketListings(
    buildScanFromMarketSearch(marketResult.search),
    {
      maxListings: Number(searchInput.maxListings || 20),
    }
  );

  const pipeline = buildMasterOpportunityPipeline(realResult.listings || []);

  const opportunities = Array.isArray(pipeline.topOpportunities)
    ? pipeline.topOpportunities
    : [];

  return {
    status: realResult.listings?.length ? "ready" : "empty",
    mode: "opportunity-engine-v2-real-feed",
    search: marketResult.search,
    totalListings: realResult.listings?.length || 0,
    totalOpportunities: opportunities.length,
    opportunities,
    pipeline,
    diagnostics: realResult.diagnostics || [],
    errors: realResult.errors || [],
    generatedAt: new Date().toISOString(),
  };
}

function buildScanFromMarketSearch(search = {}) {
  return {
    query: search.query || "",
    maxBudget: Number(search.maxPrice || search.maxBudget || 0),
    country: search.country || "Alemania",
    semantic: {},
    searchLinks: [
      {
        source: search.source || "mobile.de",
        country: search.country || "Alemania",
        url: search.url,
      },
    ],
  };
}