const MARKET_TRENDS = {
  phev: {
    label: "PHEV premium",
    demand: "Alta",
    trend: "Fuerte",
    risk: "Medio",
    insight:
      "Los híbridos enchufables premium siguen siendo atractivos por etiqueta, fiscalidad, uso urbano y demanda familiar.",
  },
  diesel: {
    label: "Diésel automático",
    demand: "Media-alta",
    trend: "Estable",
    risk: "Medio",
    insight:
      "El diésel automático mantiene demanda en compradores que hacen muchos kilómetros, pero requiere controlar restricciones urbanas.",
  },
  hybrid: {
    label: "Híbrido fiable",
    demand: "Muy alta",
    trend: "Fuerte",
    risk: "Bajo",
    insight:
      "Los híbridos fiables tienen gran liquidez, menor riesgo y salida rápida en mercados como España y Francia.",
  },
  performance: {
    label: "Performance premium",
    demand: "Selectiva",
    trend: "Volátil",
    risk: "Alto",
    insight:
      "Los modelos performance pueden tener margen alto, pero la rotación es lenta y el comprador final es más difícil.",
  },
  luxury: {
    label: "Lujo alto ticket",
    demand: "Media",
    trend: "Selectiva",
    risk: "Medio-alto",
    insight:
      "El lujo caro puede parecer barato frente a mercado, pero inmoviliza capital y exige comprador muy concreto.",
  },
};

export function buildMarketTrendProfile(input = {}) {
  const query = normalizeText(input.query || "");
  const semantic = input.semantic || {};
  const maxBudget = toNumber(input.maxBudget, 0);

  const trends = [];

  if (semantic.isPhev || hasAny(query, ["45e", "300e", "300de", "tfsie", "phev"])) {
    trends.push(MARKET_TRENDS.phev);
  }

  if (hasAny(query, ["diesel", "diésel", "320d", "330d", "tdi", "dci"])) {
    trends.push(MARKET_TRENDS.diesel);
  }

  if (hasAny(query, ["toyota", "hybrid", "híbrido", "corolla", "rav4", "c-hr"])) {
    trends.push(MARKET_TRENDS.hybrid);
  }

  if (semantic.isPerformance || hasAny(query, ["m3", "m4", "amg", "rs", "performance"])) {
    trends.push(MARKET_TRENDS.performance);
  }

  if (maxBudget >= 70000 || hasAny(query, ["q7", "x7", "gle", "range rover", "panamera"])) {
    trends.push(MARKET_TRENDS.luxury);
  }

  const mainTrend = trends[0] || {
    label: "Mercado general",
    demand: "Media",
    trend: "Estable",
    risk: "Medio",
    insight:
      "No hay una tendencia dominante clara. Conviene priorizar anuncios con datos completos, buen precio frente a comparables y liquidez demostrable.",
  };

  return {
    mainTrend,
    trends,
    summary: buildTrendSummary(mainTrend),
  };
}

function buildTrendSummary(mainTrend) {
  return `${mainTrend.label}: demanda ${mainTrend.demand.toLowerCase()}, tendencia ${mainTrend.trend.toLowerCase()} y riesgo ${mainTrend.risk.toLowerCase()}. ${mainTrend.insight}`;
}

function hasAny(text, words) {
  return words.some((word) => text.includes(normalizeText(word)));
}

function normalizeText(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function toNumber(value, fallback) {
  const parsed = Number(String(value).replace(/[^0-9.]/g, ""));

  return Number.isFinite(parsed) ? parsed : fallback;
}