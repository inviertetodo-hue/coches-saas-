const BRAND_PATTERNS = [
  "abarth",
  "alfa-romeo",
  "alfa",
  "audi",
  "bmw",
  "byd",
  "citroen",
  "cupra",
  "dacia",
  "fiat",
  "ford",
  "hyundai",
  "jaguar",
  "jeep",
  "kia",
  "land-rover",
  "range-rover",
  "lexus",
  "mazda",
  "mercedes-benz",
  "mercedes",
  "mg",
  "mini",
  "nissan",
  "opel",
  "peugeot",
  "porsche",
  "renault",
  "seat",
  "skoda",
  "škoda",
  "tesla",
  "toyota",
  "volkswagen",
  "vw",
  "volvo",
];

const MODEL_PATTERNS = [
  "fabia",
  "octavia",
  "superb",
  "kodiaq",
  "karoq",
  "kamiq",
  "golf",
  "passat",
  "polo",
  "tiguan",
  "touareg",
  "arteon",
  "id3",
  "id-3",
  "id4",
  "id-4",
  "leon",
  "ateca",
  "arona",
  "formentor",
  "born",
  "tavascan",
  "corolla",
  "yaris",
  "rav4",
  "land-cruiser",
  "camry",
  "prius",
  "chr",
  "c-hr",
  "x1",
  "x3",
  "x5",
  "x6",
  "x7",
  "m3",
  "m4",
  "m5",
  "serie-1",
  "serie-3",
  "serie-5",
  "a3",
  "a4",
  "a5",
  "a6",
  "a7",
  "q3",
  "q5",
  "q7",
  "q8",
  "rs3",
  "rs4",
  "rs5",
  "rs6",
  "rs7",
  "glc",
  "gle",
  "gls",
  "g63",
  "c63",
  "a45",
  "clase-a",
  "clase-c",
  "clase-e",
  "taycan",
  "cayenne",
  "macan",
  "panamera",
  "911",
  "model-3",
  "model-s",
  "model-x",
  "model-y",
  "xc40",
  "xc60",
  "xc90",
];

const MOBILE_DE_MS_REFERENCE = {
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

const PERFORMANCE_PATTERNS = [
  "amg",
  "competition",
  "rs",
  "rs3",
  "rs4",
  "rs5",
  "rs6",
  "rs7",
  "m-sport",
  "m340",
  "m440",
  "m3",
  "m4",
  "m5",
  "gti",
  "gtd",
  "gts",
  "gt-r",
  "quadrifoglio",
  "brabus",
];

const PREMIUM_PACKAGES = [
  "designo",
  "night",
  "exclusive",
  "performance",
  "line",
  "sport",
  "s-line",
  "m-sport",
  "avantgarde",
  "advanced",
  "edition",
  "full-options",
  "keramik",
];

const DRIVETRAIN_PATTERNS = [
  "quattro",
  "xdrive",
  "4matic",
  "4m",
  "4motion",
  "awd",
];

const BODY_PATTERNS = [
  "suv",
  "coupe",
  "cabrio",
  "avant",
  "touring",
  "wagon",
  "sedan",
  "shooting-brake",
  "familiar",
  "berlina",
];

const HIGH_LIQUIDITY_MODELS = [
  "x5",
  "gle",
  "q7",
  "glc",
  "q5",
  "tiguan",
  "golf",
  "octavia",
  "model-y",
  "model-3",
  "rav4",
  "corolla",
  "3008",
  "sportage",
  "tucson",
  "qashqai",
];

const LOW_LIQUIDITY_MODELS = [
  "g63",
  "rs6",
  "rs4",
  "m5",
  "c63",
  "gt-r",
  "panamera",
];

export function parseMobileDeUrl(url = "") {
  try {
    const normalizedUrl = normalizeText(url);

    if (!normalizedUrl.includes("mobile.de")) {
      return buildFallbackResult(url);
    }

    const slug = extractSlug(normalizedUrl);
    const queryTokens = extractQueryTokens(normalizedUrl);
    const msMatches = extractMsMatches(url);
    const singleMsMatch = getSingleReliableMsMatch(msMatches);

    const tokens = normalizeTokens([
      ...slug.split("-"),
      ...queryTokens,
    ]);

    const hasUsefulSlug = detectUsefulSlug(slug);

    const slugBrand = detectBrand(tokens);
    const slugModel = detectModel(tokens);
    const year = detectYear(tokens);

    const brand = slugBrand !== "Unknown"
      ? slugBrand
      : singleMsMatch?.brand || "Unknown";

    const model = slugModel || singleMsMatch?.model || null;

    const fuelType = detectFuelType(tokens, normalizedUrl);
    const semantic = buildSemanticProfile(tokens, fuelType, model);
    const title = hasUsefulSlug
      ? buildTitle(tokens)
      : buildTitleFromMsMatch(singleMsMatch);

    const performancePackage = detectPerformancePackage(tokens);
    const premiumPackage = detectPremiumPackage(tokens);
    const drivetrain = detectDrivetrain(tokens);
    const bodyType = detectBodyType(tokens, model);

    const luxuryScore = calculateLuxuryScore({
      semantic,
      performancePackage,
      premiumPackage,
      drivetrain,
      brand,
    });

    const liquidityProfile = detectLiquidityProfile({
      model,
      performancePackage,
      bodyType,
    });

    const marketSegment = detectMarketSegment({
      brand,
      performancePackage,
      bodyType,
      fuelType,
    });

    const riskProfile = detectRiskProfile({
      performancePackage,
      fuelType,
      luxuryScore,
      model,
    });

    const hasReliableIdentity =
      brand !== "Unknown" &&
      Boolean(model);

    const needsManualTitle =
      !hasReliableIdentity ||
      (msMatches.length > 1 && !hasUsefulSlug);

    return {
      source: "mobile.de",
      url,
      title,
      brand,
      model,
      year,
      semantic,
      drivetrain,
      fuelType,
      performancePackage,
      premiumPackage,
      bodyType,
      luxuryScore,
      liquidityProfile,
      marketSegment,
      riskProfile,
      needsManualTitle,
      possibleMatches: msMatches,
      confidence: calculateConfidence({
        brand,
        model,
        year,
        semantic,
        performancePackage,
        premiumPackage,
        hasUsefulSlug,
        hasReliableMsMatch: Boolean(singleMsMatch),
        hasMultipleMsMatches: msMatches.length > 1,
      }),
      extractedTokens: tokens,
      isValid: true,
    };
  } catch (error) {
    console.error("mobileDeAdapter error", error);
    return buildFallbackResult(url);
  }
}

function extractSlug(url) {
  const withoutQuery = url.split("?")[0];
  const parts = withoutQuery.split("/").filter(Boolean);

  const htmlPart = parts.find((part) => part.endsWith(".html"));

  if (!htmlPart) {
    return "";
  }

  const htmlIndex = parts.indexOf(htmlPart);
  const previousPart = parts[htmlIndex - 1] || "";

  if (
    previousPart &&
    previousPart !== "details.html" &&
    !previousPart.includes("fahrzeuge") &&
    !previousPart.includes("auto-inserat")
  ) {
    return previousPart.replace(/\.html$/i, "");
  }

  if (htmlPart !== "details.html") {
    return htmlPart.replace(/\.html$/i, "");
  }

  return "";
}

function extractQueryTokens(url) {
  try {
    const query = url.split("?")[1] || "";
    const params = new URLSearchParams(query);
    const tokens = [];

    const fuel = params.get("ft");

    if (fuel) {
      tokens.push(fuel);
    }

    return tokens;
  } catch {
    return [];
  }
}

function extractMsMatches(url = "") {
  try {
    const query = String(url).split("?")[1] || "";
    const params = new URLSearchParams(query);
    const rawMsValues = params.getAll("ms");
    const matches = [];

    for (const rawValue of rawMsValues) {
      const decodedValue = decodeURIComponent(rawValue || "");
      const [brandCode, modelCode] = decodedValue.split(";");

      const brandReference = MOBILE_DE_MS_REFERENCE[brandCode];

      if (!brandReference) {
        continue;
      }

      const model = brandReference.models?.[modelCode] || null;

      matches.push({
        brandCode,
        modelCode,
        brand: brandReference.brand,
        model,
      });
    }

    return matches;
  } catch {
    return [];
  }
}

function getSingleReliableMsMatch(matches = []) {
  const reliableMatches = matches.filter((match) => match.brand && match.model);

  if (reliableMatches.length !== 1) {
    return null;
  }

  return reliableMatches[0];
}

function buildTitleFromMsMatch(match) {
  if (!match?.brand && !match?.model) {
    return "Vehicle";
  }

  return [match.brand, match.model].filter(Boolean).join(" ");
}

function normalizeTokens(tokens = []) {
  return tokens
    .map((token) => normalizeText(token))
    .flatMap((token) => token.split(/[\s_+]+/))
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => !/^\d{6,}$/.test(token))
    .filter((token) => token !== "html");
}

function normalizeText(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/%c3%9f/g, "ss")
    .replace(/%c5%a1/g, "s")
    .replace(/%c5%a0/g, "s")
    .replace(/%c3%a9/g, "e")
    .replace(/%c3%a8/g, "e")
    .replace(/%c3%a1/g, "a")
    .replace(/%c3%a0/g, "a")
    .replace(/%c3%ad/g, "i")
    .replace(/%c3%b3/g, "o")
    .replace(/%c3%ba/g, "u")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function detectUsefulSlug(slug = "") {
  if (!slug) {
    return false;
  }

  if (slug.includes("details")) {
    return false;
  }

  if (/^\d+$/.test(slug)) {
    return false;
  }

  return slug.split("-").filter(Boolean).length >= 2;
}

function detectBrand(tokens = []) {
  for (const brand of BRAND_PATTERNS) {
    if (tokens.includes(brand)) {
      return normalizeBrand(brand);
    }
  }

  return "Unknown";
}

function normalizeBrand(brand) {
  switch (brand) {
    case "mercedes-benz":
    case "mercedes":
      return "Mercedes-Benz";

    case "land-rover":
      return "Land Rover";

    case "range-rover":
      return "Range Rover";

    case "volkswagen":
    case "vw":
      return "Volkswagen";

    case "skoda":
    case "škoda":
      return "Skoda";

    case "alfa-romeo":
    case "alfa":
      return "Alfa Romeo";

    case "citroen":
      return "Citroën";

    default:
      return brand.charAt(0).toUpperCase() + brand.slice(1);
  }
}

function detectYear(tokens = []) {
  const currentYear = new Date().getFullYear();

  for (const token of tokens) {
    const number = Number(token);

    if (
      Number.isFinite(number) &&
      number >= 2000 &&
      number <= currentYear + 1
    ) {
      return number;
    }
  }

  return null;
}

function detectModel(tokens = []) {
  for (const model of MODEL_PATTERNS) {
    if (tokens.includes(model)) {
      return normalizeModel(model);
    }
  }

  return null;
}

function normalizeModel(model) {
  return model
    .replace("model-3", "Model 3")
    .replace("model-s", "Model S")
    .replace("model-x", "Model X")
    .replace("model-y", "Model Y")
    .replace("serie-1", "Serie 1")
    .replace("serie-3", "Serie 3")
    .replace("serie-5", "Serie 5")
    .replace("clase-a", "Clase A")
    .replace("clase-c", "Clase C")
    .replace("clase-e", "Clase E")
    .replace("id-3", "ID.3")
    .replace("id3", "ID.3")
    .replace("id-4", "ID.4")
    .replace("id4", "ID.4")
    .toUpperCase();
}

function detectPerformancePackage(tokens = []) {
  for (const item of PERFORMANCE_PATTERNS) {
    if (tokens.includes(item)) {
      return item.toUpperCase();
    }
  }

  return null;
}

function detectPremiumPackage(tokens = []) {
  for (const item of PREMIUM_PACKAGES) {
    if (tokens.includes(item)) {
      return item;
    }
  }

  return null;
}

function detectDrivetrain(tokens = []) {
  for (const item of DRIVETRAIN_PATTERNS) {
    if (tokens.includes(item)) {
      return item.toUpperCase();
    }
  }

  return null;
}

function detectBodyType(tokens = [], model = "") {
  for (const item of BODY_PATTERNS) {
    if (tokens.includes(item)) {
      return normalizeBodyType(item);
    }
  }

  const suvModels = [
    "x1",
    "x3",
    "x5",
    "x6",
    "x7",
    "gle",
    "glc",
    "gls",
    "g63",
    "q3",
    "q5",
    "q7",
    "q8",
    "tiguan",
    "touareg",
    "kodiaq",
    "karoq",
    "kamiq",
    "rav4",
    "xc40",
    "xc60",
    "xc90",
    "model-y",
    "model-x",
    "3008",
    "sportage",
    "tucson",
    "qashqai",
  ];

  const normalizedModel = normalizeText(model);

  if (
    suvModels.some((item) =>
      tokens.includes(item) || normalizedModel.includes(item)
    )
  ) {
    return "SUV";
  }

  return null;
}

function normalizeBodyType(bodyType) {
  if (bodyType === "avant" || bodyType === "touring" || bodyType === "wagon") {
    return "wagon";
  }

  if (bodyType === "berlina") {
    return "sedan";
  }

  return bodyType;
}

function detectFuelType(tokens = [], url = "") {
  const joined = tokens.join(" ");
  const text = `${joined} ${url}`;

  if (
    text.includes("electricity") ||
    text.includes("electric") ||
    text.includes("ev") ||
    text.includes("bev")
  ) {
    return "Electric";
  }

  if (
    text.includes("hybrid") ||
    text.includes("phev") ||
    text.includes("plugin") ||
    text.includes("plug-in")
  ) {
    return "Hybrid";
  }

  if (
    text.includes("diesel") ||
    text.includes("-d-") ||
    tokens.includes("tdi") ||
    tokens.includes("cdi")
  ) {
    return "Diesel";
  }

  return "Combustion";
}

function calculateLuxuryScore({
  semantic,
  performancePackage,
  premiumPackage,
  drivetrain,
  brand,
}) {
  let score = 35;

  if (isPremiumBrandName(brand)) {
    score += 15;
  }

  if (semantic.isPremium) {
    score += 20;
  }

  if (semantic.isPerformance) {
    score += 20;
  }

  if (performancePackage) {
    score += 10;
  }

  if (premiumPackage) {
    score += 5;
  }

  if (drivetrain) {
    score += 5;
  }

  return Math.min(score, 100);
}

function detectLiquidityProfile({
  model,
  performancePackage,
  bodyType,
}) {
  const normalizedModel = normalizeText(model);

  if (
    LOW_LIQUIDITY_MODELS.some((item) => normalizedModel.includes(item))
  ) {
    return "Low Liquidity";
  }

  if (
    HIGH_LIQUIDITY_MODELS.some((item) => normalizedModel.includes(item))
  ) {
    return "High Liquidity";
  }

  if (performancePackage && bodyType === "SUV") {
    return "Medium Liquidity";
  }

  return "Standard Liquidity";
}

function detectRiskProfile({
  performancePackage,
  fuelType,
  luxuryScore,
  model,
}) {
  let risk = "Moderate";

  if (performancePackage) {
    risk = "High";
  }

  if (luxuryScore >= 80 && performancePackage) {
    risk = "Very High";
  }

  if (fuelType === "Electric") {
    risk = "Technology Sensitive";
  }

  if (normalizeText(model).includes("g63")) {
    risk = "Ultra Premium Risk";
  }

  return risk;
}

function detectMarketSegment({
  brand,
  performancePackage,
  bodyType,
  fuelType,
}) {
  if (performancePackage && bodyType === "SUV") {
    return "Performance Luxury SUV";
  }

  if (fuelType === "Electric") {
    return "Electric Premium";
  }

  if (isPremiumBrandName(brand)) {
    return "Premium";
  }

  return "General";
}

function buildSemanticProfile(tokens = [], fuelType = "", model = "") {
  const joined = tokens.join(" ");
  const normalizedModel = normalizeText(model);

  return {
    isHybrid:
      fuelType === "Hybrid" ||
      joined.includes("hybrid") ||
      joined.includes("phev") ||
      joined.includes("plugin"),

    isElectric:
      fuelType === "Electric" ||
      joined.includes("electric") ||
      joined.includes("ev") ||
      joined.includes("tesla"),

    isPerformance:
      PERFORMANCE_PATTERNS.some((item) => tokens.includes(item)),

    isSuv:
      joined.includes("suv") ||
      [
        "x1",
        "x3",
        "x5",
        "x6",
        "x7",
        "gle",
        "glc",
        "gls",
        "q3",
        "q5",
        "q7",
        "q8",
        "kodiaq",
        "karoq",
        "kamiq",
        "rav4",
        "xc40",
        "xc60",
        "xc90",
        "g63",
        "3008",
        "sportage",
        "tucson",
        "qashqai",
      ].some((item) => tokens.includes(item) || normalizedModel.includes(item)),

    isPremium:
      joined.includes("amg") ||
      joined.includes("performance") ||
      joined.includes("night") ||
      joined.includes("designo") ||
      joined.includes("s-line") ||
      joined.includes("m-sport"),
  };
}

function buildTitle(tokens = []) {
  return tokens
    .slice(0, 14)
    .map((token) => {
      if (token.length <= 2) {
        return token.toUpperCase();
      }

      return token.charAt(0).toUpperCase() + token.slice(1);
    })
    .join(" ");
}

function calculateConfidence({
  brand,
  model,
  year,
  semantic,
  performancePackage,
  premiumPackage,
  hasUsefulSlug,
  hasReliableMsMatch,
  hasMultipleMsMatches,
}) {
  let score = hasUsefulSlug ? 35 : 15;

  if (hasReliableMsMatch) {
    score += 25;
  }

  if (hasMultipleMsMatches) {
    score -= 20;
  }

  if (brand !== "Unknown") {
    score += 20;
  }

  if (model) {
    score += 20;
  }

  if (year) {
    score += 10;
  }

  if (semantic.isPremium) {
    score += 5;
  }

  if (semantic.isPerformance) {
    score += 5;
  }

  if (performancePackage) {
    score += 5;
  }

  if (premiumPackage) {
    score += 5;
  }

  return Math.max(0, Math.min(score, 100));
}

function isPremiumBrandName(brand = "") {
  const normalizedBrand = normalizeText(brand);

  return [
    "audi",
    "bmw",
    "mercedes",
    "mercedes-benz",
    "porsche",
    "tesla",
    "lexus",
    "land rover",
    "range rover",
    "jaguar",
    "volvo",
  ].some((item) => normalizedBrand.includes(item));
}

function buildFallbackResult(url) {
  return {
    source: "unknown",
    url,
    title: "Vehicle",
    brand: "Unknown",
    model: null,
    year: null,
    confidence: 0,
    drivetrain: null,
    fuelType: null,
    performancePackage: null,
    premiumPackage: null,
    bodyType: null,
    luxuryScore: 0,
    liquidityProfile: "Unknown",
    marketSegment: "Unknown",
    riskProfile: "Unknown",
    needsManualTitle: true,
    possibleMatches: [],
    semantic: {
      isHybrid: false,
      isElectric: false,
      isPerformance: false,
      isSuv: false,
      isPremium: false,
    },
    extractedTokens: [],
    isValid: false,
  };
}