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
    .filter((item) => {
      const score = Number(item.score || 0);
      const roi = Number(item.roi || 0);
      const profit = Number(item.profit || 0);

      return score >= 75 && roi >= 12 && profit > 0;
    })
    .map((item) => ({
      id: item.id,
      title: item.title || "Vehículo IA",
      score: Number(item.score || 0),
      roi: Number(item.roi || 0),
      profit: Number(item.profit || 0),
      reason: "Candidato para seguimiento por score, ROI y beneficio positivo.",
    }))
    .sort((a, b) => b.score + b.roi - (a.score + a.roi))
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