export function simulatePortfolio(analyses = []) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    return {
      simulationScore: 0,
      simulationLevel: "Sin datos",
      simulatedPortfolio: [],
      totalExpectedProfit: 0,
      averageROI: 0,
      insights: ["📊 Todavía no hay datos para simular portfolio."],
    };
  }

  const simulatedPortfolio = analyses
    .filter((item) => {
      const score = Number(item.score || 0);
      const roi = Number(item.roi || 0);
      const profit = Number(item.profit || 0);

      return score >= 70 && roi >= 10 && profit > 0;
    })
    .map((item) => ({
      id: item.id,
      title: item.title || "Vehículo IA",
      score: Number(item.score || 0),
      roi: Number(item.roi || 0),
      profit: Number(item.profit || 0),
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 6);

  const totalExpectedProfit = simulatedPortfolio.reduce(
    (sum, item) => sum + item.profit,
    0
  );

  const averageROI =
    simulatedPortfolio.length > 0
      ? Math.round(
          simulatedPortfolio.reduce(
            (sum, item) => sum + item.roi,
            0
          ) / simulatedPortfolio.length
        )
      : 0;

  const simulationScore = Math.min(
    100,
    Math.round(
      35 +
        simulatedPortfolio.length * 8 +
        averageROI * 1.2
    )
  );

  let simulationLevel = "Inicial";

  if (simulationScore >= 80) {
    simulationLevel = "Fuerte";
  } else if (simulationScore >= 60) {
    simulationLevel = "Intermedio";
  }

  const insights = [];

  if (simulatedPortfolio.length === 0) {
    insights.push(
      "📊 No hay suficientes candidatos para simular portfolio."
    );
  }

  if (simulatedPortfolio.length > 0) {
    insights.push(
      `💼 Portfolio simulado con ${simulatedPortfolio.length} operación(es).`
    );

    insights.push(
      `💰 Beneficio esperado total aproximado: ${totalExpectedProfit} €.`
    );
  }

  if (averageROI >= 20) {
    insights.push(
      "🔥 El portfolio simulado muestra una rentabilidad media fuerte."
    );
  }

  return {
    simulationScore,
    simulationLevel,
    simulatedPortfolio,
    totalExpectedProfit,
    averageROI,
    insights,
  };
}