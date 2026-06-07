const MIN_COMPARABLE_SCORE = 50;
const STRONG_COMPARABLE_SCORE = 78;

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
    (item) => item.comparableQualityScore >= STRONG_COMPARABLE_SCORE
  );

  const usableComparables =
    strongComparables.length >= 3 ? strongComparables : comparables.slice(0, 12);

  const prices = usableComparables.map((item) => toNumber(item.price)).filter((value) => value > 0);
  const marketAverages = usableComparables.map((item) => toNumber(item.marketAverage)).filter((value) => value > 0);

  return {
    source: "coches_net",
    comparableCount: usableComparables.length,
    strongComparableCount: strongComparables.length,
    estimatedMarketValue: median(marketAverages) || median(prices) || average(prices),
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

  if (price <= 0) return null;

  const gates = calculateHardCompatibilityGates(vehicle, { ...listing, year, mileage, hp });
  if (!gates.accepted) return null;

  const score = calculateComparableQualityScore(vehicle, { ...listing, year, mileage, hp });
  if (score < MIN_COMPARABLE_SCORE) return null;

  return {
    source: "coches_net",
    sourceMode: "coches_net_spain_reference",
    isRealMarketData: true,
    status: "ACTIVE",
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
    compatibilityReasons: gates.reasons,
  };
}

function calculateHardCompatibilityGates(vehicle = {}, listing = {}) {
  const reasons = [];

  const vehicleBrand = normalizeText(vehicle.brand || vehicle.make);
  const listingBrand = normalizeText(listing.brand || listing.make);
  if (vehicleBrand && listingBrand && vehicleBrand !== listingBrand) {
    return reject(`marca distinta: ${listing.brand || listing.make || "-"}`);
  }

  const vehicleModel = normalizeText(vehicle.model);
  const listingModel = normalizeText(listing.model);
  if (vehicleModel && listingModel && vehicleModel !== listingModel) {
    return reject(`modelo distinto: ${listing.model || "-"}`);
  }

  const vehicleFuel = normalizeFuel(vehicle.fuelType || vehicle.fuel_type);
  const listingFuel = normalizeFuel(listing.fuelType || listing.fuel_type);
  if (vehicleFuel && listingFuel && !areCompatibleFuelTypes(vehicleFuel, listingFuel)) {
    return reject(`combustible distinto: ${listing.fuelType || "-"}`);
  }

  const vehicleYear = toNumber(vehicle.year);
  const listingYear = toNumber(listing.year);
  if (vehicleYear > 0 && listingYear > 0) {
    const yearDistance = Math.abs(vehicleYear - listingYear);
    if (yearDistance > 2) return reject(`año demasiado lejano: ${listingYear}`);
    reasons.push(`año ±${yearDistance}`);
  }

  const vehicleKm = toNumber(vehicle.km ?? vehicle.mileage);
  const listingKm = toNumber(listing.km ?? listing.mileage);
  if (vehicleKm > 0 && listingKm > 0) {
    const kmDistance = Math.abs(vehicleKm - listingKm);
    if (kmDistance > 65000) return reject(`km demasiado lejanos: ${formatNumber(listingKm)} km`);
    reasons.push(`km ±${formatNumber(kmDistance)}`);
  }

  const vehicleHp = toNumber(vehicle.hp || vehicle.powerHp);
  const listingHp = toNumber(listing.hp || listing.powerHp);
  if (vehicleHp > 0 && listingHp > 0) {
    const hpDistance = Math.abs(vehicleHp - listingHp);
    if (hpDistance > 95) return reject(`potencia demasiado distinta: ${listingHp} hp`);
    reasons.push(`hp ±${hpDistance}`);
  }

  const vehicleVariant = detectVariantToken(vehicle.title);
  const listingVariant = detectVariantToken(listing.title);
  if (vehicleVariant && listingVariant && vehicleVariant !== listingVariant) {
    reasons.push(`versión distinta pero cercana: ${listingVariant}`);
  }

  if (vehicleVariant && listingVariant) reasons.push(`versión ${listingVariant}`);

  return { accepted: true, reasons };
}

function reject(reason) {
  return { accepted: false, reasons: [reason] };
}

function calculateComparableQualityScore(vehicle = {}, listing = {}) {
  let score = 0;

  if (sameText(vehicle.brand || vehicle.make, listing.brand || listing.make)) score += 15;
  if (sameText(vehicle.model, listing.model)) score += 20;

  const yearDistance = Math.abs(toNumber(vehicle.year) - toNumber(listing.year));
  if (yearDistance === 0) score += 18;
  else if (yearDistance === 1) score += 13;
  else if (yearDistance === 2) score += 7;

  const kmDistance = Math.abs(toNumber(vehicle.km ?? vehicle.mileage) - toNumber(listing.km ?? listing.mileage));
  if (kmDistance <= 10000) score += 16;
  else if (kmDistance <= 25000) score += 12;
  else if (kmDistance <= 45000) score += 7;
  else if (kmDistance <= 65000) score += 3;

  if (normalizeFuel(vehicle.fuelType || vehicle.fuel_type) === normalizeFuel(listing.fuelType || listing.fuel_type)) {
    score += 12;
  } else if (
    areCompatibleFuelTypes(
      normalizeFuel(vehicle.fuelType || vehicle.fuel_type),
      normalizeFuel(listing.fuelType || listing.fuel_type)
    )
  ) {
    score += 5;
  }

  const hpDistance = Math.abs(toNumber(vehicle.hp || vehicle.powerHp) - toNumber(listing.hp || listing.powerHp));
  if (hpDistance <= 15) score += 10;
  else if (hpDistance <= 35) score += 7;
  else if (hpDistance <= 55) score += 3;

  score += calculateTrimSimilarityBonus(normalizeText(vehicle.title), normalizeText(listing.title));

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateTrimSimilarityBonus(vehicleTitle = "", listingTitle = "") {
  if (!vehicleTitle || !listingTitle) return 0;

  let bonus = 0;
  const premiumTokens = ["m sport", "msport", "pack m", "xline", "x line", "s line", "black line", "amg line", "competition", "head up", "hud", "laser", "techo", "cuero"];

  for (const token of premiumTokens) {
    if (vehicleTitle.includes(token) && listingTitle.includes(token)) bonus += 3;
  }

  const vehicleVariant = detectVariantToken(vehicleTitle);
  const listingVariant = detectVariantToken(listingTitle);
  if (vehicleVariant && listingVariant && vehicleVariant === listingVariant) bonus += 8;

  return Math.min(18, bonus);
}

function detectVariantToken(title = "") {
  const text = normalizeText(title);
  const patterns = ["xdrive50e", "xdrive45e", "xdrive40d", "xdrive30d", "xdrive25d", "sdrive25d", "m50d", "m60i", "40d", "30d", "25d", "50e", "45e"];
  return patterns.find((pattern) => text.includes(pattern)) || "";
}

function buildComparableReason(vehicle = {}, listing = {}, score = 0) {
  const parts = [];
  if (vehicle.year && listing.year) parts.push(`año ${listing.year}`);
  if (listing.mileage || listing.km) parts.push(`${formatNumber(listing.mileage || listing.km)} km`);
  if (listing.fuelType) parts.push(listing.fuelType);
  if (listing.hp) parts.push(`${listing.hp} hp`);

  return `Comparable Coches.net ${score}/100${parts.length ? ` · ${parts.join(" · ")}` : ""}`;
}

function calculateSpainReferenceConfidence({ comparableCount, strongComparableCount, marketAverageCount }) {
  let score = 25;

  if (comparableCount >= 3) score += 15;
  if (comparableCount >= 6) score += 15;
  if (comparableCount >= 10) score += 12;
  if (comparableCount >= 15) score += 8;
  if (strongComparableCount >= 3) score += 12;
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
  const clean = values.map(toNumber).filter((value) => value > 0).sort((a, b) => a - b);
  if (!clean.length) return 0;
  const middle = Math.floor(clean.length / 2);
  if (clean.length % 2) return clean[middle];
  return Math.round((clean[middle - 1] + clean[middle]) / 2);
}

function average(values = []) {
  const clean = values.map(toNumber).filter((value) => value > 0);
  if (!clean.length) return 0;
  return Math.round(clean.reduce((sum, value) => sum + value, 0) / clean.length);
}

function sameText(a, b) {
  const normalizedA = normalizeText(a);
  const normalizedB = normalizeText(b);
  return normalizedA && normalizedB && normalizedA === normalizedB;
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
  if (text.includes("diesel")) return "diesel";
  if (text.includes("gasolina")) return "gasolina";
  if (text.includes("phev") || text.includes("hibrido enchufable")) return "phev";
  if (text.includes("hibrido") || text.includes("hybrid")) return "hibrido";
  if (text.includes("electrico") || text.includes("electric")) return "electrico";
  return text;
}

function areCompatibleFuelTypes(vehicleFuel = "", listingFuel = "") {
  if (!vehicleFuel || !listingFuel) return true;
  if (vehicleFuel === listingFuel) return true;

  const electrified = new Set(["phev", "hibrido"]);
  if (electrified.has(vehicleFuel) && electrified.has(listingFuel)) return true;

  return false;
}

function formatNumber(value) {
  return new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(toNumber(value));
}

function toNumber(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return numericValue;
}
