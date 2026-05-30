export function buildImportFlowDraft({ url = "", manual = {} } = {}) {
  const normalizedUrl = cleanText(url);
  const source = detectSource(normalizedUrl);
  const urlSignals = extractSignalsFromUrl(normalizedUrl);
  const manualSignals = normalizeManualFields(manual);

  const draft = {
    url: normalizedUrl,
    source,

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
    }),
  };

  return draft;
}

function detectSource(url) {
  const normalized = url.toLowerCase();

  if (normalized.includes("mobile.de")) return "mobile.de";
  if (normalized.includes("autoscout24")) return "autoscout24";
  if (normalized.includes("coches.net")) return "coches.net";

  return "unknown";
}

function extractSignalsFromUrl(url) {
  const decoded = safeDecode(url);
  const externalId = extractExternalId(decoded);
  const brand = detectBrand(decoded);
  const model = detectModel(decoded, brand);
  const fuel_type = detectFuel(decoded);
  const title = buildTitle({ brand, model, fuel_type });

  return {
    externalId,
    brand,
    model,
    fuel_type,
    title,
  };
}

function extractExternalId(url) {
  const match = url.match(/[?&]id=(\d+)/i);
  return match?.[1] || "";
}

function detectBrand(text) {
  const normalized = normalize(text);

  const brands = [
    ["audi", ["audi", "ms=1900"]],
    ["bmw", ["bmw", "ms=3500"]],
    ["mercedes", ["mercedes", "mercedes-benz", "ms=17200"]],
    ["skoda", ["skoda", "ms=24100"]],
    ["volkswagen", ["volkswagen", "vw", "ms=25200"]],
    ["seat", ["seat", "ms=22500"]],
    ["toyota", ["toyota", "ms=24100"]],
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
    seat: ["leon", "ateca", "ibiza", "arona", "tarraco"],
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

  if (normalized.includes("diesel") || normalized.includes("tdi") || normalized.includes("dci")) {
    return "Diesel";
  }

  if (normalized.includes("hybrid") || normalized.includes("phev") || normalized.includes("e-hybrid")) {
    return "Hybrid";
  }

  if (normalized.includes("electric") || normalized.includes("ev")) {
    return "Electric";
  }

  if (normalized.includes("gasolina") || normalized.includes("petrol") || normalized.includes("tsi")) {
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

function calculateImportConfidence({ urlSignals, manualSignals }) {
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

function buildUserMessage({ source, urlSignals, manualSignals }) {
  if (!source || source === "unknown") {
    return "Pega una URL válida o introduce los datos manualmente.";
  }

  const missingCore =
    !manualSignals.price || !manualSignals.mileage || !manualSignals.year;

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