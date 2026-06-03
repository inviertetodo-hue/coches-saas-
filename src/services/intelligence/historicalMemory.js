export function buildHistoricalModelMemory(analyses = []) {
  const groups = {};

  for (const item of analyses) {
    const brand = String(item.brand || "").trim();
    const model = String(item.model || "").trim();

    if (!brand || !model) continue;

    const label = `${brand} ${model}`;
    const key = normalize(label);

    if (!groups[key]) {
      groups[key] = {
        model: label,
        analyses: 0,
        totalROI: 0,
        totalProfit: 0,
        totalScore: 0,
      };
    }

    groups[key].analyses += 1;
    groups[key].totalROI += safeNumber(item.roi);
    groups[key].totalProfit += safeNumber(item.profit);
    groups[key].totalScore += safeNumber(item.score);
  }

  return Object.values(groups).map((group) => {
    const confidence = getHistoricalConfidence(group.analyses);

    return {
      model: group.model,
      analyses: group.analyses,
      averageROI: Math.round(group.totalROI / group.analyses),
      averageProfit: Math.round(group.totalProfit / group.analyses),
      averageScore: Math.round(group.totalScore / group.analyses),
      confidence: confidence.label,
      confidenceScore: confidence.score,
    };
  });
}

export function buildOpportunityTimeline(analyses = []) {
  const groups = {};

  analyses.filter(Boolean).forEach((item) => {
    const fingerprint = resolveFingerprint(item);

    if (!fingerprint) return;

    if (!groups[fingerprint]) {
      groups[fingerprint] = {
        fingerprint,
        title: buildTitle(item),
        brand: item.brand || "",
        model: item.model || "",
        events: [],
      };
    }

    groups[fingerprint].events.push(buildTimelineEvent(item));
  });

  return Object.values(groups)
    .map((group) => {
      const sortedEvents = group.events.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      const first = sortedEvents[0] || {};
      const latest = sortedEvents[sortedEvents.length - 1] || {};

      return {
        ...group,
        events: sortedEvents,
        totalEvents: sortedEvents.length,
        firstSeenAt: first.timestamp || null,
        lastSeenAt: latest.timestamp || null,
        latestAction: latest.action || "WATCH",
        latestScore: latest.score || 0,
        latestROI: latest.roi || 0,
        latestProfit: latest.profit || 0,
        latestPrice: latest.price || 0,
        latestSellSpeed: latest.sellSpeedScore || 0,
        timelineSummary: buildTimelineSummary(sortedEvents),
      };
    })
    .sort((a, b) => new Date(b.lastSeenAt || 0).getTime() - new Date(a.lastSeenAt || 0).getTime());
}

export function buildOpportunityTimelineSummary(analyses = []) {
  const timelines = buildOpportunityTimeline(analyses);

  const upgradedToBuy = timelines.filter((timeline) =>
    timeline.events.some((event, index) => {
      if (index === 0) return false;
      const previous = timeline.events[index - 1];
      return previous.action !== "BUY" && event.action === "BUY";
    })
  ).length;

  const priceDrops = timelines.filter((timeline) =>
    timeline.events.some((event, index) => {
      if (index === 0) return false;
      const previous = timeline.events[index - 1];
      return event.price > 0 && previous.price > 0 && event.price < previous.price;
    })
  ).length;

  const improvingROI = timelines.filter((timeline) =>
    timeline.events.some((event, index) => {
      if (index === 0) return false;
      const previous = timeline.events[index - 1];
      return event.roi - previous.roi >= 5;
    })
  ).length;

  return {
    totalTimelines: timelines.length,
    upgradedToBuy,
    priceDrops,
    improvingROI,
    timelines,
  };
}

export function getHistoricalConfidence(count) {
  if (count >= 15) {
    return {
      label: "Alta",
      score: 90,
    };
  }

  if (count >= 5) {
    return {
      label: "Media",
      score: 70,
    };
  }

  return {
    label: "Baja",
    score: 40,
  };
}

function buildTimelineEvent(item = {}) {
  return {
    timestamp: resolveTimestamp(item),
    action: resolveAction(item),
    score: safeNumber(
      item.decision?.decisionScore ??
        item.opportunity?.scoreV2 ??
        item.score
    ),
    roi: safeNumber(item.valuation?.roi ?? item.roi),
    profit: safeNumber(item.valuation?.profit ?? item.profit),
    price: safeNumber(item.price ?? item.purchasePrice),
    sellSpeedScore: safeNumber(item.sellSpeed?.sellSpeedScore ?? item.sellSpeedScore),
    confidence: safeNumber(
      item.decision?.confidence?.score ??
        item.vehicleValuation?.confidence ??
        item.confidence
    ),
  };
}

function buildTimelineSummary(events = []) {
  if (events.length === 0) {
    return "Sin histórico suficiente.";
  }

  if (events.length === 1) {
    return "Primer registro histórico de la oportunidad.";
  }

  const first = events[0];
  const latest = events[events.length - 1];

  const changes = [];

  if (first.action !== latest.action) {
    changes.push(`pasa de ${first.action} a ${latest.action}`);
  }

  if (latest.price > 0 && first.price > 0 && latest.price < first.price) {
    changes.push(`precio baja ${formatCurrency(first.price - latest.price)}`);
  }

  if (latest.roi - first.roi >= 5) {
    changes.push(`ROI mejora ${formatNumber(latest.roi - first.roi)} puntos`);
  }

  if (latest.profit - first.profit >= 1000) {
    changes.push(`beneficio mejora ${formatCurrency(latest.profit - first.profit)}`);
  }

  if (latest.sellSpeedScore - first.sellSpeedScore >= 10) {
    changes.push(`rotación mejora ${formatNumber(latest.sellSpeedScore - first.sellSpeedScore)} puntos`);
  }

  if (changes.length === 0) {
    return `Histórico estable con ${events.length} registros.`;
  }

  return `Evolución detectada: ${changes.join(", ")}.`;
}

function resolveFingerprint(item = {}) {
  return (
    item.fingerprint ||
    item.market_fingerprint ||
    item.id ||
    [item.brand, item.model, item.year, item.km, item.price]
      .filter(Boolean)
      .join("-")
      .toLowerCase()
  );
}

function buildTitle(item = {}) {
  return (
    item.title ||
    [item.brand, item.model, item.version, item.year].filter(Boolean).join(" ") ||
    "Oportunidad IA"
  );
}

function resolveTimestamp(item = {}) {
  return (
    item.savedAt ||
    item.created_at ||
    item.updated_at ||
    item.last_seen_at ||
    item.lastSeenAt ||
    new Date().toISOString()
  );
}

function resolveAction(item = {}) {
  const action = String(
    item.decision?.action ||
      item.action ||
      item.opportunity?.opportunityLevelV2 ||
      "WATCH"
  ).toUpperCase();

  if (action === "BUY") return "BUY";
  if (action === "REJECT") return "REJECT";
  return "WATCH";
}

function formatCurrency(value) {
  return `${Math.round(safeNumber(value)).toLocaleString("es-ES")} €`;
}

function formatNumber(value) {
  return safeNumber(value).toLocaleString("es-ES", {
    maximumFractionDigits: 2,
  });
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number)
    ? number
    : 0;
}