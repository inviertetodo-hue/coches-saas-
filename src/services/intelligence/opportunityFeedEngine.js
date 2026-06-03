export function buildOpportunityFeed({
  radar = {},
  changes = [],
  alerts = {},
  limit = 12,
} = {}) {
  const events = [];

  const opportunities = Array.isArray(radar?.priorityOpportunities)
    ? radar.priorityOpportunities
    : [];

  opportunities.forEach((item) => {
    events.push(...buildRadarEvents(item));
  });

  changes.forEach((entry) => {
    events.push(...buildChangeEvents(entry));
  });

  events.push(...buildAlertEvents(alerts));

  const deduped = dedupeEvents(events)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);

  return {
    totalEvents: deduped.length,
    highestPriority: deduped[0]?.priority || 0,
    events: deduped,
    summary: buildSummary(deduped),
  };
}

function buildRadarEvents(item = {}) {
  const events = [];
  const title = buildTitle(item);

  const radarPriority = toNumber(item.radarPriority);
  const decisionScore = toNumber(item.decisionScore);
  const sellSpeedScore = toNumber(item.sellSpeedScore);
  const discountPercent = toNumber(item.discountPercent);
  const roi = toNumber(item.roi);
  const profit = toNumber(item.profit);

  if (item.discoveryLevel === "DISCOVER_NOW") {
    events.push(buildEvent({
      type: "DISCOVERY_NOW",
      priority: 100,
      title,
      text: `Oportunidad prioritaria detectada. Radar Priority ${radarPriority}/100.`,
      action: "Revisar ya",
      item,
    }));
  }

  if (item.action === "BUY") {
    events.push(buildEvent({
      type: "NEW_BUY",
      priority: 95,
      title,
      text: `BUY activo con Decision Score ${decisionScore}/100.`,
      action: "Validar y contactar",
      item,
    }));
  }

  if (sellSpeedScore >= 80) {
    events.push(buildEvent({
      type: "FAST_SELL",
      priority: 84,
      title,
      text: `Alta rotación prevista. Sell Speed ${sellSpeedScore}/100.`,
      action: "No dormir la oportunidad",
      item,
    }));
  }

  if (discountPercent >= 8) {
    events.push(buildEvent({
      type: "VALUATION_DISCOUNT",
      priority: 82,
      title,
      text: `Descuento relevante frente a valoración: ${formatNumber(discountPercent)}%.`,
      action: "Comprobar precio real",
      item,
    }));
  }

  if (roi >= 12 && profit > 0) {
    events.push(buildEvent({
      type: "ROI_PROFIT",
      priority: 78,
      title,
      text: `ROI ${formatNumber(roi)}% con margen estimado de ${formatCurrency(profit)}.`,
      action: "Comparar con alternativas",
      item,
    }));
  }

  return events;
}

function buildChangeEvents(entry = {}) {
  const events = [];

  if (entry.isNew) {
    const current = entry.current || {};
    events.push(buildEvent({
      type: "NEW_CANDIDATE",
      priority: 72,
      title: buildTitle(current),
      text: "Nuevo candidato detectado por el radar.",
      action: "Clasificar oportunidad",
      item: current,
    }));

    return events;
  }

  const current = entry.current || {};
  const change = entry.change || {};
  const signals = Array.isArray(change.signals) ? change.signals : [];
  const title = buildTitle(current);

  signals.forEach((signal) => {
    if (signal.type === "ACTION_UPGRADE") {
      events.push(buildEvent({
        type: "WATCH_TO_BUY",
        priority: 98,
        title,
        text: signal.label || "La oportunidad pasa a BUY.",
        action: "Revisar cambio a BUY",
        item: current,
      }));
    }

    if (signal.type === "ACTION_DOWNGRADE") {
      events.push(buildEvent({
        type: "BUY_TO_WATCH",
        priority: 74,
        title,
        text: signal.label || "La oportunidad pierde prioridad BUY.",
        action: "Rebajar prioridad",
        item: current,
      }));
    }

    if (signal.type === "PRICE_DROP") {
      events.push(buildEvent({
        type: "PRICE_DROP",
        priority: 94,
        title,
        text: signal.label || "Precio a la baja detectado.",
        action: "Contactar antes que el mercado",
        item: current,
      }));
    }

    if (signal.type === "PRICE_RISE") {
      events.push(buildEvent({
        type: "PRICE_RISE",
        priority: 58,
        title,
        text: signal.label || "Precio al alza detectado.",
        action: "Revisar si sigue siendo oportunidad",
        item: current,
      }));
    }

    if (signal.type === "SCORE_UP") {
      events.push(buildEvent({
        type: "SCORE_UP",
        priority: 88,
        title,
        text: signal.label || `Score mejora ${formatNumber(change.scoreChange)} puntos.`,
        action: "Reevaluar oportunidad",
        item: current,
      }));
    }

    if (signal.type === "SCORE_DOWN") {
      events.push(buildEvent({
        type: "SCORE_DOWN",
        priority: 70,
        title,
        text: signal.label || `Score cae ${formatNumber(Math.abs(change.scoreChange))} puntos.`,
        action: "Revisar riesgo",
        item: current,
      }));
    }

    if (signal.type === "CONFIDENCE_UP") {
      events.push(buildEvent({
        type: "CONFIDENCE_UP",
        priority: 76,
        title,
        text: signal.label || "La confianza de valoración mejora.",
        action: "Revalidar compra",
        item: current,
      }));
    }

    if (signal.type === "CONFIDENCE_DOWN") {
      events.push(buildEvent({
        type: "CONFIDENCE_DOWN",
        priority: 66,
        title,
        text: signal.label || "La confianza de valoración empeora.",
        action: "Esperar más evidencia",
        item: current,
      }));
    }
  });

  return events;
}

function buildAlertEvents(alerts = {}) {
  const events = [];

  const criticalAlerts = Array.isArray(alerts.criticalAlerts)
    ? alerts.criticalAlerts
    : [];

  const warningAlerts = Array.isArray(alerts.warningAlerts)
    ? alerts.warningAlerts
    : [];

  criticalAlerts.forEach((alert, index) => {
    events.push(buildEvent({
      type: "CRITICAL_ALERT",
      priority: 90 - index,
      title: "Alerta crítica",
      text: alert,
      action: "Revisar alerta",
      item: null,
    }));
  });

  warningAlerts.slice(0, 3).forEach((alert, index) => {
    events.push(buildEvent({
      type: "WARNING_ALERT",
      priority: 54 - index,
      title: "Aviso de radar",
      text: alert,
      action: "Revisar aviso",
      item: null,
    }));
  });

  return events;
}

function buildEvent({
  type,
  priority,
  title,
  text,
  action,
  item,
}) {
  return {
    id: `${type}-${title || "item"}-${text || ""}`.toLowerCase(),
    type,
    priority: clampScore(priority),
    title: title || "Oportunidad IA",
    text,
    action,
    item,
  };
}

function dedupeEvents(events = []) {
  const seen = new Set();

  return events.filter((event) => {
    if (seen.has(event.id)) return false;
    seen.add(event.id);
    return true;
  });
}

function buildSummary(events = []) {
  if (!events.length) {
    return "Sin eventos prioritarios todavía.";
  }

  const top = events[0];

  return `${events.length} evento(s) detectados. Prioridad principal: ${top.type}.`;
}

function buildTitle(item = {}) {
  return (
    item.title ||
    [item.brand, item.model, item.version, item.year].filter(Boolean).join(" ") ||
    "Oportunidad IA"
  );
}

function formatCurrency(value) {
  return `${Math.round(toNumber(value)).toLocaleString("es-ES")} €`;
}

function formatNumber(value) {
  return toNumber(value).toLocaleString("es-ES", {
    maximumFractionDigits: 2,
  });
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(toNumber(value))));
}