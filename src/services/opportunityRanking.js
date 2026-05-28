export function generateOpportunityRanking(analyses = []) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    return {
      rankingScore: 0,
      topOpportunities: [],
      rankingInsights: [],
    };
  }

  const topOpportunities = analyses
    .map((item) => {
      const score = safeNumber(item.score);
      const roi = safeNumber(item.roi);
      const profit = safeNumber(item.profit);

      const title = String(item.title || "");
      const brand = String(item.brand || "");
      const model = String(item.model || "");
      const fuelType = String(item.fuel_type || "");
      const drivetrain = String(item.drivetrain || "");
      const performancePackage = String(
        item.performance_package || ""
      );

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
        liquidityBonus -
        riskPenalty;

      const priorityScore = clampScore(
        Math.round(rawPriority * confidenceWeight)
      );

      return {
        id: item.id,
        title: title || "Vehículo IA",
        score,
        roi,
        profit,
        priorityScore,
        confidence: semanticQuality,
        riskPenalty,
        liquidityBonus,
      };
    })
    .sort((a, b) => {
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
            (sum, item) => sum + item.priorityScore,
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
    insights.push(
      `🏆 Ranking IA generado sobre ${total} análisis guardados.`
    );
  }

  if (rankingScore >= 85) {
    insights.push(
      "🔥 El top de oportunidades muestra calidad alta y buena prioridad comercial."
    );
  } else if (rankingScore >= 70) {
    insights.push(
      "🟢 Hay oportunidades interesantes, pero conviene validar liquidez y datos reales."
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

  const hasLowConfidence = topOpportunities.some(
    (item) => item.confidence < 50
  );

  if (hasLowConfidence) {
    insights.push(
      "🧠 Algunas oportunidades del top tienen baja confianza semántica. No conviene decidir solo por ROI."
    );
  }

  const hasHighRisk = topOpportunities.some(
    (item) => item.riskPenalty >= 18
  );

  if (hasHighRisk) {
    insights.push(
      "⚠️ El ranking detecta coches con riesgo comercial elevado aunque parezcan rentables."
    );
  }

  const strongest = topOpportunities[0];

  if (strongest) {
    insights.push(
      `🥇 Mejor oportunidad actual: ${strongest.title} · prioridad ${strongest.priorityScore}/100.`
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