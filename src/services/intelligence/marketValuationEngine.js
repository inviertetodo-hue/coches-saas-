export function buildMarketValuation(vehicle = {}, options = {}) {
  const price = toNumber(vehicle.price);

  const memoryValuation =
    vehicle.vehicleValuation ||
    vehicle.memoryValuation ||
    options.vehicleValuation ||
    null;

  const spainReference =
    vehicle.spainMarketReference ||
    vehicle.spainReference ||
    options.spainMarketReference ||
    options.spainReference ||
    null;

  const resolvedSource = resolveMarketValueSource({
    vehicle,
    memoryValuation,
    spainReference,
  });

  const estimatedMarketValue = resolvedSource.estimatedMarketValue;
  const importCosts = resolveImportCosts(vehicle);

  const grossProfit = Math.round(estimatedMarketValue - price);
  const profit = Math.round(estimatedMarketValue - price - importCosts.total);
  const roi = price > 0 ? Number(((profit / price) * 100).toFixed(2)) : 0;

  const discountValue = grossProfit;
  const discountPercent =
    price > 0 ? Number(((grossProfit / price) * 100).toFixed(2)) : 0;

  const valuationScore = calculateValuationScore({
    discountPercent,
    roi,
    profit,
    confidence: resolvedSource.confidence,
    comparableCount: resolvedSource.comparableCount,
    source: resolvedSource.source,
  });

  return {
    price,
    estimatedMarketValue,
    grossProfit,
    importCosts,
    importCostTotal: importCosts.total,
    profit,
    netProfit: profit,
    roi,
    netRoi: roi,
    discountValue,
    discountPercent,
    valuationScore,
    valuationLabel: buildValuationLabel(valuationScore),
    valuationSource: resolvedSource.source,
    valuationConfidence: resolvedSource.confidence,
    comparableCount: resolvedSource.comparableCount,
    marketValueSources: resolvedSource.sources,
    marketValueReason: resolvedSource.reason,
  };
}


function resolveImportCosts(vehicle = {}) {
  const candidates = [
    vehicle.netCosts?.total,
    vehicle.importCosts?.total,
    vehicle.importCostTotal,
    vehicle.totalImportCosts,
    vehicle.costs?.importTotal,
  ];

  for (const candidate of candidates) {
    const value = toNumber(candidate);
    if (value > 0) {
      return {
        total: Math.round(value),
        source: "vehicle_import_costs",
      };
    }
  }

  return buildFallbackImportCosts(vehicle);
}

function buildFallbackImportCosts(vehicle = {}) {
  const country = String(vehicle.country || "").toLowerCase();
  const price = toNumber(vehicle.price);

  const transport =
    country.includes("alemania") || country.includes("germany") ? 900 : 1200;
  const registration = 750;
  const gestor = 450;
  const inspection = 350;
  const detailing = 400;
  const riskBuffer = price >= 70000 ? 1800 : 900;

  return {
    transport,
    registration,
    gestor,
    inspection,
    detailing,
    riskBuffer,
    total:
      transport + registration + gestor + inspection + detailing + riskBuffer,
    source: "fallback_import_costs",
  };
}

function resolveMarketValueSource({ vehicle = {}, memoryValuation = null, spainReference = null }) {
  const memoryEstimatedValue = toNumber(memoryValuation?.estimatedMarketValue);
  const memoryConfidence = toNumber(memoryValuation?.confidence);
  const memoryComparableCount = toNumber(memoryValuation?.comparableCount);

  const spainEstimatedValue = toNumber(spainReference?.estimatedMarketValue);
  const spainConfidence = toNumber(spainReference?.confidence);
  const spainComparableCount = toNumber(spainReference?.comparableCount);

  const candidates = [];

  if (memoryEstimatedValue > 0 && memoryConfidence >= 50) {
    candidates.push({
      source: "memory_comparables",
      estimatedMarketValue: memoryEstimatedValue,
      confidence: memoryConfidence,
      comparableCount: memoryComparableCount,
      weight: calculateSourceWeight({
        confidence: memoryConfidence,
        comparableCount: memoryComparableCount,
        source: "memory_comparables",
      }),
    });
  }

  if (spainEstimatedValue > 0 && spainConfidence >= 45 && spainComparableCount >= 3) {
    candidates.push({
      source: "coches_net_spain_reference",
      estimatedMarketValue: spainEstimatedValue,
      confidence: spainConfidence,
      comparableCount: spainComparableCount,
      weight: calculateSourceWeight({
        confidence: spainConfidence,
        comparableCount: spainComparableCount,
        source: "coches_net_spain_reference",
      }),
    });
  }

  if (candidates.length) {
    const totalWeight = candidates.reduce((sum, item) => sum + item.weight, 0);
    const estimatedMarketValue = Math.round(
      candidates.reduce(
        (sum, item) => sum + item.estimatedMarketValue * item.weight,
        0
      ) / totalWeight
    );

    const confidence = Math.round(
      candidates.reduce((sum, item) => sum + item.confidence * item.weight, 0) /
        totalWeight
    );

    const comparableCount = candidates.reduce(
      (sum, item) => sum + item.comparableCount,
      0
    );

    return {
      source:
        candidates.length > 1
          ? "blended_market_reference"
          : candidates[0].source,
      estimatedMarketValue,
      confidence,
      comparableCount,
      reason:
        candidates.length > 1
          ? "Valor ponderado por varias fuentes reales."
          : `Valor basado en ${candidates[0].source}.`,
      sources: candidates,
    };
  }

  return {
    source: "fallback_market_estimate",
    estimatedMarketValue: buildFallbackMarketValue(vehicle),
    confidence: 0,
    comparableCount: 0,
    reason: "Sin comparables reales suficientes; fallback conservador.",
    sources: [],
  };
}

function calculateSourceWeight({ confidence, comparableCount, source }) {
  let weight = 1;

  if (confidence >= 60) weight += 0.5;
  if (confidence >= 75) weight += 0.7;
  if (confidence >= 90) weight += 0.8;

  if (comparableCount >= 3) weight += 0.4;
  if (comparableCount >= 7) weight += 0.6;
  if (comparableCount >= 12) weight += 0.6;

  if (source === "coches_net_spain_reference") {
    weight += 0.3;
  }

  return Math.max(0.5, weight);
}

function buildFallbackMarketValue(vehicle = {}) {
  const price = toNumber(vehicle.price);

  if (price <= 0) {
    return 0;
  }

  return Math.round(price * 1.05);
}

function calculateValuationScore({
  discountPercent,
  roi,
  profit,
  confidence,
  comparableCount,
  source,
}) {
  let score = 50;

  score += discountPercent * 2;
  score += roi * 2;

  if (profit > 0) score += 10;
  if (profit >= 1000) score += 5;
  if (profit >= 2000) score += 5;

  if (comparableCount >= 1) score += 5;
  if (comparableCount >= 3) score += 5;
  if (comparableCount >= 7) score += 4;

  if (confidence >= 70) score += 6;
  if (confidence >= 85) score += 6;

  if (confidence > 0 && confidence < 50) score -= 10;

  if (source === "fallback_market_estimate") {
    score = Math.min(score, 55);
  }

  if (roi < 0) score -= 12;
  if (profit < 0) score -= 12;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildValuationLabel(score) {
  if (score >= 85) return "Muy infravalorado";
  if (score >= 70) return "Infravalorado";
  if (score >= 50) return "Precio razonable";
  return "Sobrevalorado";
}

function toNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return numericValue;
}
