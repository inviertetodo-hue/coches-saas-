export function buildMarketMemory(analyses = []) {
  if (!Array.isArray(analyses)) {
    return createEmptyMemory();
  }

  const validAnalyses = analyses.filter((item) => {
    return item && Number.isFinite(Number(item.score));
  });

  if (!validAnalyses.length) {
    return createEmptyMemory();
  }

  const cleanAnalyses = validAnalyses.map(normalizeAnalysis);

  const averageScore = calculateAverage(cleanAnalyses, "score");
  const averageROI = calculateAverage(cleanAnalyses, "roi");
  const averageProfit = calculateAverage(cleanAnalyses, "profit");

  const brandRanking = buildGroupedRanking(cleanAnalyses, "brand");
  const modelRanking = buildModelRanking(cleanAnalyses);
  const configurationRanking = buildConfigurationRanking(cleanAnalyses);
  const historicalModelMemory = buildHistoricalModelMemory(modelRanking);

  return {
    totalAnalyses: cleanAnalyses.length,

    averageScore: Math.round(averageScore),
    averageROI: Math.round(averageROI),
    averageProfit: Math.round(averageProfit),

    topBrand: brandRanking[0]?.label || "",
    topFuelType: detectTopValue(cleanAnalyses, "fuel_type"),
    topPerformance: detectTopValue(cleanAnalyses, "performance_package"),
    topModel: modelRanking[0]?.label || "",
    topConfiguration: configurationRanking[0]?.label || "",

    bestROIBrand: detectBestByMetric(brandRanking, "averageROI"),
    bestScoreBrand: detectBestByMetric(brandRanking, "averageScore"),
    bestROIModel: detectBestByMetric(modelRanking, "averageROI"),
    bestScoreModel: detectBestByMetric(modelRanking, "averageScore"),
    bestROIConfiguration: detectBestByMetric(configurationRanking, "averageROI"),
    bestScoreConfiguration: detectBestByMetric(configurationRanking, "averageScore"),

    brandRanking,
    modelRanking,
    configurationRanking,
    historicalModelMemory,

    liquidityMap: buildLiquidityMap(cleanAnalyses),
    riskMap: buildRiskMap(cleanAnalyses),
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
    topModel: "",
    topConfiguration: "",

    bestROIBrand: null,
    bestScoreBrand: null,
    bestROIModel: null,
    bestScoreModel: null,
    bestROIConfiguration: null,
    bestScoreConfiguration: null,

    brandRanking: [],
    modelRanking: [],
    configurationRanking: [],
    historicalModelMemory: [],

    liquidityMap: {},
    riskMap: {},
  };
}

function normalizeAnalysis(item) {
  return {
    ...item,
    title: cleanText(item.title),
    brand: cleanKnownValue(item.brand),
    model: cleanKnownValue(item.model),
    fuel_type: cleanKnownValue(item.fuel_type),
    drivetrain: cleanKnownValue(item.drivetrain),
    performance_package: cleanKnownValue(item.performance_package),
    score: safeNumber(item.score),
    roi: safeNumber(item.roi),
    profit: safeNumber(item.profit),
  };
}

function buildGroupedRanking(items, field) {
  const groups = {};

  for (const item of items) {
    const value = item[field];

    if (!isUsefulValue(value)) {
      continue;
    }

    if (!groups[value]) {
      groups[value] = createGroup(value);
    }

    addItemToGroup(groups[value], item);
  }

  return finalizeGroups(groups);
}

function buildModelRanking(items) {
  const groups = {};

  for (const item of items) {
    if (!isUsefulValue(item.brand) || !isUsefulValue(item.model)) {
      continue;
    }

    const key = `${item.brand}|||${item.model}`;
    const label = `${item.brand} ${item.model}`;

    if (!groups[key]) {
      groups[key] = createGroup(label, {
        brand: item.brand,
        model: item.model,
      });
    }

    addItemToGroup(groups[key], item);
  }

  return finalizeGroups(groups);
}

function buildConfigurationRanking(items) {
  const groups = {};

  for (const item of items) {
    if (!isUsefulValue(item.brand) || !isUsefulValue(item.model)) {
      continue;
    }

    const fuel = isUsefulValue(item.fuel_type) ? item.fuel_type : "Sin motor";
    const performance = isUsefulValue(item.performance_package)
      ? item.performance_package
      : "";

    const label = [
      item.brand,
      item.model,
      fuel,
      performance,
    ]
      .filter(Boolean)
      .join(" · ");

    const key = label.toLowerCase();

    if (!groups[key]) {
      groups[key] = createGroup(label, {
        brand: item.brand,
        model: item.model,
        fuel_type: fuel,
        performance_package: performance,
      });
    }

    addItemToGroup(groups[key], item);
  }

  return finalizeGroups(groups);
}

function createGroup(label, extra = {}) {
  return {
    label,
    count: 0,
    totalScore: 0,
    totalROI: 0,
    totalProfit: 0,
    bestScore: 0,
    bestROI: 0,
    ...extra,
  };
}

function addItemToGroup(group, item) {
  const score = safeNumber(item.score);
  const roi = safeNumber(item.roi);
  const profit = safeNumber(item.profit);

  group.count += 1;
  group.totalScore += score;
  group.totalROI += roi;
  group.totalProfit += profit;
  group.bestScore = Math.max(group.bestScore, score);
  group.bestROI = Math.max(group.bestROI, roi);
}

function finalizeGroups(groups) {
  return Object.values(groups)
    .map((group) => ({
      ...group,
      averageScore: Math.round(group.totalScore / group.count),
      averageROI: Math.round(group.totalROI / group.count),
      averageProfit: Math.round(group.totalProfit / group.count),
    }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      if (b.averageScore !== a.averageScore) return b.averageScore - a.averageScore;
      return b.averageROI - a.averageROI;
    })
    .slice(0, 10);
}

function detectBestByMetric(groups = [], metric) {
  const validGroups = groups.filter((group) => {
    return group && Number.isFinite(Number(group[metric]));
  });

  if (!validGroups.length) {
    return null;
  }

  return [...validGroups].sort((a, b) => {
    if (Number(b[metric]) !== Number(a[metric])) {
      return Number(b[metric]) - Number(a[metric]);
    }

    if (Number(b.count) !== Number(a.count)) {
      return Number(b.count) - Number(a.count);
    }

    return Number(b.averageProfit || 0) - Number(a.averageProfit || 0);
  })[0];
}

function calculateAverage(items, field) {
  const values = items
    .map((item) => Number(item[field] || 0))
    .filter((value) => Number.isFinite(value));

  if (!values.length) {
    return 0;
  }

  const total = values.reduce((acc, value) => acc + value, 0);

  return total / values.length;
}

function detectTopValue(items, field) {
  const counter = {};

  for (const item of items) {
    const value = item[field];

    if (!isUsefulValue(value)) {
      continue;
    }

    counter[value] = (counter[value] || 0) + 1;
  }

  const sorted = Object.entries(counter).sort((a, b) => b[1] - a[1]);

  return sorted[0]?.[0] || "";
}

function buildHistoricalModelMemory(modelRanking = []) {
  return modelRanking.map((item) => {
    const confidence = getHistoricalConfidence(item.count);

    return {
      model: item.label,
      brand: item.brand || "",
      modelName: item.model || "",
      analyses: item.count,
      averageROI: item.averageROI,
      averageProfit: item.averageProfit,
      averageScore: item.averageScore,
      bestROI: item.bestROI,
      bestScore: item.bestScore,
      confidence: confidence.label,
      confidenceScore: confidence.score,
      signal: buildHistoricalModelSignal(item, confidence),
    };
  });
}

function getHistoricalConfidence(count) {
  if (count >= 15) {
    return {
      label: "Alta",
      score: 90,
    };
  }

  if (count >= 5) {
    return {
      label: "Media",
      score: 70,
    };
  }

  return {
    label: "Baja",
    score: 40,
  };
}

function buildHistoricalModelSignal(item, confidence) {
  return `${item.label}: ${item.count} análisis, ROI medio ${item.averageROI}%, beneficio medio ${item.averageProfit} €, score medio ${item.averageScore}/100 y confianza histórica ${confidence.label.toLowerCase()}.`;
}

function buildLiquidityMap(items) {
  const map = {};

  for (const item of items) {
    const score = Number(item.score || 0);

    if (score >= 85) {
      map.high = (map.high || 0) + 1;
    } else if (score >= 65) {
      map.medium = (map.medium || 0) + 1;
    } else {
      map.low = (map.low || 0) + 1;
    }
  }

  return map;
}

function buildRiskMap(items) {
  const map = {};

  for (const item of items) {
    const roi = Number(item.roi || 0);
    const score = Number(item.score || 0);

    if (score >= 85 && roi >= 25) {
      map.opportunity = (map.opportunity || 0) + 1;
    } else if (roi >= 15) {
      map.balanced = (map.balanced || 0) + 1;
    } else {
      map.risk = (map.risk || 0) + 1;
    }
  }

  return map;
}

function cleanText(value) {
  return String(value || "").trim();
}

function cleanKnownValue(value) {
  const cleaned = cleanText(value);

  if (!isUsefulValue(cleaned)) {
    return "";
  }

  return cleaned;
}

function isUsefulValue(value) {
  const normalized = String(value || "").trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  return ![
    "unknown",
    "vehicle",
    "vehículo ia",
    "sin datos",
    "null",
    "undefined",
  ].includes(normalized);
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}