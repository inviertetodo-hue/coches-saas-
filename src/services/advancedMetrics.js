export function generateAdvancedMetrics(
  analyses = []
) {
  if (!analyses.length) {
    return {
      avgScore: 0,
      avgROI: 0,
      avgProfit: 0,
      premiumRatio: 0,
      highRiskRatio: 0,
      lowRiskRatio: 0,
      marketHealth: "Sin datos",
      datasetQuality: "Baja",
      aiReadiness: 0,
    };
  }

  const total = analyses.length;

  const avgScore =
    analyses.reduce(
      (sum, item) => sum + (item.score || 0),
      0
    ) / total;

  const avgROI =
    analyses.reduce(
      (sum, item) => sum + (item.roi || 0),
      0
    ) / total;

  const avgProfit =
    analyses.reduce(
      (sum, item) => sum + (item.profit || 0),
      0
    ) / total;

  const premiumCars = analyses.filter(
    (item) => item.score >= 85
  ).length;

  const highRiskCars = analyses.filter(
    (item) => item.score < 50
  ).length;

  const lowRiskCars = analyses.filter(
    (item) => item.score >= 70
  ).length;

  const premiumRatio = Math.round(
    (premiumCars / total) * 100
  );

  const highRiskRatio = Math.round(
    (highRiskCars / total) * 100
  );

  const lowRiskRatio = Math.round(
    (lowRiskCars / total) * 100
  );

  let marketHealth = "Neutral";

  if (avgROI >= 20 && avgScore >= 75) {
    marketHealth = "🔥 Muy Fuerte";
  } else if (avgROI >= 12) {
    marketHealth = "🟢 Fuerte";
  } else if (avgROI < 5) {
    marketHealth = "🔴 Débil";
  }

  let datasetQuality = "Media";

  if (total >= 30 && avgScore >= 70) {
    datasetQuality = "Alta";
  }

  if (total < 10) {
    datasetQuality = "Baja";
  }

  const aiReadiness = Math.min(
    100,
    Math.round(
      avgScore * 0.45 +
      avgROI * 1.8 +
      premiumRatio * 0.35
    )
  );

  return {
    avgScore: Math.round(avgScore),
    avgROI: Math.round(avgROI),
    avgProfit: Math.round(avgProfit),
    premiumRatio,
    highRiskRatio,
    lowRiskRatio,
    marketHealth,
    datasetQuality,
    aiReadiness,
  };
}