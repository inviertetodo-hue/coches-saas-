const MAX_YEAR_DISTANCE = 3;
const MAX_KM_DISTANCE = 100000;
const MIN_COMPARABLE_SCORE = 45;

export function buildComparableVehicles(vehicle = {}, memoryRecords = []) {
  const comparables = memoryRecords
    .filter((record) => isComparable(vehicle, record))
    .map((record) => {
      const comparableScore = calculateComparableScore(vehicle, record);

      return {
        ...record,
        comparableScore,
        comparableQualityScore: comparableScore,
        comparableReasons: buildComparableReasons(vehicle, record),
      };
    })
    .filter((record) => record.comparableScore >= MIN_COMPARABLE_SCORE)
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

  const vehicleYear = toNumber(vehicle.year);
  const recordYear = toNumber(record.year);

  if (
    vehicleYear > 0 &&
    recordYear > 0 &&
    Math.abs(vehicleYear - recordYear) > MAX_YEAR_DISTANCE
  ) {
    return false;
  }

  const vehicleKm = toNumber(vehicle.km ?? vehicle.mileage);
  const recordKm = toNumber(record.km ?? record.mileage);

  if (
    vehicleKm > 0 &&
    recordKm > 0 &&
    Math.abs(vehicleKm - recordKm) > MAX_KM_DISTANCE
  ) {
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

  if (model === "gama") {
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
    const yearDistance = Math.abs(vehicleYear - recordYear);

    score -= yearDistance * 10;

    if (yearDistance === 0) score += 6;
    if (yearDistance === 1) score += 3;
  }

  const vehicleKm = toNumber(vehicle.km ?? vehicle.mileage);
  const recordKm = toNumber(record.km ?? record.mileage);

  if (vehicleKm > 0 && recordKm > 0) {
    const kmDistance = Math.abs(vehicleKm - recordKm);

    score -= Math.floor(kmDistance / 5000);

    if (kmDistance <= 15000) score += 8;
    if (kmDistance > 50000) score -= 10;
    if (kmDistance > 80000) score -= 10;
  }

  if (sameNormalized(vehicle.fuelType ?? vehicle.fuel_type, record.fuelType ?? record.fuel_type)) {
    score += 5;
  }

  if (sameNormalized(vehicle.drivetrain, record.drivetrain)) {
    score += 4;
  }

  if (
    sameNormalized(
      vehicle.performancePackage ?? vehicle.performance_package,
      record.performancePackage ?? record.performance_package
    )
  ) {
    score += 4;
  }

  const confidence = toNumber(record.comparableConfidence);

  if (confidence >= 85) score += 8;
  if (confidence >= 75) score += 5;
  if (confidence > 0 && confidence < 60) score -= 8;

  return clamp(score, 0, 100);
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
    reasons.push("Año muy similar");
  } else if (
    vehicleYear > 0 &&
    recordYear > 0 &&
    Math.abs(vehicleYear - recordYear) <= MAX_YEAR_DISTANCE
  ) {
    reasons.push("Año comparable");
  }

  const vehicleKm = toNumber(vehicle.km ?? vehicle.mileage);
  const recordKm = toNumber(record.km ?? record.mileage);

  if (
    vehicleKm > 0 &&
    recordKm > 0 &&
    Math.abs(vehicleKm - recordKm) <= 20000
  ) {
    reasons.push("Kilometraje muy similar");
  } else if (
    vehicleKm > 0 &&
    recordKm > 0 &&
    Math.abs(vehicleKm - recordKm) <= MAX_KM_DISTANCE
  ) {
    reasons.push("Kilometraje comparable");
  }

  if (sameNormalized(vehicle.fuelType ?? vehicle.fuel_type, record.fuelType ?? record.fuel_type)) {
    reasons.push("Mismo combustible");
  }

  if (sameNormalized(vehicle.drivetrain, record.drivetrain)) {
    reasons.push("Misma tracción");
  }

  if (
    sameNormalized(
      vehicle.performancePackage ?? vehicle.performance_package,
      record.performancePackage ?? record.performance_package
    )
  ) {
    reasons.push("Paquete similar");
  }

  return reasons;
}

function buildComparableQuality(records = []) {
  const total = records.length;
  const averageScore = calculateAverageComparableScore(records);

  if (total >= 5 && averageScore >= 75) {
    return {
      level: "strong",
      label: "Comparables sólidos",
      score: 90,
      averageScore,
    };
  }

  if (total >= 3 && averageScore >= 65) {
    return {
      level: "good",
      label: "Comparables suficientes",
      score: 75,
      averageScore,
    };
  }

  if (total >= 1) {
    return {
      level: "limited",
      label: "Comparables limitados",
      score: 55,
      averageScore,
    };
  }

  return {
    level: "none",
    label: "Sin comparables reales",
    score: 0,
    averageScore: 0,
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

function calculateAverageComparableScore(records = []) {
  const values = records
    .map((item) => toNumber(item.comparableScore ?? item.comparableQualityScore))
    .filter((value) => value > 0);

  if (!values.length) {
    return 0;
  }

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length
  );
}

function sameNormalized(a, b) {
  const left = normalize(a);
  const right = normalize(b);

  return Boolean(left && right && left === right);
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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}