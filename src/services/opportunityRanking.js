import { calculateLearningBonus } from "./intelligence/marketLearningEngine";
import { buildSuccessProbability } from "./intelligence/successProbabilityEngine";
import { buildExecutiveBuySignal } from "./intelligence/executiveBuySignalEngine";
import { buildSellSpeed } from "./intelligence/sellSpeedEngine";
import { buildCapitalEfficiency } from "./intelligence/capitalEfficiencyEngine";

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

      const learning = calculateLearningBonus({
        vehicle: {
          title,
          brand,
          model,
          fuelType,
          drivetrain,
          performancePackage,
        },
        historicalModelMemory,
      });

      const confidenceWeight =
        semanticQuality >= 75
          ? 1
          : semanticQuality >= 50
          ? 0.88
          : semanticQuality >= 25
          ? 0.72
          : 0.55;

      const rawPriority =
        score * 0.42 +
        roi * 0.95 +
        Math.min(profit / 1000, 28) +
        liquidityBonus +
        learning.learningBonus -
        riskPenalty;

      const priorityScore = clampScore(
        Math.round(rawPriority * confidenceWeight)
      );

      const executiveScore = clampScore(
        Math.round(
          priorityScore * 0.7 +
            score * 0.18 +
            safeNumber(learning.confidenceScore) * 0.12
        )
      );

      const successEngine = buildSuccessProbability({
        opportunity: {
          score,
          roi,
          profit,
          priorityScore,
          executiveScore,
          learningBonus: learning.learningBonus,
          historicalConfidenceScore: learning.confidenceScore,
          historicalAverageROI: learning.averageROI,
          historicalAverageProfit: learning.averageProfit,
        },
        learning,
      });

      const executiveBuySignal = buildExecutiveBuySignal({
        executiveScore,
        successProbability: successEngine.successProbability,
        confidenceScore: learning.confidenceScore,
        liquidityScore: clampScore(60 + liquidityBonus),
        riskScore: clampScore(riskPenalty),
      });

      const sellSpeed = buildSellSpeed({
        successProbability: successEngine.successProbability,
        executiveScore,
        roi,
        profit,
        confidenceScore: learning.confidenceScore,
      });

      const capitalEfficiency = buildCapitalEfficiency({
        price,
        profit,
        roi,
        estimatedSellDays: sellSpeed.estimatedSellDays,
        successProbability: successEngine.successProbability,
        executiveBuySignalScore: executiveBuySignal.finalScore,
      });

      return {
        id: item.id,
        title: title || "Vehículo IA",
        score,
        roi,
        profit,
        price,
        priorityScore,
        executiveScore,
        confidence: semanticQuality,
        riskPenalty,
        liquidityBonus,
        learningBonus: learning.learningBonus,
        historicalConfidence: learning.confidence,
        historicalConfidenceScore: learning.confidenceScore,
        historicalAnalyses: learning.analyses,
        historicalAverageROI: learning.averageROI,
        historicalAverageProfit: learning.averageProfit,
        learningSignals: learning.signals,

        successProbability: successEngine.successProbability,
        buySignal: successEngine.buySignal,
        expectedROI: successEngine.expectedROI,
        expectedProfit: successEngine.expectedProfit,
        successRiskLabel: successEngine.riskLabel,
        successSummary: successEngine.summary,
        successEngine,

        executiveBuySignal,
        executiveBuySignalScore: executiveBuySignal.finalScore,
        executiveBuySignalLabel: executiveBuySignal.signal,
        executiveBuySignalColor: executiveBuySignal.color,
        executiveBuySignalSummary: executiveBuySignal.summary,

        sellSpeed,
        sellSpeedScore: sellSpeed.sellSpeedScore,
        estimatedSellDays: sellSpeed.estimatedSellDays,
        speedLabel: sellSpeed.speedLabel,
        sellSpeedSummary: sellSpeed.summary,

        capitalEfficiency,
        capitalEfficiencyScore: capitalEfficiency.capitalEfficiencyScore,
        capitalEfficiencyLabel: capitalEfficiency.capitalEfficiencyLabel,
        capitalVelocity: capitalEfficiency.capitalVelocity,
        annualizedProfitPotential:
          capitalEfficiency.annualizedProfitPotential,
        capitalRisk: capitalEfficiency.capitalRisk,
        profitPerDay: capitalEfficiency.profitPerDay,
        profitPerThousand: capitalEfficiency.profitPerThousand,
        capitalEfficiencySummary: capitalEfficiency.summary,
      };
    })
    .sort((a, b) => {
      if (b.executiveBuySignalScore !== a.executiveBuySignalScore) {
        return b.executiveBuySignalScore - a.executiveBuySignalScore;
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
    })
    .slice(0, 5);

  const rankingScore =
    topOpportunities.length > 0
      ? Math.round(
          topOpportunities.reduce(
            (sum, item) =>
              sum +
              Math.round(
                item.executiveBuySignalScore * 0.65 +
                  item.capitalEfficiencyScore * 0.35
              ),
            0
          ) / topOpportunities.length
        )
      : 0;

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

function buildRankingInsights(topOpportunities, total, rankingScore) {
  const insights = [];

  if (topOpportunities.length > 0) {
    insights.push(`🏆 Ranking IA generado sobre ${total} análisis guardados.`);
  }

  if (rankingScore >= 85) {
    insights.push(
      "🔥 El top de oportunidades muestra alta señal ejecutiva, buena eficiencia de capital, velocidad de venta y aprendizaje histórico."
    );
  } else if (rankingScore >= 70) {
    insights.push(
      "🟢 Hay oportunidades interesantes, pero conviene validar capital inmovilizado, liquidez y datos reales."
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
      (item) =>
        item.capitalEfficiencyLabel === "CAPITAL_STAR" ||
        item.capitalEfficiencyLabel === "EFFICIENT"
    )
  ) {
    insights.push(
      "🚀 Hay oportunidades donde el capital trabaja especialmente bien frente al tiempo de venta."
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
      `🥇 Mejor oportunidad actual: ${strongest.title} · señal ${strongest.executiveBuySignalLabel} · eficiencia capital ${strongest.capitalEfficiencyScore}/100 · venta estimada ${strongest.estimatedSellDays} días.`
    );
  }

  return insights;
}

function calculateSemanticQuality({
  title,
  brand,
  model,
  fuelType,
  drivetrain,
  performancePackage,
}) {
  let quality = 0;

  if (title && title.length >= 12 && !title.includes("Vehículo IA")) {
    quality += 20;
  }

  if (brand) quality += 25;
  if (model) quality += 25;
  if (fuelType) quality += 12;
  if (drivetrain) quality += 10;
  if (performancePackage) quality += 8;

  return clampScore(quality);
}

function calculateRiskPenalty({
  title,
  score,
  roi,
  profit,
  semanticQuality,
  performancePackage,
}) {
  const text = normalize(`${title} ${performancePackage}`);

  let penalty = 0;

  if (semanticQuality < 25) penalty += 24;
  else if (semanticQuality < 50) penalty += 14;

  if (score >= 90 && semanticQuality < 60) {
    penalty += 14;
  }

  if (roi >= 25 && semanticQuality < 50) {
    penalty += 10;
  }

  if (profit >= 25000) {
    penalty += 6;
  }

  if (
    text.includes("amg") ||
    text.includes(" rs") ||
    text.includes(" m5") ||
    text.includes("m5") ||
    text.includes("m4") ||
    text.includes("m3") ||
    text.includes("turbo") ||
    text.includes("performance")
  ) {
    penalty += 14;
  }

  if (
    text.includes("sl 63") ||
    text.includes("sl63") ||
    text.includes("m5 touring") ||
    text.includes("rs6") ||
    text.includes("911") ||
    text.includes("gt")
  ) {
    penalty += 10;
  }

  return penalty;
}

function calculateLiquidityBonus({
  title,
  brand,
  model,
  fuelType,
  drivetrain,
  performancePackage,
  semanticQuality,
}) {
  const text = normalize(
    `${title} ${brand} ${model} ${fuelType} ${drivetrain} ${performancePackage}`
  );

  let bonus = 0;

  if (semanticQuality >= 75) bonus += 6;

  if (
    text.includes("x5") ||
    text.includes("x3") ||
    text.includes("glc") ||
    text.includes("gle") ||
    text.includes("q5") ||
    text.includes("q7") ||
    text.includes("cayenne") ||
    text.includes("xc90") ||
    text.includes("range rover sport")
  ) {
    bonus += 12;
  }

  if (
    text.includes("phev") ||
    text.includes("hybrid") ||
    text.includes("tfsi e") ||
    text.includes("tfsie") ||
    text.includes("300de") ||
    text.includes("350de") ||
    text.includes("45e")
  ) {
    bonus += 8;
  }

  if (
    text.includes("xdrive") ||
    text.includes("quattro") ||
    text.includes("4matic")
  ) {
    bonus += 5;
  }

  if (
    text.includes("amg") ||
    text.includes("rs") ||
    text.includes("m5") ||
    text.includes("sl 63") ||
    text.includes("sl63")
  ) {
    bonus -= 10;
  }

  return bonus;
}

function buildHistoricalModelMemory(analyses = []) {
  const groups = {};

  for (const item of analyses) {
    const brand = String(item.brand || "").trim();
    const model = String(item.model || "").trim();

    if (!brand || !model) continue;

    const label = `${brand} ${model}`;
    const key = normalize(label);

    if (!groups[key]) {
      groups[key] = {
        model: label,
        analyses: 0,
        totalROI: 0,
        totalProfit: 0,
        totalScore: 0,
      };
    }

    groups[key].analyses += 1;
    groups[key].totalROI += safeNumber(item.roi);
    groups[key].totalProfit += safeNumber(item.profit);
    groups[key].totalScore += safeNumber(item.score);
  }

  return Object.values(groups).map((group) => {
    const confidence = getHistoricalConfidence(group.analyses);

    return {
      model: group.model,
      analyses: group.analyses,
      averageROI: Math.round(group.totalROI / group.analyses),
      averageProfit: Math.round(group.totalProfit / group.analyses),
      averageScore: Math.round(group.totalScore / group.analyses),
      confidence: confidence.label,
      confidenceScore: confidence.score,
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

function normalize(value) {
  return String(value || "").toLowerCase().trim();
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