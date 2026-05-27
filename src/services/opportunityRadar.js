export function generateOpportunityRadar(analyses = []) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    return {
      radarScore: 0,
      radarLevel: "Sin datos",
      priorityOpportunities: [],
      radarInsights: [],
    };
  }

  const priorityOpportunities = [];
  const radarInsights = [];

  analyses.forEach((item) => {
    const score = Number(item.score || 0);
    const roi = Number(item.roi || 0);
    const profit = Number(item.profit || 0);

    if (score >= 85 && roi >= 20 && profit >= 5000) {
      priorityOpportunities.push({
        id: item.id,
        title: item.title || "Vehículo IA",
        score,
        roi,
        profit,
        reason: "Score alto + ROI alto + beneficio fuerte",
      });
    }
  });

  const radarScore = clampScore(
    40 + priorityOpportunities.length * 12
  );

  let radarLevel = "Inicial";

  if (radarScore >= 80) {
    radarLevel = "Alto";
  } else if (radarScore >= 60) {
    radarLevel = "Medio";
  }

  if (priorityOpportunities.length > 0) {
    radarInsights.push(
      `🚀 ${priorityOpportunities.length} oportunidad(es) prioritarias detectadas.`
    );
  }

  if (priorityOpportunities.length >= 3) {
    radarInsights.push(
      "🔥 El radar detecta un flujo interesante de operaciones fuertes."
    );
  }

  if (priorityOpportunities.length === 0) {
    radarInsights.push(
      "📡 Todavía no hay oportunidades prioritarias claras en el dataset."
    );
  }

  return {
    radarScore,
    radarLevel,
    priorityOpportunities,
    radarInsights,
  };
}

function clampScore(value) {
  if (value > 100) return 100;
  if (value < 0) return 0;
  return Math.round(value);
}