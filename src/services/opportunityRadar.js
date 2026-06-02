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
    const decision = item.decision || {};
    const action = decision.action || "";
    const score = Number(decision.decisionScore || item.score || 0);
    const roi = Number(item.roi || item.valuation?.roi || 0);
    const profit = Number(item.profit || item.valuation?.profit || 0);
    const sellSpeedScore = Number(item.sellSpeed?.sellSpeedScore || 0);

    const isPriority =
      action === "BUY" ||
      (action === "WATCH" && score >= 75 && profit > 0) ||
      (!action && score >= 80 && roi >= 8 && profit > 0);

    if (isPriority) {
      priorityOpportunities.push({
        id: item.id,
        title: item.title || "Vehículo IA",
        score,
        roi,
        profit,
        action,
        sellSpeedScore,
        reason:
          decision.summary ||
          `Radar V2: ${action || "OPPORTUNITY"} con score ${score}/100, ROI ${roi}% y margen ${profit} €.`,
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