export function analyzeMarketTrends(analyses = []) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    return {
      total: 0,
      trendScore: 0,
      hotSegments: [],
      weakSegments: [],
      trendInsights: [],
    };
  }

  const trendInsights = [];
  const hotSegments = [];
  const weakSegments = [];

  const total = analyses.length;

  const highScoreCars = analyses.filter(
    (item) => Number(item.score || 0) >= 85
  );

  const highROICars = analyses.filter(
    (item) => Number(item.roi || 0) >= 25
  );

  const premiumCars = analyses.filter(
    (item) => item.brand
  );

  const awdCars = analyses.filter(
    (item) =>
      String(item.drivetrain || "")
        .toLowerCase()
        .includes("awd") ||
      String(item.drivetrain || "")
        .toLowerCase()
        .includes("xdrive") ||
      String(item.drivetrain || "")
        .toLowerCase()
        .includes("quattro") ||
      String(item.drivetrain || "")
        .toLowerCase()
        .includes("4matic")
  );

  const performanceCars = analyses.filter(
    (item) => item.performance_package
  );

  const electrifiedCars = analyses.filter(
    (item) =>
      String(item.fuel_type || "")
        .toLowerCase()
        .includes("phev") ||
      String(item.fuel_type || "")
        .toLowerCase()
        .includes("ev") ||
      String(item.fuel_type || "")
        .toLowerCase()
        .includes("hybrid")
  );

  const trendScore = clampTrendScore(
    50 +
      highScoreCars.length * 6 +
      highROICars.length * 5 +
      awdCars.length * 4 +
      electrifiedCars.length * 4 +
      performanceCars.length * 3
  );

  if (highScoreCars.length > 0) {
    hotSegments.push("Score IA alto");
    trendInsights.push(
      "🔥 Hay oportunidades con score IA alto dentro del histórico."
    );
  }

  if (highROICars.length > 0) {
    hotSegments.push("ROI alto");
    trendInsights.push(
      "💰 El dataset contiene operaciones con ROI fuerte."
    );
  }

  if (awdCars.length > 0) {
    hotSegments.push("AWD premium");
    trendInsights.push(
      "🛞 Las configuraciones AWD aparecen como segmento interesante."
    );
  }

  if (electrifiedCars.length > 0) {
    hotSegments.push("Electrificados");
    trendInsights.push(
      "⚡ Los vehículos electrificados empiezan a tener peso en el dataset."
    );
  }

  if (performanceCars.length > 0) {
    hotSegments.push("Performance");
    trendInsights.push(
      "🏁 Hay presencia de paquetes deportivos o performance."
    );
  }

  if (premiumCars.length === 0) {
    weakSegments.push("Premium insuficiente");
    trendInsights.push(
      "⚠️ Faltan datos suficientes de marcas premium para sacar conclusiones fuertes."
    );
  }

  if (total < 5) {
    weakSegments.push("Dataset pequeño");
    trendInsights.push(
      "📊 Todavía hay pocos análisis guardados; las tendencias serán más fiables con más datos."
    );
  }

  return {
    total,
    trendScore,
    hotSegments,
    weakSegments,
    trendInsights,
  };
}

function clampTrendScore(value) {
  if (value > 100) return 100;
  if (value < 0) return 0;
  return Math.round(value);
}