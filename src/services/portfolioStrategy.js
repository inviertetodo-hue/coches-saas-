export function analyzePortfolioStrategy(analyses = []) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    return {
      strategyScore: 0,
      strategy: "Sin datos suficientes",
      focusAreas: [],
      strategyInsights: [],
    };
  }

  const strategyInsights = [];
  const focusAreas = [];

  const total = analyses.length;

  const averageScore = Math.round(
    analyses.reduce((acc, item) => acc + Number(item.score || 0), 0) / total
  );

  const averageROI = Math.round(
    analyses.reduce((acc, item) => acc + Number(item.roi || 0), 0) / total
  );

  const highScoreCars = analyses.filter(
    (item) => Number(item.score || 0) >= 85
  );

  const highROICars = analyses.filter(
    (item) => Number(item.roi || 0) >= 25
  );

  const premiumCars = analyses.filter(
    (item) => Boolean(item.brand)
  );

  const electrifiedCars = analyses.filter((item) =>
    String(item.fuel_type || "").toLowerCase().includes("phev") ||
    String(item.fuel_type || "").toLowerCase().includes("ev") ||
    String(item.fuel_type || "").toLowerCase().includes("hybrid")
  );

  const awdCars = analyses.filter((item) =>
    String(item.drivetrain || "").toLowerCase().includes("awd") ||
    String(item.drivetrain || "").toLowerCase().includes("xdrive") ||
    String(item.drivetrain || "").toLowerCase().includes("quattro") ||
    String(item.drivetrain || "").toLowerCase().includes("4matic")
  );

  let strategyScore =
    50 +
    highScoreCars.length * 6 +
    highROICars.length * 5 +
    electrifiedCars.length * 4 +
    awdCars.length * 4;

  strategyScore = clampScore(strategyScore);

  let strategy = "Exploración de mercado";

  if (averageScore >= 80 && averageROI >= 25) {
    strategy = "Escalar oportunidades premium";
    focusAreas.push("Chollos IA");
    focusAreas.push("ROI alto");
    strategyInsights.push(
      "🚀 El dataset muestra señales suficientes para priorizar operaciones premium."
    );
  }

  if (premiumCars.length >= 3) {
    focusAreas.push("Marcas premium");
    strategyInsights.push(
      "💎 Las marcas premium tienen presencia relevante en el histórico."
    );
  }

  if (awdCars.length >= 2) {
    focusAreas.push("AWD premium");
    strategyInsights.push(
      "🛞 Las configuraciones AWD deberían seguir monitorizándose."
    );
  }

  if (electrifiedCars.length >= 2) {
    focusAreas.push("Electrificados");
    strategyInsights.push(
      "⚡ Los electrificados empiezan a formar un segmento estratégico."
    );
  }

  if (averageROI < 15) {
    strategy = "Mejorar selección";
    strategyInsights.push(
      "⚠️ El ROI medio todavía es bajo; conviene endurecer filtros antes de escalar."
    );
  }

  if (total < 5) {
    strategy = "Aumentar dataset";
    strategyInsights.push(
      "📊 Todavía faltan datos para una estrategia fuerte; guarda más análisis."
    );
  }

  return {
    strategyScore,
    strategy,
    focusAreas,
    strategyInsights,
  };
}

function clampScore(value) {
  if (value > 100) return 100;
  if (value < 0) return 0;
  return Math.round(value);
}