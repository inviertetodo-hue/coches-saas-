export function buildMarketScan({
  query = "",
  maxBudget = "",
  country = "España",
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
      "Introduce un modelo para empezar a buscar oportunidades reales en Milanuncios y mercado europeo.",
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
    return [
      "España",
      "Alemania",
      "Holanda",
      "Bélgica",
      "Francia",
      "Italia",
      "Austria",
      "Luxemburgo",
      "Suecia",
      "Dinamarca",
    ];
  }

  return [country || "España"];
}

function buildSearchLinks(query, budget, countries) {
  return countries.flatMap((country) => {
    const encoded = encodeURIComponent(query);
    const priority = getCountryPriority(country);
    const links = [];

    // Milanuncios primero: fuente prioritaria inicial para España.
    // Mantener mobile.de y AutoScout24 para futuras fases europeas.
    if (country === "España") {
      links.push({
        source: "Milanuncios",
        country,
        label: `Milanuncios · ${query} · España`,
        url: buildMilanunciosUrl(query, budget),
        priority: "Alta",
      });
    }

    // mobile.de solo sirve para Alemania — devuelve ~385 chars para otros países.
    if (country === "Alemania") {
      links.push({
        source: "mobile.de",
        country,
        label: `mobile.de · ${query} · ${country}`,
        url: buildMobileUrl(encoded, budget, country),
        priority,
      });
    }

    // AutoScout: mantener como fuente europea secundaria.
    // Siempre usar autoscout24.de con cy= para el país.
    // Los dominios .nl/.be/.fr devuelven muro de cookies, sin listados.
    links.push({
      source: "AutoScout24",
      country,
      label: `AutoScout24 · ${query} · ${country}`,
      url: buildAutoscoutUrl(query, budget, country),
      priority,
    });

    return links;
  });
}

function buildMilanunciosUrl(query, budget) {
  const brand = extractBrandSlug(query);
  const model = extractModelSlug(query);
  const budgetParam = budget > 0 ? `?preciomax=${budget}` : "";

  // URL estructurada por marca-modelo → más resultados relevantes.
  if (brand && model) {
    return `https://www.milanuncios.com/coches-de-segunda-mano/${brand}-${model}.htm${budgetParam}`;
  }

  if (brand) {
    return `https://www.milanuncios.com/coches-de-segunda-mano/${brand}.htm${budgetParam}`;
  }

  const slug = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

  return `https://www.milanuncios.com/coches-de-segunda-mano/${slug}.htm${budgetParam}`;
}

function buildMobileUrl(encodedQuery, budget, country) {
  const countryCode = getMobileCountryCode(country);
  const budgetParam = budget > 0 ? `&p=%3A${budget}` : "";

  return `https://suchen.mobile.de/fahrzeuge/search.html?dam=false&isSearchRequest=true&ms=&ref=quickSearch&s=Car&sb=rel&vc=Car&cn=${countryCode}&q=${encodedQuery}${budgetParam}`;
}

function buildAutoscoutUrl(rawQuery, budget, country) {
  const query = String(rawQuery || "").replace(/%20/g, " ").trim();
  const countryCode = getAutoscoutCountryCode(country);
  const budgetParam = budget > 0 ? `&price_to=${budget}` : "";

  const brand = extractBrandSlug(query);
  const model = extractModelSlug(query);
  const fuelParam = extractFuelParam(query);

  if (brand && model) {
    return `https://www.autoscout24.de/lst/${brand}/${model}?atype=C&cy=${countryCode}&ustate=N%2CU${fuelParam}${budgetParam}`;
  }

  if (brand) {
    return `https://www.autoscout24.de/lst/${brand}?atype=C&cy=${countryCode}&ustate=N%2CU${fuelParam}${budgetParam}`;
  }

  const encoded = encodeURIComponent(query);
  return `https://www.autoscout24.de/lst?atype=C&cy=${countryCode}&ustate=N%2CU&q=${encoded}${budgetParam}`;
}

function extractBrandSlug(query) {
  const text = query.toLowerCase();

  if (text.includes("bmw")) return "bmw";
  if (text.includes("audi")) return "audi";
  if (text.includes("mercedes")) return "mercedes-benz";
  if (text.includes("volkswagen") || text.includes("vw")) return "volkswagen";
  if (text.includes("volvo")) return "volvo";
  if (text.includes("porsche")) return "porsche";
  if (text.includes("seat")) return "seat";
  if (text.includes("skoda") || text.includes("škoda")) return "skoda";
  if (text.includes("peugeot")) return "peugeot";
  if (text.includes("renault")) return "renault";
  if (text.includes("toyota")) return "toyota";
  if (text.includes("hyundai")) return "hyundai";
  if (text.includes("kia")) return "kia";
  if (text.includes("nissan")) return "nissan";
  if (text.includes("ford")) return "ford";
  if (text.includes("opel")) return "opel";

  return "";
}

function extractModelSlug(query) {
  const text = query.toLowerCase();

  // BMW
  if (text.includes("x1")) return "x1";
  if (text.includes("x2")) return "x2";
  if (text.includes("x3")) return "x3";
  if (text.includes("x4")) return "x4";
  if (text.includes("x5")) return "x5";
  if (text.includes("x6")) return "x6";
  if (text.includes("x7")) return "x7";
  if (text.match(/serie\s*1/) || text.match(/1\s*series/)) return "1er";
  if (text.match(/serie\s*3/) || text.match(/3\s*series/)) return "3er";
  if (text.match(/serie\s*5/) || text.match(/5\s*series/)) return "5er";

  // Audi
  if (text.includes("a1")) return "a1";
  if (text.includes("a3")) return "a3";
  if (text.includes("a4")) return "a4";
  if (text.includes("a5")) return "a5";
  if (text.includes("a6")) return "a6";
  if (text.includes("q2")) return "q2";
  if (text.includes("q3")) return "q3";
  if (text.includes("q5")) return "q5";
  if (text.includes("q7")) return "q7";
  if (text.includes("q8")) return "q8";

  // Mercedes
  if (text.includes("glc")) return "glc-(alle)";
  if (text.includes("gle")) return "gle-(alle)";
  if (text.includes("gla")) return "gla-(alle)";
  if (text.includes("glb")) return "glb";
  if (text.includes("gls")) return "gls";
  if (
    text.match(/clase\s*c/) ||
    text.match(/klasse\s*c/) ||
    text.includes("c 300") ||
    text.includes("c300")
  ) {
    return "c-klasse";
  }
  if (text.match(/clase\s*e/) || text.includes("e 300")) return "e-klasse";

  // VW
  if (text.includes("golf")) return "golf";
  if (text.includes("tiguan")) return "tiguan";
  if (text.includes("passat")) return "passat";
  if (text.includes("polo")) return "polo";
  if (text.includes("touareg")) return "touareg";

  // Volvo
  if (text.includes("xc90")) return "xc90";
  if (text.includes("xc60")) return "xc60";
  if (text.includes("xc40")) return "xc40";
  if (text.includes("v90")) return "v90";
  if (text.includes("v60")) return "v60";

  // Skoda
  if (text.includes("octavia")) return "octavia";
  if (text.includes("kodiaq")) return "kodiaq";
  if (text.includes("superb")) return "superb";

  // Porsche
  if (text.includes("cayenne")) return "cayenne";
  if (text.includes("macan")) return "macan";
  if (text.includes("panamera")) return "panamera";
  if (text.includes("taycan")) return "taycan";

  return "";
}

function extractFuelParam(query) {
  const text = query.toLowerCase();

  const isPhev =
    text.includes("phev") ||
    text.includes("hybrid") ||
    text.includes("hibrido") ||
    text.includes("híbrido") ||
    text.includes("45e") ||
    text.includes("50e") ||
    text.includes("30e") ||
    text.includes("300de") ||
    text.includes("300e") ||
    text.includes("350de") ||
    text.includes("tfsie") ||
    text.includes("tfsi e") ||
    text.includes("tfsi-e") ||
    text.includes("e-hybrid") ||
    text.includes("ehybrid") ||
    text.includes("recharge") ||
    text.includes("plug");

  if (isPhev) return "&fuel=EB";

  if (
    text.includes("electric") ||
    text.includes("eléctrico") ||
    text.includes("ev") ||
    text.includes("electrico")
  ) {
    return "&fuel=E";
  }

  if (text.includes("diesel") || text.includes("tdi") || text.includes("dci")) {
    return "&fuel=D";
  }

  return "";
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

  logic.push({
    title: "Fuente prioritaria inicial",
    text:
      "Milanuncios queda como primera fuente de oportunidades en España. Mobile.de y AutoScout24 se mantienen preparados para ampliar cobertura europea después.",
    type: "positive",
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

  parts.push("priorizando Milanuncios");

  if (semantic.isPremium && semantic.isPhev && semantic.isSuv) {
    parts.push("con perfil de oportunidad premium líquida");
  } else if (semantic.isPerformance) {
    parts.push("con perfil performance de mayor riesgo");
  }

  return `${parts.join(" ")}.`;
}

function getCountryPriority(country) {
  const highPriority = [
    "España",
    "Alemania",
    "Holanda",
    "Bélgica",
    "Francia",
    "Italia",
  ];

  return highPriority.includes(country) ? "Alta" : "Media";
}

function getMobileCountryCode(country) {
  const map = {
    Alemania: "D",
    Holanda: "NL",
    Bélgica: "B",
    Belgica: "B",
    Francia: "F",
    Italia: "I",
    Austria: "A",
    Luxemburgo: "L",
    Suecia: "S",
    Dinamarca: "DK",
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
    Italia: "I",
    Austria: "A",
    Luxemburgo: "L",
    Suecia: "S",
    Dinamarca: "DK",
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