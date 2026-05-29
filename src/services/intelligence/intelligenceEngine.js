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
  const marketTrend = detectMarketTrend(cleanAnalyses);
  const buyRecommendation = buildBuyRecommendation(cleanAnalyses, bestOpportunity);
  const weeklyRecommendation = buildWeeklyRecommendation({
    topOpportunities,
    brandProfitRanking,
    modelProfitRanking,
    marketTrend,
  });

  const marketInsights = buildMarketInsights(cleanAnalyses, {
    bestOpportunity,
    worstOpportunity,
    marketTrend,
    brandProfitRanking,
    modelProfitRanking,
  });

  return {
    totalAnalyses: cleanAnalyses.length,
    bestOpportunity,
    worstOpportunity,
    topOpportunities,
    weakOpportunities,
    brandProfitRanking,
    modelProfitRanking,
    marketTrend,
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
    marketTrend: "Sin datos",
    buyRecommendation: "Guarda más análisis para generar recomendaciones.",
    weeklyRecommendation: "Guarda más análisis para generar una recomendación semanal.",
    marketInsights: [],
  };
}

function normalizeAnalysis(item) {
  return {
    ...item,
    title: cleanText(item.title),
    brand: cleanText(item.brand),
    model: cleanText(item.model),
    fuel_type: cleanText(item.fuel_type),
    performance_package: cleanText(item.performance_package),
    score: safeNumber(item.score),
    roi: safeNumber(item.roi),
    profit: safeNumber(item.profit),
  };
}

function findBestOpportunity(items) {
  return [...items].sort((a, b) => {
    return calculateOpportunityPower(b) - calculateOpportunityPower(a);
  })[0];
}

function findWorstOpportunity(items) {
  return [...items].sort((a, b) => {
    return calculateOpportunityPower(a) - calculateOpportunityPower(b);
  })[0];
}

function buildTopOpportunities(items) {
  return [...items]
    .sort((a, b) => calculateOpportunityPower(b) - calculateOpportunityPower(a))
    .slice(0, 5);
}

function buildWeakOpportunities(items) {
  return [...items]
    .sort((a, b) => calculateOpportunityPower(a) - calculateOpportunityPower(b))
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

function buildBuyRecommendation(items, bestOpportunity) {
  if (!bestOpportunity) {
    return "Guarda más análisis para generar una recomendación.";
  }

  if (
    bestOpportunity.score >= 85 &&
    bestOpportunity.roi >= 25 &&
    bestOpportunity.profit >= 2500
  ) {
    return `Priorizar compra: ${bestOpportunity.title}. Score ${bestOpportunity.score}, ROI ${bestOpportunity.roi}% y beneficio estimado de ${bestOpportunity.profit} €.`;
  }

  if (bestOpportunity.score >= 75 && bestOpportunity.roi >= 15) {
    return `Analizar con calma: ${bestOpportunity.title}. Tiene señales buenas, pero conviene validar precio, historial y demanda.`;
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
  marketTrend,
}) {
  const bestDeal = topOpportunities[0];
  const bestBrand = brandProfitRanking[0];
  const bestModel = modelProfitRanking[0];

  if (!bestDeal) {
    return "Todavía no hay datos suficientes para una recomendación semanal.";
  }

  if (bestDeal.score >= 85 && bestDeal.roi >= 25) {
    return `Esta semana prioriza oportunidades similares a ${bestDeal.title}. La señal de mercado es: ${marketTrend}.`;
  }

  if (bestModel?.label) {
    return `Esta semana busca modelos similares a ${bestModel.label}, con ROI alto y margen verificable.`;
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

  insights.push(`Score medio del histórico: ${averageScore}/100.`);
  insights.push(`ROI medio del histórico: ${averageROI}%.`);
  insights.push(`Beneficio medio estimado: ${averageProfit} €.`);

  if (context.bestOpportunity) {
    insights.push(
      `Mejor oportunidad detectada: ${context.bestOpportunity.title} con score ${context.bestOpportunity.score} y ROI ${context.bestOpportunity.roi}%.`
    );
  }

  if (context.worstOpportunity) {
    insights.push(
      `Oportunidad más débil detectada: ${context.worstOpportunity.title} con score ${context.worstOpportunity.score}.`
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

  if (context.marketTrend) {
    insights.push(`Lectura de mercado: ${context.marketTrend}.`);
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

function cleanText(value) {
  return String(value || "").trim();
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}