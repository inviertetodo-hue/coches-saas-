export function buildOpportunityScore(vehicle = {}) {
  const qualityScore = normalizeScore(vehicle.qualityScore ?? vehicle.quality ?? 0);
  const roi = normalizeNumber(vehicle.roi);
  const profit = normalizeNumber(vehicle.profit);
  const matchScore = normalizeScore(vehicle.matchScore ?? 0);
  const comparableConfidence = normalizeScore(vehicle.comparableConfidence ?? 0);

  const roiScore = scoreROI(roi);
  const profitScore = scoreProfit(profit);
  const confidenceScore = Math.round((qualityScore + matchScore + comparableConfidence) / 3);

  const opportunityScore = clampScore(
    Math.round(
      roiScore * 0.35 +
        profitScore * 0.25 +
        confidenceScore * 0.30 +
        qualityScore * 0.10
    )
  );

  const riskLevel = detectRiskLevel({
    opportunityScore,
    qualityScore,
    comparableConfidence,
    roi,
    profit,
  });

  const decision = buildDecision({
    opportunityScore,
    riskLevel,
    roi,
    profit,
  });

  return {
    opportunityScore,
    roiScore,
    profitScore,
    confidenceScore,
    qualityScore,
    riskLevel,
    decision,
    summary: buildSummary({
      opportunityScore,
      riskLevel,
      decision,
      roi,
      profit,
    }),
  };
}

export function rankOpportunities(items = []) {
  return items
    .filter(Boolean)
    .map((item) => ({
      ...item,
      opportunity: buildOpportunityScore(item),
    }))
    .sort(
      (a, b) =>
        b.opportunity.opportunityScore - a.opportunity.opportunityScore
    );
}

function scoreROI(roi) {
  if (roi >= 15) return 100;
  if (roi >= 10) return 90;
  if (roi >= 7) return 80;
  if (roi >= 5) return 70;
  if (roi >= 3) return 60;
  if (roi >= 1) return 50;
  if (roi >= 0) return 40;
  if (roi >= -3) return 25;
  return 10;
}

function scoreProfit(profit) {
  if (profit >= 5000) return 100;
  if (profit >= 3500) return 90;
  if (profit >= 2500) return 80;
  if (profit >= 1500) return 70;
  if (profit >= 750) return 60;
  if (profit >= 250) return 50;
  if (profit >= 0) return 40;
  if (profit >= -750) return 25;
  return 10;
}

function detectRiskLevel({
  opportunityScore,
  qualityScore,
  comparableConfidence,
  roi,
  profit,
}) {
  if (qualityScore < 60 || comparableConfidence < 60) {
    return "high";
  }

  if (roi < 0 || profit < 0) {
    return "market_observation";
  }

  if (opportunityScore >= 80) {
    return "low";
  }

  if (opportunityScore >= 60) {
    return "medium";
  }

  return "high";
}

function buildDecision({ opportunityScore, riskLevel, roi, profit }) {
  if (riskLevel === "market_observation") {
    return "Dato útil de mercado, no oportunidad de compra";
  }

  if (roi < 0 || profit < 0) {
    return "No comprar";
  }

  if (opportunityScore >= 85) {
    return "Oportunidad fuerte";
  }

  if (opportunityScore >= 70) {
    return "Interesante";
  }

  if (opportunityScore >= 55) {
    return "Revisar";
  }

  return "Descartar";
}

function buildSummary({ opportunityScore, riskLevel, decision, roi, profit }) {
  return [
    `Opportunity Score: ${opportunityScore}/100.`,
    `Decisión: ${decision}.`,
    `Riesgo: ${formatRisk(riskLevel)}.`,
    `ROI estimado: ${roi}%.`,
    `Margen estimado: ${profit} €.`,
  ].join(" ");
}

function formatRisk(riskLevel) {
  const labels = {
    low: "bajo",
    medium: "medio",
    high: "alto",
    market_observation: "observación de mercado",
  };

  return labels[riskLevel] || "sin clasificar";
}

function normalizeScore(value) {
  return clampScore(Math.round(normalizeNumber(value)));
}

function normalizeNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return numericValue;
}

function clampScore(value) {
  return Math.max(0, Math.min(100, value));
}