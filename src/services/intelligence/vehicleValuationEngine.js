export function buildVehicleValuation(vehicle = {}, memoryRecords = []) {
  const comparableRecords = findComparableRecords(vehicle, memoryRecords);

  const price = toNumber(vehicle.price);
  const marketValue = calculateEstimatedMarketValue(vehicle, comparableRecords);
  const discountAmount = Math.round(marketValue - price);
  const discountPercent =
    price > 0 ? Number(((discountAmount / price) * 100).toFixed(2)) : 0;

  const confidence = calculateValuationConfidence({
    vehicle,
    comparableRecords,
    marketValue,
  });

  const opportunityLevel = buildOpportunityLevel({
    discountPercent,
    confidence,
    comparableCount: comparableRecords.length,
  });

  return {
    brand: vehicle.brand || "",
    model: vehicle.model || "",
    year: vehicle.year || null,
    price,
    estimatedMarketValue: marketValue,
    discountAmount,
    discountPercent,
    comparableCount: comparableRecords.length,
    confidence,
    opportunityLevel,
    summary: buildSummary({
      vehicle,
      price,
      marketValue,
      discountAmount,
      discountPercent,
      confidence,
      opportunityLevel,
      comparableCount: comparableRecords.length,
    }),
    comparables: comparableRecords.slice(0, 10),
  };
}

export function buildVehicleValuationBatch(vehicles = [], memoryRecords = []) {
  const valuations = vehicles
    .filter(Boolean)
    .map((vehicle) => buildVehicleValuation(vehicle, memoryRecords));

  const highOpportunities = valuations.filter(
    (item) => item.opportunityLevel === "HIGH"
  );

  const mediumOpportunities = valuations.filter(
    (item) => item.opportunityLevel === "MEDIUM"
  );

  const lowOpportunities = valuations.filter(
    (item) => item.opportunityLevel === "LOW"
  );

  return {
    total: valuations.length,
    high: highOpportunities.length,
    medium: mediumOpportunities.length,
    low: lowOpportunities.length,
    valuations,
    topValuations: [...valuations]
      .sort((a, b) => b.discountPercent - a.discountPercent)
      .slice(0, 10),
  };
}

function findComparableRecords(vehicle = {}, memoryRecords = []) {
  const brand = normalize(vehicle.brand);
  const model = normalize(vehicle.model);
  const year = toNumber(vehicle.year);

  return memoryRecords
    .filter((record) => isComparable(record, { brand, model, year }))
    .sort((a, b) => {
      const yearDistanceA = Math.abs(toNumber(a.year) - year);
      const yearDistanceB = Math.abs(toNumber(b.year) - year);

      if (yearDistanceA !== yearDistanceB) {
        return yearDistanceA - yearDistanceB;
      }

      return (
        toTimestamp(b.savedAt || b.created_at || b.updated_at) -
        toTimestamp(a.savedAt || a.created_at || a.updated_at)
      );
    });
}

function isComparable(record = {}, target = {}) {
  if (!record) return false;

  const status = String(record.status || "ACTIVE").toUpperCase();

  if (status !== "ACTIVE") return false;

  if (!isRealValuationRecord(record)) return false;

  if (normalize(record.brand) !== target.brand) return false;
  if (normalize(record.model) !== target.model) return false;

  const recordYear = toNumber(record.year);

  if (target.year > 0 && recordYear > 0) {
    return Math.abs(recordYear - target.year) <= 2;
  }

  return true;
}

function isRealValuationRecord(record = {}) {
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

  if (blockedSourceModes.has(sourceMode)) return false;
  if (record.needsLiveMarketFeed) return false;
  if (record.isRealMarketData === false) return false;

  const brand = normalize(record.brand);
  const model = normalize(record.model);
  const year = toNumber(record.year);
  const price = toNumber(record.price);
  const km = toNumber(record.km ?? record.mileage);

  if (!brand || !model) return false;
  if (model === "gama") return false;
  if (year <= 0 || price <= 0 || km <= 0) return false;

  return true;
}

function calculateEstimatedMarketValue(vehicle = {}, comparableRecords = []) {
  const price = toNumber(vehicle.price);

  if (!comparableRecords.length) {
    return fallbackMarketValue(vehicle);
  }

  const weightedValues = comparableRecords.map((record) => {
    const comparablePrice = toNumber(record.price);
    const profit = toNumber(record.profit);
    const roi = toNumber(record.roi);

    const estimated =
      profit > 0
        ? comparablePrice + profit
        : comparablePrice * (1 + roi / 100);

    const weight = calculateComparableWeight(vehicle, record);

    return {
      value: estimated,
      weight,
    };
  });

  const totalWeight = weightedValues.reduce((sum, item) => sum + item.weight, 0);

  if (totalWeight <= 0) {
    return fallbackMarketValue(vehicle);
  }

  const weightedAverage =
    weightedValues.reduce((sum, item) => sum + item.value * item.weight, 0) /
    totalWeight;

  if (!Number.isFinite(weightedAverage) || weightedAverage <= 0) {
    return fallbackMarketValue(vehicle);
  }

  if (price > 0) {
    const minimumReasonableValue = price * 0.75;
    const maximumReasonableValue = price * 1.35;

    return Math.round(
      Math.max(
        minimumReasonableValue,
        Math.min(maximumReasonableValue, weightedAverage)
      )
    );
  }

  return Math.round(weightedAverage);
}

function fallbackMarketValue(vehicle = {}) {
  const price = toNumber(vehicle.price);
  const roi = toNumber(vehicle.roi);
  const profit = toNumber(vehicle.profit);

  if (price <= 0) return 0;

  if (profit > 0) {
    return Math.round(price + profit);
  }

  if (roi !== 0) {
    return Math.round(price * (1 + roi / 100));
  }

  return price;
}

function calculateComparableWeight(vehicle = {}, record = {}) {
  let weight = 1;

  const vehicleYear = toNumber(vehicle.year);
  const recordYear = toNumber(record.year);

  if (vehicleYear > 0 && recordYear > 0) {
    const yearDistance = Math.abs(vehicleYear - recordYear);

    if (yearDistance === 0) weight += 2;
    if (yearDistance === 1) weight += 1;
    if (yearDistance >= 2) weight -= 0.3;
  }

  const vehicleKm = toNumber(vehicle.km ?? vehicle.mileage);
  const recordKm = toNumber(record.km ?? record.mileage);

  if (vehicleKm > 0 && recordKm > 0) {
    const kmDistance = Math.abs(vehicleKm - recordKm);

    if (kmDistance <= 15000) weight += 1;
    if (kmDistance <= 30000) weight += 0.5;
    if (kmDistance > 70000) weight -= 0.4;
  }

  const confidence = toNumber(record.comparableConfidence);

  if (confidence >= 85) weight += 1;
  if (confidence >= 75) weight += 0.5;
  if (confidence < 60) weight -= 0.5;

  return Math.max(0.2, weight);
}

function calculateValuationConfidence({
  vehicle,
  comparableRecords,
  marketValue,
}) {
  let confidence = 20;

  if (vehicle.brand) confidence += 10;
  if (vehicle.model) confidence += 15;
  if (toNumber(vehicle.year) > 0) confidence += 10;
  if (toNumber(vehicle.price) > 0) confidence += 10;
  if (toNumber(vehicle.km ?? vehicle.mileage) > 0) confidence += 10;
  if (marketValue > 0) confidence += 10;

  confidence += Math.min(20, comparableRecords.length * 5);

  const avgComparableConfidence =
    comparableRecords.length > 0
      ? comparableRecords.reduce(
          (sum, item) => sum + toNumber(item.comparableConfidence),
          0
        ) / comparableRecords.length
      : 0;

  if (avgComparableConfidence >= 85) confidence += 10;
  if (avgComparableConfidence >= 75) confidence += 5;

  return Math.max(0, Math.min(100, Math.round(confidence)));
}

function buildOpportunityLevel({ discountPercent, confidence, comparableCount }) {
  if (confidence < 50 || comparableCount === 0) {
    return "LOW";
  }

  if (discountPercent >= 8 && confidence >= 75) {
    return "HIGH";
  }

  if (discountPercent >= 4 && confidence >= 60) {
    return "MEDIUM";
  }

  return "LOW";
}

function buildSummary({
  vehicle,
  price,
  marketValue,
  discountAmount,
  discountPercent,
  confidence,
  opportunityLevel,
  comparableCount,
}) {
  const name = [vehicle.brand, vehicle.model, vehicle.year]
    .filter(Boolean)
    .join(" ");

  if (!price || !marketValue) {
    return `${name || "Vehículo"} sin datos suficientes para valoración fiable.`;
  }

  return `${name || "Vehículo"} valorado en ${formatNumber(
    marketValue
  )} €. Precio actual ${formatNumber(price)} €. Diferencia ${formatNumber(
    discountAmount
  )} € (${discountPercent}%). Confianza ${confidence}/100 con ${comparableCount} comparables. Nivel: ${opportunityLevel}.`;
}

function formatNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  return numericValue.toLocaleString("es-ES", {
    maximumFractionDigits: 0,
  });
}

function toTimestamp(value) {
  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return 0;
  }

  return timestamp;
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