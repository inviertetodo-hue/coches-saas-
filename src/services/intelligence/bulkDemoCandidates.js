import { parseCarFromUrl } from "../urlParser";
import { buildLiveMarketFeedPreview } from "./liveMarketFeedAdapter";

export function buildDemoCandidates(url) {
  const parsed = parseCarFromUrl(url);
  const brand = parsed?.brand || detectBrandFromUrl(url);
  const model = parsed?.model || detectModelFromUrl(url, brand);

  const feedPreview = buildLiveMarketFeedPreview({
    url,
    parsed,
    brand,
    model,
  });

  return [
    buildMarketQueryCandidate({
      url,
      parsed,
      brand,
      model,
      feedPreview,
    }),
  ];
}

function buildMarketQueryCandidate({ url, parsed, brand, model, feedPreview }) {
  return {
    id: buildCandidateId(brand, model, feedPreview.status),
    sourceMode: feedPreview.status,
    sourceStatus: "needs-live-market-feed",
    sourceUrl: url || "",
    title: buildTitle({ brand, model }),
    brand: brand || "",
    model: model || "",
    year: 0,
    price: 0,
    mileage: null,
    km: null,
    roi: 0,
    profit: 0,
    matchScore: buildMatchScore({ brand, model }),
    comparableConfidence: 0,
    memoryEligible: false,
    canSave: false,
    qualityHint: feedPreview.status,
    bodyType: parsed?.bodyType || "",
    fuelType: parsed?.fuelType || "",
    electrified: Boolean(parsed?.electrified),
    needsLiveMarketFeed: true,
    feedPreview,
    explanation: feedPreview.message,
  };
}

function buildTitle({ brand, model }) {
  if (brand && model) {
    return [brand, model].join(" ");
  }

  if (brand) {
    return `${brand} pendiente de modelo`;
  }

  return "Búsqueda pendiente de identificación";
}

function buildMatchScore({ brand, model }) {
  if (brand && model) return 55;
  if (brand) return 35;
  return 15;
}

function detectBrandFromUrl(url) {
  const normalized = normalizeUrl(url);

  const brands = [
    "Audi",
    "BMW",
    "Mercedes",
    "Volkswagen",
    "Toyota",
    "Renault",
    "Peugeot",
    "Citroën",
    "Ford",
    "Hyundai",
    "Kia",
    "Nissan",
    "Volvo",
    "Skoda",
    "Seat",
    "Cupra",
    "Opel",
    "Fiat",
    "Dacia",
    "Mazda",
    "Honda",
    "Jeep",
    "Porsche",
    "Tesla",
    "BYD",
    "MG",
    "Omoda",
    "Jaecoo",
    "Leapmotor",
    "NIO",
    "XPeng",
    "Chery",
    "Lynk & Co",
    "Zeekr",
    "Polestar",
    "Smart",
  ];

  return brands.find((brand) => normalized.includes(normalizeUrl(brand))) || "";
}

function detectModelFromUrl(url, brand) {
  const normalized = normalizeUrl(url);

  const modelGroups = {
    Audi: ["A1", "A3", "A4", "A5", "A6", "Q2", "Q3", "Q5", "Q7", "e-tron"],
    BMW: ["Serie 1", "Serie 3", "Serie 5", "X1", "X3", "X5", "X6"],
    Mercedes: ["Clase A", "Clase C", "Clase E", "GLA", "GLC", "GLE"],
    Volkswagen: ["Golf", "Polo", "Passat", "Tiguan", "T-Roc", "Touran", "Arteon"],
    Toyota: ["Auris", "Yaris", "Corolla", "C-HR", "RAV4", "Prius", "Aygo"],
    Renault: ["Clio", "Captur", "Megane", "Kadjar", "Austral", "Scenic"],
    Peugeot: ["208", "308", "2008", "3008", "5008", "508"],
    Citroën: ["C3", "C4", "C5 Aircross", "Berlingo"],
    Ford: ["Fiesta", "Focus", "Kuga", "Puma", "Mondeo"],
    Hyundai: ["i20", "i30", "Kona", "Tucson", "Santa Fe"],
    Kia: ["Picanto", "Rio", "Ceed", "Sportage", "Niro", "Sorento"],
    Nissan: ["Micra", "Juke", "Qashqai", "X-Trail", "Leaf"],
    Volvo: ["XC40", "XC60", "XC90", "C40", "V60"],
    Skoda: ["Fabia", "Octavia", "Superb", "Karoq", "Kodiaq"],
    Seat: ["Ibiza", "Leon", "Arona", "Ateca", "Tarraco"],
    Cupra: ["Formentor", "Born", "Leon", "Ateca"],
    Opel: ["Corsa", "Astra", "Mokka", "Grandland", "Insignia"],
    Fiat: ["500", "Panda", "Tipo", "500X"],
    Dacia: ["Sandero", "Duster", "Jogger", "Logan"],
    Mazda: ["Mazda2", "Mazda3", "CX-3", "CX-30", "CX-5"],
    Honda: ["Civic", "Jazz", "HR-V", "CR-V"],
    Jeep: ["Renegade", "Compass", "Cherokee", "Wrangler"],
    Porsche: ["Macan", "Cayenne", "Panamera", "911", "Taycan"],
    Tesla: ["Model 3", "Model Y", "Model S", "Model X"],
    BYD: ["Seal", "Atto 3", "Dolphin", "Tang", "Han"],
    MG: ["MG4", "ZS EV", "HS", "EHS"],
    Omoda: ["Omoda 5", "Omoda 7"],
    Jaecoo: ["Jaecoo 7", "Jaecoo 5"],
    Leapmotor: ["C10", "T03"],
    NIO: ["EL6", "ET5", "ET7"],
    XPeng: ["G6", "G9", "P7"],
    Chery: ["Tiggo 7", "Tiggo 8"],
    "Lynk & Co": ["01", "08"],
    Zeekr: ["001", "X"],
    Polestar: ["Polestar 2", "Polestar 3"],
    Smart: ["ForTwo", "ForFour", "#1", "#3"],
  };

  const models = modelGroups[brand] || [];
  return models.find((model) => normalized.includes(normalizeUrl(model))) || "";
}

function buildCandidateId(brand, model, status) {
  return [
    "query",
    normalizeIdPart(status),
    normalizeIdPart(brand || "unknown"),
    normalizeIdPart(model || "unknown"),
  ].join("-");
}

function normalizeUrl(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/%20/g, "-")
    .replace(/[^a-z0-9#]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeIdPart(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}