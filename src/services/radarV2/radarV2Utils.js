import { VEHICLE_CATALOG } from "../vehicleCatalog";

export function normalizeText(value = "") {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&amp;/g, "&")
    .replace(/[-_/]+/g, " ")
    .replace(/[^a-z0-9€.%\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function cleanText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function safeNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const text = String(value || "")
    .replace(/\./g, "")
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");

  const number = Number(text);
  return Number.isFinite(number) ? number : 0;
}

export function extractPrice(text = "") {
  const source = String(text || "");
  const matches = [
    ...source.matchAll(/(?:€|eur)\s*([0-9]{1,3}(?:[.\s][0-9]{3})+|[0-9]{4,6})/gi),
    ...source.matchAll(/([0-9]{1,3}(?:[.\s][0-9]{3})+|[0-9]{4,6})\s*(?:€|eur)/gi),
  ];

  return matches
    .map((match) => safeNumber(match[1]))
    .filter((value) => value >= 1000 && value <= 250000)
    .sort((a, b) => a - b)[0] || 0;
}

export function extractMileage(text = "") {
  const source = String(text || "");
  const matches = [
    ...source.matchAll(/([0-9]{1,3}(?:[.\s][0-9]{3})+|[0-9]{4,6})\s*km\b/gi),
    ...source.matchAll(/kilometerstand\s*([0-9]{1,3}(?:[.\s][0-9]{3})+|[0-9]{4,6})/gi),
    ...source.matchAll(/mileage\s*([0-9]{1,3}(?:[.\s][0-9]{3})+|[0-9]{4,6})/gi),
  ];

  return matches
    .map((match) => safeNumber(match[1]))
    .filter((value) => value >= 500 && value <= 500000)
    .sort((a, b) => a - b)[0] || 0;
}

export function extractYear(text = "") {
  const source = String(text || "");
  const currentYear = new Date().getFullYear();

  const registration = source.match(/\b(?:0[1-9]|1[0-2])[-/](20\d{2}|19\d{2})\b/);
  if (registration?.[1]) {
    const year = safeNumber(registration[1]);
    if (year >= 1990 && year <= currentYear + 1) return year;
  }

  const yearMatch = source.match(/\b(20\d{2}|19\d{2})\b/);
  const year = yearMatch?.[1] ? safeNumber(yearMatch[1]) : 0;
  return year >= 1990 && year <= currentYear + 1 ? year : 0;
}

export function extractPowerKw(text = "") {
  const source = String(text || "");
  const kw = source.match(/\b([0-9]{2,3})\s*kW\b/i);
  if (kw?.[1]) {
    const value = safeNumber(kw[1]);
    if (value >= 30 && value <= 900) return value;
  }

  const hp = source.match(/\b([0-9]{2,4})\s*(?:PS|hp|cv)\b/i);
  if (hp?.[1]) {
    const value = Math.round(safeNumber(hp[1]) / 1.35962);
    if (value >= 30 && value <= 900) return value;
  }

  return 0;
}

export function detectFuelType(text = "") {
  const value = normalizeText(text);

  if (value.includes("elektro benzin") || value.includes("electric gasoline") || value.includes("plug in hybrid") || value.includes("phev")) return "PHEV";
  if (value.includes("elektro diesel") || value.includes("electric diesel")) return "PHEV";
  if (value.includes("hybrid") || value.includes("mhev") || value.includes("hev")) return "Hybrid";
  if (value.includes("electric") || value.includes("elektro") || value.includes("electrique") || value.includes("electrico")) return "Electric";
  if (value.includes("diesel")) return "Diesel";
  if (value.includes("benzin") || value.includes("gasoline") || value.includes("petrol") || value.includes("gasolina")) return "Gasoline";

  return "";
}

export function detectBrand(text = "") {
  const source = normalizeText(text);

  const aliases = [
    { keys: ["mercedes benz", "mercedes", "benz"], value: "Mercedes-Benz" },
    { keys: ["vw", "volkswagen"], value: "Volkswagen" },
    { keys: ["land rover", "range rover"], value: "Land Rover" },
    { keys: ["citroen", "citroën"], value: "Citroën" },
    { keys: ["skoda", "škoda"], value: "Skoda" },
    { keys: ["bmw"], value: "BMW" },
    { keys: ["audi"], value: "Audi" },
    { keys: ["tesla"], value: "Tesla" },
    { keys: ["peugeot"], value: "Peugeot" },
    { keys: ["kia"], value: "Kia" },
    { keys: ["hyundai"], value: "Hyundai" },
    { keys: ["nissan"], value: "Nissan" },
    { keys: ["renault"], value: "Renault" },
    { keys: ["toyota"], value: "Toyota" },
    { keys: ["ford"], value: "Ford" },
    { keys: ["porsche"], value: "Porsche" },
    { keys: ["volvo"], value: "Volvo" },
    { keys: ["cupra"], value: "Cupra" },
    { keys: ["seat"], value: "SEAT" },
    { keys: ["opel"], value: "Opel" },
    { keys: ["fiat"], value: "Fiat" },
    { keys: ["honda"], value: "Honda" },
    { keys: ["mazda"], value: "Mazda" },
    { keys: ["dacia"], value: "Dacia" },
    { keys: ["jeep"], value: "Jeep" },
  ];

  const alias = aliases.find((item) =>
    item.keys.some((key) => hasPhrase(source, normalizeText(key)))
  );

  if (alias) return alias.value;

  return Object.keys(VEHICLE_CATALOG || {})
    .sort((a, b) => normalizeText(b).length - normalizeText(a).length)
    .find((brand) => hasPhrase(source, normalizeText(brand))) || "";
}

export function detectModel(text = "", brand = "") {
  const source = normalizeText(text);
  const catalog = VEHICLE_CATALOG || {};

  const brandModels = brand && Array.isArray(catalog[brand]) ? catalog[brand] : [];
  const allModels = Object.values(catalog).flat().filter(Boolean);

  const models = (brandModels.length > 0 ? brandModels : allModels)
    .slice()
    .sort((a, b) => normalizeText(b).length - normalizeText(a).length);

  const matched = models.find((model) => hasPhrase(source, normalizeText(model)));
  if (matched) return formatModel(matched, brand);

  // Si la marca es conocida y tiene catálogo propio, no caer a alias
  // genéricos de otras marcas (x5, gle, q5...) por contaminación de bloque.
  if (brandModels.length > 0) return "";

  const aliases = [
    { keys: ["model 3", "model-3"], value: "Model 3" },
    { keys: ["model y", "model-y"], value: "Model Y" },
    { keys: ["model s", "model-s"], value: "Model S" },
    { keys: ["model x", "model-x"], value: "Model X" },
    { keys: ["e 2008", "e-2008", "e2008"], value: "e-2008" },
    { keys: ["e 208", "e-208", "e208"], value: "e-208" },
    { keys: ["e 3008", "e-3008", "e3008"], value: "e-3008" },
    { keys: ["x5"], value: "X5" },
    { keys: ["x3"], value: "X3" },
    { keys: ["gle"], value: "GLE" },
    { keys: ["q5"], value: "Q5" },
    { keys: ["tucson"], value: "Tucson" },
    { keys: ["sportage"], value: "Sportage" },
    { keys: ["3008"], value: "3008" },
    { keys: ["2008"], value: "2008" },
  ];

  return aliases.find((item) =>
    item.keys.some((key) => hasPhrase(source, normalizeText(key)))
  )?.value || "";
}

export function formatModel(model = "", brand = "") {
  const normalized = normalizeText(model);

  const direct = {
    "model 3": "Model 3",
    "model y": "Model Y",
    "model s": "Model S",
    "model x": "Model X",
    "e 2008": "e-2008",
    "e 208": "e-208",
    "e 3008": "e-3008",
    x5: "X5",
    x3: "X3",
    gle: "GLE",
    q5: "Q5",
  };

  if (direct[normalized]) return direct[normalized];

  if (/^[0-9]{3,4}$/.test(normalized)) return normalized;

  return normalized
    .split(" ")
    .map((part) => {
      if (/^ev\d+$/i.test(part)) return part.toUpperCase();
      if (/^ix\d*$/i.test(part)) return `i${part.slice(1).toUpperCase()}`;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

export function hasPhrase(text = "", phrase = "") {
  if (!phrase) return false;
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(text);
}

export function buildListingTitle({ brand, model, year, fuelType, powerKw }) {
  const power = powerKw ? `${powerKw} kW / ${Math.round(powerKw * 1.35962)} hp` : "";
  return [brand, model, year, fuelType, power].filter(Boolean).join(" · ");
}

export function uniqueBy(items = [], keyFn) {
  const seen = new Set();

  return items.filter((item) => {
    const key = keyFn(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function estimateMarketMultiplier({ price, mileage, year }) {
  let multiplier = 1;

  if (year >= 2024) multiplier += 0.08;
  else if (year >= 2022) multiplier += 0.04;
  else if (year < 2020) multiplier -= 0.08;

  if (mileage <= 25000) multiplier += 0.06;
  else if (mileage <= 60000) multiplier += 0.03;
  else if (mileage > 120000) multiplier -= 0.08;

  if (price <= 25000) multiplier += 0.03;
  else if (price >= 60000) multiplier -= 0.03;

  return Number(multiplier.toFixed(3));
}
