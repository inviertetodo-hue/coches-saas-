const AVOID_LANES = [
  {
    id: "too-cheap-listings",
    label: "Anuncios demasiado baratos",
    risk: "Muy alto",
    reason:
      "Un precio excesivamente bajo puede esconder daños, fraude, historial incompleto, impuestos pendientes o datos inconsistentes.",
  },
  {
    id: "low-data-cars",
    label: "Coches sin datos suficientes",
    risk: "Alto",
    reason:
      "Sin kilómetros, año, versión, historial o equipamiento claro, la IA debe bajar confianza y evitar recomendar compra agresiva.",
  },
  {
    id: "negative-margin",
    label: "Operaciones con margen neto negativo",
    risk: "Crítico",
    reason:
      "Aunque el coche parezca barato, si el margen neto calculado es negativo o muy bajo, no debe priorizarse para compra.",
  },
  {
    id: "slow-luxury",
    label: "Lujo caro de baja rotación",
    risk: "Medio-alto",
    reason:
      "Puede inmovilizar capital durante demasiado tiempo aunque parezca barato frente a mercado.",
  },
];

export function buildSearchRecommendations(input = {}) {
  const form = input.form || {};
  const scan = input.scan || {};
  const marketFeed = input.marketFeed || null;

  const queryLabel = cleanLabel(form.query || scan.query || "vehículo buscado");
  const country = form.country || "Europa";
  const useCase = form.useCase || "reventa";

  const liveOpportunities = Array.isArray(marketFeed?.opportunities)
    ? marketFeed.opportunities
    : [];

  const realRecommendations = buildRecommendationsFromMarketFeed({
    opportunities: liveOpportunities,
    queryLabel,
    country,
    useCase,
  });

  const recommendedSearches =
    realRecommendations.length > 0
      ? realRecommendations
      : buildFallbackRecommendations({ queryLabel, country, useCase });

  const topSearch = recommendedSearches[0];

  return {
    summary: buildSummary({
      topSearch,
      queryLabel,
      country,
      useCase,
      hasRealData: realRecommendations.length > 0,
    }),
    recommendedSearches,
    avoidSearches: buildAvoidRecommendations({ scan, useCase }),
  };
}

function buildRecommendationsFromMarketFeed({
  opportunities,
  queryLabel,
  country,
}) {
  return opportunities
    .filter((item) => item && item.title && item.price && (item.km || item.mileage) && item.year)
    .filter((item) => !isNoiseTitle(item.title))
    .map((item, index) => {
      const finalScore = Number(item.finalDecision?.finalScore || 0);
      const opportunityScore = Number(item.opportunityScore || 0);
      const liquidityScore = Number(item.liquidity?.liquidityScore || 0);
      const riskScore = Number(item.dealRisk?.riskScore || 0);
      const netRoi = Number(item.netRoi || 0);
      const netProfit = Number(item.netProfit || 0);

      const priority = clamp(
        Math.round(
          finalScore * 0.45 +
            opportunityScore * 0.25 +
            liquidityScore * 0.15 +
            Math.max(0, 100 - riskScore) * 0.10 +
            Math.min(Math.max(netRoi, 0), 20) * 0.25
        ),
        1,
        100
      );

      return {
        id: item.id || `real-opportunity-${index}`,
        label: item.title || queryLabel,
        segment: "real-market-opportunity",
        priority,
        liquidity: item.liquidity?.demand || scoreToLiquidity(liquidityScore),
        risk: item.dealRisk?.level || scoreToRisk(riskScore),
        marginPotential: marginToLabel({ netProfit, netRoi }),
        budgetTarget: formatVehicleBudget(item.price),
        countriesTarget: [item.country || country || "Europa"],
        isDirectMatch: true,
        reason: buildRealReason({ item, netProfit, netRoi, riskScore, liquidityScore }),
      };
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 6);
}

function buildFallbackRecommendations({ queryLabel, country }) {
  return [
    {
      id: "fallback-current-query",
      label: queryLabel,
      segment: "current-search",
      priority: 70,
      liquidity: "Pendiente",
      risk: "Pendiente",
      marginPotential: "Pendiente",
      budgetTarget: "Según presupuesto",
      countriesTarget: [country || "Europa"],
      isDirectMatch: true,
      reason:
        "Todavía no hay suficientes anuncios reales compatibles para priorizar oportunidades. Conviene revisar diagnóstico del feed y ampliar fuentes reales.",
    },
  ];
}

function buildRealReason({ item, netProfit, netRoi, riskScore, liquidityScore }) {
  const price = Number(item.price || 0);
  const km = Number(item.km || item.mileage || 0);
  const year = item.year || "año no detectado";

  const parts = [];

  parts.push(
    `${item.source || "Fuente real"} detecta este vehículo con precio ${formatMoney(price)}, año ${year} y ${formatKm(km)}.`
  );

  if (Number.isFinite(netProfit)) {
    parts.push(`Margen neto estimado: ${formatMoney(netProfit)}.`);
  }

  if (Number.isFinite(netRoi)) {
    parts.push(`ROI estimado: ${netRoi}%.`);
  }

  if (liquidityScore > 0) {
    parts.push(`Liquidez estimada: ${liquidityScore}/100.`);
  }

  if (riskScore >= 50) {
    parts.push("Riesgo elevado: validar historial, daños, impuestos y costes antes de contactar.");
  } else {
    parts.push("Riesgo controlado si documentación, historial y estado cuadran.");
  }

  return parts.join(" ");
}

function buildAvoidRecommendations({ scan, useCase }) {
  const recommendations = [...AVOID_LANES];

  if (scan.semantic?.isPerformance) {
    recommendations.unshift({
      id: "performance-warning",
      label: "Performance premium con score artificialmente alto",
      risk: "Alto",
      reason:
        "Si el coche es muy prestacional, exige más margen de seguridad porque la salida puede ser lenta y el mantenimiento pesa más.",
    });
  }

  if (useCase === "reventa") {
    recommendations.unshift({
      id: "low-roi-warning",
      label: "ROI bajo aunque el score sea alto",
      risk: "Medio",
      reason:
        "Para reventa, prioriza oportunidades con margen neto real y no solo buen precio aparente frente al mercado.",
    });
  }

  return recommendations.slice(0, 5);
}

function buildSummary({
  topSearch,
  queryLabel,
  country,
  useCase,
  hasRealData,
}) {
  if (!topSearch) {
    return "No hay suficientes datos para priorizar oportunidades todavía.";
  }

  const objective =
    useCase === "quedarmelo" ? "compra segura" : "reventa con margen";

  if (hasRealData) {
    return `Radar IA está priorizando oportunidades reales encontradas para ${queryLabel} en ${country}. Mejor candidata actual: ${topSearch.label}, prioridad ${topSearch.priority}/100, liquidez ${String(topSearch.liquidity).toLowerCase()} y riesgo ${String(topSearch.risk).toLowerCase()}.`;
  }

  return `Radar IA no tiene aún suficientes anuncios reales compatibles para ${queryLabel}. Mantiene una recomendación provisional para ${objective} en ${country}.`;
}

function isNoiseTitle(title = "") {
  const text = normalizeText(title);

  const noiseTerms = [
    "häufige fragen",
    "haeufige fragen",
    "preguntas frecuentes",
    "faq",
    "autoscout24",
    "anuncios de",
    "coches similares",
    "vehiculos similares",
    "financiacion",
    "precio justo",
    "super oferta",
    "sin comparacion",
  ];

  return noiseTerms.some((term) => text.includes(normalizeText(term)));
}

function scoreToLiquidity(score) {
  if (score >= 85) return "Muy alta";
  if (score >= 75) return "Alta";
  if (score >= 60) return "Media";
  return "Baja";
}

function scoreToRisk(score) {
  if (score >= 70) return "Crítico";
  if (score >= 50) return "Alto";
  if (score >= 25) return "Medio";
  return "Bajo";
}

function marginToLabel({ netProfit, netRoi }) {
  if (netProfit >= 3000 || netRoi >= 10) return "Alto";
  if (netProfit >= 1500 || netRoi >= 6) return "Medio-alto";
  if (netProfit >= 500 || netRoi >= 3) return "Medio";
  if (netProfit > 0) return "Bajo";
  return "Negativo";
}

function formatVehicleBudget(price) {
  const value = Number(price || 0);

  if (!Number.isFinite(value) || value <= 0) {
    return "Sin precio fiable";
  }

  const min = Math.max(0, Math.round(value * 0.92));
  const max = Math.round(value * 1.05);

  return `${min.toLocaleString("es-ES")} € - ${max.toLocaleString("es-ES")} €`;
}

function formatMoney(value) {
  const number = Number(value || 0);

  return `${Math.round(number).toLocaleString("es-ES")} €`;
}

function formatKm(value) {
  const number = Number(value || 0);

  if (!Number.isFinite(number) || number <= 0) return "km no detectados";

  return `${Math.round(number).toLocaleString("es-ES")} km`;
}

function cleanLabel(value) {
  return String(value || "")
    .replace(/^https?:\/\/\S+/i, "vehículo buscado")
    .trim();
}

function normalizeText(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
