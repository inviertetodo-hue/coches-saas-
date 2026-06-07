export function generateWatchlist(analyses = []) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    return {
      watchlistScore: 0,
      watchlistLevel: "Sin datos",
      items: [],
      insights: [],
      alerts: [],
      summary: "Todavía no hay oportunidades suficientes para seguimiento.",
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
      const roi = Number(item.valuation?.roi ?? item.roi ?? item.netRoi ?? 0);
      const profit = Number(
        item.valuation?.profit ?? item.profit ?? item.netProfit ?? 0
      );
      const price = Number(item.price ?? item.purchasePrice ?? 0);
      const estimatedMarketValue = Number(
        item.estimatedMarketValue ??
          item.marketValuation?.estimatedMarketValue ??
          item.vehicleValuation?.estimatedMarketValue ??
          0
      );

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

      const watchStatus = buildWatchStatus({
        action,
        watchScore,
        roi,
        profit,
        confidence,
      });

      const priority = buildPriority({
        action,
        watchScore,
        roi,
        profit,
        confidence,
      });

      return {
        id: item.id,
        sourceId: item.sourceId || item.listingId || item.url || item.id,
        title:
          item.title ||
          `${item.brand || ""} ${item.model || ""}`.trim() ||
          "Vehículo IA",
        brand: item.brand || "",
        model: item.model || "",
        year: item.year || null,
        url: item.url || item.sourceUrl || "",
        action,
        watchStatus,
        priority,
        decisionScore,
        score,
        confidence,
        comparableCount,
        sellSpeedScore,
        estimatedSellDays,
        roi,
        profit,
        price,
        estimatedMarketValue,
        discountAmount: calculateDiscountAmount(price, estimatedMarketValue),
        watchScore,
        nextAction: buildNextAction({
          watchStatus,
          action,
          roi,
          profit,
          confidence,
        }),
        alert: buildAlert({
          action,
          watchStatus,
          profit,
          roi,
          confidence,
          estimatedSellDays,
        }),
        reason: buildReason({
          action,
          decisionScore,
          score,
          confidence,
          comparableCount,
          sellSpeedScore,
          roi,
          profit,
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
  const alerts = buildAlerts(items);
  const summary = buildSummary({ items, watchlistScore, watchlistLevel });

  return {
    watchlistScore,
    watchlistLevel,
    items,
    insights,
    alerts,
    summary,
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
    confidence * 0.2 +
    sellSpeedScore * 0.1;

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
  if (score >= 85) return "Alta oportunidad";
  if (score >= 65) return "Seguimiento activo";
  return "Radar inicial";
}

function buildWatchStatus({ action, watchScore, roi, profit, confidence }) {
  if (action === "BUY" && watchScore >= 82 && profit >= 2000 && confidence >= 65) {
    return "Actuar ahora";
  }

  if (watchScore >= 75 && roi >= 15 && profit > 0) {
    return "Validar hoy";
  }

  if (watchScore >= 62) {
    return "Vigilar precio";
  }

  return "Observación";
}

function buildPriority({ action, watchScore, roi, profit, confidence }) {
  const value =
    watchScore * 0.55 +
    Math.min(Math.max(roi, 0), 35) * 0.75 +
    Math.min(Math.max(profit, 0) / 100, 35) * 0.35 +
    confidence * 0.15 +
    (action === "BUY" ? 8 : 0);

  if (value >= 85) return "Alta";
  if (value >= 68) return "Media";
  return "Baja";
}

function buildNextAction({ watchStatus, action, roi, profit, confidence }) {
  if (watchStatus === "Actuar ahora") {
    return "Contactar rápido, confirmar disponibilidad e historial antes de que desaparezca.";
  }

  if (watchStatus === "Validar hoy") {
    return "Pedir fotos, libro de mantenimiento, daños, número de propietarios y precio final.";
  }

  if (watchStatus === "Vigilar precio") {
    return "Guardar y revisar si baja de precio o mejora la señal de mercado.";
  }

  if (action === "BUY" && confidence < 60) {
    return "No comprar todavía: validar datos porque la señal es buena pero la confianza es limitada.";
  }

  if (roi > 0 || profit > 0) {
    return "Mantener en seguimiento y comparar con nuevas oportunidades similares.";
  }

  return "No priorizar salvo bajada de precio o mejora clara de datos.";
}

function buildAlert({
  action,
  watchStatus,
  profit,
  roi,
  confidence,
  estimatedSellDays,
}) {
  if (watchStatus === "Actuar ahora") {
    return "Alerta alta: oportunidad candidata a contacto inmediato.";
  }

  if (action === "BUY" && confidence >= 70) {
    return "Alerta BUY: revisar antes que el resto de candidatos.";
  }

  if (profit >= 2500 && roi >= 15) {
    return "Alerta margen: beneficio y ROI estimados por encima del umbral.";
  }

  if (estimatedSellDays > 0 && estimatedSellDays <= 21) {
    return "Alerta rotación: puede venderse rápido si el dato es fiable.";
  }

  return "";
}

function buildAlerts(items = []) {
  return items
    .map((item) => item.alert)
    .filter(Boolean)
    .slice(0, 5);
}

function buildInsights(items = []) {
  const insights = [];

  const buyCount = items.filter((item) => item.action === "BUY").length;
  const watchCount = items.filter((item) => item.action === "WATCH").length;
  const urgentCount = items.filter(
    (item) => item.watchStatus === "Actuar ahora"
  ).length;
  const validationCount = items.filter(
    (item) => item.watchStatus === "Validar hoy"
  ).length;

  if (items.length === 0) {
    insights.push("📋 Todavía no hay candidatos claros para seguimiento.");
    return insights;
  }

  insights.push(`📌 ${items.length} candidato(s) listos para seguimiento.`);

  if (urgentCount > 0) {
    insights.push(`🚨 ${urgentCount} oportunidad(es) requieren acción rápida.`);
  }

  if (validationCount > 0) {
    insights.push(`📞 ${validationCount} candidato(s) conviene validar hoy.`);
  }

  if (buyCount > 0) {
    insights.push(`🚀 ${buyCount} candidato(s) BUY deben revisarse primero.`);
  }

  if (watchCount > 0) {
    insights.push(`👀 ${watchCount} candidato(s) WATCH requieren vigilancia.`);
  }

  if (items.length >= 5) {
    insights.push("🔥 La watchlist ya tiene masa crítica operativa.");
  }

  return insights;
}

function buildSummary({ items, watchlistScore, watchlistLevel }) {
  if (!items.length) {
    return "Todavía no hay candidatos suficientemente claros para seguimiento.";
  }

  const first = items[0];
  const urgentCount = items.filter(
    (item) => item.watchStatus === "Actuar ahora"
  ).length;

  if (urgentCount > 0) {
    return `${urgentCount} oportunidad(es) requieren acción rápida. Mejor candidato: ${first.title}.`;
  }

  return `${items.length} candidato(s) en seguimiento. Nivel ${watchlistLevel} con score medio ${watchlistScore}/100.`;
}

function buildReason({
  action,
  decisionScore,
  score,
  confidence,
  comparableCount,
  sellSpeedScore,
  roi,
  profit,
}) {
  if (action === "BUY") {
    return `BUY en seguimiento: Decision Score ${decisionScore}/100, Opportunity Score ${score}/100, confianza ${confidence}/100, ROI ${roi}% y beneficio estimado de ${profit} €.`;
  }

  return `WATCH en seguimiento: Decision Score ${decisionScore}/100, confianza ${confidence}/100, ${comparableCount} comparable(s), Sell Speed ${sellSpeedScore}/100 y ROI ${roi}%.`;
}

function calculateDiscountAmount(price, estimatedMarketValue) {
  if (!price || !estimatedMarketValue) return 0;

  const discount = estimatedMarketValue - price;

  return Number.isFinite(discount) ? Math.round(discount) : 0;
}

function clampScore(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(number)));
}