// ---------------------------------------------------------------------------
// Lookup de códigos mobile.de — marca → código numérico
// ---------------------------------------------------------------------------
const MOBILE_DE_BRAND_CODES = {
  audi:       "1900",
  bmw:        "3500",
  mercedes:   "17200",
  volkswagen: "25200",
  vw:         "25200",
  seat:       "22900",
  skoda:      "24100",
  peugeot:    "18700",
  hyundai:    "11600",
  kia:        "13200",
  nissan:     "19300",
  toyota:     "24900",
  renault:    "21200",
  porsche:    "20100",
  ford:       "9000",
  opel:       "19900",
  volvo:      "25800",
  mazda:      "16600",
  honda:      "11200",
  mini:       "17400",
  citroen:    "4900",
  fiat:       "8400",
  cupra:      "5200",
  dacia:      "5700",
  tesla:      "24350",
  jeep:       "12900",
};

// modelo normalizado → código numérico (por marca)
const MOBILE_DE_MODEL_CODES = {
  // Audi
  a1: "5",  a3: "8",  a4: "9",  a5: "10",
  a6: "11", a7: "12", a8: "13",
  q2: "24", q3: "25", q5: "26", q7: "27", q8: "28",
  "e-tron": "38", "q4 e-tron": "41", "etron": "38",
  rs3: "44", rs4: "45", rs5: "46", rs6: "47", rs7: "48",
  // BMW
  "serie 1": "2",  "1er": "2",  "1 series": "2",
  "serie 2": "3",  "2er": "3",
  "serie 3": "4",  "3er": "4",  "3 series": "4",
  "serie 4": "5",  "4er": "5",
  "serie 5": "6",  "5er": "6",  "5 series": "6",
  "serie 7": "8",  "7er": "8",
  x1: "19", x2: "20", x3: "21", x4: "22", x5: "23", x6: "24", x7: "25",
  ix: "36", i4: "37", i3: "31",
  m3: "50", m4: "51", m5: "52",
  // Mercedes
  "clase a": "6",  "a-klasse": "6",
  "clase b": "7",  "b-klasse": "7",
  "clase c": "8",  "c-klasse": "8",  "c300": "8",  "c 300": "8",
  "clase e": "10", "e-klasse": "10",
  "clase s": "13", "s-klasse": "13",
  gla: "25", glb: "26", glc: "27", gle: "28", gls: "29",
  eqa: "44", eqb: "45", eqc: "46",
  // VW
  golf: "14", polo: "18", passat: "19", tiguan: "32",
  touareg: "33", "id.3": "38", "id3": "38", "id.4": "39", "id4": "39",
  "t-roc": "42",
  // SEAT / Cupra
  ibiza: "8", leon: "10", "león": "10", ateca: "19", arona: "22",
  // Skoda
  fabia: "5", octavia: "9", superb: "12",
  kodiaq: "20", karoq: "21", kamiq: "24",
  // Peugeot
  "3008": "47", "5008": "48", "2008": "44", "208": "39", "308": "40",
  // Hyundai
  tucson: "27", "santa fe": "28", "ioniq 5": "33", "ioniq 6": "34",
  // Kia
  sportage: "25", sorento: "26", ev6: "30", niro: "29",
  // Nissan
  qashqai: "26", juke: "27", leaf: "30", ariya: "31",
  // Toyota
  corolla: "22", yaris: "24", rav4: "31", "c-hr": "35", chr: "35",
  // Renault
  clio: "14", megane: "15", kadjar: "22", koleos: "25", zoe: "30",
  // Porsche
  "911": "2", cayenne: "5", macan: "6", panamera: "7", taycan: "10",
  // Volvo
  xc40: "10", xc60: "11", xc90: "12", v60: "7", v90: "8",
};

const MOBILE_DE_FUEL_CODES = {
  diesel:    "DIESEL",
  gasolina:  "PETROL",
  petrol:    "PETROL",
  gasoil:    "DIESEL",
  hibrido:   "HYBRID",
  híbrido:   "HYBRID",
  hybrid:    "HYBRID",
  phev:      "HYBRID",
  electrico: "ELECTRICITY",
  eléctrico: "ELECTRICITY",
  electric:  "ELECTRICITY",
  ev:        "ELECTRICITY",
};

export function buildMarketScan({
  query = "",
  maxBudget = "",
  country = "Alemania",
  useCase = "reventa",
  fuel = "",
  minYear = "",
  maxMileage = "",
}) {
  const cleanQuery = String(query || "").trim();
  const budget = Number(maxBudget || 0);

  if (!cleanQuery) {
    return buildEmptyScan();
  }

  const semantic = detectSearchIntent(cleanQuery);
  const countries = buildCountryTargets(country);
  const filters = {
    fuel: String(fuel || "").trim(),
    minYear: Number(minYear || 0),
    maxMileage: Number(maxMileage || 0),
  };
  const searchLinks = buildSearchLinks(cleanQuery, budget, countries, filters);
  const buyingLogic = buildBuyingLogic({
    semantic,
    budget,
    useCase,
  });

  return {
    query: cleanQuery,
    country,
    maxBudget: budget,
    fuel: filters.fuel,
    minYear: filters.minYear,
    maxMileage: filters.maxMileage,
    semantic,
    searchLinks,
    buyingLogic,
    summary: buildScanSummary(cleanQuery, country, budget, semantic, filters),
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
    return [
      "Alemania",
      "Holanda",
      "Bélgica",
      "Francia",
      "Italia",
      "Austria",
      "Luxemburgo",
      "Suecia",
      "Dinamarca",
      "España",
    ];
  }

  return [country || "Alemania"];
}

function buildSearchLinks(query, budget, countries, filters = {}) {
  return countries.flatMap((country) => {
    const priority = getCountryPriority(country);
    const links = [];

    // mobile.de solo sirve para Alemania
    if (country === "Alemania") {
      links.push({
        source: "mobile.de",
        country,
        label: buildReadableLabel(query, filters, budget, country),
        url: buildMobileUrl(query, budget, filters),
        priority,
      });
    }

    links.push({
      source: "AutoScout24",
      country,
      label: buildReadableLabel(query, filters, budget, country),
      url: buildAutoscoutUrl(query, budget, country, filters),
      priority,
    });

    return links;
  });
}

function buildMobileUrl(query, budget, filters = {}) {
  const params = new URLSearchParams();

  params.set("dam", "false");
  params.set("isSearchRequest", "true");
  params.set("s", "Car");
  params.set("vc", "Car");
  params.set("sb", "p"); // ordenar por precio ascendente

  // Marca y modelo → parámetro ms=brandCode;modelCode;;
  const brandCode = extractMobileBrandCode(query);
  const modelCode = brandCode ? extractMobileModelCode(query) : "";

  if (brandCode) {
    params.set("ms", modelCode
      ? `${brandCode};${modelCode};;`
      : `${brandCode};;;`
    );
  }

  // Combustible
  const fuelCode = getMobileDeFuelCode(filters.fuel || query);
  if (fuelCode) params.set("ft", fuelCode);

  // Precio máximo
  if (budget > 0) params.set("p", `:${budget}`);

  // Año mínimo (fr=YYYY:)
  if (filters.minYear > 0) params.set("fr", `${filters.minYear}:`);

  // Km máximo (ml=:MAXKM)
  if (filters.maxMileage > 0) params.set("ml", `:${filters.maxMileage}`);

  return `https://suchen.mobile.de/fahrzeuge/search.html?${params.toString()}`;
}

function extractMobileBrandCode(query) {
  const text = normalize(query);
  for (const [name, code] of Object.entries(MOBILE_DE_BRAND_CODES)) {
    if (text.includes(name)) return code;
  }
  return "";
}

function extractMobileModelCode(query) {
  const text = normalize(query);
  // Primero buscar coincidencias exactas más largas (evitar "a3" dentro de "a30")
  const sortedModels = Object.entries(MOBILE_DE_MODEL_CODES)
    .sort(([a], [b]) => b.length - a.length);
  for (const [name, code] of sortedModels) {
    const pattern = new RegExp(`(?:^|[\\s-])${normalize(name)}(?:[\\s-]|$)`);
    if (pattern.test(` ${text} `)) return code;
  }
  return "";
}

function getMobileDeFuelCode(text) {
  const t = normalize(text);
  // PHEV signals
  if (/45e|50e|30e|300de|300e|350de|phev|plug.?in|tfsie|tfsi e/.test(t)) return "HYBRID";
  for (const [key, code] of Object.entries(MOBILE_DE_FUEL_CODES)) {
    if (t.includes(key)) return code;
  }
  return "";
}

function buildReadableLabel(query, filters, budget, country) {
  const parts = [query];
  if (filters.fuel) parts.push(capitalize(filters.fuel));
  if (budget > 0) parts.push(`hasta ${budget.toLocaleString("es-ES")} €`);
  if (filters.minYear > 0) parts.push(`desde ${filters.minYear}`);
  if (filters.maxMileage > 0) parts.push(`máx. ${filters.maxMileage.toLocaleString("es-ES")} km`);
  parts.push(country);
  return parts.join(" · ");
}

function capitalize(str) {
  return String(str || "").charAt(0).toUpperCase() + String(str || "").slice(1).toLowerCase();
}

function buildAutoscoutUrl(rawQuery, budget, country, filters = {}) {
  const query = String(rawQuery || "").replace(/%20/g, " ").trim();
  const countryCode = getAutoscoutCountryCode(country);
  const budgetParam = budget > 0 ? `&price_to=${budget}` : "";
  const yearParam = filters.minYear > 0 ? `&fregfrom=${filters.minYear}` : "";
  const kmParam = filters.maxMileage > 0 ? `&kmto=${filters.maxMileage}` : "";

  const brand = extractBrandSlug(query);
  const model = extractModelSlug(query);
  // Combustible: prioriza el filtro explícito, luego detecta del query
  const fuelParam = extractFuelParam(filters.fuel || query);

  if (brand && model) {
    return `https://www.autoscout24.de/lst/${brand}/${model}?atype=C&cy=${countryCode}&ustate=N%2CU${fuelParam}${budgetParam}${yearParam}${kmParam}`;
  }

  if (brand) {
    return `https://www.autoscout24.de/lst/${brand}?atype=C&cy=${countryCode}&ustate=N%2CU${fuelParam}${budgetParam}${yearParam}${kmParam}`;
  }

  const encoded = encodeURIComponent(query);
  return `https://www.autoscout24.de/lst?atype=C&cy=${countryCode}&ustate=N%2CU&q=${encoded}${fuelParam}${budgetParam}${yearParam}${kmParam}`;
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
  if (text.match(/clase\s*c/) || text.match(/klasse\s*c/) || text.includes("c 300") || text.includes("c300")) return "c-klasse";
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

  // PHEV: Elektro/Benzin en AutoScout = fuel=EB
  const isPhev =
    text.includes("phev") ||
    text.includes("hybrid") ||
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
    text.includes("plug") ||
    text.includes("phev");

  if (isPhev) return "&fuel=EB";

  // EV puro
  if (text.includes("electric") || text.includes("eléctrico") || text.includes("ev") || text.includes("electrico")) {
    return "&fuel=E";
  }

  // Diesel
  if (text.includes("diesel") || text.includes("tdi") || text.includes("dci")) {
    return "&fuel=D";
  }

  return "";
}

function getAutoscoutDomain(country) {
  const map = {
    Alemania: "de",
    Holanda: "nl",
    Bélgica: "be",
    Belgica: "be",
    Francia: "fr",
    Italia: "it",
    Austria: "at",
    Luxemburgo: "lu",
    Suecia: "se",
    Dinamarca: "dk",
    España: "es",
    Espana: "es",
  };

  return map[country] || "de";
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
    title: "Mercados prioritarios",
    text:
      "El escaneo europeo prioriza Alemania, Holanda, Bélgica, Francia e Italia, y amplía cobertura hacia Austria, Luxemburgo, Suecia, Dinamarca y España.",
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

function buildScanSummary(query, country, budget, semantic, filters = {}) {
  const parts = [`Buscando ${query}`];

  if (filters.fuel) parts.push(capitalize(filters.fuel));
  if (country) parts.push(`en ${country}`);
  if (budget > 0) parts.push(`hasta ${formatMoney(budget)}`);
  if (filters.minYear > 0) parts.push(`desde ${filters.minYear}`);
  if (filters.maxMileage > 0) parts.push(`máx. ${filters.maxMileage.toLocaleString("es-ES")} km`);

  if (semantic.isPremium && semantic.isPhev && semantic.isSuv) {
    parts.push("con perfil de oportunidad premium líquida");
  } else if (semantic.isPerformance) {
    parts.push("con perfil performance de mayor riesgo");
  }

  return `${parts.join(" ")}.`;
}

function getCountryPriority(country) {
  const highPriority = [
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