const SEARCH_LANES = [
  {
    id: "bmw-x5-45e",
    label: "BMW X5 45e",
    segment: "premium-phev-suv",
    budgetMin: 43000,
    budgetMax: 62000,
    countries: ["Alemania", "Holanda", "Bélgica"],
    liquidity: "Alta",
    risk: "Medio",
    marginPotential: "Alto",
    basePriority: 92,
    keywords: ["bmw", "x5", "45e", "phev", "híbrido", "suv"],
    reason:
      "SUV premium PHEV con demanda fuerte, ticket alto defendible y margen potencial si aparece por debajo de mercado con buen historial.",
  },
  {
    id: "mercedes-glc-300de-300e",
    label: "Mercedes GLC 300de / 300e",
    segment: "premium-phev-suv",
    budgetMin: 38000,
    budgetMax: 57000,
    countries: ["Alemania", "Bélgica", "Holanda"],
    liquidity: "Alta",
    risk: "Medio",
    marginPotential: "Alto",
    basePriority: 90,
    keywords: ["mercedes", "glc", "300de", "300e", "phev", "híbrido"],
    reason:
      "Modelo muy buscado para uso familiar y empresa. Buena combinación de liquidez, imagen premium y oportunidades en mercados europeos grandes.",
  },
  {
    id: "audi-q7-tfsie",
    label: "Audi Q7 TFSIe",
    segment: "large-premium-phev-suv",
    budgetMin: 52000,
    budgetMax: 76000,
    countries: ["Alemania", "Holanda"],
    liquidity: "Media",
    risk: "Medio-alto",
    marginPotential: "Alto",
    basePriority: 82,
    keywords: ["audi", "q7", "tfsie", "tfsi", "phev", "quattro"],
    reason:
      "Puede dejar margen alto, pero exige más capital, mejor filtrado y comprador claro por su ticket y coste de rotación.",
  },
  {
    id: "bmw-serie-3-diesel-auto",
    label: "BMW Serie 3 diésel automático",
    segment: "premium-diesel-sedan",
    budgetMin: 22000,
    budgetMax: 42000,
    countries: ["Alemania", "Bélgica", "Francia"],
    liquidity: "Alta",
    risk: "Bajo-medio",
    marginPotential: "Medio-alto",
    basePriority: 86,
    keywords: ["bmw", "serie 3", "320d", "330d", "diesel", "automático"],
    reason:
      "Producto líquido, fácil de comparar y con demanda estable. Interesante para rotación más rápida con riesgo controlado.",
  },
  {
    id: "mercedes-clase-a-auto",
    label: "Mercedes Clase A automático",
    segment: "premium-compact",
    budgetMin: 19000,
    budgetMax: 36000,
    countries: ["Alemania", "Francia", "Bélgica"],
    liquidity: "Alta",
    risk: "Bajo-medio",
    marginPotential: "Medio",
    basePriority: 84,
    keywords: ["mercedes", "clase a", "a180", "a200", "automático"],
    reason:
      "Alta demanda de entrada a marca premium. Buen candidato para rotación si el precio, kilómetros y acabado cuadran.",
  },
  {
    id: "toyota-hibridos",
    label: "Toyota híbridos",
    segment: "reliable-hybrid",
    budgetMin: 15000,
    budgetMax: 34000,
    countries: ["España", "Francia", "Bélgica", "Alemania"],
    liquidity: "Muy alta",
    risk: "Bajo",
    marginPotential: "Medio",
    basePriority: 88,
    keywords: ["toyota", "hybrid", "híbrido", "corolla", "rav4", "c-hr"],
    reason:
      "Liquidez muy fuerte, riesgo bajo y público comprador amplio. Ideal cuando se prioriza seguridad y velocidad de salida.",
  },
];

const AVOID_LANES = [
  {
    id: "expensive-performance",
    label: "Performance caro sin comprador claro",
    risk: "Alto",
    reason:
      "El margen aparente puede ser grande, pero la liquidez suele ser menor y el comprador final es más específico.",
  },
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

  const query = normalizeText(form.query || scan.query || "");
  const maxBudget = toNumber(form.maxBudget, 0);
  const country = form.country || "Europa";
  const useCase = form.useCase || "reventa";

  const recommendedSearches = SEARCH_LANES.map((lane) => {
    const priority = calculatePriority({
      lane,
      query,
      maxBudget,
      country,
      useCase,
      scan,
      marketFeed,
    });

    return {
      ...lane,
      priority,
      budgetTarget: formatBudgetRange(lane.budgetMin, lane.budgetMax),
      countriesTarget: lane.countries,
      isDirectMatch: hasKeywordMatch(query, lane.keywords),
    };
  })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 6);

  const avoidSearches = buildAvoidRecommendations({
    scan,
    maxBudget,
    useCase,
  });

  const topSearch = recommendedSearches[0];

  return {
    summary: buildSummary(topSearch, country, useCase),
    recommendedSearches,
    avoidSearches,
  };
}

function calculatePriority({
  lane,
  query,
  maxBudget,
  country,
  useCase,
  scan,
  marketFeed,
}) {
  let score = lane.basePriority;

  if (hasKeywordMatch(query, lane.keywords)) score += 8;
  if (country !== "Europa" && lane.countries.includes(country)) score += 5;
  if (country !== "Europa" && !lane.countries.includes(country)) score -= 6;

  if (maxBudget > 0) {
    if (maxBudget >= lane.budgetMin && maxBudget <= lane.budgetMax + 5000) {
      score += 6;
    }

    if (maxBudget < lane.budgetMin) score -= 18;
    if (maxBudget > lane.budgetMax + 18000) score -= 4;
  }

  if (useCase === "quedarmelo" && lane.risk === "Bajo") score += 4;
  if (useCase === "quedarmelo" && lane.risk.includes("Alto")) score -= 6;
  if (useCase === "reventa" && lane.liquidity.includes("Alta")) score += 5;
  if (useCase === "reventa" && lane.liquidity === "Media") score -= 3;

  if (scan.semantic?.isPerformance && lane.risk.includes("Alto")) score -= 8;
  if (scan.semantic?.isPhev && lane.segment.includes("phev")) score += 4;
  if (scan.semantic?.isSuv && lane.segment.includes("suv")) score += 4;

  if (
    marketFeed?.best?.opportunityScore >= 80 &&
    hasKeywordMatch(query, lane.keywords)
  ) {
    score += 4;
  }

  return clamp(Math.round(score), 1, 100);
}

function buildAvoidRecommendations({ scan, maxBudget, useCase }) {
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

  if (maxBudget >= 70000 && useCase === "reventa") {
    recommendations.unshift({
      id: "high-ticket-warning",
      label: "Ticket alto para reventa rápida",
      risk: "Medio-alto",
      reason:
        "Por encima de 70.000 €, conviene priorizar liquidez y comprador final antes que margen teórico.",
    });
  }

  return recommendations.slice(0, 5);
}

function buildSummary(topSearch, country, useCase) {
  if (!topSearch) {
    return "No hay suficientes datos para priorizar líneas de búsqueda todavía.";
  }

  const objective =
    useCase === "quedarmelo" ? "compra segura" : "reventa con margen";

  return `Radar IA recomienda empezar por ${topSearch.label} para ${objective} en ${country}. Prioridad ${topSearch.priority}/100 por liquidez ${topSearch.liquidity.toLowerCase()}, riesgo ${topSearch.risk.toLowerCase()} y margen potencial ${topSearch.marginPotential.toLowerCase()}.`;
}

function hasKeywordMatch(query, keywords) {
  if (!query) return false;

  return keywords.some((keyword) => query.includes(normalizeText(keyword)));
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

function formatBudgetRange(min, max) {
  return `${min.toLocaleString("es-ES")} € - ${max.toLocaleString("es-ES")} €`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}