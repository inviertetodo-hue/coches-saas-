export function generateDealPipeline(analyses = []) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    return {
      pipelineScore: 0,
      pipelineLevel: "Sin datos",
      stages: {
        discovery: [],
        analysis: [],
        priority: [],
        discard: [],
      },
      insights: ["📊 Todavía no hay datos para construir pipeline."],
    };
  }

  const stages = {
    discovery: [],
    analysis: [],
    priority: [],
    discard: [],
  };

  analyses.forEach((item) => {
    const score = Number(item.score || 0);
    const roi = Number(item.roi || 0);
    const profit = Number(item.profit || 0);

    const deal = {
      id: item.id,
      title: item.title || "Vehículo IA",
      score,
      roi,
      profit,
    };

    if (score >= 85 && roi >= 20 && profit > 0) {
      stages.priority.push(deal);
    } else if (score >= 60 && roi >= 10 && profit > 0) {
      stages.analysis.push(deal);
    } else if (score >= 45) {
      stages.discovery.push(deal);
    } else {
      stages.discard.push(deal);
    }
  });

  const pipelineScore = Math.min(
    100,
    Math.round(
      35 +
        stages.priority.length * 12 +
        stages.analysis.length * 6 -
        stages.discard.length * 4
    )
  );

  let pipelineLevel = "Inicial";

  if (pipelineScore >= 80) {
    pipelineLevel = "Fuerte";
  } else if (pipelineScore >= 60) {
    pipelineLevel = "Intermedio";
  }

  const insights = [];

  insights.push(
    `🚀 ${stages.priority.length} operación(es) en prioridad alta.`
  );

  insights.push(
    `🟡 ${stages.analysis.length} operación(es) requieren análisis.`
  );

  if (stages.discard.length > 0) {
    insights.push(
      `🔴 ${stages.discard.length} operación(es) deberían descartarse.`
    );
  }

  if (stages.priority.length >= 3) {
    insights.push(
      "🔥 El pipeline muestra varias oportunidades fuertes para revisar primero."
    );
  }

  return {
    pipelineScore,
    pipelineLevel,
    stages,
    insights,
  };
}