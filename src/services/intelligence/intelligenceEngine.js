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
  const marketTrend = detectMarketTrend(cleanAnalyses);
  const buyRecommendation = buildBuyRecommendation(cleanAnalyses, bestOpportunity);
  const marketInsights = buildMarketInsights(cleanAnalyses, {
    bestOpportunity,
    worstOpportunity,
    marketTrend,
  });

  return {
    totalAnalyses: cleanAnalyses.length,
    bestOpportunity,
    worstOpportunity,
    marketTrend,
    buyRecommendation,
    marketInsights,
  };
}

function createEmptyIntelligence() {
  return {
    totalAnalyses: 0,
    bestOpportunity: null,
    worstOpportunity: null,
    marketTrend: "Sin datos",
    buyRecommendation: "Guarda más análisis para generar recomendaciones.",
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
    const aScore = calculateOpportunityPower(a);
    const bScore = calculateOpportunityPower(b);
    return bScore - aScore;
  })[0];
}

function findWorstOpportunity(items) {
  return [...items].sort((a, b) => {
    const aScore = calculateOpportunityPower(a);
    const bScore = calculateOpportunityPower(b);
    return aScore - bScore;
  })[0];
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