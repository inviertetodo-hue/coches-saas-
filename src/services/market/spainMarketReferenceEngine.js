import {
  fetchCochesNetListings,
} from "./cochesNetFeed.js";
import {
  buildCochesNetSpainReference,
} from "./cochesNetComparableAdapter.js";

const COCHES_NET_MODEL_IDS = {
  audi: {
    a3: { make: "Audi", makeId: 4, model: "A3", modelId: 345 },
    q5: { make: "Audi", makeId: 4, model: "Q5", modelId: 904 },
  },
  bmw: {
    x5: { make: "BMW", makeId: 7, model: "X5", modelId: 438 },
  },
  ford: {
    kuga: { make: "Ford", makeId: 15, model: "Kuga", modelId: 882 },
  },
  "mercedes-benz": {
    glc: { make: "Mercedes-Benz", makeId: 28, model: "GLC", modelId: 1439 },
    gle: { make: "Mercedes-Benz", makeId: 28, model: "GLE", modelId: 1261 },
  },
};

export async function resolveSpainMarketReference(vehicle = {}, options = {}) {
  const modelConfig = resolveCochesNetModelConfig(vehicle);

  if (!modelConfig) {
    return buildEmptySpainReference({
      reason: "unsupported_model",
      vehicle,
    });
  }

  try {
    const listingsResult = await fetchCochesNetListings({
      ...modelConfig,
      page: 1,
      size: options.size || 30,
      yearFrom: buildYearFrom(vehicle),
      yearTo: buildYearTo(vehicle),
      kmFrom: null,
      kmTo: buildKmTo(vehicle),
    });

    const reference = buildCochesNetSpainReference(
      vehicle,
      listingsResult.listings || []
    );

    return {
      ...reference,
      supported: true,
      available: reference.estimatedMarketValue > 0,
      reason:
        reference.estimatedMarketValue > 0
          ? "spain_reference_available"
          : "insufficient_spain_comparables",
      source: "coches_net",
      sourceLabel: "Coches.net",
      totalResults: listingsResult.totalResults,
      totalPages: listingsResult.totalPages,
      listingsChecked: listingsResult.listings.length,
      modelConfig,
    };
  } catch (error) {
    return buildEmptySpainReference({
      reason: "spain_reference_error",
      vehicle,
      error,
      modelConfig,
    });
  }
}

export function resolveCochesNetModelConfig(vehicle = {}) {
  const brand = normalizeKey(vehicle.brand || vehicle.make);
  const model = normalizeKey(vehicle.model);

  if (!brand || !model) return null;

  return COCHES_NET_MODEL_IDS[brand]?.[model] || null;
}

export function buildSpainReferenceValuationInput(spainReference = {}) {
  const estimatedMarketValue = toNumber(spainReference.estimatedMarketValue);
  const confidence = toNumber(spainReference.confidence);
  const comparableCount = toNumber(spainReference.comparableCount);

  if (estimatedMarketValue <= 0 || comparableCount <= 0) {
    return null;
  }

  return {
    source: "coches_net_spain_reference",
    estimatedMarketValue,
    confidence,
    comparableCount,
    comparables: Array.isArray(spainReference.comparables)
      ? spainReference.comparables
      : [],
    medianPrice: toNumber(spainReference.medianPrice),
    medianMarketAverage: toNumber(spainReference.medianMarketAverage),
    strongComparableCount: toNumber(spainReference.strongComparableCount),
  };
}

function buildEmptySpainReference({
  reason,
  vehicle,
  error = null,
  modelConfig = null,
}) {
  return {
    source: "coches_net",
    sourceLabel: "Coches.net",
    supported: Boolean(modelConfig),
    available: false,
    reason,
    vehicle: {
      brand: vehicle.brand || vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year || null,
    },
    modelConfig,
    estimatedMarketValue: 0,
    medianPrice: 0,
    medianMarketAverage: 0,
    comparableCount: 0,
    strongComparableCount: 0,
    confidence: 0,
    comparables: [],
    error: error ? String(error.message || error) : "",
  };
}

function buildYearFrom(vehicle = {}) {
  const year = toNumber(vehicle.year);
  return year > 0 ? Math.max(1980, year - 2) : null;
}

function buildYearTo(vehicle = {}) {
  const year = toNumber(vehicle.year);
  return year > 0 ? year + 2 : null;
}

function buildKmTo(vehicle = {}) {
  const km = toNumber(vehicle.km ?? vehicle.mileage);

  if (km <= 0) return null;

  return Math.round(km + 65000);
}

function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return numericValue;
}
