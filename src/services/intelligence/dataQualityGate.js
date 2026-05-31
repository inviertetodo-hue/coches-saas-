export function buildDataQualityGate({
  sourceMode = "",
  sourceStatus = "",
  title = "",
  brand = "",
  model = "",
  year = 0,
  price = 0,
  mileage = 0,
  matchScore = 0,
  comparableConfidence = 0,
  roi = 0,
  profit = 0,
} = {}) {
  let score = 100;
  const reasons = [];

  if (isMockSource(sourceMode)) {
    score -= 70;
    reasons.push("Datos procedentes de mock o fallback.");
  }

  if (isBlockedSource(sourceStatus)) {
    score -= 80;
    reasons.push("Fuente bloqueada o no verificable.");
  }

  if (!hasUsefulValue(title)) {
    score -= 15;
    reasons.push("Título insuficiente.");
  }

  if (!hasUsefulValue(brand)) {
    score -= 20;
    reasons.push("Marca no detectada.");
  }

  if (!hasUsefulValue(model)) {
    score -= 25;
    reasons.push("Modelo no detectado.");
  }

  if (!isReasonableYear(year)) {
    score -= 20;
    reasons.push("Año incoherente o ausente.");
  }

  if (!isReasonablePrice(price)) {
    score -= 25;
    reasons.push("Precio incoherente o ausente.");
  }

  if (!isReasonableMileage(mileage)) {
    score -= 10;
    reasons.push("Kilometraje incoherente.");
  }

  if (Number(matchScore || 0) < 70) {
    score -= 15;
    reasons.push("Match semántico bajo.");
  }

  if (Number(comparableConfidence || 0) < 70) {
    score -= 15;
    reasons.push("Confianza de comparables baja.");
  }

  if (Number(roi || 0) < -20 || Number(profit || 0) < -10000) {
    score -= 20;
    reasons.push("Rentabilidad anómala.");
  }

  const dataQualityScore = clamp(Math.round(score), 0, 100);
  const dataQualityLabel = getQualityLabel(dataQualityScore);

  return {
    dataQualityScore,
    dataQualityLabel,
    memoryEligible: dataQualityScore >= 75,
    canSaveAnalysis: dataQualityScore >= 55,
    reasons,
    summary: buildSummary(dataQualityScore, reasons),
  };
}

function isMockSource(value) {
  const normalized = String(value || "").toLowerCase();

  return (
    normalized.includes("mock") ||
    normalized.includes("fallback") ||
    normalized.includes("demo")
  );
}

function isBlockedSource(value) {
  const normalized = String(value || "").toLowerCase();

  return (
    normalized.includes("blocked") ||
    normalized.includes("access_denied") ||
    normalized.includes("forbidden") ||
    normalized.includes("error")
  );
}

function hasUsefulValue(value) {
  const normalized = String(value || "").trim().toLowerCase();

  if (!normalized) return false;

  return ![
    "unknown",
    "sin datos",
    "vehículo ia",
    "vehicle",
    "null",
    "undefined",
  ].includes(normalized);
}

function isReasonableYear(value) {
  const year = Number(value);

  if (!Number.isFinite(year)) return false;

  return year >= 1990 && year <= 2030;
}

function isReasonablePrice(value) {
  const price = Number(value);

  if (!Number.isFinite(price)) return false;

  return price >= 1000 && price <= 500000;
}

function isReasonableMileage(value) {
  const mileage = Number(value);

  if (!Number.isFinite(mileage)) return true;

  return mileage >= 0 && mileage <= 500000;
}

function getQualityLabel(score) {
  if (score >= 90) return "TRUSTED";
  if (score >= 75) return "GOOD";
  if (score >= 55) return "REVIEW";
  return "REJECT";
}

function buildSummary(score, reasons) {
  if (score >= 90) {
    return "Datos fiables para análisis y memoria histórica.";
  }

  if (score >= 75) {
    return "Datos suficientemente buenos para memoria, con revisión razonable.";
  }

  if (score >= 55) {
    return "Datos útiles para análisis, pero no deberían entrenar memoria fuerte.";
  }

  if (reasons.length > 0) {
    return `Datos rechazados para memoria: ${reasons.slice(0, 2).join(" ")}`;
  }

  return "Datos rechazados para memoria histórica.";
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}