import { buildDataQualityGate } from "./dataQualityGate";

export const PERSISTENCE_TARGETS = {
  BLOCKED: "blocked",
  ANALYSIS_HISTORY: "analysis_history",
  MARKET_MEMORY: "market_memory",
  OPPORTUNITY_MEMORY: "opportunity_memory",
};

export function evaluatePersistencePolicy(record = {}) {
  const dataQuality = resolveDataQuality(record);

  const quality = readNumber(dataQuality.dataQualityScore);

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
    Boolean(dataQuality.canSaveAnalysis) &&
    hasBrand &&
    hasModel;

  const canSaveMarketMemory =
    Boolean(dataQuality.memoryEligible) &&
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

  if (!dataQuality.memoryEligible) memoryBlockers.push("not_memory_eligible");
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
    dataQuality,
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

function resolveDataQuality(record = {}) {
  const explicitQuality = readOptionalNumber(
    record.dataQualityScore ??
      record.qualityScore ??
      record.confidence_score
  );

  if (explicitQuality !== null) {
    const dataQualityScore = clamp(Math.round(explicitQuality), 0, 100);

    return {
      dataQualityScore,
      dataQualityLabel: getQualityLabel(dataQualityScore),
      memoryEligible: dataQualityScore >= 75,
      canSaveAnalysis: dataQualityScore >= 55,
      reasons: [],
      summary: "Calidad recibida desde el registro.",
    };
  }

  const price = readNumber(
    record.price ??
      record.salePrice ??
      record.listingPrice ??
      record.purchasePrice ??
      record.budget
  );

  const roi = readNumber(record.roi ?? record.netRoi ?? record.expectedROI);
  const profit = readNumber(
    record.profit ??
      record.netProfit ??
      record.expectedProfit ??
      record.estimatedProfit
  );

  return buildDataQualityGate({
    sourceMode:
      record.sourceMode ||
      record.source_mode ||
      record.feedMode ||
      record.feed_mode ||
      record.mode,
    sourceStatus:
      record.sourceStatus ||
      record.source_status ||
      record.feedStatus ||
      record.feed_status ||
      record.status,
    title: record.title,
    brand: record.brand,
    model: record.model,
    year: record.year || record.registrationYear,
    price,
    mileage: record.mileage || record.km || record.kilometers,
    matchScore:
      record.matchScore ||
      record.match_score ||
      record.semanticScore ||
      record.semantic_score,
    comparableConfidence:
      record.comparableConfidence ||
      record.comparable_confidence ||
      record.marketConfidence ||
      record.market_confidence,
    roi,
    profit,
  });
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

function readOptionalNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = readNumber(value);

  return Number.isFinite(number) ? number : null;
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

function getQualityLabel(score) {
  if (score >= 90) return "TRUSTED";
  if (score >= 75) return "GOOD";
  if (score >= 55) return "REVIEW";
  return "REJECT";
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}