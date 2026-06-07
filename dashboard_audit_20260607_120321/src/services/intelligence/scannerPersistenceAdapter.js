export function buildScannerOpportunityPayload({
  candidate,
  scan,
}) {
  return {
    title: candidate?.title || scan?.query || "Scanner opportunity",
    brand: candidate?.brand || null,
    model: candidate?.model || null,
    fuel_type: candidate?.fuelType || null,
    drivetrain: candidate?.drivetrain || null,
    performance_package: candidate?.performancePackage || null,
    country: candidate?.country || scan?.country || null,
    profit: Math.round(Number(candidate?.netProfit || 0)),
    roi: Number(candidate?.netRoi || 0),
    score: Number(candidate?.finalDecision?.finalScore || 0),
    url: candidate?.url || null,
  };
}