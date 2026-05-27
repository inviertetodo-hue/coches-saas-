export function analyzeTemporalIntelligence(analyses = []) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    return {
      freshnessScore: 0,
      recentOpportunities: 0,
      oldOpportunities: 0,
      temporalInsights: [],
    };
  }

  const now = new Date();

  let recentOpportunities = 0;
  let oldOpportunities = 0;

  const temporalInsights = [];

  analyses.forEach((item) => {
    if (!item.created_at) return;

    const createdAt = new Date(item.created_at);

    const diffDays =
      (now - createdAt) /
      (1000 * 60 * 60 * 24);

    if (diffDays <= 7) {
      recentOpportunities++;
    }

    if (diffDays >= 30) {
      oldOpportunities++;
    }
  });

  let freshnessScore = 50;

  freshnessScore +=
    recentOpportunities * 8;

  freshnessScore -=
    oldOpportunities * 4;

  freshnessScore = clampScore(
    freshnessScore
  );

  if (recentOpportunities > 0) {
    temporalInsights.push(
      "🕒 Existen oportunidades recientes dentro del dataset."
    );
  }

  if (recentOpportunities >= 5) {
    temporalInsights.push(
      "🔥 El flujo de oportunidades recientes es alto."
    );
  }

  if (oldOpportunities > 5) {
    temporalInsights.push(
      "📉 Gran parte del dataset es antiguo."
    );
  }

  if (freshnessScore >= 80) {
    temporalInsights.push(
      "🚀 El dataset tiene una frescura excelente."
    );
  }

  return {
    freshnessScore,
    recentOpportunities,
    oldOpportunities,
    temporalInsights,
  };
}

function clampScore(value) {
  if (value > 100) return 100;
  if (value < 0) return 0;
  return Math.round(value);
}