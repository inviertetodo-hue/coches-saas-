export function generateOpportunityRanking(analyses = []) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    return {
      rankingScore: 0,
      topOpportunities: [],
      rankingInsights: [],
    };
  }

  const topOpportunities = analyses
    .map((item) => {
      const score = Number(item.score || 0);
      const roi = Number(item.roi || 0);
      const profit = Number(item.profit || 0);

      const priorityScore = Math.round(
        score * 0.45 +
          roi * 1.2 +
          Math.min(profit / 1000, 30)
      );

      return {
        id: item.id,
        title: item.title || "Vehículo IA",
        score,
        roi,
        profit,
        priorityScore,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 5);

  const rankingScore =
    topOpportunities.length > 0
      ? Math.round(
          topOpportunities.reduce(
            (sum, item) => sum + item.priorityScore,
            0
          ) / topOpportunities.length
        )
      : 0;

  const rankingInsights = [];

  if (topOpportunities.length > 0) {
    rankingInsights.push(
      "🏆 Ranking IA generado con las mejores oportunidades del dataset."
    );
  }

  if (rankingScore >= 80) {
    rankingInsights.push(
      "🔥 El top de oportunidades tiene una calidad muy alta."
    );
  }

  if (rankingScore < 60) {
    rankingInsights.push(
      "📊 El ranking todavía necesita mejores operaciones para ganar fuerza."
    );
  }

  return {
    rankingScore,
    topOpportunities,
    rankingInsights,
  };
}