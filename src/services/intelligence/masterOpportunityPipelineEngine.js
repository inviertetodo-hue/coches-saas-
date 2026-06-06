import { analyzeOpportunityAlerts } from "../opportunityAlerts";
import { generateWatchlist } from "../watchlistEngine";
import { buildComparableVehicles } from "./comparableVehiclesEngine";
import { buildDecisionPipeline } from "./decisionPipeline";
import {
  buildHistoricalModelMemory,
  buildOpportunityTimelineSummary,
} from "./historicalMemory";
import { buildMarketValuation } from "./marketValuationEngine";
import { buildOpportunityChanges } from "./opportunityChangeEngine";
import { buildOpportunityDecision } from "./opportunityDecisionEngine";
import { buildOpportunityScore } from "./opportunityScoreEngine";
import { buildPortfolioOpportunity } from "./portfolioOpportunityEngine";
import {
  calculateLiquidityBonus,
  calculateRiskPenalty,
  calculateSemanticQuality,
} from "./rankingUtils";
import { buildVehicleValuation } from "./vehicleValuationEngine";

export function buildMasterOpportunityPipeline(records = [], options = {}) {
  const memoryRecords = options.memoryRecords || records;
  const previousRecords = options.previousRecords || options.previousItems || [];

  const historicalModelMemory = buildHistoricalModelMemory(memoryRecords);
  const timelineSummary = buildOpportunityTimelineSummary(memoryRecords);
  const timelineByFingerprint = new Map(
    (timelineSummary.timelines || []).map((timeline) => [
      timeline.fingerprint,
      timeline,
    ])
  );

  const enriched = records.filter(Boolean).map((vehicle) => {
    const comparables = buildComparableVehicles(vehicle, memoryRecords);

    const vehicleValuation = buildVehicleValuation(vehicle, memoryRecords, {
      comparables,
    });

    const baseOpportunity = buildOpportunityScore(vehicle);

    const valuation = {
      ...buildMarketValuation(vehicle, {
        vehicleValuation,
      }),
      memoryValuation: vehicleValuation,
      comparables,
    };

    const roi = Number(
      vehicle.netRoi ??
      vehicle.roi ??
      valuation.roi ??
      0
    );

    const profit = Number(
      vehicle.netProfit ??
      vehicle.profit ??
      valuation.profit ??
      0
    );
    const price = Number(vehicle.price || vehicle.purchasePrice || vehicle.budget || 0);

    const opportunity = buildOpportunityScoreV2({
      vehicle,
      baseOpportunity,
      comparables,
      vehicleValuation,
      roi,
      profit,
    });

    const title = String(vehicle.title || "");
    const brand = String(vehicle.brand || "");
    const model = String(vehicle.model || "");
    const fuelType = String(vehicle.fuel_type || vehicle.fuelType || "");
    const drivetrain = String(vehicle.drivetrain || "");
    const performancePackage = String(vehicle.performance_package || vehicle.performancePackage || "");

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
      score: opportunity.scoreV2,
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

    const timeline = timelineByFingerprint.get(resolveFingerprint(vehicle));
    const timelineMomentum = buildTimelineMomentum(timeline);

    const pipelineVehicle = {
      ...vehicle,
      score: opportunity.scoreV2,
      roi,
      profit,
      price,
      title,
      brand,
      model,
      fuelType,
      drivetrain,
      performancePackage,
      opportunity,
      valuation,
      vehicleValuation,
      comparables,
      comparableConfidence: vehicleValuation.confidence,
      matchScore: semanticQuality,
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
    };

    const decisionPipeline = buildDecisionPipeline({
      vehicle: pipelineVehicle,
      historicalModelMemory,
      liquidityBonus,
      riskPenalty,
      semanticQuality,
    });

    const modernVehicle = {
      ...pipelineVehicle,
      ...decisionPipeline.flat,
      decisionPipeline,
      sellSpeed: decisionPipeline.sellSpeed,
    };

    const decision = buildOpportunityDecision(modernVehicle);

    return {
      ...modernVehicle,
      decision,
    };
  });

  const ranked = [...enriched].sort(sortModernOpportunities);

  const topOpportunities = ranked.slice(0, 20);
  const portfolio = buildPortfolioOpportunity(ranked);
  const valuationSummary = buildValuationSummary(ranked);
  const watchlist = generateWatchlist(ranked);
  const changes = buildOpportunityChanges(ranked, previousRecords);
  const alerts = analyzeOpportunityAlerts(ranked, changes);

  return {
    totalRecords: ranked.length,
    topOpportunities,
    portfolio,
    valuationSummary,
    watchlist,
    changes,
    alerts,
    timelineSummary,
    buyCount: portfolio.buyCount,
    watchCount: portfolio.watchCount,
    rejectCount: portfolio.rejectCount,
    summary: {
      totalRecords: ranked.length,
      buyCount: portfolio.buyCount,
      watchCount: portfolio.watchCount,
      rejectCount: portfolio.rejectCount,
      requiredCapital: portfolio.requiredCapital,
      expectedProfit: portfolio.expectedProfit,
      averageROI: portfolio.averageROI,
      averageValuationConfidence: valuationSummary.averageConfidence,
      averageDiscountPercent: valuationSummary.averageDiscountPercent,
      totalComparables: valuationSummary.totalComparables,
      averageOpportunityScoreV2: valuationSummary.averageOpportunityScoreV2,
      averageSellSpeedScore: valuationSummary.averageSellSpeedScore,
      averageEstimatedSellDays: valuationSummary.averageEstimatedSellDays,
      averageExecutiveBuySignalScore: valuationSummary.averageExecutiveBuySignalScore,
      averageMarketTimingScore: valuationSummary.averageMarketTimingScore,
      averageCapitalEfficiencyScore: valuationSummary.averageCapitalEfficiencyScore,
      averageTimelineMomentumScore: valuationSummary.averageTimelineMomentumScore,
      watchlistScore: watchlist.watchlistScore,
      alertScore: alerts.alertScore,
      importantChanges: changes.filter((item) => item.change?.hasImportantChange).length,
      timelineCount: timelineSummary.totalTimelines || 0,
      timelineUpgradedToBuy: timelineSummary.upgradedToBuy || 0,
      timelinePriceDrops: timelineSummary.priceDrops || 0,
      timelineImprovingROI: timelineSummary.improvingROI || 0,
    },
  };
}

function sortModernOpportunities(a, b) {
  const comparisons = [
    ["allocationScore"],
    ["executiveBuySignalScore"],
    ["marketTimingScore"],
    ["capitalEfficiencyScore"],
    ["timelineMomentumScore"],
    ["sellSpeedScore"],
    ["successProbability"],
    ["decision", "decisionScore"],
    ["opportunity", "scoreV2"],
  ];

  for (const path of comparisons) {
    const aValue = getNestedNumber(a, path);
    const bValue = getNestedNumber(b, path);

    if (bValue !== aValue) {
      return bValue - aValue;
    }
  }

  return Number(b.profit || 0) - Number(a.profit || 0);
}

function getNestedNumber(item, path = []) {
  const value = path.reduce((current, key) => current?.[key], item);
  return Number(value || 0);
}

function buildOpportunityScoreV2({
  vehicle,
  baseOpportunity,
  comparables,
  vehicleValuation,
  roi = 0,
  profit = 0,
}) {
  const baseScore = Number(
    baseOpportunity?.score ??
      baseOpportunity?.opportunityScore ??
      baseOpportunity?.totalScore ??
      0
  );

  const comparableCount = Number(comparables?.totalComparables || 0);
  const confidence = Number(vehicleValuation?.confidence || 0);
  const discountPercent = Number(vehicleValuation?.discountPercent || 0);

  let score = baseScore || 40;

  score += Math.min(18, Math.max(-18, roi * 2));
  score += Math.min(15, Math.max(-15, discountPercent * 1.4));

  if (profit > 0) score += 8;
  if (profit >= 1000) score += 6;
  if (profit >= 2000) score += 6;

  if (comparableCount >= 1) score += 5;
  if (comparableCount >= 2) score += 5;
  if (comparableCount >= 5) score += 5;

  if (confidence >= 60) score += 5;
  if (confidence >= 75) score += 7;
  if (confidence >= 90) score += 5;

  if (confidence < 50) score -= 15;
  if (comparableCount === 0) score -= 10;
  if (roi < 0) score -= 18;
  if (profit < 0) score -= 18;

  let scoreV2 = clampScore(score);

  // Cortafuegos económico del Radar
  if (profit < 0 && roi <= 0) {
    scoreV2 = Math.min(scoreV2, 35);
  } else if (profit < 0) {
    scoreV2 = Math.min(scoreV2, 45);
  } else if (roi <= 0) {
    scoreV2 = Math.min(scoreV2, 55);
  }

  return {
    ...baseOpportunity,
    scoreV2,
    opportunityScoreV2: scoreV2,
    opportunityLevelV2: buildOpportunityLevel(scoreV2),
    opportunityReasonsV2: buildOpportunityReasons({
      roi,
      profit,
      comparableCount,
      confidence,
      discountPercent,
      scoreV2,
    }),
    valuationConfidence: confidence,
    comparableCount,
    discountPercent,
    estimatedMarketValue: vehicleValuation?.estimatedMarketValue || 0,
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

  const roiChange = Number(latest.roi || 0) - Number(first.roi || 0);
  const profitChange = Number(latest.profit || 0) - Number(first.profit || 0);
  const priceChange = Number(latest.price || 0) - Number(first.price || 0);
  const sellSpeedChange =
    Number(latest.sellSpeedScore || 0) - Number(first.sellSpeedScore || 0);

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

function buildOpportunityLevel(score) {
  if (score >= 85) return "BUY";
  if (score >= 65) return "WATCH";
  return "REJECT";
}

function buildOpportunityReasons({
  roi,
  profit,
  comparableCount,
  confidence,
  discountPercent,
  scoreV2,
}) {
  const reasons = [];

  if (scoreV2 >= 85) {
    reasons.push("Alta oportunidad según score v2.");
  }

  if (scoreV2 >= 65 && scoreV2 < 85) {
    reasons.push("Oportunidad interesante, requiere revisión.");
  }

  if (scoreV2 < 65) {
    reasons.push("Oportunidad insuficiente para compra directa.");
  }

  if (roi > 0) {
    reasons.push(`ROI positivo estimado: ${roi}%.`);
  }

  if (profit > 0) {
    reasons.push(`Margen positivo estimado: ${formatNumber(profit)} €.`);
  }

  if (discountPercent > 0) {
    reasons.push(`Descuento frente a valoración: ${discountPercent}%.`);
  }

  if (comparableCount > 0) {
    reasons.push(`${comparableCount} comparable(s) encontrados en memoria.`);
  }

  if (confidence >= 75) {
    reasons.push(`Confianza de valoración alta: ${confidence}/100.`);
  }

  if (confidence < 50) {
    reasons.push("Confianza de valoración todavía baja.");
  }

  if (comparableCount === 0) {
    reasons.push("Sin comparables suficientes en memoria.");
  }

  return reasons;
}

function buildValuationSummary(records = []) {
  const totalComparables = records.reduce(
    (sum, item) => sum + Number(item.comparables?.totalComparables || 0),
    0
  );

  const confidenceValues = records
    .map((item) => Number(item.vehicleValuation?.confidence || 0))
    .filter((value) => value > 0);

  const discountValues = records
    .map((item) => Number(item.vehicleValuation?.discountPercent || 0))
    .filter((value) => Number.isFinite(value));

  const scoreV2Values = records
    .map((item) => Number(item.opportunity?.scoreV2 || 0))
    .filter((value) => value > 0);

  const sellSpeedValues = records
    .map((item) => Number(item.sellSpeed?.sellSpeedScore || 0))
    .filter((value) => value > 0);

  const sellDaysValues = records
    .map((item) => Number(item.sellSpeed?.estimatedSellDays || 0))
    .filter((value) => value > 0);

  const executiveValues = records
    .map((item) => Number(item.executiveBuySignalScore || 0))
    .filter((value) => value > 0);

  const timingValues = records
    .map((item) => Number(item.marketTimingScore || 0))
    .filter((value) => value > 0);

  const capitalEfficiencyValues = records
    .map((item) => Number(item.capitalEfficiencyScore || 0))
    .filter((value) => value > 0);

  const timelineMomentumValues = records
    .map((item) => Number(item.timelineMomentumScore || 0))
    .filter((value) => value > 0);

  return {
    totalComparables,
    averageConfidence: average(confidenceValues),
    averageDiscountPercent: average(discountValues),
    averageOpportunityScoreV2: average(scoreV2Values),
    averageSellSpeedScore: average(sellSpeedValues),
    averageEstimatedSellDays: average(sellDaysValues),
    averageExecutiveBuySignalScore: average(executiveValues),
    averageMarketTimingScore: average(timingValues),
    averageCapitalEfficiencyScore: average(capitalEfficiencyValues),
    averageTimelineMomentumScore: average(timelineMomentumValues),
    vehiclesWithComparables: records.filter(
      (item) => Number(item.comparables?.totalComparables || 0) > 0
    ).length,
  };
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

function average(values = []) {
  if (!values.length) {
    return 0;
  }

  return Number(
    (
      values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length
    ).toFixed(2)
  );
}

function clampScore(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numericValue)));
}

function formatNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  return numericValue.toLocaleString("es-ES", {
    maximumFractionDigits: 0,
  });
}