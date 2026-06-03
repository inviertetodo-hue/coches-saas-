export const PERSISTENCE_TARGETS = {
  BLOCKED: "blocked",
  ANALYSIS_HISTORY: "analysis_history",
  MARKET_MEMORY: "market_memory",
  OPPORTUNITY_MEMORY: "opportunity_memory",
};

export function evaluatePersistencePolicy(record = {}) {
  const quality = readNumber(
    record.dataQualityScore ??
      record.qualityScore ??
      record.confidence_score ??
      record.score
  );

  const roi = readNumber(record.roi ?? record.netRoi ?? record.expectedROI);
  const profit = readNumber(
    record.profit ??
      record.netProfit ??
      record.expectedProfit ??
      record.estimatedProfit
  );

  const hasBrand = Boolean(readText(record.brand));
  const hasModel = Boolean(readText(record.model));
  const hasPrice = isValidPrice(
    readNumber(record.price ?? record.salePrice ?? record.listingPrice)
  );
  const hasYear = isValidYear(
    readNumber(record.year ?? record.registrationYear)
  );
  const hasKm = isValidKm(
    readNumber(record.km ?? record.kilometers ?? record.mileage)
  );
  const hasValidSource = isValidUrl(
    readText(record.source_url ?? record.sourceUrl ?? record.url)
  );

  const canSaveAnalysis =
    quality >= 55 &&
    hasBrand &&
    hasModel;

  const canSaveMarketMemory =
    quality >= 70 &&
    hasBrand &&
    hasModel &&
    hasPrice &&
    hasYear &&
    hasKm &&
    hasValidSource;

  const isOpportunity =
    canSaveMarketMemory &&
    roi > 0 &&
    profit > 0;

  const rejectionReasons = [];

  if (quality < 55) rejectionReasons.push("quality_too_low_for_analysis");
  if (!hasBrand) rejectionReasons.push("missing_brand");
  if (!hasModel) rejectionReasons.push("missing_model");

  const memoryBlockers = [];

  if (quality < 70) memoryBlockers.push("quality_below_memory_threshold");
  if (!hasPrice) memoryBlockers.push("invalid_price");
  if (!hasYear) memoryBlockers.push("invalid_year");
  if (!hasKm) memoryBlockers.push("invalid_km");
  if (!hasValidSource) memoryBlockers.push("missing_or_invalid_source_url");

  const target = resolveTarget({
    canSaveAnalysis,
    canSaveMarketMemory,
    isOpportunity,
  });

  return {
    target,
    canSaveAnalysis,
    canSaveMarketMemory,
    isOpportunity,
    opportunityType: isOpportunity ? "opportunity_signal" : "market_signal",
    quality,
    roi,
    profit,
    rejectionReasons,
    memoryBlockers,
    summary: buildSummary({
      target,
      canSaveAnalysis,
      canSaveMarketMemory,
      isOpportunity,
      memoryBlockers,
    }),
  };
}

function resolveTarget({
  canSaveAnalysis,
  canSaveMarketMemory,
  isOpportunity,
}) {
  if (isOpportunity) {
    return PERSISTENCE_TARGETS.OPPORTUNITY_MEMORY;
  }

  if (canSaveMarketMemory) {
    return PERSISTENCE_TARGETS.MARKET_MEMORY;
  }

  if (canSaveAnalysis) {
    return PERSISTENCE_TARGETS.ANALYSIS_HISTORY;
  }

  return PERSISTENCE_TARGETS.BLOCKED;
}

function buildSummary({
  target,
  canSaveAnalysis,
  canSaveMarketMemory,
  isOpportunity,
  memoryBlockers,
}) {
  if (target === PERSISTENCE_TARGETS.OPPORTUNITY_MEMORY && isOpportunity) {
    return "Registro apto para memoria y señal de oportunidad.";
  }

  if (target === PERSISTENCE_TARGETS.MARKET_MEMORY && canSaveMarketMemory) {
    return "Registro apto para memoria de mercado, pero no es oportunidad de compra.";
  }

  if (target === PERSISTENCE_TARGETS.ANALYSIS_HISTORY && canSaveAnalysis) {
    return "Registro apto para historial de análisis, pero no para memoria verificada.";
  }

  if (memoryBlockers.length > 0) {
    return `Registro bloqueado para memoria: ${memoryBlockers.join(", ")}.`;
  }

  return "Registro bloqueado por calidad insuficiente o datos mínimos incompletos.";
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

function isValidPrice(value) {
  return Number.isFinite(value) && value >= 500 && value <= 500000;
}

function isValidYear(value) {
  const maxYear = new Date().getFullYear() + 1;
  return Number.isFinite(value) && value >= 1980 && value <= maxYear;
}

function isValidKm(value) {
  return Number.isFinite(value) && value >= 0 && value <= 1000000;
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}