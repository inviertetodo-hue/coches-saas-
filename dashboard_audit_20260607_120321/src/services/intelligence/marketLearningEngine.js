export function buildMarketLearning(analyses = []) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    return createEmptyLearning();
  }

  const cleanAnalyses = analyses
    .filter((item) => item && Number.isFinite(Number(item.score)))
    .map(normalizeAnalysis);

  if (!cleanAnalyses.length) {
    return createEmptyLearning();
  }

  const modelLearning = buildModelLearning(cleanAnalyses);
  const brandLearning = buildBrandLearning(cleanAnalyses);
  const globalLearning = buildGlobalLearning(cleanAnalyses);

  return {
    totalAnalyses: cleanAnalyses.length,
    globalLearning,
    modelLearning,
    brandLearning,
    historicalModelMemory: modelLearning,
    strongestModel: modelLearning[0] || null,
    strongestBrand: brandLearning[0] || null,
    learningSignals: buildLearningSignals({
      globalLearning,
      modelLearning,
      brandLearning,
    }),
  };
}

export function calculateLearningBonus({
  vehicle = {},
  historicalModelMemory = [],
} = {}) {
  if (!Array.isArray(historicalModelMemory)) {
    return buildEmptyLearningResult();
  }

  const vehicleText = normalize(
    [vehicle.title, vehicle.brand, vehicle.model, vehicle.engine]
      .filter(Boolean)
      .join(" ")
  );

  const historicalMatch = historicalModelMemory.find((item) => {
    const modelText = normalize(item.model || item.label || "");
    return modelText && vehicleText.includes(modelText);
  });

  if (!historicalMatch) {
    return buildEmptyLearningResult();
  }

  let learningBonus = 0;
  const signals = [];

  if (historicalMatch.averageROI >= 12 && historicalMatch.confidenceScore >= 70) {
    learningBonus += 6;
    signals.push("Histórico sólido: ROI medio elevado y confianza suficiente.");
  }

  if (historicalMatch.averageROI >= 18 && historicalMatch.confidenceScore >= 90) {
    learningBonus += 4;
    signals.push("Modelo históricamente muy rentable.");
  }

  if (historicalMatch.averageROI < 5 && historicalMatch.confidenceScore >= 70) {
    learningBonus -= 6;
    signals.push("Histórico débil: ROI medio insuficiente.");
  }

  if (
    historicalMatch.averageProfit >= 5000 &&
    historicalMatch.confidenceScore >= 70
  ) {
    learningBonus += 3;
    signals.push("Beneficio medio histórico atractivo.");
  }

  if (
    historicalMatch.averageProfit < 1000 &&
    historicalMatch.confidenceScore >= 70
  ) {
    learningBonus -= 3;
    signals.push("Beneficio histórico limitado.");
  }

  return {
    active: true,
    model: historicalMatch.model || historicalMatch.label,
    analyses: historicalMatch.analyses || historicalMatch.count || 0,
    confidence: historicalMatch.confidence || "Media",
    confidenceScore: historicalMatch.confidenceScore || 0,
    averageROI: historicalMatch.averageROI || 0,
    averageProfit: historicalMatch.averageProfit || 0,
    learningBonus,
    signals,
  };
}

export function applyLearningBonus({
  score = 0,
  vehicle = {},
  historicalModelMemory = [],
} = {}) {
  const learning = calculateLearningBonus({
    vehicle,
    historicalModelMemory,
  });

  const finalScore = clamp(Math.round(score + learning.learningBonus), 0, 100);

  return {
    finalScore,
    learning,
  };
}

function buildModelLearning(items) {
  const groups = {};

  for (const item of items) {
    if (!item.brand || !item.model) continue;

    const key = `${item.brand}|||${item.model}`;
    const label = `${item.brand} ${item.model}`;

    if (!groups[key]) {
      groups[key] = createLearningGroup(label, {
        brand: item.brand,
        modelName: item.model,
      });
    }

    addToLearningGroup(groups[key], item);
  }

  return finalizeLearningGroups(groups);
}

function buildBrandLearning(items) {
  const groups = {};

  for (const item of items) {
    if (!item.brand) continue;

    if (!groups[item.brand]) {
      groups[item.brand] = createLearningGroup(item.brand, {
        brand: item.brand,
      });
    }

    addToLearningGroup(groups[item.brand], item);
  }

  return finalizeLearningGroups(groups);
}

function buildGlobalLearning(items) {
  const averageScore = calculateAverage(items, "score");
  const averageROI = calculateAverage(items, "roi");
  const averageProfit = calculateAverage(items, "profit");

  return {
    averageScore,
    averageROI,
    averageProfit,
    confidence:
      items.length >= 30 ? "Alta" : items.length >= 10 ? "Media" : "Baja",
    confidenceScore:
      items.length >= 30 ? 90 : items.length >= 10 ? 70 : 40,
  };
}

function createLearningGroup(label, extra = {}) {
  return {
    label,
    model: label,
    count: 0,
    analyses: 0,
    totalScore: 0,
    totalROI: 0,
    totalProfit: 0,
    bestScore: 0,
    bestROI: 0,
    ...extra,
  };
}

function addToLearningGroup(group, item) {
  const score = safeNumber(item.score);
  const roi = safeNumber(item.roi);
  const profit = safeNumber(item.profit);

  group.count += 1;
  group.analyses += 1;
  group.totalScore += score;
  group.totalROI += roi;
  group.totalProfit += profit;
  group.bestScore = Math.max(group.bestScore, score);
  group.bestROI = Math.max(group.bestROI, roi);
}

function finalizeLearningGroups(groups) {
  return Object.values(groups)
    .map((group) => {
      const averageScore = Math.round(group.totalScore / group.count);
      const averageROI = Math.round(group.totalROI / group.count);
      const averageProfit = Math.round(group.totalProfit / group.count);
      const confidence = getConfidence(group.count);

      return {
        ...group,
        averageScore,
        averageROI,
        averageProfit,
        confidence: confidence.label,
        confidenceScore: confidence.score,
        learningBonus: calculateGroupLearningBonus({
          averageROI,
          averageProfit,
          confidenceScore: confidence.score,
        }),
      };
    })
    .sort((a, b) => {
      if (b.confidenceScore !== a.confidenceScore) {
        return b.confidenceScore - a.confidenceScore;
      }

      if (b.averageROI !== a.averageROI) {
        return b.averageROI - a.averageROI;
      }

      return b.averageProfit - a.averageProfit;
    })
    .slice(0, 20);
}

function calculateGroupLearningBonus({
  averageROI,
  averageProfit,
  confidenceScore,
}) {
  let bonus = 0;

  if (averageROI >= 12 && confidenceScore >= 70) bonus += 6;
  if (averageROI >= 18 && confidenceScore >= 90) bonus += 4;
  if (averageROI < 5 && confidenceScore >= 70) bonus -= 6;
  if (averageProfit >= 5000 && confidenceScore >= 70) bonus += 3;
  if (averageProfit < 1000 && confidenceScore >= 70) bonus -= 3;

  return bonus;
}

function buildLearningSignals({ globalLearning, modelLearning, brandLearning }) {
  const signals = [];

  signals.push(
    `Histórico global: ROI medio ${globalLearning.averageROI}%, beneficio medio ${globalLearning.averageProfit} € y confianza ${globalLearning.confidence.toLowerCase()}.`
  );

  if (modelLearning[0]) {
    signals.push(
      `Modelo líder aprendido: ${modelLearning[0].label} con ROI medio ${modelLearning[0].averageROI}% y confianza ${modelLearning[0].confidence.toLowerCase()}.`
    );
  }

  if (brandLearning[0]) {
    signals.push(
      `Marca líder aprendida: ${brandLearning[0].label} con ROI medio ${brandLearning[0].averageROI}%.`
    );
  }

  return signals;
}

function buildEmptyLearningResult() {
  return {
    active: false,
    model: null,
    analyses: 0,
    confidence: "Sin datos",
    confidenceScore: 0,
    averageROI: 0,
    averageProfit: 0,
    learningBonus: 0,
    signals: [],
  };
}

function createEmptyLearning() {
  return {
    totalAnalyses: 0,
    globalLearning: {
      averageScore: 0,
      averageROI: 0,
      averageProfit: 0,
      confidence: "Sin datos",
      confidenceScore: 0,
    },
    modelLearning: [],
    brandLearning: [],
    historicalModelMemory: [],
    strongestModel: null,
    strongestBrand: null,
    learningSignals: [],
  };
}

function normalizeAnalysis(item) {
  return {
    ...item,
    title: cleanText(item.title),
    brand: cleanKnownValue(item.brand),
    model: cleanKnownValue(item.model),
    score: safeNumber(item.score),
    roi: safeNumber(item.roi),
    profit: safeNumber(item.profit),
  };
}

function calculateAverage(items, field) {
  if (!items.length) return 0;

  const total = items.reduce((acc, item) => {
    return acc + safeNumber(item[field]);
  }, 0);

  return Math.round(total / items.length);
}

function getConfidence(count) {
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

function cleanText(value) {
  return String(value || "").trim();
}

function cleanKnownValue(value) {
  const cleaned = cleanText(value);

  if (!cleaned) return "";

  const normalized = cleaned.toLowerCase();

  if (
    ["unknown", "vehicle", "vehículo ia", "sin datos", "null", "undefined"].includes(
      normalized
    )
  ) {
    return "";
  }

  return cleaned;
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_/+.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value), max);
}