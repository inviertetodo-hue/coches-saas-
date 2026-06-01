export function buildMarketValuation(vehicle = {}, options = {}) {
  const price = toNumber(vehicle.price);
  const roi = toNumber(vehicle.roi);
  const profit = toNumber(vehicle.profit);

  const memoryValuation =
    vehicle.vehicleValuation ||
    vehicle.memoryValuation ||
    options.vehicleValuation ||
    null;

  const memoryEstimatedValue = toNumber(memoryValuation?.estimatedMarketValue);
  const memoryConfidence = toNumber(memoryValuation?.confidence);
  const memoryComparableCount = toNumber(memoryValuation?.comparableCount);

  const estimatedMarketValue =
    memoryEstimatedValue > 0 && memoryConfidence >= 50
      ? memoryEstimatedValue
      : buildFallbackMarketValue({ price, roi, profit });

  const discountValue = Math.round(estimatedMarketValue - price);

  const discountPercent =
    price > 0
      ? Number(((discountValue / price) * 100).toFixed(2))
      : 0;

  const valuationScore = calculateValuationScore({
    discountPercent,
    roi,
    profit,
    memoryConfidence,
    memoryComparableCount,
  });

  return {
    price,
    estimatedMarketValue,
    discountValue,
    discountPercent,
    valuationScore,
    valuationLabel: buildValuationLabel(valuationScore),
    valuationSource:
      memoryEstimatedValue > 0 && memoryConfidence >= 50
        ? "memory_comparables"
        : "fallback_roi_profit",
    valuationConfidence: memoryConfidence,
    comparableCount: memoryComparableCount,
  };
}

function buildFallbackMarketValue({ price, roi, profit }) {
  if (price <= 0) {
    return 0;
  }

  if (profit > 0) {
    return Math.round(price + profit);
  }

  if (roi !== 0) {
    return Math.round(price * (1 + roi / 100));
  }

  return price;
}

function calculateValuationScore({
  discountPercent,
  roi,
  profit,
  memoryConfidence,
  memoryComparableCount,
}) {
  let score = 50;

  score += discountPercent * 2;
  score += roi * 2;

  if (profit > 0) {
    score += 10;
  }

  if (profit >= 1000) {
    score += 5;
  }

  if (profit >= 2000) {
    score += 5;
  }

  if (memoryComparableCount >= 1) {
    score += 5;
  }

  if (memoryComparableCount >= 3) {
    score += 5;
  }

  if (memoryConfidence >= 70) {
    score += 6;
  }

  if (memoryConfidence >= 85) {
    score += 6;
  }

  if (memoryConfidence > 0 && memoryConfidence < 50) {
    score -= 10;
  }

  if (roi < 0) {
    score -= 12;
  }

  if (profit < 0) {
    score -= 12;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildValuationLabel(score) {
  if (score >= 85) {
    return "Muy infravalorado";
  }

  if (score >= 70) {
    return "Infravalorado";
  }

  if (score >= 50) {
    return "Precio razonable";
  }

  return "Sobrevalorado";
}

function toNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return numericValue;
}