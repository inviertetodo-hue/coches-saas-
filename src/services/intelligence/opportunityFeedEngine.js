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
    if (item.discoveryLevel === "DISCOVER_NOW") {
      events.push(buildEvent({
        type: "DISCOVERY_NOW",
        priority: 100,
        title: item.title,
        text: `Oportunidad prioritaria detectada con radar priority ${item.radarPriority || 0}/100.`,
        action: "Revisar ya",
        item,
      }));
    }

    if (item.action === "BUY") {
      events.push(buildEvent({
        type: "BUY_SIGNAL",
        priority: 92,
        title: item.title,
        text: `BUY confirmado con Decision Score ${item.decisionScore || 0}/100.`,
        action: "Validar y contactar",
        item,
      }));
    }

    if (Number(item.sellSpeedScore || 0) >= 80) {
      events.push(buildEvent({
        type: "FAST_SELL",
        priority: 82,
        title: item.title,
        text: `Alta rotación prevista. Sell Speed ${item.sellSpeedScore}/100.`,
        action: "No dormir la oportunidad",
        item,
      }));
    }

    if (Number(item.discountPercent || 0) >= 8) {
      events.push(buildEvent({
        type: "VALUATION_DISCOUNT",
        priority: 78,
        title: item.title,
        text: `Descuento relevante frente a valoración: ${item.discountPercent}%.`,
        action: "Comprobar precio real",
        item,
      }));
    }
  });

  changes.forEach((entry) => {
    const current = entry?.current || {};
    const title = current.title || "Vehículo IA";

    const signals = entry?.change?.signals || [];

    signals.forEach((signal) => {
      if (signal.type === "ACTION_UPGRADE") {
        events.push(buildEvent({
          type: "ACTION_UPGRADE",
          priority: 98,
          title,
          text: signal.label,
          action: "Revisar cambio a BUY",
          item: current,
        }));
      }

      if (signal.type === "PRICE_DROP") {
        events.push(buildEvent({
          type: "PRICE_DROP",
          priority: 90,
          title,
          text: signal.label,
          action: "Contactar antes que el mercado",
          item: current,
        }));
      }

      if (signal.type === "CONFIDENCE_UP") {
        events.push(buildEvent({
          type: "CONFIDENCE_UP",
          priority: 70,
          title,
          text: signal.label,
          action: "Revalidar oportunidad",
          item: current,
        }));
      }

      if (signal.type === "ACTION_DOWNGRADE") {
        events.push(buildEvent({
          type: "ACTION_DOWNGRADE",
          priority: 68,
          title,
          text: signal.label,
          action: "Rebajar prioridad",
          item: current,
        }));
      }
    });
  });

  const criticalAlerts = Array.isArray(alerts?.criticalAlerts)
    ? alerts.criticalAlerts
    : [];

  criticalAlerts.forEach((alert, index) => {
    events.push(buildEvent({
      type: "CRITICAL_ALERT",
      priority: 88 - index,
      title: "Alerta crítica",
      text: alert,
      action: "Revisar alerta",
      item: null,
    }));
  });

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

  return `${events.length} evento(s) de oportunidad detectados. Prioridad principal: ${top.type}.`;
}

function clampScore(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(number)));
}