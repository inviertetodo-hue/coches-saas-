const DEFAULT_TIMEOUT_MS = 25000;

export async function extractAutoScoutDetailFromUrl(url = "", options = {}) {
  const originalUrl = String(url || "").trim();

  if (!originalUrl || !originalUrl.startsWith("http")) {
    return buildErrorResult({
      originalUrl,
      error: "URL inválida. Debe ser una URL individual de anuncio.",
    });
  }

  const jinaUrl = buildJinaUrl(originalUrl);

  try {
    const text = await fetchText(jinaUrl, {
      timeoutMs: options.timeoutMs || DEFAULT_TIMEOUT_MS,
    });

    const detail = parseAutoScoutDetailText({
      text,
      originalUrl,
      jinaUrl,
    });

    return {
      status: detail.qualityScore >= 70 ? "ready" : "low_quality",
      source: "autoscout_detail_jina",
      originalUrl,
      jinaUrl,
      detail,
      diagnostics: [
        `Raw length: ${text.length}`,
        `Fotos detectadas: ${detail.images.length}`,
        `Quality score: ${detail.qualityScore}/100`,
      ],
      rawText: options.includeRawText ? text : "",
      extractedAt: new Date().toISOString(),
    };
  } catch (error) {
    return buildErrorResult({
      originalUrl,
      jinaUrl,
      error: error?.message || "Error desconocido extrayendo ficha.",
    });
  }
}

export function parseAutoScoutDetailText({ text = "", originalUrl = "", jinaUrl = "" }) {
  const raw = String(text || "");

  const title = cleanTitle(
    findFirst([
      /^Title:\s*(.+)$/im,
      /^#\s*(.+)$/im,
      /^(BMW\s+X5.+)$/im,
      /^(Alfa\s+Romeo\s+Giulia.+)$/im,
      /^(Mercedes-Benz.+)$/im,
      /^(Audi.+)$/im,
      /^(Porsche.+)$/im,
    ], raw)
  );

  const price = extractPrice(raw);
  const km = extractMileage(raw);
  const year = extractYear(raw);
  const fuelType = extractFuelType(raw);
  const powerKw = extractPowerKw(raw);
  const hp = powerKw ? Math.round(powerKw * 1.35962) : 0;
  const sellerName = extractSellerName(raw);
  const location = extractLocation(raw);
  const transmission = extractTransmission(raw);
  const bodyType = extractBodyType(raw);
  const drivetrain = extractDrivetrain(raw);
  const images = extractImages(raw);
  const equipment = extractEquipment(raw);

  const brand = detectBrand(`${title} ${raw.slice(0, 1200)}`);
  const model = detectModel(`${title} ${raw.slice(0, 1200)}`, brand);

  const detail = {
    title,
    brand,
    model,
    price,
    year,
    km,
    mileage: km,
    fuelType,
    powerKw,
    hp,
    transmission,
    bodyType,
    drivetrain,
    sellerName,
    location,
    equipment,
    images,
    imageUrl: images[0] || "",
    originalUrl,
    url: originalUrl,
    jinaUrl,
    rawLength: raw.length,
  };

  return {
    ...detail,
    qualityScore: buildDetailQualityScore(detail),
    verification: buildVerification(detail),
  };
}

function buildErrorResult({ originalUrl = "", jinaUrl = "", error = "" }) {
  return {
    status: "error",
    source: "autoscout_detail_jina",
    originalUrl,
    jinaUrl,
    detail: null,
    diagnostics: [error],
    rawText: "",
    extractedAt: new Date().toISOString(),
  };
}

function buildJinaUrl(url) {
  return `https://r.jina.ai/http://${String(url)
    .trim()
    .replace(/^https?:\/\//, "")}`;
}

async function fetchText(url, { timeoutMs }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "text/plain,text/markdown,text/html,*/*",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function findFirst(patterns, text) {
  for (const pattern of patterns) {
    const match = String(text || "").match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  return "";
}

function cleanTitle(value = "") {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\s+-\s+AutoScout24.*$/i, "")
    .trim();
}

function extractPrice(text) {
  const values = [...String(text || "").matchAll(/€\s*([0-9]{1,3}(?:[.\s][0-9]{3})+|[0-9]{4,6})/g)]
    .map((match) => toNumber(match[1]))
    .filter((value) => value >= 1000 && value <= 500000);

  return values[0] || 0;
}

function extractMileage(text) {
  const values = [...String(text || "").matchAll(/([0-9]{1,3}(?:[.\s][0-9]{3})+|[0-9]{4,6})\s*km\b/gi)]
    .map((match) => toNumber(match[1]))
    .filter((value) => value >= 1000 && value <= 500000);

  return values[0] || 0;
}

function extractYear(text) {
  const patterns = [
    /\b(?:Erstzulassung|Eerste registratie|First registration|EZ)\D{0,30}(20[0-9]{2}|19[0-9]{2})\b/i,
    /\b(?:0[1-9]|1[0-2])\/(20[0-9]{2}|19[0-9]{2})\b/i,
    /\b(20[0-9]{2}|19[8-9][0-9])\b/i,
  ];

  for (const pattern of patterns) {
    const match = String(text || "").match(pattern);
    const year = Number(match?.[1] || 0);

    if (year >= 1980 && year <= new Date().getFullYear() + 1) {
      return year;
    }
  }

  return 0;
}

function extractPowerKw(text) {
  const match = String(text || "").match(/\b([0-9]{2,3})\s*kW\b/i);
  const value = Number(match?.[1] || 0);

  return value >= 30 && value <= 900 ? value : 0;
}

function extractFuelType(text) {
  const source = String(text || "").toLowerCase();

  if (source.includes("elektro/benzin") || source.includes("electric/gasoline")) return "PHEV";
  if (source.includes("hybrid") || source.includes("hybride")) return "Hybrid";
  if (source.includes("diesel")) return "Diesel";
  if (source.includes("benzine") || source.includes("benzin") || source.includes("gasolina") || source.includes("petrol")) return "Gasolina";
  if (source.includes("elektro") || source.includes("electric") || source.includes("elektrisch")) return "Eléctrico";

  return "";
}

function extractTransmission(text) {
  const source = String(text || "").toLowerCase();

  if (source.includes("automatik") || source.includes("automatic") || source.includes("automaat")) return "Automático";
  if (source.includes("schaltgetriebe") || source.includes("manual")) return "Manual";

  return "";
}

function extractBodyType(text) {
  const source = String(text || "").toLowerCase();

  if (source.includes("suv") || source.includes("geländewagen")) return "SUV";
  if (source.includes("kombi")) return "Familiar";
  if (source.includes("limousine")) return "Berlina";
  if (source.includes("coupé") || source.includes("coupe")) return "Coupé";

  return "";
}

function extractDrivetrain(text) {
  const source = String(text || "").toLowerCase();

  if (source.includes("allrad") || source.includes("xdrive") || source.includes("4x4")) return "AWD";
  if (source.includes("heckantrieb")) return "RWD";
  if (source.includes("frontantrieb")) return "FWD";

  return "";
}

function extractSellerName(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const sellerIndex = lines.findIndex((line) =>
    /^Verkäufer$|^Händler$|^Seller$/i.test(line)
  );

  if (sellerIndex >= 0) {
    return lines.slice(sellerIndex + 1, sellerIndex + 6).find((line) =>
      line.length > 2 &&
      !/kontakt|geschlossen|öffnet|details|anbieter/i.test(line)
    ) || "";
  }

  return "";
}

function extractLocation(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const titleIndex = lines.findIndex((line) =>
    /^BMW|^Alfa Romeo|^Mercedes|^Audi|^Porsche|^Volkswagen|^Volvo|^Toyota/i.test(line)
  );

  if (titleIndex >= 0) {
    return lines.slice(titleIndex + 1, titleIndex + 6).find((line) =>
      /^[A-ZÄÖÜÑÁÉÍÓÚ0-9\s-]{4,}$/.test(line) &&
      !line.includes("€")
    ) || "";
  }

  return "";
}

function extractImages(text) {
  const markdownImages = [...String(text || "").matchAll(/!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g)]
    .map((match) => match[1]);

  const directImages = [...String(text || "").matchAll(/https?:\/\/[^\s)"']+\.(?:jpg|jpeg|png|webp)(?:\/[^\s)"']*)?/gi)]
    .map((match) => match[0]);

  const all = unique([...markdownImages, ...directImages])
    .filter((url) =>
      url.includes("pictures.autoscout24") ||
      url.includes("listing-images")
    );

  const preferred = all.filter((url) => url.includes("1920x1080") || url.includes("1024") || url.includes("800"));

  return unique([...(preferred.length ? preferred : all), ...all]).slice(0, 40);
}

function extractEquipment(text) {
  const source = String(text || "");

  const known = [
    "Head-up display",
    "HUD",
    "Panoramadach",
    "panorama",
    "Trekhaak",
    "Anhängerkupplung",
    "360",
    "Kamera",
    "Rückfahrkamera",
    "LED",
    "Laser",
    "Leder",
    "Vollleder",
    "Memory",
    "Sitzheizung",
    "Lenkradheizung",
    "Navigation",
    "Harman",
    "Bowers",
    "M Sport",
    "Keyless",
    "Adaptive",
    "Cruise Control",
    "Blind Spot",
    "Dodehoek",
  ];

  return unique(
    known.filter((item) =>
      source.toLowerCase().includes(item.toLowerCase())
    )
  ).slice(0, 24);
}

function detectBrand(text) {
  const source = String(text || "").toLowerCase();

  const brands = [
    "BMW",
    "Alfa Romeo",
    "Mercedes-Benz",
    "Audi",
    "Porsche",
    "Volkswagen",
    "Volvo",
    "Toyota",
    "Lexus",
    "Land Rover",
    "Range Rover",
    "Jaguar",
    "Tesla",
    "Cupra",
    "Skoda",
    "Peugeot",
    "Renault",
    "Citroën",
    "Citroen",
  ];

  return brands.find((brand) => source.includes(brand.toLowerCase())) || "";
}

function detectModel(text, brand) {
  const source = String(text || "").toLowerCase();

  const models = [
    "X5",
    "X3",
    "X6",
    "Giulia",
    "Stelvio",
    "Cayenne",
    "Macan",
    "Q5",
    "Q7",
    "GLE",
    "GLC",
    "XC60",
    "XC90",
    "RAV4",
    "3008",
    "Berlingo",
  ];

  return models.find((model) => source.includes(model.toLowerCase())) || "";
}

function buildDetailQualityScore(detail) {
  let score = 0;

  if (detail.title && detail.title.length >= 8) score += 15;
  if (detail.brand) score += 10;
  if (detail.model) score += 10;
  if (detail.price) score += 12;
  if (detail.km) score += 12;
  if (detail.year) score += 12;
  if (detail.fuelType) score += 8;
  if (detail.powerKw) score += 8;
  if (detail.images.length >= 8) score += 13;
  else if (detail.images.length >= 3) score += 8;
  else if (detail.images.length >= 1) score += 4;

  return Math.min(score, 100);
}

function buildVerification(detail) {
  const missing = [];

  if (!detail.brand) missing.push("brand");
  if (!detail.model) missing.push("model");
  if (!detail.price) missing.push("price");
  if (!detail.km) missing.push("km");
  if (!detail.year) missing.push("year");
  if (!detail.images.length) missing.push("images");

  return {
    isVerifiedDetail: missing.length === 0,
    missing,
    canShowAsDetailCard: missing.length <= 1 && detail.images.length > 0,
    canScoreAsOpportunity: missing.length === 0,
  };
}

function toNumber(value) {
  return Number(String(value || "").replace(/\D/g, "")) || 0;
}

function unique(items) {
  const seen = new Set();
  const output = [];

  for (const item of items) {
    if (!item || seen.has(item)) continue;
    seen.add(item);
    output.push(item);
  }

  return output;
}
