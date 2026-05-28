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

    return {
      source: "mobile.de",
      url,
      title,
      brand,
      year,
      semantic,
      confidence: calculateConfidence({
        brand,
        year,
        semantic,
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
      joined.includes("m") ||
      joined.includes("rs") ||
      joined.includes("gts"),

    isSuv:
      joined.includes("suv") ||
      joined.includes("x5") ||
      joined.includes("gle") ||
      joined.includes("q7") ||
      joined.includes("xc90"),

    isPremium:
      joined.includes("amg") ||
      joined.includes("m") ||
      joined.includes("performance") ||
      joined.includes("night"),
  };
}

function buildTitle(tokens = []) {
  return tokens
    .slice(0, 10)
    .map((token) => {
      if (token.length <= 2) {
        return token.toUpperCase();
      }

      return token.charAt(0).toUpperCase() + token.slice(1);
    })
    .join(" ");
}

function calculateConfidence({ brand, year, semantic }) {
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

  if (semantic.isHybrid || semantic.isElectric) {
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
    year: null,
    confidence: 0,
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