export function buildIntelligenceEngine(analyses = []) {
  if (!Array.isArray(analyses)) {
    return createEmptyIntelligence();
  }

  const cleanAnalyses = analyses
    .filter((item) => item && Number.isFinite(Number(item.score)))
    .map(normalizeAnalysis);

  if (!cleanAnalyses.length) {
    return createEmptyIntelligence();
  }

  const bestOpportunity = findBestOpportunity(cleanAnalyses);
  const worstOpportunity = findWorstOpportunity(cleanAnalyses);
  const topOpportunities = buildTopOpportunities(cleanAnalyses);
  const weakOpportunities = buildWeakOpportunities(cleanAnalyses);

  const brandProfitRanking = buildProfitRanking(cleanAnalyses, "brand");
  const modelProfitRanking = buildModelProfitRanking(cleanAnalyses);

  const brandModernRanking = buildModernRanking(cleanAnalyses, "brand");
  const modelModernRanking = buildModernModelRanking(cleanAnalyses);

  const marketTrend = detectMarketTrend(cleanAnalyses);
  const modernMarketTrend = detectModernMarketTrend(cleanAnalyses);

  const buyRecommendation = buildBuyRecommendation(cleanAnalyses, bestOpportunity);
  const weeklyRecommendation = buildWeeklyRecommendation({
    topOpportunities,
    brandProfitRanking,
    modelProfitRanking,
    brandModernRanking,
    modelModernRanking,
    marketTrend,
    modernMarketTrend,
  });

  const marketInsights = buildMarketInsights(cleanAnalyses, {
    bestOpportunity,
    worstOpportunity,
    marketTrend,
    modernMarketTrend,
    brandProfitRanking,
    modelProfitRanking,
    brandModernRanking,
    modelModernRanking,
  });

  return {
    totalAnalyses: cleanAnalyses.length,
    bestOpportunity,
    worstOpportunity,
    topOpportunities,
    weakOpportunities,
    brandProfitRanking,
    modelProfitRanking,
    brandModernRanking,
    modelModernRanking,
    marketTrend,
    modernMarketTrend,
    buyRecommendation,
    weeklyRecommendation,
    marketInsights,
  };
}

function createEmptyIntelligence() {
  return {
    totalAnalyses: 0,
    bestOpportunity: null,
    worstOpportunity: null,
    topOpportunities: [],
    weakOpportunities: [],
    brandProfitRanking: [],
    modelProfitRanking: [],
    brandModernRanking: [],
    modelModernRanking: [],
    marketTrend: "Sin datos",
    modernMarketTrend: "Sin datos modernos",
    buyRecommendation: "Guarda más análisis para generar recomendaciones.",
    weeklyRecommendation: "Guarda más análisis para generar una recomendación semanal.",
    marketInsights: [],
  };
}

function normalizeAnalysis(item) {
  const decision = item.decision || {};
  const opportunity = item.opportunity || {};

  return {
    ...item,
    title: cleanText(item.title),
    brand: cleanText(item.brand),
    model: cleanText(item.model),
    fuel_type: cleanText(item.fuel_type),
    performance_package: cleanText(item.performance_package),

    score: safeNumber(item.score ?? opportunity.scoreV2),
    roi: safeNumber(item.roi),
    profit: safeNumber(item.profit),

    decisionScore: safeNumber(
      item.decisionScore ?? decision.decisionScore ?? opportunity.scoreV2
    ),
    allocationScore: safeNumber(item.allocationScore),
    executiveBuySignalScore: safeNumber(item.executiveBuySignalScore),
    marketTimingScore: safeNumber(item.marketTimingScore),
    capitalEfficiencyScore: safeNumber(item.capitalEfficiencyScore),
    timelineMomentumScore: safeNumber(item.timelineMomentumScore),
    successProbability: safeNumber(item.successProbability),
    sellSpeedScore: safeNumber(item.sellSpeedScore ?? item.sellSpeed?.sellSpeedScore),
    inventoryRiskScore: safeNumber(item.inventoryRiskScore),
  };
}

function findBestOpportunity(items) {
  return [...items].sort((a, b) => {
    return calculateModernOpportunityPower(b) - calculateModernOpportunityPower(a);
  })[0];
}

function findWorstOpportunity(items) {
  return [...items].sort((a, b) => {
    return calculateModernOpportunityPower(a) - calculateModernOpportunityPower(b);
  })[0];
}

function buildTopOpportunities(items) {
  return [...items]
    .sort((a, b) => calculateModernOpportunityPower(b) - calculateModernOpportunityPower(a))
    .slice(0, 5);
}

function buildWeakOpportunities(items) {
  return [...items]
    .sort((a, b) => calculateModernOpportunityPower(a) - calculateModernOpportunityPower(b))
    .slice(0, 5);
}

function calculateOpportunityPower(item) {
  const score = safeNumber(item.score);
  const roi = safeNumber(item.roi);
  const profit = safeNumber(item.profit);

  return Math.round(
    score * 0.45 +
      Math.min(roi, 45) * 0.85 +
      Math.min(profit / 100, 45) * 0.45
  );
}

function calculateModernOpportunityPower(item) {
  const modernSignals = [
    item.allocationScore,
    item.executiveBuySignalScore,
    item.marketTimingScore,
    item.capitalEfficiencyScore,
    item.timelineMomentumScore,
    item.successProbability,
    item.decisionScore,
  ].map(safeNumber);

  const hasModernSignal = modernSignals.some((value) => value > 0);

  if (!hasModernSignal) {
    return calculateOpportunityPower(item);
  }

  const score = Math.round(
    safeNumber(item.allocationScore) * 0.25 +
      safeNumber(item.executiveBuySignalScore) * 0.20 +
      safeNumber(item.marketTimingScore) * 0.16 +
      safeNumber(item.capitalEfficiencyScore) * 0.16 +
      safeNumber(item.timelineMomentumScore) * 0.10 +
      safeNumber(item.successProbability) * 0.08 +
      safeNumber(item.decisionScore) * 0.05
  );

  return clampScore(score);
}

function buildProfitRanking(items, field) {
  const groups = {};

  for (const item of items) {
    const key = cleanText(item[field]);

    if (!key) continue;

    if (!groups[key]) {
      groups[key] = createRankingGroup(key);
    }

    addToRankingGroup(groups[key], item);
  }

  return finalizeRankingGroups(groups);
}

function buildModelProfitRanking(items) {
  const groups = {};

  for (const item of items) {
    if (!item.brand || !item.model) continue;

    const key = `${item.brand} ${item.model}`;

    if (!groups[key]) {
      groups[key] = createRankingGroup(key);
    }

    addToRankingGroup(groups[key], item);
  }

  return finalizeRankingGroups(groups);
}

function buildModernRanking(items, field) {
  const groups = {};

  for (const item of items) {
    const key = cleanText(item[field]);

    if (!key) continue;

    if (!groups[key]) {
      groups[key] = createModernRankingGroup(key);
    }

    addToModernRankingGroup(groups[key], item);
  }

  return finalizeModernRankingGroups(groups);
}

function buildModernModelRanking(items) {
  const groups = {};

  for (const item of items) {
    if (!item.brand || !item.model) continue;

    const key = `${item.brand} ${item.model}`;

    if (!groups[key]) {
      groups[key] = createModernRankingGroup(key);
    }

    addToModernRankingGroup(groups[key], item);
  }

  return finalizeModernRankingGroups(groups);
}

function createRankingGroup(label) {
  return {
    label,
    count: 0,
    totalProfit: 0,
    totalROI: 0,
    totalScore: 0,
    bestProfit: 0,
    bestROI: 0,
    bestScore: 0,
  };
}

function addToRankingGroup(group, item) {
  group.count += 1;
  group.totalProfit += safeNumber(item.profit);
  group.totalROI += safeNumber(item.roi);
  group.totalScore += safeNumber(item.score);
  group.bestProfit = Math.max(group.bestProfit, safeNumber(item.profit));
  group.bestROI = Math.max(group.bestROI, safeNumber(item.roi));
  group.bestScore = Math.max(group.bestScore, safeNumber(item.score));
}

function finalizeRankingGroups(groups) {
  return Object.values(groups)
    .map((group) => ({
      ...group,
      averageProfit: Math.round(group.totalProfit / group.count),
      averageROI: Math.round(group.totalROI / group.count),
      averageScore: Math.round(group.totalScore / group.count),
    }))
    .sort((a, b) => {
      if (b.averageProfit !== a.averageProfit) {
        return b.averageProfit - a.averageProfit;
      }

      if (b.averageROI !== a.averageROI) {
        return b.averageROI - a.averageROI;
      }

      return b.averageScore - a.averageScore;
    })
    .slice(0, 5);
}

function createModernRankingGroup(label) {
  return {
    label,
    count: 0,
    totalModernScore: 0,
    totalAllocationScore: 0,
    totalExecutiveScore: 0,
    totalMarketTimingScore: 0,
    totalCapitalEfficiencyScore: 0,
    totalTimelineMomentumScore: 0,
    totalSuccessProbability: 0,
    totalDecisionScore: 0,
    totalProfit: 0,
    totalROI: 0,
    bestModernScore: 0,
  };
}

function addToModernRankingGroup(group, item) {
  const modernScore = calculateModernOpportunityPower(item);

  group.count += 1;
  group.totalModernScore += modernScore;
  group.totalAllocationScore += safeNumber(item.allocationScore);
  group.totalExecutiveScore += safeNumber(item.executiveBuySignalScore);
  group.totalMarketTimingScore += safeNumber(item.marketTimingScore);
  group.totalCapitalEfficiencyScore += safeNumber(item.capitalEfficiencyScore);
  group.totalTimelineMomentumScore += safeNumber(item.timelineMomentumScore);
  group.totalSuccessProbability += safeNumber(item.successProbability);
  group.totalDecisionScore += safeNumber(item.decisionScore);
  group.totalProfit += safeNumber(item.profit);
  group.totalROI += safeNumber(item.roi);
  group.bestModernScore = Math.max(group.bestModernScore, modernScore);
}

function finalizeModernRankingGroups(groups) {
  return Object.values(groups)
    .map((group) => ({
      ...group,
      averageModernScore: averageGroupValue(group.totalModernScore, group.count),
      averageAllocationScore: averageGroupValue(group.totalAllocationScore, group.count),
      averageExecutiveScore: averageGroupValue(group.totalExecutiveScore, group.count),
      averageMarketTimingScore: averageGroupValue(group.totalMarketTimingScore, group.count),
      averageCapitalEfficiencyScore: averageGroupValue(
        group.totalCapitalEfficiencyScore,
        group.count
      ),
      averageTimelineMomentumScore: averageGroupValue(
        group.totalTimelineMomentumScore,
        group.count
      ),
      averageSuccessProbability: averageGroupValue(
        group.totalSuccessProbability,
        group.count
      ),
      averageDecisionScore: averageGroupValue(group.totalDecisionScore, group.count),
      averageProfit: Math.round(group.totalProfit / group.count),
      averageROI: Math.round(group.totalROI / group.count),
    }))
    .sort((a, b) => {
      if (b.averageModernScore !== a.averageModernScore) {
        return b.averageModernScore - a.averageModernScore;
      }

      if (b.averageAllocationScore !== a.averageAllocationScore) {
        return b.averageAllocationScore - a.averageAllocationScore;
      }

      return b.averageExecutiveScore - a.averageExecutiveScore;
    })
    .slice(0, 5);
}

function detectMarketTrend(items) {
  const strongDeals = items.filter((item) => {
    return item.score >= 85 && item.roi >= 20 && item.profit >= 2000;
  }).length;

  const weakDeals = items.filter((item) => {
    return item.score < 60 || item.roi < 10;
  }).length;

  if (strongDeals >= 3) return "Mercado con oportunidades fuertes";
  if (strongDeals >= 1) return "Mercado selectivo";
  if (weakDeals > items.length / 2) return "Mercado débil";
  return "Mercado estable";
}

function detectModernMarketTrend(items) {
  const strongModernDeals = items.filter((item) => {
    return (
      calculateModernOpportunityPower(item) >= 75 &&
      item.allocationScore >= 65 &&
      item.executiveBuySignalScore >= 55 &&
      item.marketTimingScore >= 60
    );
  }).length;

  const weakModernDeals = items.filter((item) => {
    return (
      calculateModernOpportunityPower(item) < 45 ||
      item.allocationScore < 40 ||
      item.marketTimingScore < 45 ||
      item.successProbability < 25
    );
  }).length;

  if (strongModernDeals >= 3) return "Mercado moderno con oportunidades accionables";
  if (strongModernDeals >= 1) return "Mercado moderno selectivo";
  if (weakModernDeals > items.length / 2) return "Mercado moderno débil";
  return "Mercado moderno estable";
}

function buildBuyRecommendation(items, bestOpportunity) {
  if (!bestOpportunity) {
    return "Guarda más análisis para generar una recomendación.";
  }

  const modernScore = calculateModernOpportunityPower(bestOpportunity);

  if (
    modernScore >= 75 &&
    bestOpportunity.allocationScore >= 65 &&
    bestOpportunity.executiveBuySignalScore >= 55 &&
    bestOpportunity.profit >= 1000
  ) {
    return `Priorizar compra: ${bestOpportunity.title}. Modern Score ${modernScore}/100, allocation ${bestOpportunity.allocationScore}/100, señal ejecutiva ${bestOpportunity.executiveBuySignalScore}/100 y beneficio estimado de ${bestOpportunity.profit} €.`;
  }

  if (
    bestOpportunity.score >= 85 &&
    bestOpportunity.roi >= 25 &&
    bestOpportunity.profit >= 2500
  ) {
    return `Priorizar compra: ${bestOpportunity.title}. Score ${bestOpportunity.score}, ROI ${bestOpportunity.roi}% y beneficio estimado de ${bestOpportunity.profit} €.`;
  }

  if (modernScore >= 62 || (bestOpportunity.score >= 75 && bestOpportunity.roi >= 15)) {
    return `Analizar con calma: ${bestOpportunity.title}. Tiene señales buenas, pero conviene validar precio, historial, demanda y timing.`;
  }

  if (items.length < 5) {
    return "Aún hay pocos datos. Guarda más análisis antes de tomar decisiones fuertes.";
  }

  return "No hay una compra clara ahora mismo. Conviene seguir buscando mejores oportunidades.";
}

function buildWeeklyRecommendation({
  topOpportunities,
  brandProfitRanking,
  modelProfitRanking,
  brandModernRanking,
  modelModernRanking,
  marketTrend,
  modernMarketTrend,
}) {
  const bestDeal = topOpportunities[0];
  const bestBrand = brandProfitRanking[0];
  const bestModel = modelProfitRanking[0];
  const bestModernBrand = brandModernRanking[0];
  const bestModernModel = modelModernRanking[0];

  if (!bestDeal) {
    return "Todavía no hay datos suficientes para una recomendación semanal.";
  }

  if (bestDeal.allocationScore >= 70 && bestDeal.executiveBuySignalScore >= 60) {
    return `Esta semana prioriza oportunidades similares a ${bestDeal.title}. La señal moderna es: ${modernMarketTrend}.`;
  }

  if (bestModernModel?.label) {
    return `Esta semana busca modelos similares a ${bestModernModel.label}, con buena asignación de capital, timing favorable y eficiencia de capital.`;
  }

  if (bestDeal.score >= 85 && bestDeal.roi >= 25) {
    return `Esta semana prioriza oportunidades similares a ${bestDeal.title}. La señal de mercado es: ${marketTrend}.`;
  }

  if (bestModel?.label) {
    return `Esta semana busca modelos similares a ${bestModel.label}, con ROI alto y margen verificable.`;
  }

  if (bestModernBrand?.label) {
    return `Esta semana vigila especialmente ${bestModernBrand.label}, porque aparece como marca fuerte en señales modernas.`;
  }

  if (bestBrand?.label) {
    return `Esta semana vigila especialmente ${bestBrand.label}, porque aparece como marca rentable en tu histórico.`;
  }

  return "Esta semana conviene analizar más anuncios antes de tomar decisiones agresivas.";
}

function buildMarketInsights(items, context) {
  const insights = [];

  const averageScore = calculateAverage(items, "score");
  const averageROI = calculateAverage(items, "roi");
  const averageProfit = calculateAverage(items, "profit");
  const averageModernScore = calculateAverageFromMapper(
    items,
    calculateModernOpportunityPower
  );
  const averageAllocationScore = calculateAverage(items, "allocationScore");
  const averageExecutiveScore = calculateAverage(items, "executiveBuySignalScore");
  const averageMarketTimingScore = calculateAverage(items, "marketTimingScore");
  const averageCapitalEfficiencyScore = calculateAverage(
    items,
    "capitalEfficiencyScore"
  );
  const averageTimelineMomentumScore = calculateAverage(
    items,
    "timelineMomentumScore"
  );
  const averageSuccessProbability = calculateAverage(items, "successProbability");

  insights.push(`Score medio del histórico: ${averageScore}/100.`);
  insights.push(`ROI medio del histórico: ${averageROI}%.`);
  insights.push(`Beneficio medio estimado: ${averageProfit} €.`);
  insights.push(`Modern Score medio: ${averageModernScore}/100.`);
  insights.push(`Allocation medio: ${averageAllocationScore}/100.`);
  insights.push(`Executive Signal medio: ${averageExecutiveScore}/100.`);
  insights.push(`Market Timing medio: ${averageMarketTimingScore}/100.`);
  insights.push(`Capital Efficiency medio: ${averageCapitalEfficiencyScore}/100.`);
  insights.push(`Timeline Momentum medio: ${averageTimelineMomentumScore}/100.`);
  insights.push(`Success Probability media: ${averageSuccessProbability}/100.`);

  if (context.bestOpportunity) {
    insights.push(
      `Mejor oportunidad detectada: ${context.bestOpportunity.title} con Modern Score ${calculateModernOpportunityPower(
        context.bestOpportunity
      )}/100, score ${context.bestOpportunity.score} y ROI ${context.bestOpportunity.roi}%.`
    );
  }

  if (context.worstOpportunity) {
    insights.push(
      `Oportunidad más débil detectada: ${context.worstOpportunity.title} con Modern Score ${calculateModernOpportunityPower(
        context.worstOpportunity
      )}/100.`
    );
  }

  if (context.brandProfitRanking?.[0]) {
    insights.push(
      `Marca más rentable por beneficio medio: ${context.brandProfitRanking[0].label} con ${context.brandProfitRanking[0].averageProfit} € de beneficio medio.`
    );
  }

  if (context.modelProfitRanking?.[0]) {
    insights.push(
      `Modelo más rentable por beneficio medio: ${context.modelProfitRanking[0].label} con ${context.modelProfitRanking[0].averageProfit} € de beneficio medio.`
    );
  }

  if (context.brandModernRanking?.[0]) {
    insights.push(
      `Marca más fuerte por señales modernas: ${context.brandModernRanking[0].label} con Modern Score medio ${context.brandModernRanking[0].averageModernScore}/100.`
    );
  }

  if (context.modelModernRanking?.[0]) {
    insights.push(
      `Modelo más fuerte por señales modernas: ${context.modelModernRanking[0].label} con Modern Score medio ${context.modelModernRanking[0].averageModernScore}/100.`
    );
  }

  if (context.marketTrend) {
    insights.push(`Lectura de mercado clásica: ${context.marketTrend}.`);
  }

  if (context.modernMarketTrend) {
    insights.push(`Lectura de mercado moderna: ${context.modernMarketTrend}.`);
  }

  const repeatedBrand = detectMostRepeatedValue(items, "brand");

  if (repeatedBrand) {
    insights.push(`Marca más repetida en el histórico: ${repeatedBrand}.`);
  }

  return insights;
}

function detectMostRepeatedValue(items, field) {
  const counter = {};

  for (const item of items) {
    const value = cleanText(item[field]);

    if (!value) continue;

    counter[value] = (counter[value] || 0) + 1;
  }

  return Object.entries(counter).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

function calculateAverage(items, field) {
  const values = items
    .map((item) => safeNumber(item[field]))
    .filter((value) => Number.isFinite(value));

  if (!values.length) return 0;

  return Math.round(values.reduce((acc, value) => acc + value, 0) / values.length);
}

function calculateAverageFromMapper(items, mapper) {
  const values = items
    .map((item) => safeNumber(mapper(item)))
    .filter((value) => Number.isFinite(value));

  if (!values.length) return 0;

  return Math.round(values.reduce((acc, value) => acc + value, 0) / values.length);
}

function averageGroupValue(total, count) {
  if (!count) return 0;
  return Math.round(total / count);
}

function cleanText(value) {
  return String(value || "").trim();
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function clampScore(value) {
  if (value > 100) return 100;
  if (value < 0) return 0;
  return Math.round(value);
}