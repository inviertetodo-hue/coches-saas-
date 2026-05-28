const BRAND_PATTERNS = [
  "bmw",
  "audi",
  "mercedes-benz",
  "mercedes",
  "porsche",
  "volkswagen",
  "toyota",
  "lexus",
  "tesla",
  "cupra",
  "seat",
  "peugeot",
  "renault",
  "kia",
  "hyundai",
  "volvo",
  "land-rover",
  "range-rover",
];

const PERFORMANCE_PATTERNS = [
  "amg",
  "competition",
  "rs",
  "m-sport",
  "m340",
  "m440",
  "m3",
  "m4",
  "m5",
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
];

const DRIVETRAIN_PATTERNS = [
  "quattro",
  "xdrive",
  "4matic",
  "4motion",
  "awd",
];

export function parseMobileDeUrl(url = "") {
  try {
    const normalizedUrl = String(url).toLowerCase();

    if (!normalizedUrl.includes("mobile.de")) {
      return buildFallbackResult(url);
    }

    const slug = extractSlug(normalizedUrl);

    const tokens = slug
      .split("-")
      .map((token) => token.trim())
      .filter(Boolean);

    const brand = detectBrand(tokens);

    const year = detectYear(tokens);

    const semantic = buildSemanticProfile(tokens);

    const title = buildTitle(tokens);

    const performancePackage =
      detectPerformancePackage(tokens);

    const premiumPackage =
      detectPremiumPackage(tokens);

    const drivetrain =
      detectDrivetrain(tokens);

    const fuelType =
      detectFuelType(tokens);

    const model =
      detectModel(tokens);

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
      confidence: calculateConfidence({
        brand,
        year,
        semantic,
        performancePackage,
        premiumPackage,
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
  const parts = url.split("/");

  return parts[parts.length - 1] || "";
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
      return "Mercedes-Benz";

    case "land-rover":
      return "Land Rover";

    case "range-rover":
      return "Range Rover";

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
  const modelPatterns = [
    "g63",
    "gle",
    "x5",
    "x3",
    "q7",
    "rs6",
    "a45",
    "c63",
    "m3",
    "m5",
    "glc",
    "xc90",
    "taycan",
    "cayenne",
  ];

  for (const model of modelPatterns) {
    if (tokens.includes(model)) {
      return model.toUpperCase();
    }
  }

  return null;
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

function detectFuelType(tokens = []) {
  const joined = tokens.join(" ");

  if (
    joined.includes("hybrid") ||
    joined.includes("phev")
  ) {
    return "Hybrid";
  }

  if (
    joined.includes("electric") ||
    joined.includes("ev")
  ) {
    return "Electric";
  }

  if (joined.includes("diesel")) {
    return "Diesel";
  }

  return "Combustion";
}

function buildSemanticProfile(tokens = []) {
  const joined = tokens.join(" ");

  return {
    isHybrid:
      joined.includes("hybrid") ||
      joined.includes("phev") ||
      joined.includes("plugin"),

    isElectric:
      joined.includes("electric") ||
      joined.includes("ev") ||
      joined.includes("tesla"),

    isPerformance:
      joined.includes("amg") ||
      joined.includes("competition") ||
      joined.includes("rs") ||
      joined.includes("gts"),

    isSuv:
      joined.includes("suv") ||
      joined.includes("x5") ||
      joined.includes("gle") ||
      joined.includes("q7") ||
      joined.includes("xc90") ||
      joined.includes("g63"),

    isPremium:
      joined.includes("amg") ||
      joined.includes("performance") ||
      joined.includes("night") ||
      joined.includes("designo"),
  };
}

function buildTitle(tokens = []) {
  return tokens
    .slice(0, 12)
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
  year,
  semantic,
  performancePackage,
  premiumPackage,
}) {
  let score = 40;

  if (brand !== "Unknown") {
    score += 20;
  }

  if (year) {
    score += 15;
  }

  if (semantic.isPremium) {
    score += 10;
  }

  if (semantic.isPerformance) {
    score += 10;
  }

  if (performancePackage) {
    score += 10;
  }

  if (premiumPackage) {
    score += 5;
  }

  return Math.min(score, 100);
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