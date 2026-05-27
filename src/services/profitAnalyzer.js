// Mantén tu motor actual y añade esta función al final del archivo.

export function analyzeMarketIntelligence(analyses = []) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    return {
      total: 0,
      bestBrand: "",
      bestFuelType: "",
      bestDrivetrain: "",
      bestConfiguration: "",
      marketInsights: [],
    };
  }

  const marketInsights = [];

  const total = analyses.length;

  const averageScore = Math.round(
    analyses.reduce((acc, item) => acc + Number(item.score || 0), 0) / total
  );

  const averageROI = Math.round(
    analyses.reduce((acc, item) => acc + Number(item.roi || 0), 0) / total
  );

  const bestBrand = getTopValue(analyses, "brand");
  const bestFuelType = getTopValue(analyses, "fuel_type");
  const bestDrivetrain = getTopValue(analyses, "drivetrain");
  const bestPerformance = getTopValue(analyses, "performance_package");

  if (averageScore >= 80) {
    marketInsights.push("📈 El histórico muestra oportunidades de alta calidad.");
  }

  if (averageROI >= 25) {
    marketInsights.push("💰 El ROI medio del mercado analizado es fuerte.");
  }

  if (bestBrand) {
    marketInsights.push(`🚘 ${bestBrand} aparece como marca dominante en tu dataset.`);
  }

  if (bestFuelType) {
    marketInsights.push(`⚡ ${bestFuelType} destaca como tipo de motorización relevante.`);
  }

  if (bestDrivetrain) {
    marketInsights.push(`🛞 ${bestDrivetrain} aparece como configuración de tracción importante.`);
  }

  if (bestPerformance) {
    marketInsights.push(`🏁 ${bestPerformance} muestra presencia en oportunidades premium.`);
  }

  return {
    total,
    averageScore,
    averageROI,
    bestBrand,
    bestFuelType,
    bestDrivetrain,
    bestPerformance,
    bestConfiguration: [
      bestBrand,
      bestFuelType,
      bestDrivetrain,
      bestPerformance,
    ]
      .filter(Boolean)
      .join(" · "),
    marketInsights,
  };
}

function getTopValue(items, key) {
  const counter = {};

  for (const item of items) {
    const value = item[key];

    if (!value) continue;

    counter[value] = (counter[value] || 0) + 1;
  }

  const sorted = Object.entries(counter).sort((a, b) => b[1] - a[1]);

  return sorted[0]?.[0] || "";
}