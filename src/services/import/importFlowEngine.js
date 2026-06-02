const MOBILE_DE_MS_REFERENCE = {
  "22900": {
    brand: "SEAT",
    models: {
      "10": "Leon",
    },
  },
  "22500": {
    brand: "SEAT",
    models: {
      "10": "Leon",
    },
  },
  "24100": {
    brand: "Skoda",
    models: {
      "5": "Fabia",
      "9": "Octavia",
    },
  },
  "25200": {
    brand: "Volkswagen",
    models: {
      "14": "Golf",
    },
  },
  "18700": {
    brand: "Peugeot",
    models: {
      "47": "3008",
    },
  },
  "11600": {
    brand: "Hyundai",
    models: {
      "27": "Tucson",
    },
  },
  "13200": {
    brand: "Kia",
    models: {
      "25": "Sportage",
    },
  },
  "19300": {
    brand: "Nissan",
    models: {
      "26": "Qashqai",
    },
  },
};

export const IMPORT_URL_TYPES = {
  SEARCH_RESULT_SOURCE: "SEARCH_RESULT_SOURCE",
  LISTING_DETAIL: "LISTING_DETAIL",
  UNKNOWN: "UNKNOWN",
};

export function buildImportFlowDraft({ url = "", manual = {} } = {}) {
  const normalizedUrl = cleanText(url);
  const source = detectSource(normalizedUrl);
  const urlType = detectUrlType(normalizedUrl);
  const urlSignals = extractSignalsFromUrl(normalizedUrl, urlType);
  const manualSignals = normalizeManualFields(manual);

  return {
    url: normalizedUrl,
    source,
    urlType,

    title: manualSignals.title || urlSignals.title || "",
    brand: manualSignals.brand || urlSignals.brand || "",
    model: manualSignals.model || urlSignals.model || "",
    fuel_type: manualSignals.fuel_type || urlSignals.fuel_type || "",

    price: manualSignals.price,
    mileage: manualSignals.mileage,
    year: manualSignals.year,

    externalId: urlSignals.externalId,
    confidence: calculateImportConfidence({
      urlSignals,
      manualSignals,
      urlType,
    }),

    missingFields: detectMissingFields({
      title: manualSignals.title || urlSignals.title,
      brand: manualSignals.brand || urlSignals.brand,
      model: manualSignals.model || urlSignals.model,
      price: manualSignals.price,
      mileage: manualSignals.mileage,
      year: manualSignals.year,
    }),

    userMessage: buildUserMessage({
      source,
      urlSignals,
      manualSignals,
      urlType,
    }),
  };
}

function detectSource(url) {
  const normalized = url.toLowerCase();

  if (normalized.includes("mobile.de")) return "mobile.de";
  if (normalized.includes("autoscout24")) return "autoscout24";
  if (normalized.includes("coches.net")) return "coches.net";

  return "unknown";
}

function detectUrlType(url) {
  const normalized = normalize(url);

  if (!normalized) {
    return IMPORT_URL_TYPES.UNKNOWN;
  }

  if (
    normalized.includes("/lst/") ||
    normalized.includes("/results") ||
    normalized.includes("/search") ||
    normalized.includes("homepage_search-mask") ||
    normalized.includes("sort=") ||
    normalized.includes("ustate=") ||
    normalized.includes("atype=")
  ) {
    return IMPORT_URL_TYPES.SEARCH_RESULT_SOURCE;
  }

  if (
    normalized.includes("/offer/") ||
    normalized.includes("/anuncio/") ||
    normalized.includes("/coches/") ||
    normalized.includes("/vehicle/") ||
    normalized.includes("adid=") ||
    normalized.includes("id=")
  ) {
    return IMPORT_URL_TYPES.LISTING_DETAIL;
  }

  return IMPORT_URL_TYPES.UNKNOWN;
}

function extractSignalsFromUrl(url, urlType = IMPORT_URL_TYPES.UNKNOWN) {
  const decoded = safeDecode(url);
  const mobileDeMs = extractMobileDeMs(decoded);
  const externalId = extractExternalId(decoded);

  const brand = mobileDeMs.brand || detectBrand(decoded);
  const model = mobileDeMs.model || detectModel(decoded, brand);
  const fuel_type = detectFuel(decoded);
  const title = buildTitle({ brand, model, fuel_type });

  return {
    externalId,
    brand,
    model,
    fuel_type,
    title,
    urlType,
    isSearchResultSource: urlType === IMPORT_URL_TYPES.SEARCH_RESULT_SOURCE,
    isListingDetail: urlType === IMPORT_URL_TYPES.LISTING_DETAIL,
  };
}

function extractMobileDeMs(url) {
  const match = url.match(/[?&]ms=([^&]+)/i);

  if (!match?.[1]) {
    return {
      brand: "",
      model: "",
    };
  }

  const decodedMs = safeDecode(match[1]);
  const parts = decodedMs.split(";");

  const brandCode = cleanText(parts[0]);
  const modelCode = cleanText(parts[1]);

  const reference = MOBILE_DE_MS_REFERENCE[brandCode];

  if (!reference) {
    return {
      brand: "",
      model: "",
    };
  }

  return {
    brand: reference.brand || "",
    model: reference.models?.[modelCode] || "",
  };
}

function extractExternalId(url) {
  const match = url.match(/[?&](id|adid)=(\d+)/i);
  return match?.[2] || "";
}

function detectBrand(text) {
  const normalized = normalize(text);

  const brands = [
    ["audi", ["audi", "ms=1900"]],
    ["bmw", ["bmw", "ms=3500"]],
    ["mercedes", ["mercedes", "mercedes-benz", "ms=17200"]],
    ["skoda", ["skoda", "ms=24100"]],
    ["volkswagen", ["volkswagen", "vw", "ms=25200"]],
    ["seat", ["seat", "ms=22500", "ms=22900"]],
    ["toyota", ["toyota"]],
    ["peugeot", ["peugeot"]],
    ["renault", ["renault"]],
    ["ford", ["ford"]],
    ["hyundai", ["hyundai"]],
    ["kia", ["kia"]],
    ["nissan", ["nissan"]],
    ["opel", ["opel"]],
    ["fiat", ["fiat"]],
    ["honda", ["honda"]],
    ["dacia", ["dacia"]],
    ["citroen", ["citroen", "citroën"]],
  ];

  for (const [brand, aliases] of brands) {
    if (aliases.some((alias) => normalized.includes(alias))) {
      return formatBrand(brand);
    }
  }

  return "";
}

function detectModel(text, brand) {
  const normalized = normalize(text);

  const models = {
    audi: ["a1", "a3", "a4", "a5", "a6", "q2", "q3", "q5", "q7"],
    bmw: ["116", "118", "120", "320", "330", "520", "530", "x1", "x3", "x5"],
    mercedes: ["a180", "a200", "c220", "e220", "cla", "glc", "gle"],
    skoda: ["fabia", "octavia", "superb", "karoq", "kodiaq"],
    volkswagen: ["golf", "passat", "tiguan", "touran", "polo", "arteon"],
    seat: ["leon", "león", "ateca", "ibiza", "arona", "tarraco"],
    toyota: ["corolla", "rav4", "yaris", "c-hr", "chr"],
    peugeot: ["208", "308", "3008", "5008"],
    renault: ["clio", "megane", "captur", "kadjar"],
    ford: ["focus", "fiesta", "kuga", "mondeo"],
    hyundai: ["i30", "tucson", "kona", "santa fe"],
    kia: ["ceed", "sportage", "sorento", "niro"],
    nissan: ["qashqai", "juke", "x-trail"],
    opel: ["corsa", "astra", "insignia", "mokka"],
    fiat: ["500", "tipo", "panda"],
    honda: ["civic", "cr-v", "hr-v"],
    dacia: ["sandero", "duster", "logan"],
    citroen: ["c3", "c4", "c5", "berlingo"],
  };

  const key = normalize(brand);
  const candidates = models[key] || [];

  for (const model of candidates) {
    if (normalized.includes(normalize(model))) {
      return formatModel(model);
    }
  }

  return "";
}

function detectFuel(text) {
  const normalized = normalize(text);

  if (
    normalized.includes("diesel") ||
    normalized.includes("tdi") ||
    normalized.includes("dci")
  ) {
    return "Diesel";
  }

  if (
    normalized.includes("hybrid") ||
    normalized.includes("phev") ||
    normalized.includes("e-hybrid")
  ) {
    return "Hybrid";
  }

  if (normalized.includes("electric") || normalized.includes("ev")) {
    return "Electric";
  }

  if (
    normalized.includes("gasolina") ||
    normalized.includes("petrol") ||
    normalized.includes("tsi")
  ) {
    return "Gasoline";
  }

  return "";
}

function buildTitle({ brand, model, fuel_type }) {
  return [brand, model, fuel_type].filter(Boolean).join(" ");
}

function normalizeManualFields(manual = {}) {
  return {
    title: cleanText(manual.title),
    brand: cleanText(manual.brand),
    model: cleanText(manual.model),
    fuel_type: cleanText(manual.fuel_type),
    price: safeNumber(manual.price),
    mileage: safeNumber(manual.mileage),
    year: safeNumber(manual.year),
  };
}

function detectMissingFields(draft) {
  const missing = [];

  if (!draft.price) missing.push("price");
  if (!draft.mileage) missing.push("mileage");
  if (!draft.year) missing.push("year");
  if (!draft.brand) missing.push("brand");
  if (!draft.model) missing.push("model");

  return missing;
}

function calculateImportConfidence({
  urlSignals,
  manualSignals,
  urlType = IMPORT_URL_TYPES.UNKNOWN,
}) {
  if (urlType === IMPORT_URL_TYPES.SEARCH_RESULT_SOURCE) {
    return Math.min(
      35,
      (urlSignals.brand ? 15 : 0) +
        (urlSignals.model ? 15 : 0) +
        (urlSignals.fuel_type ? 5 : 0)
    );
  }

  let score = 0;

  if (urlSignals.externalId) score += 15;
  if (urlSignals.brand || manualSignals.brand) score += 20;
  if (urlSignals.model || manualSignals.model) score += 20;
  if (urlSignals.fuel_type || manualSignals.fuel_type) score += 10;
  if (manualSignals.price) score += 15;
  if (manualSignals.mileage) score += 10;
  if (manualSignals.year) score += 10;

  return Math.min(100, score);
}

function buildUserMessage({
  source,
  urlSignals,
  manualSignals,
  urlType = IMPORT_URL_TYPES.UNKNOWN,
}) {
  if (!source || source === "unknown") {
    return "Pega una URL válida o introduce los datos manualmente.";
  }

  if (urlType === IMPORT_URL_TYPES.SEARCH_RESULT_SOURCE) {
    return "Esta URL es una búsqueda/listado. Sirve para descubrir candidatos, pero no se guardará como coche real hasta extraer anuncios concretos.";
  }

  const missingCore =
    !manualSignals.price ||
    !manualSignals.mileage ||
    !manualSignals.year;

  if (missingCore) {
    return `${source} puede bloquear la lectura automática. Añade precio, kilómetros y año para completar el análisis.`;
  }

  if (urlSignals.brand || urlSignals.model) {
    return "Datos principales preparados. Puedes analizar y guardar.";
  }

  return "Datos manuales preparados. Revisa marca y modelo antes de guardar.";
}

function formatBrand(value) {
  const map = {
    audi: "Audi",
    bmw: "BMW",
    mercedes: "Mercedes",
    skoda: "Skoda",
    volkswagen: "Volkswagen",
    seat: "SEAT",
    toyota: "Toyota",
    peugeot: "Peugeot",
    renault: "Renault",
    ford: "Ford",
    hyundai: "Hyundai",
    kia: "Kia",
    nissan: "Nissan",
    opel: "Opel",
    fiat: "Fiat",
    honda: "Honda",
    dacia: "Dacia",
    citroen: "Citroën",
  };

  return map[value] || cleanText(value);
}

function formatModel(value) {
  return cleanText(value)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
}

function safeDecode(value) {
  try {
    return decodeURIComponent(String(value || ""));
  } catch {
    return String(value || "");
  }
}

function cleanText(value) {
  return String(value || "").trim();
}

function normalize(value) {
  return cleanText(value).toLowerCase();
}

function safeNumber(value) {
  const cleaned = String(value || "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : 0;
}