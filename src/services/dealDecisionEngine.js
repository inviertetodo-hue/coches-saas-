export function generateDealDecisions(analyses = []) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    return {
      decisionScore: 0,
      decisionLevel: "Sin datos",
      decisions: [],
      insights: ["⚖️ Todavía no hay datos para generar decisiones IA."],
    };
  }

  const decisions = analyses.map((item) => {
    const score = Number(item.score || 0);
    const roi = Number(item.roi || 0);
    const profit = Number(item.profit || 0);

    let decision = "Esperar";
    let priority = "Media";
    let reason = "Datos mixtos: conviene revisar antes de actuar.";

    if (score >= 85 && roi >= 20 && profit > 5000) {
      decision = "Comprar / Priorizar";
      priority = "Alta";
      reason = "Score alto, ROI alto y beneficio fuerte.";
    } else if (score >= 70 && roi >= 12 && profit > 0) {
      decision = "Analizar";
      priority = "Media";
      reason = "Operación interesante, pero necesita validación adicional.";
    } else if (score < 55 || roi < 5 || profit <= 0) {
      decision = "Descartar";
      priority = "Baja";
      reason = "Riesgo elevado o rentabilidad insuficiente.";
    }

    const decisionScore = Math.min(
      100,
      Math.round(score * 0.5 + roi * 1.4 + Math.min(profit / 1200, 25))
    );

    return {
      id: item.id,
      title: item.title || "Vehículo IA",
      score,
      roi,
      profit,
      decision,
      priority,
      reason,
      decisionScore,
    };
  });

  const strongDecisions = decisions.filter(
    (item) => item.decision === "Comprar / Priorizar"
  );

  const discardDecisions = decisions.filter(
    (item) => item.decision === "Descartar"
  );

  const decisionScore = Math.min(
    100,
    Math.round(
      45 +
        strongDecisions.length * 10 -
        discardDecisions.length * 5
    )
  );

  let decisionLevel = "Inicial";

  if (decisionScore >= 80) {
    decisionLevel = "Fuerte";
  } else if (decisionScore >= 60) {
    decisionLevel = "Intermedio";
  }

  const insights = [];

  insights.push(
    `⚖️ ${strongDecisions.length} operación(es) con señal clara de compra/prioridad.`
  );

  if (discardDecisions.length > 0) {
    insights.push(
      `🔴 ${discardDecisions.length} operación(es) deberían descartarse.`
    );
  }

  if (strongDecisions.length >= 3) {
    insights.push(
      "🔥 Hay varias decisiones fuertes; conviene revisarlas primero."
    );
  }

  return {
    decisionScore,
    decisionLevel,
    decisions,
    insights,
  };
}
