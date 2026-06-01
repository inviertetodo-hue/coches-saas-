export function buildComparableVehicles(vehicle = {}, memoryRecords = []) {
  const comparables = memoryRecords
    .filter((record) => isComparable(vehicle, record))
    .map((record) => ({
      ...record,
      comparableScore: calculateComparableScore(vehicle, record),
      comparableReasons: buildComparableReasons(vehicle, record),
    }))
    .sort((a, b) => b.comparableScore - a.comparableScore);

  const bestComparables = comparables.slice(0, 20);

  return {
    totalComparables: comparables.length,
    bestComparables,
    bestMatch: bestComparables[0] || null,
    averageComparablePrice: calculateAveragePrice(bestComparables),
    averageComparableKm: calculateAverageKm(bestComparables),
    averageComparableYear: calculateAverageYear(bestComparables),
    quality: buildComparableQuality(bestComparables),
  };
}

function isComparable(vehicle = {}, record = {}) {
  const status = String(record.status || "ACTIVE").toUpperCase();

  if (status !== "ACTIVE") {
    return false;
  }

  if (!isRealComparableRecord(record)) {
    return false;
  }

  const vehicleBrand = normalize(vehicle.brand);
  const vehicleModel = normalize(vehicle.model);

  const recordBrand = normalize(record.brand);
  const recordModel = normalize(record.model);

  if (!vehicleBrand || !vehicleModel) {
    return false;
  }

  if (vehicleBrand !== recordBrand) {
    return false;
  }

  if (vehicleModel !== recordModel) {
    return false;
  }

  return true;
}

function isRealComparableRecord(record = {}) {
  const sourceMode = normalize(record.sourceMode);

  const blockedSourceModes = new Set([
    "mock-fallback",
    "mock-fallback-ranking",
    "review",
    "unresolved-url-query",
    "brand-url-query",
    "semantic-url-query",
    "ready_for_live_feed",
    "missing_model",
    "insufficient_query",
  ]);

  if (blockedSourceModes.has(sourceMode)) {
    return false;
  }

  if (record.needsLiveMarketFeed) {
    return false;
  }

  if (record.isRealMarketData === false) {
    return false;
  }

  const brand = normalize(record.brand);
  const model = normalize(record.model);
  const year = toNumber(record.year);
  const price = toNumber(record.price);
  const km = toNumber(record.km ?? record.mileage);

  if (!brand || !model) {
    return false;
  }

  if (year <= 0 || price <= 0 || km <= 0) {
    return false;
  }

  return true;
}

function calculateComparableScore(vehicle = {}, record = {}) {
  let score = 100;

  const vehicleYear = toNumber(vehicle.year);
  const recordYear = toNumber(record.year);

  if (vehicleYear > 0 && recordYear > 0) {
    score -= Math.abs(vehicleYear - recordYear) * 8;
  }

  const vehicleKm = toNumber(vehicle.km ?? vehicle.mileage);
  const recordKm = toNumber(record.km ?? record.mileage);

  if (vehicleKm > 0 && recordKm > 0) {
    score -= Math.floor(Math.abs(vehicleKm - recordKm) / 10000);
  }

  const confidence = toNumber(record.comparableConfidence);

  score += Math.floor(confidence / 10);

  return Math.max(0, Math.min(100, score));
}

function buildComparableReasons(vehicle = {}, record = {}) {
  const reasons = [];

  if (normalize(vehicle.brand) === normalize(record.brand)) {
    reasons.push("Misma marca");
  }

  if (normalize(vehicle.model) === normalize(record.model)) {
    reasons.push("Mismo modelo");
  }

  const vehicleYear = toNumber(vehicle.year);
  const recordYear = toNumber(record.year);

  if (
    vehicleYear > 0 &&
    recordYear > 0 &&
    Math.abs(vehicleYear - recordYear) <= 1
  ) {
    reasons.push("Año similar");
  }

  const vehicleKm = toNumber(vehicle.km ?? vehicle.mileage);
  const recordKm = toNumber(record.km ?? record.mileage);

  if (
    vehicleKm > 0 &&
    recordKm > 0 &&
    Math.abs(vehicleKm - recordKm) <= 20000
  ) {
    reasons.push("Kilometraje similar");
  }

  return reasons;
}

function buildComparableQuality(records = []) {
  const total = records.length;

  if (total >= 5) {
    return {
      level: "strong",
      label: "Comparables sólidos",
      score: 90,
    };
  }

  if (total >= 3) {
    return {
      level: "good",
      label: "Comparables suficientes",
      score: 75,
    };
  }

  if (total >= 1) {
    return {
      level: "limited",
      label: "Comparables limitados",
      score: 55,
    };
  }

  return {
    level: "none",
    label: "Sin comparables reales",
    score: 0,
  };
}

function calculateAveragePrice(records = []) {
  const values = records
    .map((item) => toNumber(item.price))
    .filter((value) => value > 0);

  if (!values.length) {
    return 0;
  }

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length
  );
}

function calculateAverageKm(records = []) {
  const values = records
    .map((item) => toNumber(item.km ?? item.mileage))
    .filter((value) => value > 0);

  if (!values.length) {
    return 0;
  }

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length
  );
}

function calculateAverageYear(records = []) {
  const values = records
    .map((item) => toNumber(item.year))
    .filter((value) => value > 0);

  if (!values.length) {
    return 0;
  }

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length
  );
}

function toNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return numericValue;
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}