const DEFAULT_SOURCE = "manual_analysis";

export function buildMemoryCandidateFromAnalysis(analysis = {}) {
  const now = new Date().toISOString();

  const sourceUrl = readText(
    analysis.source_url ||
      analysis.sourceUrl ||
      analysis.url ||
      analysis.listingUrl ||
      analysis.originalUrl
  );

  const brand = readText(analysis.brand);
  const model = readText(analysis.model);
  const title =
    readText(analysis.title) ||
    [brand, model, analysis.year].filter(Boolean).join(" ") ||
    "Vehículo sin título";

  const price = readNumber(
    analysis.price ||
      analysis.salePrice ||
      analysis.listingPrice ||
      analysis.purchasePrice ||
      analysis.budget ||
      analysis.maxPrice
  );

  const year = readNumber(
    analysis.year ||
      analysis.registrationYear ||
      analysis.firstRegistrationYear
  );

  const km = readNumber(
    analysis.km ||
      analysis.kilometers ||
      analysis.mileage
  );

  const roi = readNumber(analysis.roi || analysis.netRoi || analysis.expectedROI);
  const profit = readNumber(
    analysis.profit ||
      analysis.netProfit ||
      analysis.expectedProfit ||
      analysis.estimatedProfit
  );

  const qualityScore = readNumber(
    analysis.dataQualityScore ||
      analysis.qualityScore ||
      analysis.confidence_score ||
      analysis.confidenceScore ||
      analysis.score
  );

  const opportunityType = profit > 0 && roi > 0
    ? "opportunity_signal"
    : "market_signal";

  return {
    ...analysis,
    title,
    brand,
    model,
    price,
    year,
    km,
    kilometers: km,
    mileage: km,
    roi,
    profit,
    source_url: sourceUrl,
    sourceUrl,
    source: readText(analysis.source || analysis.sourceSite) || detectSource(sourceUrl),
    sourceMode: readText(analysis.sourceMode) || DEFAULT_SOURCE,
    importStatus: "approved",
    status: "approved",
    memoryEligible: true,
    dataQualityScore: qualityScore || 100,
    qualityScore: qualityScore || 100,
    opportunityType,
    captured_at: analysis.captured_at || analysis.capturedAt || now,
    adapted_at: now,
  };
}

export function buildMemoryCandidatesFromAnalyses(analyses = []) {
  if (!Array.isArray(analyses)) {
    return [];
  }

  return analyses
    .filter(Boolean)
    .map((analysis) => buildMemoryCandidateFromAnalysis(analysis));
}

function readText(value) {
  return String(value || "").trim();
}

function readNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const cleaned = String(value || "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/[^\d.-]/g, "");

  const parsed = Number(cleaned);

  return Number.isFinite(parsed) ? parsed : 0;
}

function detectSource(value) {
  if (!value) {
    return DEFAULT_SOURCE;
  }

  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return DEFAULT_SOURCE;
  }
}