export function buildMarketLearning(analyses = []) {
  if (!Array.isArray(analyses)) {
    return createEmptyLearning();
  }

  const cleanAnalyses = analyses
    .filter((item) => item && Number.isFinite(Number(item.score)))
    .map(normalizeAnalysis);

  if (!cleanAnalyses.length) {
    return createEmptyLearning();
  }

  const brandLearning = buildGroupedLearning(cleanAnalyses, "brand");
  const modelLearning = buildModelLearning(cleanAnalyses);
  const roiRangeLearning = buildRangeLearning(cleanAnalyses, "roi", getROIRange);
  const scoreRangeLearning = buildRangeLearning(cleanAnalyses, "score", getScoreRange);
  const profitRangeLearning = buildRangeLearning(cleanAnalyses, "profit", getProfitRange);

  const learningInsights = buildLearningInsights({
    brandLearning,
    modelLearning,
    roiRangeLearning,
    scoreRangeLearning,
    profitRangeLearning,
  });

  return {
    totalAnalyses: cleanAnalyses.length,
    learningLevel: detectLearningLevel(cleanAnalyses.length),
    brandLearning,
    modelLearning,
    roiRangeLearning,
    scoreRangeLearning,
    profitRangeLearning,
    learningInsights,
  };
}

function createEmptyLearning() {
  return {
    totalAnalyses: 0,
    learningLevel: "Sin datos",
    brandLearning: [],
    modelLearning: [],
    roiRangeLearning: [],
    scoreRangeLearning: [],
    profitRangeLearning: [],
    learningInsights: [
      "Todavía no hay datos suficientes para aprender patrones de mercado.",
    ],
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

function buildGroupedLearning(items, field) {
  const groups = {};

  for (const item of items) {
    const key = cleanKnownValue(item[field]);

    if (!key) continue;

    if (!groups[key]) {
      groups[key] = createLearningGroup(key);
    }

    addItemToLearningGroup(groups[key], item);
  }

  return finalizeLearningGroups(groups);
}

function buildModelLearning(items) {
  const groups = {};

  for (const item of items) {
    if (!item.brand || !item.model) continue;

    const key = `${item.brand} ${item.model}`;

    if (!groups[key]) {
      groups[key] = createLearningGroup(key);
    }

    addItemToLearningGroup(groups[key], item);
  }

  return finalizeLearningGroups(groups);
}

function buildRangeLearning(items, field, rangeBuilder) {
  const groups = {};

  for (const item of items) {
    const value = safeNumber(item[field]);
    const key = rangeBuilder(value);

    if (!key) continue;

    if (!groups[key]) {
      groups[key] = createLearningGroup(key);
    }

    addItemToLearningGroup(groups[key], item);
  }

  return finalizeLearningGroups(groups);
}

function createLearningGroup(label) {
  return {
    label,
    count: 0,
    totalScore: 0,
    totalROI: 0,
    totalProfit: 0,
    bestScore: 0,
    bestROI: 0,
    bestProfit: 0,
  };
}

function addItemToLearningGroup(group, item) {
  const score = safeNumber(item.score);
  const roi = safeNumber(item.roi);
  const profit = safeNumber(item.profit);

  group.count += 1;
  group.totalScore += score;
  group.totalROI += roi;
  group.totalProfit += profit;
  group.bestScore = Math.max(group.bestScore, score);
  group.bestROI = Math.max(group.bestROI, roi);
  group.bestProfit = Math.max(group.bestProfit, profit);
}

function finalizeLearningGroups(groups) {
  return Object.values(groups)
    .map((group) => {
      const averageScore = Math.round(group.totalScore / group.count);
      const averageROI = Math.round(group.totalROI / group.count);
      const averageProfit = Math.round(group.totalProfit / group.count);
      const learningScore = calculateLearningScore({
        count: group.count,
        averageScore,
        averageROI,
        averageProfit,
      });

      return {
        ...group,
        averageScore,
        averageROI,
        averageProfit,
        learningScore,
        learningSignal: detectLearningSignal(learningScore),
      };
    })
    .sort((a, b) => {
      if (b.learningScore !== a.learningScore) {
        return b.learningScore - a.learningScore;
      }

      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return b.averageProfit - a.averageProfit;
    })
    .slice(0, 10);
}

function calculateLearningScore({ count, averageScore, averageROI, averageProfit }) {
  const volumeBonus = Math.min(count * 4, 20);
  const profitScore = Math.min(Math.max(averageProfit / 100, 0), 35);
  const roiScore = Math.min(Math.max(averageROI, 0), 35);
  const qualityScore = Math.min(Math.max(averageScore / 4, 0), 25);

  return Math.round(volumeBonus + profitScore + roiScore + qualityScore);
}

function detectLearningSignal(score) {
  if (score >= 85) return "Muy fuerte";
  if (score >= 70) return "Fuerte";
  if (score >= 55) return "Interesante";
  if (score >= 35) return "Inicial";
  return "Débil";
}

function detectLearningLevel(total) {
  if (total >= 50) return "Avanzado";
  if (total >= 20) return "Sólido";
  if (total >= 8) return "Inicial";
  if (total > 0) return "Aprendiendo";
  return "Sin datos";
}

function buildLearningInsights({
  brandLearning,
  modelLearning,
  roiRangeLearning,
  scoreRangeLearning,
  profitRangeLearning,
}) {
  const insights = [];

  if (brandLearning[0]) {
    insights.push(
      `Marca con mejor patrón aprendido: ${brandLearning[0].label} (${brandLearning[0].learningSignal}).`
    );
  }

  if (modelLearning[0]) {
    insights.push(
      `Modelo con mejor patrón aprendido: ${modelLearning[0].label} (${modelLearning[0].learningSignal}).`
    );
  }

  if (roiRangeLearning[0]) {
    insights.push(
      `Rango ROI más favorable: ${roiRangeLearning[0].label}.`
    );
  }

  if (scoreRangeLearning[0]) {
    insights.push(
      `Rango Score más favorable: ${scoreRangeLearning[0].label}.`
    );
  }

  if (profitRangeLearning[0]) {
    insights.push(
      `Rango de beneficio más favorable: ${profitRangeLearning[0].label}.`
    );
  }

  if (!insights.length) {
    insights.push("Todavía no hay patrones de aprendizaje suficientes.");
  }

  return insights;
}

function getROIRange(value) {
  if (value >= 30) return "ROI 30%+";
  if (value >= 20) return "ROI 20%-29%";
  if (value >= 10) return "ROI 10%-19%";
  if (value >= 0) return "ROI 0%-9%";
  return "ROI negativo";
}

function getScoreRange(value) {
  if (value >= 85) return "Score 85+";
  if (value >= 70) return "Score 70-84";
  if (value >= 55) return "Score 55-69";
  if (value >= 0) return "Score 0-54";
  return "";
}

function getProfitRange(value) {
  if (value >= 5000) return "Beneficio 5000€+";
  if (value >= 2500) return "Beneficio 2500€-4999€";
  if (value >= 1000) return "Beneficio 1000€-2499€";
  if (value >= 0) return "Beneficio 0€-999€";
  return "Beneficio negativo";
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

  if (!normalized) return false;

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