import { buildDecisionPipeline } from "./intelligence/decisionPipeline";
import { buildHistoricalModelMemory } from "./intelligence/historicalMemory";
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
        ...decision.flat,
      };
    })
    .sort(sortOpportunities)
    .slice(0, 5);

  const rankingScore = calculateRankingScore(topOpportunities);

  const rankingInsights = buildRankingInsights(
    topOpportunities,
    analyses.length,
    rankingScore
  );

  return {
    rankingScore,
    topOpportunities,
    rankingInsights,
  };
}

function sortOpportunities(a, b) {
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
          safeNumber(item.executiveBuySignalScore) * 0.5 +
            safeNumber(item.capitalEfficiencyScore) * 0.25 +
            safeNumber(item.marketTimingScore) * 0.25
        )
      );
    }, 0) / topOpportunities.length
  );
}

function buildRankingInsights(topOpportunities, total, rankingScore) {
  const insights = [];

  if (topOpportunities.length > 0) {
    insights.push(`🏆 Ranking IA generado sobre ${total} análisis guardados.`);
  }

  if (rankingScore >= 85) {
    insights.push(
      "🔥 El top de oportunidades muestra alta señal ejecutiva, buen timing de entrada, eficiencia de capital, velocidad de venta y aprendizaje histórico."
    );
  } else if (rankingScore >= 70) {
    insights.push(
      "🟢 Hay oportunidades interesantes, pero conviene validar timing, capital inmovilizado, liquidez y datos reales."
    );
  } else if (rankingScore >= 50) {
    insights.push(
      "🟡 El ranking tiene potencial, aunque todavía necesita operaciones más claras."
    );
  } else {
    insights.push(
      "📊 El ranking aún no tiene suficiente fuerza: faltan mejores datos u oportunidades."
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
        item.capitalEfficiencyLabel === "CAPITAL_STAR" ||
        item.capitalEfficiencyLabel === "EFFICIENT"
    )
  ) {
    insights.push(
      "🚀 Hay oportunidades donde el capital trabaja especialmente bien frente al tiempo de venta."
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

  const strongest = topOpportunities[0];

  if (strongest) {
    insights.push(
      `🥇 Mejor oportunidad actual: ${strongest.title} · señal ${strongest.executiveBuySignalLabel} · timing ${strongest.marketTimingLabel} · eficiencia capital ${strongest.capitalEfficiencyScore}/100 · inventario ${strongest.inventoryRiskLabel}.`
    );
  }

  return insights;
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}