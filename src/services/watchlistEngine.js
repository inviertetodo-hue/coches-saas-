export function generateWatchlist(analyses = []) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    return {
      watchlistScore: 0,
      watchlistLevel: "Sin datos",
      items: [],
      insights: [],
    };
  }

  const items = analyses
    .map((item) => {
      const decision = item.decision || {};
      const action = decision.action || "";
      const decisionScore = Number(decision.decisionScore || item.score || 0);
      const confidenceScore = Number(decision.confidence?.score || 0);
      const opportunityScoreV2 = Number(
        item.opportunity?.scoreV2 ||
          item.opportunity?.opportunityScoreV2 ||
          item.score ||
          0
      );
      const roi = Number(item.roi || item.valuation?.roi || 0);
      const profit = Number(item.profit || item.valuation?.profit || 0);
      const sellSpeedScore = Number(item.sellSpeed?.sellSpeedScore || 0);

      const shouldWatch =
        action === "BUY" ||
        (action === "WATCH" && (profit > 0 || decisionScore >= 70)) ||
        (!action && decisionScore >= 75 && roi >= 8 && profit > 0);

      if (!shouldWatch) return null;

      return {
        id: item.id,
        title: item.title || "Vehículo IA",
        score: decisionScore || opportunityScoreV2,
        roi,
        profit,
        action,
        confidenceScore,
        opportunityScoreV2,
        sellSpeedScore,
        reason:
          decision.summary ||
          buildWatchReason({
            action,
            decisionScore,
            opportunityScoreV2,
            roi,
            profit,
            sellSpeedScore,
          }),
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        b.score +
        b.opportunityScoreV2 +
        b.roi +
        b.sellSpeedScore -
        (a.score + a.opportunityScoreV2 + a.roi + a.sellSpeedScore)
    )
    .slice(0, 8);

  const watchlistScore = Math.min(
    100,
    Math.round(35 + items.length * 8)
  );

  let watchlistLevel = "Inicial";

  if (watchlistScore >= 80) {
    watchlistLevel = "Fuerte";
  } else if (watchlistScore >= 60) {
    watchlistLevel = "Intermedio";
  }

  const insights = [];

  if (items.length === 0) {
    insights.push("📋 Todavía no hay candidatos claros para watchlist.");
  }

  if (items.length > 0) {
    insights.push(`📌 ${items.length} candidato(s) añadidos a seguimiento IA.`);
  }

  if (items.length >= 5) {
    insights.push("🔥 La watchlist empieza a tener masa crítica operativa.");
  }

  return {
    watchlistScore,
    watchlistLevel,
    items,
    insights,
  };
}

function buildWatchReason({
  action,
  decisionScore,
  opportunityScoreV2,
  roi,
  profit,
  sellSpeedScore,
}) {
  if (action === "BUY") {
    return `BUY del Decision Engine V2: score ${decisionScore}/100, ROI ${roi}% y margen ${profit} €.`;
  }

  if (action === "WATCH") {
    return `WATCH del Decision Engine V2: requiere validación, score ${decisionScore}/100 y rotación ${sellSpeedScore}/100.`;
  }

  if (opportunityScoreV2 >= 75 && profit > 0) {
    return `Candidato por oportunidad V2: score ${opportunityScoreV2}/100, ROI ${roi}% y margen ${profit} €.`;
  }

  return "Candidato para seguimiento por señales combinadas de oportunidad.";
}