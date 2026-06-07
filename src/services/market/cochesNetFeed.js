const COCHES_NET_SEARCH_URL = "https://web.gw.coches.net/search/listing";
const COCHES_NET_MAKEMODELS_URL =
  "https://web.gw.coches.net/vehicle-specs/makemodels";

const DEFAULT_PAGE_SIZE = 30;

const DEFAULT_HEADERS = {
  accept: "application/json, text/plain, */*",
  "content-type": "application/json",
  origin: "https://www.coches.net",
  referer: "https://www.coches.net/search/",
  "x-adevinta-channel": "web-desktop",
  "x-schibsted-tenant": "coches",
};

export async function fetchCochesNetMakeModels() {
  const response = await fetch(COCHES_NET_MAKEMODELS_URL, {
    method: "GET",
    headers: {
      accept: "application/json, text/plain, */*",
      origin: "https://www.coches.net",
      referer: "https://www.coches.net/",
      "x-adevinta-channel": "web-desktop",
      "x-schibsted-tenant": "coches",
    },
  });

  if (!response.ok) {
    throw new Error(`Coches.net makemodels failed: ${response.status}`);
  }

  return response.json();
}

export function buildCochesNetSearchPayload({
  make,
  makeId,
  model,
  modelId,
  page = 1,
  size = DEFAULT_PAGE_SIZE,
  priceFrom = null,
  priceTo = null,
  kmFrom = null,
  kmTo = null,
  yearFrom = null,
  yearTo = null,
  fuelTypeIds = [],
  provinceIds = [],
} = {}) {
  return {
    pagination: {
      page,
      size,
    },
    sort: {
      order: "desc",
      term: "relevance",
    },
    filters: {
      price: {
        from: priceFrom,
        to: priceTo,
      },
      fee: {
        from: null,
        to: null,
      },
      commitmentMonths: [],
      priceRank: [],
      batteryCapacity: {
        from: null,
        to: null,
      },
      bodyTypeIds: [],
      categories: {
        category1Ids: [2500],
      },
      chargingTimeFastMode: {
        from: null,
        to: null,
      },
      chargingTimeStandardMode: {
        from: null,
        to: null,
      },
      contractId: 0,
      drivenWheelsIds: [],
      electricAutonomy: {
        from: null,
        to: null,
      },
      entry: null,
      environmentalLabels: [],
      equipments: [],
      fuelTypeIds,
      hasPriceDrop: null,
      hasPhoto: null,
      hasOnlineFinancing: null,
      hasReservation: null,
      hasStock: null,
      hasWarranty: null,
      hp: {
        from: null,
        to: null,
      },
      isCertified: false,
      km: {
        from: kmFrom,
        to: kmTo,
      },
      luggageCapacity: {
        from: null,
        to: null,
      },
      maxTerms: null,
      onlyPeninsula: false,
      offerTypeIds: [0, 1, 2, 3, 4, 5],
      provinceIds,
      rating: {
        from: null,
        to: null,
      },
      searchText: null,
      sellerTypeId: 0,
      targetBuyer: null,
      transmissionTypeId: 0,
      vehicles:
        make && makeId && model && modelId
          ? [
              {
                make,
                makeId,
                model,
                modelId,
              },
            ]
          : [],
      year: {
        from: yearFrom,
        to: yearTo,
      },
    },
  };
}

export async function fetchCochesNetListings(params = {}) {
  const payload = buildCochesNetSearchPayload(params);

  const response = await fetch(COCHES_NET_SEARCH_URL, {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Coches.net listing failed: ${response.status}`);
  }

  const data = await response.json();
  const items = Array.isArray(data.items) ? data.items : [];

  return {
    source: "coches_net",
    totalResults: toNumber(data.meta?.totalResults),
    totalPages: toNumber(data.meta?.totalPages),
    page: toNumber(params.page || 1),
    size: toNumber(params.size || DEFAULT_PAGE_SIZE),
    listings: items.map(normalizeCochesNetListing).filter(Boolean),
    rawMeta: data.meta || null,
    rawAggregations: Array.isArray(data.aggregations) ? data.aggregations : [],
  };
}

export function normalizeCochesNetListing(item = {}) {
  const id = toStringValue(item.id);
  const price = toNumber(item.price?.amount);
  const marketAverage = toNumber(item.price?.indicator?.average);
  const relativeToMarket =
    price > 0 && marketAverage > 0
      ? Number((((marketAverage - price) / price) * 100).toFixed(2))
      : 0;

  if (!id || price <= 0) {
    return null;
  }

  return {
    source: "coches_net",
    sourceId: id,
    title: toStringValue(item.title),
    url: buildCochesNetUrl(item.url),
    price,
    marketAverage,
    marketRank: toNumber(item.price?.indicator?.rank),
    relativeToMarket,
    year: toNumber(item.year),
    mileage: toNumber(item.km),
    km: toNumber(item.km),
    hp: toNumber(item.hp),
    cubicCapacity: toNumber(item.cubicCapacity),
    brand: toStringValue(item.make),
    make: toStringValue(item.make),
    makeId: toNumber(item.makeId),
    model: toStringValue(item.model),
    modelId: toNumber(item.modelId),
    fuelType: toStringValue(item.fuelType),
    fuelTypeId: toNumber(item.fuelTypeId),
    bodyTypeId: toNumber(item.bodyTypeId),
    transmissionTypeId: toNumber(item.transmissionTypeId),
    drivenWheelsId: toNumber(item.drivenWheelsId),
    province: toStringValue(item.mainProvince),
    location: normalizeLocation(item.location),
    isProfessional: Boolean(item.isProfessional || item.seller?.isProfessional),
    seller: normalizeSeller(item.seller),
    publishedDate: toStringValue(item.publishedDate),
    creationDate: toStringValue(item.creationDate),
    warrantyMonths: toNumber(item.warranty?.months),
    isFinanced: Boolean(item.isFinanced),
    isCertified: Boolean(item.isCertified),
    hasReservation: Boolean(item.price?.hasReservation),
    hasOnlineFinancing: Boolean(item.price?.hasOnlineFinancing),
    images: normalizeImages(item.resources),
    raw: item,
  };
}

export function calculateSpainMarketReference(listings = []) {
  const validListings = listings.filter((item) => toNumber(item.price) > 0);
  const prices = validListings.map((item) => toNumber(item.price)).filter(Boolean);
  const marketAverages = validListings
    .map((item) => toNumber(item.marketAverage))
    .filter(Boolean);

  return {
    source: "coches_net",
    comparableCount: validListings.length,
    priceMedian: median(prices),
    priceAverage: average(prices),
    marketAverageMedian: median(marketAverages),
    marketAverageAverage: average(marketAverages),
    marketAverageCoverage: marketAverages.length,
    confidence: calculateReferenceConfidence({
      comparableCount: validListings.length,
      marketAverageCoverage: marketAverages.length,
    }),
    listings: validListings,
  };
}

function calculateReferenceConfidence({ comparableCount, marketAverageCoverage }) {
  let score = 35;

  if (comparableCount >= 5) score += 15;
  if (comparableCount >= 10) score += 15;
  if (comparableCount >= 20) score += 15;

  if (marketAverageCoverage >= 5) score += 8;
  if (marketAverageCoverage >= 10) score += 7;
  if (marketAverageCoverage >= 20) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeImages(resources = []) {
  if (!Array.isArray(resources)) return [];

  return resources
    .filter((item) => item?.type === "IMAGE" && item?.url)
    .map((item) => item.url);
}

function normalizeSeller(seller = {}) {
  return {
    name: toStringValue(seller.name),
    isProfessional: Boolean(seller.isProfessional),
    scoreAverage: toNumber(seller.ratings?.scoreAverage),
    commentsNumber: toNumber(seller.ratings?.commentsNumber),
    packType: toStringValue(seller.pack?.type),
  };
}

function normalizeLocation(location = {}) {
  return {
    province: toStringValue(location.mainProvince),
    provinceId: toNumber(location.mainProvinceId),
    region: toStringValue(location.regionLiteral),
    regionId: toNumber(location.regionId),
    city: toStringValue(location.cityLiteral),
    cityId: toNumber(location.cityId),
  };
}

function buildCochesNetUrl(url) {
  const value = toStringValue(url);

  if (!value) return "";

  if (value.startsWith("http")) {
    return value;
  }

  return `https://www.coches.net${value}`;
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

function toNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return numericValue;
}

function toStringValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}
