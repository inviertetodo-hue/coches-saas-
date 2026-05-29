export function compareAgainstMarket({
  currentAnalysis,
  marketMemory,
}) {
  if (
    !currentAnalysis ||
    !marketMemory
  ) {
    return buildEmptyComparison();
  }

  const score =
    Number(
      currentAnalysis.score || 0
    );

  const roi =
    Number(
      currentAnalysis.roi || 0
    );

  const profit =
    Number(
      currentAnalysis
        .estimatedProfit || 0
    );

  const comparison = {
    scoreVsMarket:
      compareMetric(
        score,
        marketMemory.averageScore
      ),

    roiVsMarket:
      compareMetric(
        roi,
        marketMemory.averageROI
      ),

    profitVsMarket:
      compareMetric(
        profit,
        marketMemory.averageProfit
      ),
  };

  const summary =
    buildSummary(comparison);

  const recommendation =
    buildRecommendation(
      comparison
    );

  return {
    comparison,
    summary,
    recommendation,
  };
}

function compareMetric(
  current,
  average
) {
  if (!average) {
    return "neutral";
  }

  const delta =
    current - average;

  if (delta >= 15) {
    return "stronger";
  }

  if (delta >= 5) {
    return "better";
  }

  if (delta <= -15) {
    return "weaker";
  }

  if (delta <= -5) {
    return "below";
  }

  return "neutral";
}

function buildSummary(
  comparison
) {
  const positives = [];
  const negatives = [];

  if (
    comparison.scoreVsMarket ===
      "stronger" ||
    comparison.scoreVsMarket ===
      "better"
  ) {
    positives.push(
      "score IA superior"
    );
  }

  if (
    comparison.roiVsMarket ===
      "stronger" ||
    comparison.roiVsMarket ===
      "better"
  ) {
    positives.push(
      "ROI superior"
    );
  }

  if (
    comparison.profitVsMarket ===
      "stronger" ||
    comparison.profitVsMarket ===
      "better"
  ) {
    positives.push(
      "beneficio superior"
    );
  }

  if (
    comparison.scoreVsMarket ===
      "weaker" ||
    comparison.scoreVsMarket ===
      "below"
  ) {
    negatives.push(
      "score IA inferior"
    );
  }

  if (
    comparison.roiVsMarket ===
      "weaker" ||
    comparison.roiVsMarket ===
      "below"
  ) {
    negatives.push(
      "ROI inferior"
    );
  }

  if (
    comparison.profitVsMarket ===
      "weaker" ||
    comparison.profitVsMarket ===
      "below"
  ) {
    negatives.push(
      "beneficio inferior"
    );
  }

  return {
    positives,
    negatives,
  };
}

function buildRecommendation(
  comparison
) {
  let strength = 0;

  Object.values(comparison).forEach(
    (value) => {
      if (
        value === "stronger"
      ) {
        strength += 2;
      }

      if (
        value === "better"
      ) {
        strength += 1;
      }

      if (
        value === "weaker"
      ) {
        strength -= 2;
      }

      if (
        value === "below"
      ) {
        strength -= 1;
      }
    }
  );

  if (strength >= 4) {
    return "🔥 Muy superior al histórico";
  }

  if (strength >= 2) {
    return "✅ Mejor que la media";
  }

  if (strength <= -4) {
    return "❌ Muy inferior al histórico";
  }

  if (strength <= -2) {
    return "⚠️ Peor que la media";
  }

  return "🟡 Similar al histórico";
}

function buildEmptyComparison() {
  return {
    comparison: {},
    summary: {
      positives: [],
      negatives: [],
    },
    recommendation:
      "Sin datos suficientes",
  };
}