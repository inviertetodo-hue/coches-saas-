export function buildCochesNetComparablesForVehicle(vehicle = {}, listings = []) {
  const normalizedVehicle = normalizeVehicle(vehicle);

  return listings
    .filter(Boolean)
    .map((listing) => buildComparableRecord(normalizedVehicle, listing))
    .filter(Boolean)
    .sort((a, b) => b.comparableQualityScore - a.comparableQualityScore);
}

export function buildCochesNetSpainReference(vehicle = {}, listings = []) {
  const comparables = buildCochesNetComparablesForVehicle(vehicle, listings);
  const strongComparables = comparables.filter(
    (item) => item.comparableQualityScore >= 70
  );

  const usableComparables =
    strongComparables.length >= 3 ? strongComparables : comparables.slice(0, 15);

  const prices = usableComparables
    .map((item) => toNumber(item.price))
    .filter((value) => value > 0);

  const marketAverages = usableComparables
    .map((item) => toNumber(item.marketAverage))
    .filter((value) => value > 0);

  return {
    source: "coches_net",
    comparableCount: usableComparables.length,
    strongComparableCount: strongComparables.length,
    estimatedMarketValue:
      median(marketAverages) || median(prices) || average(prices),
    medianPrice: median(prices),
    averagePrice: average(prices),
    medianMarketAverage: median(marketAverages),
    averageMarketAverage: average(marketAverages),
    confidence: calculateSpainReferenceConfidence({
      comparableCount: usableComparables.length,
      strongComparableCount: strongComparables.length,
      marketAverageCount: marketAverages.length,
    }),
    comparables: usableComparables,
  };
}

function buildComparableRecord(vehicle = {}, listing = {}) {
  const price = toNumber(listing.price);
  const year = toNumber(listing.year);
  const mileage = toNumber(listing.mileage ?? listing.km);
  const hp = toNumber(listing.hp);

  if (price <= 0) {
    return null;
  }

  const score = calculateComparableQualityScore(vehicle, {
    ...listing,
    year,
    mileage,
    hp,
  });

  if (score < 35) {
    return null;
  }

  return {
    source: "coches_net",
    sourceId: listing.sourceId || listing.id || "",
    title: listing.title || "",
    url: listing.url || "",
    price,
    marketAverage: toNumber(listing.marketAverage),
    year,
    km: mileage,
    mileage,
    hp,
    brand: listing.brand || listing.make || "",
    model: listing.model || "",
    fuelType: listing.fuelType || "",
    province: listing.province || "",
    seller: listing.seller || null,
    comparableQualityScore: score,
    comparableScore: score,
    comparableConfidence: score,
    comparableReason: buildComparableReason(vehicle, listing, score),
  };
}

function calculateComparableQualityScore(vehicle = {}, listing = {}) {
  let score = 30;

  const vehicleBrand = normalizeText(vehicle.brand || vehicle.make);
  const listingBrand = normalizeText(listing.brand || listing.make);

  if (vehicleBrand && listingBrand && vehicleBrand === listingBrand) {
    score += 18;
  }

  const vehicleModel = normalizeText(vehicle.model);
  const listingModel = normalizeText(listing.model);

  if (vehicleModel && listingModel && vehicleModel === listingModel) {
    score += 22;
  }

  const vehicleYear = toNumber(vehicle.year);
  const listingYear = toNumber(listing.year);

  if (vehicleYear > 0 && listingYear > 0) {
    const distance = Math.abs(vehicleYear - listingYear);

    if (distance === 0) score += 16;
    else if (distance === 1) score += 12;
    else if (distance === 2) score += 7;
    else if (distance === 3) score += 3;
    else score -= 10;
  }

  const vehicleKm = toNumber(vehicle.km ?? vehicle.mileage);
  const listingKm = toNumber(listing.km ?? listing.mileage);

  if (vehicleKm > 0 && listingKm > 0) {
    const distance = Math.abs(vehicleKm - listingKm);

    if (distance <= 10000) score += 12;
    else if (distance <= 25000) score += 9;
    else if (distance <= 50000) score += 5;
    else if (distance <= 80000) score += 1;
    else score -= 8;
  }

  const vehicleFuel = normalizeFuel(vehicle.fuelType || vehicle.fuel_type);
  const listingFuel = normalizeFuel(listing.fuelType || listing.fuel_type);

  if (vehicleFuel && listingFuel && vehicleFuel === listingFuel) {
    score += 10;
  } else if (vehicleFuel && listingFuel) {
    score -= 8;
  }

  const vehicleHp = toNumber(vehicle.hp || vehicle.powerHp);
  const listingHp = toNumber(listing.hp || listing.powerHp);

  if (vehicleHp > 0 && listingHp > 0) {
    const hpDistance = Math.abs(vehicleHp - listingHp);

    if (hpDistance <= 15) score += 8;
    else if (hpDistance <= 35) score += 5;
    else if (hpDistance <= 60) score += 2;
    else score -= 6;
  }

  const vehicleTitle = normalizeText(vehicle.title);
  const listingTitle = normalizeText(listing.title);

  score += calculateTrimSimilarityBonus(vehicleTitle, listingTitle);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateTrimSimilarityBonus(vehicleTitle = "", listingTitle = "") {
  if (!vehicleTitle || !listingTitle) return 0;

  let bonus = 0;

  const premiumTokens = [
    "m sport",
    "msport",
    "xdrive",
    "sdrive",
    "black line",
    "s line",
    "amg line",
    "competition",
    "m50",
    "40d",
    "30d",
    "25d",
    "50e",
    "45e",
    "xline",
    "pack m",
    "head up",
    "hud",
    "laser",
    "techo",
    "cuero",
  ];

  for (const token of premiumTokens) {
    if (vehicleTitle.includes(token) && listingTitle.includes(token)) {
      bonus += 3;
    }
  }

  return Math.min(12, bonus);
}

function buildComparableReason(vehicle = {}, listing = {}, score = 0) {
  const parts = [];

  if (vehicle.year && listing.year) {
    parts.push(`año ${listing.year}`);
  }

  if (listing.mileage || listing.km) {
    parts.push(`${formatNumber(listing.mileage || listing.km)} km`);
  }

  if (listing.fuelType) {
    parts.push(listing.fuelType);
  }

  if (listing.hp) {
    parts.push(`${listing.hp} hp`);
  }

  return `Comparable Coches.net ${score}/100${
    parts.length ? ` · ${parts.join(" · ")}` : ""
  }`;
}

function calculateSpainReferenceConfidence({
  comparableCount,
  strongComparableCount,
  marketAverageCount,
}) {
  let score = 35;

  if (comparableCount >= 3) score += 12;
  if (comparableCount >= 6) score += 12;
  if (comparableCount >= 10) score += 10;
  if (comparableCount >= 15) score += 8;

  if (strongComparableCount >= 3) score += 10;
  if (strongComparableCount >= 6) score += 8;

  if (marketAverageCount >= 3) score += 3;
  if (marketAverageCount >= 8) score += 2;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeVehicle(vehicle = {}) {
  return {
    ...vehicle,
    brand: vehicle.brand || vehicle.make || "",
    model: vehicle.model || "",
    year: toNumber(vehicle.year),
    mileage: toNumber(vehicle.mileage ?? vehicle.km),
    km: toNumber(vehicle.km ?? vehicle.mileage),
    hp: toNumber(vehicle.hp || vehicle.powerHp),
    fuelType: vehicle.fuelType || vehicle.fuel_type || "",
    title: vehicle.title || "",
  };
}

function median(values = []) {
  const clean = values
    .map(toNumber)
    .filter((value) => value > 0)
    .sort((a, b) => a - b);

  if (!clean.length) return 0;

  const middle = Math.floor(clean.length / 2);

  if (clean.length % 2) {
    return clean[middle];
  }

  return Math.round((clean[middle - 1] + clean[middle]) / 2);
}

function average(values = []) {
  const clean = values.map(toNumber).filter((value) => value > 0);

  if (!clean.length) return 0;

  return Math.round(clean.reduce((sum, value) => sum + value, 0) / clean.length);
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeFuel(value) {
  const text = normalizeText(value);

  if (text.includes("diesel") || text.includes("diesel")) return "diesel";
  if (text.includes("gasolina")) return "gasolina";
  if (text.includes("phev") || text.includes("hibrido enchufable")) return "phev";
  if (text.includes("hibrido")) return "hibrido";
  if (text.includes("electrico")) return "electrico";

  return text;
}

function formatNumber(value) {
  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

function toNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return numericValue;
}
