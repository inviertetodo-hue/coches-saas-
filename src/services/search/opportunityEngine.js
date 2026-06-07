import { scanMarket } from "./marketScanner";
import { buildMasterOpportunityPipeline } from "../intelligence/masterOpportunityPipelineEngine";
import { fetchRealMarketListings } from "../market/realMarketFeed";
import { resolveSpainMarketReference } from "../market/spainMarketReferenceEngine";

export async function runOpportunityEngine(searchInput = {}) {
  const marketResult = await scanMarket(searchInput);

  const realResult = await fetchRealMarketListings(
    buildScanFromMarketSearch(marketResult.search),
    {
      maxListings: Number(searchInput.maxListings || 20),
    }
  );

  const listings = Array.isArray(realResult.listings) ? realResult.listings : [];
  const enrichedListings = await enrichListingsWithSpainReference(listings);

  const pipeline = buildMasterOpportunityPipeline(enrichedListings);

  const opportunities = Array.isArray(pipeline.topOpportunities)
    ? pipeline.topOpportunities
    : [];

  return {
    status: enrichedListings.length ? "ready" : "empty",
    mode: "opportunity-engine-v2-real-feed-spain-reference",
    search: marketResult.search,
    totalListings: enrichedListings.length,
    totalOpportunities: opportunities.length,
    opportunities,
    pipeline,
    diagnostics: realResult.diagnostics || [],
    errors: realResult.errors || [],
    generatedAt: new Date().toISOString(),
  };
}

async function enrichListingsWithSpainReference(listings = []) {
  const enriched = [];

  for (const listing of listings) {
    const spainMarketReference = await resolveSpainMarketReference(listing);

    enriched.push({
      ...listing,
      spainMarketReference,
    });
  }

  return enriched;
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
