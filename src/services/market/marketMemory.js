export function buildMarketMemory(analyses = []) {
  if (!Array.isArray(analyses)) {
    return createEmptyMemory();
  }

  const validAnalyses = analyses.filter(
    (item) =>
      item &&
      Number.isFinite(Number(item.score))
  );

  if (!validAnalyses.length) {
    return createEmptyMemory();
  }

  const averageScore = calculateAverage(
    validAnalyses,
    "score"
  );

  const averageROI = calculateAverage(
    validAnalyses,
    "roi"
  );

  const averageProfit = calculateAverage(
    validAnalyses,
    "profit"
  );

  const topBrand =
    detectTopValue(
      validAnalyses,
      "brand"
    );

  const topFuelType =
    detectTopValue(
      validAnalyses,
      "fuel_type"
    );

  const topPerformance =
    detectTopValue(
      validAnalyses,
      "performance_package"
    );

  const liquidityMap =
    buildLiquidityMap(validAnalyses);

  const riskMap =
    buildRiskMap(validAnalyses);

  return {
    totalAnalyses:
      validAnalyses.length,

    averageScore:
      Math.round(averageScore),

    averageROI:
      Math.round(averageROI),

    averageProfit:
      Math.round(averageProfit),

    topBrand,

    topFuelType,

    topPerformance,

    liquidityMap,

    riskMap,
  };
}

function createEmptyMemory() {
  return {
    totalAnalyses: 0,
    averageScore: 0,
    averageROI: 0,
    averageProfit: 0,
    topBrand: "",
    topFuelType: "",
    topPerformance: "",
    liquidityMap: {},
    riskMap: {},
  };
}

function calculateAverage(
  items,
  field
) {
  const values = items
    .map((item) =>
      Number(item[field] || 0)
    )
    .filter((value) =>
      Number.isFinite(value)
    );

  if (!values.length) {
    return 0;
  }

  const total = values.reduce(
    (acc, value) => acc + value,
    0
  );

  return total / values.length;
}

function detectTopValue(
  items,
  field
) {
  const counter = {};

  for (const item of items) {
    const value = item[field];

    if (!value) continue;

    counter[value] =
      (counter[value] || 0) + 1;
  }

  const sorted = Object.entries(
    counter
  ).sort((a, b) => b[1] - a[1]);

  return sorted[0]?.[0] || "";
}

function buildLiquidityMap(items) {
  const map = {};

  for (const item of items) {
    const score = Number(
      item.score || 0
    );

    if (score >= 80) {
      map.high =
        (map.high || 0) + 1;
    } else if (score >= 60) {
      map.medium =
        (map.medium || 0) + 1;
    } else {
      map.low =
        (map.low || 0) + 1;
    }
  }

  return map;
}

function buildRiskMap(items) {
  const map = {};

  for (const item of items) {
    const roi = Number(
      item.roi || 0
    );

    if (roi >= 30) {
      map.aggressive =
        (map.aggressive || 0) + 1;
    } else if (roi >= 15) {
      map.balanced =
        (map.balanced || 0) + 1;
    } else {
      map.conservative =
        (map.conservative || 0) + 1;
    }
  }

  return map;
}