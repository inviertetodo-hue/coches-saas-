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
    .filter(Boolean)
    .map((item) => {
      const action = item.decision?.action || item.action || "WATCH";
      const decisionScore = Number(item.decision?.decisionScore || item.decisionScore || 0);
      const score = Number(
        item.opportunity?.scoreV2 ??
          item.opportunity?.opportunityScoreV2 ??
          item.score ??
          0
      );
      const confidence = Number(
        item.decision?.confidence?.score ??
          item.vehicleValuation?.confidence ??
          item.confidence ??
          0
      );
      const comparableCount = Number(
        item.comparables?.totalComparables ??
          item.vehicleValuation?.comparableCount ??
          item.comparableCount ??
          0
      );
      const sellSpeedScore = Number(
        item.sellSpeed?.sellSpeedScore ??
          item.sellSpeedScore ??
          0
      );
      const estimatedSellDays = Number(
        item.sellSpeed?.estimatedSellDays ??
          item.estimatedSellDays ??
          0
      );
      const roi = Number(item.valuation?.roi ?? item.roi ?? 0);
      const profit = Number(item.valuation?.profit ?? item.profit ?? 0);

      const watchScore = calculateWatchScore({
        action,
        decisionScore,
        score,
        confidence,
        comparableCount,
        sellSpeedScore,
        roi,
        profit,
      });

      return {
        id: item.id,
        title:
          item.title ||
          `${item.brand || ""} ${item.model || ""}`.trim() ||
          "Vehículo IA",
        action,
        decisionScore,
        score,
        confidence,
        comparableCount,
        sellSpeedScore,
        estimatedSellDays,
        roi,
        profit,
        watchScore,
        reason: buildReason({
          action,
          decisionScore,
          score,
          confidence,
          comparableCount,
          sellSpeedScore,
        }),
      };
    })
    .filter((item) => item.action !== "REJECT")
    .filter((item) => item.watchScore >= 55)
    .sort((a, b) => b.watchScore - a.watchScore)
    .slice(0, 12);

  const watchlistScore = calculateWatchlistScore(items);
  const watchlistLevel = buildWatchlistLevel(watchlistScore);
  const insights = buildInsights(items);

  return {
    watchlistScore,
    watchlistLevel,
    items,
    insights,
  };
}

function calculateWatchScore({
  action,
  decisionScore,
  score,
  confidence,
  comparableCount,
  sellSpeedScore,
  roi,
  profit,
}) {
  let value =
    decisionScore * 0.35 +
    score * 0.25 +
    confidence * 0.20 +
    sellSpeedScore * 0.10;

  if (comparableCount >= 1) value += 4;
  if (comparableCount >= 3) value += 4;

  if (roi > 0) value += Math.min(8, roi * 0.25);
  if (profit > 0) value += Math.min(8, profit / 1000);

  if (action === "BUY") value += 8;
  if (action === "WATCH") value += 3;

  return clampScore(value);
}

function calculateWatchlistScore(items = []) {
  if (!items.length) return 0;

  const average =
    items.reduce((sum, item) => sum + Number(item.watchScore || 0), 0) /
    items.length;

  return clampScore(average);
}

function buildWatchlistLevel(score) {
  if (score >= 85) return "Fuerte";
  if (score >= 65) return "Intermedio";
  return "Inicial";
}

function buildInsights(items = []) {
  const insights = [];

  const buyCount = items.filter((item) => item.action === "BUY").length;
  const watchCount = items.filter((item) => item.action === "WATCH").length;

  if (items.length === 0) {
    insights.push("📋 Todavía no hay candidatos claros para watchlist.");
    return insights;
  }

  insights.push(`📌 ${items.length} candidato(s) añadidos a seguimiento IA.`);

  if (buyCount > 0) {
    insights.push(`🚀 ${buyCount} candidato(s) BUY deben revisarse primero.`);
  }

  if (watchCount > 0) {
    insights.push(`👀 ${watchCount} candidato(s) WATCH requieren seguimiento.`);
  }

  if (items.length >= 5) {
    insights.push("🔥 La watchlist empieza a tener masa crítica operativa.");
  }

  return insights;
}

function buildReason({
  action,
  decisionScore,
  score,
  confidence,
  comparableCount,
  sellSpeedScore,
}) {
  if (action === "BUY") {
    return `BUY en seguimiento: Decision Score ${decisionScore}/100, Opportunity Score ${score}/100, confianza ${confidence}/100 y ${comparableCount} comparable(s).`;
  }

  return `WATCH en seguimiento: Decision Score ${decisionScore}/100, confianza ${confidence}/100, ${comparableCount} comparable(s) y Sell Speed ${sellSpeedScore}/100.`;
}

function clampScore(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(number)));
}