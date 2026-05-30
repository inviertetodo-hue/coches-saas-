const MOBILE_DE_BRANDS = {
  volkswagen: "25200",
  vw: "25200",
  seat: "22900",
  skoda: "24100",
  audi: "1900",
  bmw: "3500",
  mercedes: "17200",
  peugeot: "18700",
  hyundai: "11600",
  kia: "13200",
  nissan: "19300",
};

const MOBILE_DE_MODELS = {
  volkswagen: {
    golf: "14",
    passat: "19",
    tiguan: "32",
    polo: "18",
  },
  vw: {
    golf: "14",
    passat: "19",
    tiguan: "32",
    polo: "18",
  },
  seat: {
    leon: "10",
    "león": "10",
    ibiza: "8",
    ateca: "19",
  },
  skoda: {
    octavia: "9",
    fabia: "5",
    superb: "12",
    karoq: "21",
    kodiaq: "20",
  },
  peugeot: {
    "3008": "47",
  },
  hyundai: {
    tucson: "27",
  },
  kia: {
    sportage: "25",
  },
  nissan: {
    qashqai: "26",
  },
};

export function buildMarketSearch({
  brand = "",
  model = "",
  fuel = "",
  maxPrice = "",
  minYear = "",
  maxMileage = "",
  country = "Alemania",
} = {}) {
  const normalizedBrand = normalize(brand);
  const normalizedModel = normalize(model);
  const normalizedFuel = normalize(fuel);

  const mobileDeUrl = buildMobileDeSearchUrl({
    brand: normalizedBrand,
    model: normalizedModel,
    fuel: normalizedFuel,
    maxPrice,
    minYear,
    maxMileage,
  });

  return {
    query: buildSearchLabel({
      brand,
      model,
      fuel,
      maxPrice,
      minYear,
      maxMileage,
      country,
    }),
    source: "mobile.de",
    country,
    brand: cleanText(brand),
    model: cleanText(model),
    fuel: cleanText(fuel),
    maxPrice: safeNumber(maxPrice),
    minYear: safeNumber(minYear),
    maxMileage: safeNumber(maxMileage),
    url: mobileDeUrl,
    status: "ready",
    message: "Búsqueda preparada para detectar oportunidades reales.",
  };
}

function buildMobileDeSearchUrl({
  brand,
  model,
  fuel,
  maxPrice,
  minYear,
  maxMileage,
}) {
  const params = new URLSearchParams();

  params.set("dam", "false");
  params.set("isSearchRequest", "true");
  params.set("s", "Car");
  params.set("sb", "rel");
  params.set("vc", "Car");

  const brandCode = MOBILE_DE_BRANDS[brand];
  const modelCode = MOBILE_DE_MODELS[brand]?.[model];

  if (brandCode) {
    const msValue = modelCode
      ? `${brandCode};${modelCode};;`
      : `${brandCode};;;`;

    params.set("ms", msValue);
  }

  const fuelCode = getMobileDeFuelCode(fuel);

  if (fuelCode) {
    params.set("ft", fuelCode);
  }

  const price = safeNumber(maxPrice);
  const year = safeNumber(minYear);
  const mileage = safeNumber(maxMileage);

  if (price > 0) {
    params.set("p", `:${price}`);
  }

  if (year > 0) {
    params.set("fr", `${year}:`);
  }

  if (mileage > 0) {
    params.set("ml", `:${mileage}`);
  }

  return `https://suchen.mobile.de/fahrzeuge/search.html?${params.toString()}`;
}

function getMobileDeFuelCode(fuel) {
  if (fuel.includes("diesel") || fuel.includes("tdi")) return "DIESEL";
  if (fuel.includes("gasolina") || fuel.includes("petrol") || fuel.includes("tsi")) {
    return "PETROL";
  }
  if (fuel.includes("hybrid") || fuel.includes("híbrido")) return "HYBRID";
  if (fuel.includes("electric")) return "ELECTRICITY";

  return "";
}

function buildSearchLabel({
  brand,
  model,
  fuel,
  maxPrice,
  minYear,
  maxMileage,
  country,
}) {
  const parts = [
    cleanText(brand),
    cleanText(model),
    cleanText(fuel),
    maxPrice ? `hasta ${maxPrice} €` : "",
    minYear ? `desde ${minYear}` : "",
    maxMileage ? `máx. ${maxMileage} km` : "",
    country,
  ];

  return parts.filter(Boolean).join(" · ");
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