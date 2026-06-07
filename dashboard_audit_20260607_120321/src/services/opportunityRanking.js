import { buildDecisionPipeline } from "./intelligence/decisionPipeline";
import {
  buildHistoricalModelMemory,
  buildOpportunityTimelineSummary,
} from "./intelligence/historicalMemory";
import {
  calculateSemanticQuality,
  calculateRiskPenalty,
  calculateLiquidityBonus,
} from "./intelligence/rankingUtils";

export function generateOpportunityRanking(analyses = []) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    return {
      rankingScore: 0,
      topOpportunities: [],
      rankingInsights: [],
    };
  }

  const historicalModelMemory = buildHistoricalModelMemory(analyses);
  const timelineSummary = buildOpportunityTimelineSummary(analyses);
  const timelineByFingerprint = new Map(
    (timelineSummary.timelines || []).map((timeline) => [
      timeline.fingerprint,
      timeline,
    ])
  );

  const topOpportunities = analyses
    .map((item) => {
      const score = safeNumber(item.score);
      const roi = safeNumber(item.roi);
      const profit = safeNumber(item.profit);
      const price = safeNumber(item.price || item.purchasePrice || item.budget);

      const title = String(item.title || "");
      const brand = String(item.brand || "");
      const model = String(item.model || "");
      const fuelType = String(item.fuel_type || "");
      const drivetrain = String(item.drivetrain || "");
      const performancePackage = String(item.performance_package || "");

      const semanticQuality = calculateSemanticQuality({
        title,
        brand,
        model,
        fuelType,
        drivetrain,
        performancePackage,
      });

      const riskPenalty = calculateRiskPenalty({
        title,
        score,
        roi,
        profit,
        semanticQuality,
        performancePackage,
      });

      const liquidityBonus = calculateLiquidityBonus({
        title,
        brand,
        model,
        fuelType,
        drivetrain,
        performancePackage,
        semanticQuality,
      });

      const vehicle = {
        ...item,
        score,
        roi,
        profit,
        price,
        title,
        brand,
        model,
        fuelType,
        drivetrain,
        performancePackage,
      };

      const decision = buildDecisionPipeline({
        vehicle,
        historicalModelMemory,
        liquidityBonus,
        riskPenalty,
        semanticQuality,
      });

      const timeline = timelineByFingerprint.get(resolveFingerprint(item));
      const timelineMomentum = buildTimelineMomentum(timeline);

      return {
        id: item.id,
        title: title || "Vehículo IA",
        score,
        roi,
        profit,
        price,
        confidence: semanticQuality,
        riskPenalty,
        liquidityBonus,
        timeline,
        timelineMomentumScore: timelineMomentum.timelineMomentumScore,
        timelineMomentumLabel: timelineMomentum.timelineMomentumLabel,
        timelineMomentumSummary: timelineMomentum.timelineMomentumSummary,
        timelineEvents: timeline?.totalEvents || 0,
        latestTimelineAction: timeline?.latestAction || "WATCH",
        latestTimelineROI: timeline?.latestROI || 0,
        latestTimelineProfit: timeline?.latestProfit || 0,
        latestTimelinePrice: timeline?.latestPrice || 0,
        latestTimelineSellSpeed: timeline?.latestSellSpeed || 0,
        timelineSummary: timeline?.timelineSummary || "Sin histórico temporal suficiente.",
        ...decision.flat,
      };
    })
    .sort(sortOpportunities)
    .slice(0, 5);

  const rankingScore = calculateRankingScore(topOpportunities);

  const rankingInsights = buildRankingInsights(
    topOpportunities,
    analyses.length,
    rankingScore,
    timelineSummary
  );

  return {
    rankingScore,
    topOpportunities,
    rankingInsights,
    timelineSummary,
  };
}

function buildTimelineMomentum(timeline = null) {
  if (!timeline || !Array.isArray(timeline.events) || timeline.events.length < 2) {
    return {
      timelineMomentumScore: 50,
      timelineMomentumLabel: "NO_HISTORY",
      timelineMomentumSummary: "Sin histórico temporal suficiente.",
    };
  }

  const first = timeline.events[0];
  const latest = timeline.events[timeline.events.length - 1];

  let score = 50;

  if (first.action !== "BUY" && latest.action === "BUY") score += 20;
  if (first.action === "BUY" && latest.action !== "BUY") score -= 20;

  const roiChange = safeNumber(latest.roi) - safeNumber(first.roi);
  const profitChange = safeNumber(latest.profit) - safeNumber(first.profit);
  const priceChange = safeNumber(latest.price) - safeNumber(first.price);
  const sellSpeedChange =
    safeNumber(latest.sellSpeedScore) - safeNumber(first.sellSpeedScore);

  if (roiChange >= 5) score += 12;
  if (roiChange <= -5) score -= 12;

  if (profitChange >= 1000) score += 12;
  if (profitChange <= -1000) score -= 12;

  if (priceChange < 0) score += 8;
  if (priceChange > 0) score -= 5;

  if (sellSpeedChange >= 10) score += 8;
  if (sellSpeedChange <= -10) score -= 8;

  const timelineMomentumScore = clampScore(score);

  return {
    timelineMomentumScore,
    timelineMomentumLabel: buildTimelineMomentumLabel(timelineMomentumScore),
    timelineMomentumSummary: timeline.timelineSummary,
  };
}

function buildTimelineMomentumLabel(score) {
  if (score >= 80) return "IMPROVING_FAST";
  if (score >= 65) return "IMPROVING";
  if (score >= 45) return "STABLE";
  if (score >= 30) return "DETERIORATING";
  return "AVOID_TREND";
}

function sortOpportunities(a, b) {
  if (b.timelineMomentumScore !== a.timelineMomentumScore) {
    return b.timelineMomentumScore - a.timelineMomentumScore;
  }

  if (b.allocationScore !== a.allocationScore) {
    return b.allocationScore - a.allocationScore;
  }

  if (b.executiveBuySignalScore !== a.executiveBuySignalScore) {
    return b.executiveBuySignalScore - a.executiveBuySignalScore;
  }

  if (b.marketTimingScore !== a.marketTimingScore) {
    return b.marketTimingScore - a.marketTimingScore;
  }

  if (b.capitalEfficiencyScore !== a.capitalEfficiencyScore) {
    return b.capitalEfficiencyScore - a.capitalEfficiencyScore;
  }

  if (b.sellSpeedScore !== a.sellSpeedScore) {
    return b.sellSpeedScore - a.sellSpeedScore;
  }

  if (b.successProbability !== a.successProbability) {
    return b.successProbability - a.successProbability;
  }

  if (b.executiveScore !== a.executiveScore) {
    return b.executiveScore - a.executiveScore;
  }

  if (b.priorityScore !== a.priorityScore) {
    return b.priorityScore - a.priorityScore;
  }

  if (b.confidence !== a.confidence) {
    return b.confidence - a.confidence;
  }

  return b.profit - a.profit;
}

function calculateRankingScore(topOpportunities = []) {
  if (topOpportunities.length === 0) return 0;

  return Math.round(
    topOpportunities.reduce((sum, item) => {
      return (
        sum +
        Math.round(
          safeNumber(item.allocationScore) * 0.35 +
            safeNumber(item.executiveBuySignalScore) * 0.22 +
            safeNumber(item.marketTimingScore) * 0.15 +
            safeNumber(item.capitalEfficiencyScore) * 0.13 +
            safeNumber(item.timelineMomentumScore) * 0.15
        )
      );
    }, 0) / topOpportunities.length
  );
}

function buildRankingInsights(
  topOpportunities,
  total,
  rankingScore,
  timelineSummary = {}
) {
  const insights = [];

  if (topOpportunities.length > 0) {
    insights.push(`🏆 Ranking IA generado sobre ${total} análisis guardados.`);
  }

  if (rankingScore >= 85) {
    insights.push(
      "🔥 El top de oportunidades muestra alta prioridad de asignación de capital, señal ejecutiva fuerte, buen timing, eficiencia operativa y momentum temporal."
    );
  } else if (rankingScore >= 70) {
    insights.push(
      "🟢 Hay oportunidades interesantes, pero conviene validar asignación de capital, timing, riesgo de inventario y evolución temporal."
    );
  } else if (rankingScore >= 50) {
    insights.push(
      "🟡 El ranking tiene potencial, aunque todavía necesita oportunidades más claras para priorizar capital."
    );
  } else {
    insights.push(
      "📊 El ranking aún no tiene suficiente fuerza para una asignación de capital agresiva."
    );
  }

  if (safeNumber(timelineSummary.totalTimelines) > 0) {
    insights.push(
      `🧭 El ranking ya incorpora memoria temporal sobre ${timelineSummary.totalTimelines} oportunidad(es).`
    );
  }

  if (safeNumber(timelineSummary.upgradedToBuy) > 0) {
    insights.push(
      `🚀 ${timelineSummary.upgradedToBuy} oportunidad(es) han mejorado hasta BUY en el histórico temporal.`
    );
  }

  if (safeNumber(timelineSummary.priceDrops) > 0) {
    insights.push(
      `📉 ${timelineSummary.priceDrops} oportunidad(es) muestran bajadas de precio en timeline.`
    );
  }

  if (safeNumber(timelineSummary.improvingROI) > 0) {
    insights.push(
      `💰 ${timelineSummary.improvingROI} oportunidad(es) mejoran ROI con el tiempo.`
    );
  }

  if (
    topOpportunities.some((item) => Number(item.allocationScore || 0) > 0)
  ) {
    insights.push(
      "💼 El ranking ya prioriza por Portfolio Allocation: dónde poner el dinero primero."
    );
  }

  if (
    topOpportunities.some(
      (item) => item.allocationTier === "TIER_1" || item.allocationTier === "TIER_2"
    )
  ) {
    insights.push(
      "🚀 Hay oportunidades con prioridad clara de asignación de capital."
    );
  }

  if (
    topOpportunities.some((item) => item.allocationTier === "AVOID")
  ) {
    insights.push(
      "🛑 Algunas oportunidades no justifican asignar capital ahora mismo."
    );
  }

  if (
    topOpportunities.some((item) => Number(item.learningBonus || 0) !== 0)
  ) {
    insights.push(
      "🧠 El ranking ya incorpora aprendizaje histórico por modelo en la prioridad ejecutiva."
    );
  }

  if (
    topOpportunities.some((item) => Number(item.successProbability || 0) > 0)
  ) {
    insights.push(
      "🔮 El ranking ya utiliza probabilidad de éxito y señal de compra."
    );
  }

  if (topOpportunities.some((item) => item.executiveBuySignalLabel)) {
    insights.push(
      "🎯 El ranking ya genera señal ejecutiva final: STRONG_BUY, BUY, WATCHLIST, AVOID o REJECT."
    );
  }

  if (
    topOpportunities.some(
      (item) => item.speedLabel || Number(item.sellSpeedScore || 0) > 0
    )
  ) {
    insights.push(
      "⚡ La velocidad de venta ya tiene propietario único: sellSpeedEngine."
    );
  }

  if (
    topOpportunities.some(
      (item) => Number(item.capitalEfficiencyScore || 0) > 0
    )
  ) {
    insights.push(
      "💸 El ranking ya mide eficiencia de capital: beneficio, rotación y capital inmovilizado."
    );
  }

  if (
    topOpportunities.some(
      (item) => Number(item.inventoryRiskScore || 0) > 0
    )
  ) {
    insights.push(
      "📦 El ranking ya mide riesgo de inventario y capital potencialmente atrapado."
    );
  }

  if (
    topOpportunities.some(
      (item) => Number(item.marketTimingScore || 0) > 0
    )
  ) {
    insights.push(
      "⏰ El ranking ya incorpora Market Timing para detectar si el momento de entrada es favorable."
    );
  }

  if (
    topOpportunities.some(
      (item) =>
        item.inventoryRiskLabel === "HIGH_RISK" ||
        item.inventoryRiskLabel === "CRITICAL_RISK"
    )
  ) {
    insights.push(
      "📦 Hay oportunidades con riesgo de inventario alto. Revisa rotación y capital inmovilizado."
    );
  }

  if (
    topOpportunities.some(
      (item) =>
        item.marketTimingLabel === "WAIT" ||
        item.marketTimingLabel === "AVOID"
    )
  ) {
    insights.push(
      "⏳ Algunas oportunidades necesitan mejor timing antes de entrar. No todo buen coche es buena compra hoy."
    );
  }

  if (topOpportunities.some((item) => item.speedLabel === "SLOW_SELLER")) {
    insights.push(
      "🐢 Hay oportunidades con riesgo de rotación lenta. Revisa capital inmovilizado antes de comprar."
    );
  }

  if (topOpportunities.some((item) => item.confidence < 50)) {
    insights.push(
      "🧠 Algunas oportunidades del top tienen baja confianza semántica. No conviene decidir solo por ROI."
    );
  }

  if (topOpportunities.some((item) => item.riskPenalty >= 18)) {
    insights.push(
      "⚠️ El ranking detecta coches con riesgo comercial elevado aunque parezcan rentables."
    );
  }

  if (
    topOpportunities.some(
      (item) =>
        item.timelineMomentumLabel === "IMPROVING_FAST" ||
        item.timelineMomentumLabel === "IMPROVING"
    )
  ) {
    insights.push(
      "📈 El ranking detecta oportunidades con momentum temporal positivo."
    );
  }

  if (
    topOpportunities.some(
      (item) =>
        item.timelineMomentumLabel === "DETERIORATING" ||
        item.timelineMomentumLabel === "AVOID_TREND"
    )
  ) {
    insights.push(
      "📉 Algunas oportunidades muestran deterioro temporal. Revisa evolución antes de comprar."
    );
  }

  const strongest = topOpportunities[0];

  if (strongest) {
    insights.push(
      `🥇 Mejor oportunidad actual: ${strongest.title} · allocation ${strongest.allocationTier} · score ${strongest.allocationScore}/100 · señal ${strongest.executiveBuySignalLabel} · timing ${strongest.marketTimingLabel} · momentum ${strongest.timelineMomentumLabel}.`
    );
  }

  return insights;
}

function resolveFingerprint(item = {}) {
  return (
    item.fingerprint ||
    item.market_fingerprint ||
    item.id ||
    [item.brand, item.model, item.year, item.km, item.price]
      .filter(Boolean)
      .join("-")
      .toLowerCase()
  );
}

function clampScore(value) {
  if (value > 100) return 100;
  if (value < 0) return 0;
  return Math.round(value);
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}