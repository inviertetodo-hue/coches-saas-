export function buildMarketScan({
  query = "",
  maxBudget = "",
  country = "Alemania",
  useCase = "reventa",
}) {
  const cleanQuery = String(query || "").trim();
  const budget = Number(maxBudget || 0);

  if (!cleanQuery) {
    return buildEmptyScan();
  }

  const semantic = detectSearchIntent(cleanQuery);
  const countries = buildCountryTargets(country);
  const searchLinks = buildSearchLinks(cleanQuery, budget, countries);
  const buyingLogic = buildBuyingLogic({
    semantic,
    budget,
    useCase,
  });

  return {
    query: cleanQuery,
    country,
    maxBudget: budget,
    semantic,
    searchLinks,
    buyingLogic,
    summary: buildScanSummary(cleanQuery, country, budget, semantic),
  };
}

function buildEmptyScan() {
  return {
    query: "",
    country: "",
    maxBudget: 0,
    semantic: null,
    searchLinks: [],
    buyingLogic: [],
    summary:
      "Introduce un modelo para empezar a buscar oportunidades reales en Europa.",
  };
}

function detectSearchIntent(query) {
  const text = normalize(query);

  const premiumSignals = [
    "bmw",
    "audi",
    "mercedes",
    "porsche",
    "range rover",
    "land rover",
    "volvo",
    "lexus",
  ];

  const phevSignals = [
    "phev",
    "hybrid",
    "hibrido",
    "híbrido",
    "45e",
    "50e",
    "300de",
    "350de",
    "tfsi e",
    "tfsie",
    "recharge",
    "e-hybrid",
  ];

  const suvSignals = [
    "x3",
    "x5",
    "x6",
    "q5",
    "q7",
    "q8",
    "glc",
    "gle",
    "cayenne",
    "xc90",
    "range rover",
    "touareg",
  ];

  const performanceSignals = [
    "amg",
    "rs",
    "m3",
    "m4",
    "m5",
    "m8",
    "turbo",
    "competition",
    "gti",
  ];

  return {
    isPremium: premiumSignals.some((item) => text.includes(item)),
    isPhev: phevSignals.some((item) => text.includes(item)),
    isSuv: suvSignals.some((item) => text.includes(item)),
    isPerformance: performanceSignals.some((item) => text.includes(item)),
    rawText: text,
  };
}

function buildCountryTargets(country) {
  if (country === "Europa") {
    return ["Alemania", "Holanda", "Bélgica", "Francia", "España"];
  }

  return [country || "Alemania"];
}

function buildSearchLinks(query, budget, countries) {
  return countries.flatMap((country) => {
    const encoded = encodeURIComponent(query);

    const mobileUrl = buildMobileUrl(encoded, budget, country);
    const autoscoutUrl = buildAutoscoutUrl(encoded, budget, country);

    return [
      {
        source: "mobile.de",
        country,
        label: `${query} en ${country}`,
        url: mobileUrl,
        priority: country === "Alemania" ? "Alta" : "Media",
      },
      {
        source: "AutoScout24",
        country,
        label: `${query} en ${country}`,
        url: autoscoutUrl,
        priority: country === "Alemania" ? "Alta" : "Media",
      },
    ];
  });
}

function buildMobileUrl(encodedQuery, budget, country) {
  const countryCode = getMobileCountryCode(country);
  const budgetParam = budget > 0 ? `&p=%3A${budget}` : "";

  return `https://suchen.mobile.de/fahrzeuge/search.html?dam=false&isSearchRequest=true&ms=&ref=quickSearch&s=Car&sb=rel&vc=Car&cn=${countryCode}&q=${encodedQuery}${budgetParam}`;
}

function buildAutoscoutUrl(encodedQuery, budget, country) {
  const countryCode = getAutoscoutCountryCode(country);
  const budgetParam = budget > 0 ? `&price_to=${budget}` : "";

  return `https://www.autoscout24.com/lst?atype=C&cy=${countryCode}&desc=0&sort=standard&ustate=N%2CU&q=${encodedQuery}${budgetParam}`;
}

function buildBuyingLogic({ semantic, budget, useCase }) {
  const logic = [];

  logic.push({
    title: "Precio objetivo",
    text:
      budget > 0
        ? `Buscar unidades claramente por debajo de ${formatMoney(budget)}.`
        : "Define presupuesto máximo para detectar infraprecios reales.",
    type: "neutral",
  });

  logic.push({
    title: "Ventaja real",
    text:
      "No basta con precio bajo: debe haber margen neto después de transporte, impuestos, matriculación, gestoría y reacondicionamiento.",
    type: "warning",
  });

  if (semantic.isPremium && semantic.isPhev && semantic.isSuv) {
    logic.push({
      title: "Configuración fuerte",
      text:
        "SUV premium PHEV suele tener buena demanda, buena liquidez y sentido para importación.",
      type: "positive",
    });
  }

  if (semantic.isPerformance) {
    logic.push({
      title: "Riesgo performance",
      text:
        "AMG, RS, M o Turbo pueden tener margen alto, pero comprador más pequeño, mantenimiento caro y rotación más lenta.",
      type: "warning",
    });
  }

  if (useCase === "quedarmelo") {
    logic.push({
      title: "Compra para uso propio",
      text:
        "Priorizar estado, garantía, historial, equipamiento y precio frente a mercado nacional.",
      type: "positive",
    });
  }

  if (useCase === "reventa") {
    logic.push({
      title: "Compra para reventa",
      text:
        "Priorizar liquidez, margen neto, demanda real, color vendible, kilometraje bajo y configuración fácil de vender.",
      type: "positive",
    });
  }

  return logic;
}

function buildScanSummary(query, country, budget, semantic) {
  const parts = [`Buscando ${query}`];

  if (country) parts.push(`en ${country}`);
  if (budget > 0) parts.push(`hasta ${formatMoney(budget)}`);

  if (semantic.isPremium && semantic.isPhev && semantic.isSuv) {
    parts.push("con perfil de oportunidad premium líquida");
  } else if (semantic.isPerformance) {
    parts.push("con perfil performance de mayor riesgo");
  }

  return `${parts.join(" ")}.`;
}

function getMobileCountryCode(country) {
  const map = {
    Alemania: "D",
    Holanda: "NL",
    Bélgica: "B",
    Belgica: "B",
    Francia: "F",
    España: "E",
    Espana: "E",
  };

  return map[country] || "D";
}

function getAutoscoutCountryCode(country) {
  const map = {
    Alemania: "D",
    Holanda: "NL",
    Bélgica: "B",
    Belgica: "B",
    Francia: "F",
    España: "E",
    Espana: "E",
  };

  return map[country] || "D";
}

function formatMoney(value) {
  return `${Number(value).toLocaleString("es-ES")} €`;
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}