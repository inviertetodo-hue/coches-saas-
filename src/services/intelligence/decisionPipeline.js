import { calculateLearningBonus } from "./marketLearningEngine";
import { buildSuccessProbability } from "./successProbabilityEngine";
import { buildExecutiveBuySignal } from "./executiveBuySignalEngine";
import { buildSellSpeed } from "./sellSpeedEngine";
import { buildCapitalEfficiency } from "./capitalEfficiencyEngine";
import { buildInventoryRisk } from "./inventoryRiskEngine";

export function buildDecisionPipeline({
  vehicle = {},
  historicalModelMemory = [],
  liquidityBonus = 0,
  riskPenalty = 0,
  semanticQuality = 50,
} = {}) {
  const learning = calculateLearningBonus({
    vehicle,
    historicalModelMemory,
  });

  const score = safeNumber(vehicle.score);
  const roi = safeNumber(vehicle.roi);
  const profit = safeNumber(vehicle.profit);
  const price = safeNumber(
    vehicle.price ||
      vehicle.purchasePrice ||
      vehicle.budget
  );

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

  const successProbability = buildSuccessProbability({
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
    successProbability: successProbability.successProbability,
    confidenceScore: learning.confidenceScore,
    liquidityScore: clampScore(60 + liquidityBonus),
    riskScore: clampScore(riskPenalty),
  });

  const sellSpeed = buildSellSpeed({
    successProbability: successProbability.successProbability,
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
    successProbability: successProbability.successProbability,
    executiveBuySignalScore: executiveBuySignal.finalScore,
  });

  const inventoryRisk = buildInventoryRisk({
    estimatedSellDays: sellSpeed.estimatedSellDays,
    successProbability: successProbability.successProbability,
    capitalEfficiencyScore: capitalEfficiency.capitalEfficiencyScore,
    historicalConfidenceScore: learning.confidenceScore,
    price,
  });

  return {
    learning,
    priorityScore,
    executiveScore,

    successProbability,
    executiveBuySignal,
    sellSpeed,
    capitalEfficiency,
    inventoryRisk,

    flat: {
      priorityScore,
      executiveScore,

      learningBonus: learning.learningBonus,
      historicalConfidence: learning.confidence,
      historicalConfidenceScore: learning.confidenceScore,
      historicalAnalyses: learning.analyses,
      historicalAverageROI: learning.averageROI,
      historicalAverageProfit: learning.averageProfit,
      learningSignals: learning.signals,

      successProbability: successProbability.successProbability,
      buySignal: successProbability.buySignal,
      expectedROI: successProbability.expectedROI,
      expectedProfit: successProbability.expectedProfit,
      successRiskLabel: successProbability.riskLabel,
      successSummary: successProbability.summary,
      successEngine: successProbability,

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

      inventoryRisk,
      inventoryRiskScore: inventoryRisk.inventoryRiskScore,
      inventoryRiskLabel: inventoryRisk.inventoryRiskLabel,
      immobilizedCapitalRisk: inventoryRisk.immobilizedCapitalRisk,
      inventoryRiskSummary: inventoryRisk.summary,
    },
  };
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