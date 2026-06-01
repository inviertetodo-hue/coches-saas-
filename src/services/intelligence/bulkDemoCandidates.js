import { parseCarFromUrl } from "../urlParser";

export function buildDemoCandidates(url) {
  const parsed = parseCarFromUrl(url);
  const brand = parsed?.brand || detectBrandFromUrl(url);
  const model = parsed?.model || detectModelFromUrl(url, brand);

  if (brand === "Audi" && model === "A3") {
    return buildAudiA3Candidates();
  }

  if (brand === "BMW" && !model) {
    return buildBmwCandidates();
  }

  if (brand && model) {
    return buildSemanticCandidates({
      brand,
      model,
      title: parsed?.title || [brand, model].filter(Boolean).join(" "),
      bodyType: parsed?.bodyType,
      fuelType: parsed?.fuelType,
      electrified: parsed?.electrified,
    });
  }

  if (brand) {
    return buildBrandOnlyCandidates(brand);
  }

  return buildUnknownCandidates();
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
    "Ferrari",
    "Maserati",
    "Lamborghini",
    "Bentley",
    "Aston Martin",
    "McLaren",
    "Rolls-Royce",
  ];

  return (
    brands.find((brand) => normalized.includes(normalizeUrl(brand))) || ""
  );
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
    Ferrari: ["Roma", "296 GTB", "Portofino", "F8"],
    Maserati: ["Grecale", "Levante", "Ghibli"],
    Lamborghini: ["Urus", "Huracan"],
    Bentley: ["Continental GT", "Bentayga"],
    "Aston Martin": ["DBX", "Vantage"],
    McLaren: ["Artura", "720S"],
    "Rolls-Royce": ["Cullinan", "Ghost"],
  };

  const models = modelGroups[brand] || [];

  return (
    models.find((model) => normalized.includes(normalizeUrl(model))) || ""
  );
}

function buildBrandOnlyCandidates(brand) {
  const defaults = {
    Audi: ["A3", "Q3"],
    BMW: ["Serie 3", "X5"],
    Mercedes: ["Clase A", "GLC"],
    Volkswagen: ["Golf", "Tiguan"],
    Toyota: ["Corolla", "RAV4"],
    Renault: ["Clio", "Captur"],
    Peugeot: ["3008", "208"],
    Citroën: ["C3", "C4"],
    Ford: ["Focus", "Kuga"],
    Hyundai: ["Tucson", "Kona"],
    Kia: ["Sportage", "Niro"],
    Nissan: ["Qashqai", "Juke"],
    Volvo: ["C40", "XC60"],
    Skoda: ["Fabia", "Octavia"],
    Seat: ["Leon", "Ibiza"],
    Cupra: ["Formentor", "Born"],
    Opel: ["Corsa", "Astra"],
    Fiat: ["500", "Tipo"],
    Dacia: ["Sandero", "Duster"],
    Mazda: ["CX-5", "Mazda3"],
    Honda: ["Civic", "HR-V"],
    Jeep: ["Renegade", "Compass"],
    Porsche: ["Macan", "Cayenne"],
    Tesla: ["Model 3", "Model Y"],
    BYD: ["Seal", "Atto 3"],
    MG: ["MG4", "ZS EV"],
    Omoda: ["Omoda 5", "Omoda 7"],
    Jaecoo: ["Jaecoo 7", "Jaecoo 5"],
    Leapmotor: ["C10", "T03"],
    NIO: ["EL6", "ET5"],
    XPeng: ["G6", "G9"],
    Chery: ["Tiggo 7", "Tiggo 8"],
    "Lynk & Co": ["01", "08"],
    Zeekr: ["001", "X"],
    Polestar: ["Polestar 2", "Polestar 3"],
    Smart: ["#1", "#3"],
    Ferrari: ["Roma", "296 GTB"],
    Maserati: ["Grecale", "Levante"],
    Lamborghini: ["Urus", "Huracan"],
    Bentley: ["Continental GT", "Bentayga"],
    "Aston Martin": ["DBX", "Vantage"],
    McLaren: ["Artura", "720S"],
    "Rolls-Royce": ["Cullinan", "Ghost"],
  };

  const models = defaults[brand] || ["Gama"];

  return [
    buildBrandCandidate({ brand, model: models[0], index: 1, signal: "primary" }),
    buildBrandCandidate({ brand, model: models[1] || models[0], index: 2, signal: "secondary" }),
    buildBrandCandidate({ brand, model: models[0], index: 3, signal: "fallback" }),
  ];
}

function buildBrandCandidate({ brand, model, index, signal }) {
  const isFallback = signal === "fallback";
  const baseTitle = [brand, model].filter(Boolean).join(" ");
  const isLuxury = isLuxuryBrand(brand);
  const isEvBrand = isEvFocusedBrand(brand);

  return {
    id: buildCandidateId(brand, model, index),
    sourceMode: isFallback ? "mock-fallback" : "semantic-brand-feed",
    sourceStatus: "ok",
    title: isFallback ? `${baseTitle} Demo Candidate` : `${baseTitle} mercado europeo`,
    brand,
    model,
    year: isFallback ? 2025 : index === 1 ? 2022 : 2021,
    price: buildEstimatedPrice({ isLuxury, isEvBrand, index, isFallback }),
    mileage: isFallback ? 15000 : index === 1 ? 48500 : 68500,
    roi: isFallback ? -2 : index === 1 ? 6 : 3,
    profit: isFallback
      ? -420
      : isLuxury
        ? 8500 - index * 1200
        : isEvBrand
          ? 2300 - index * 600
          : 1600 - index * 400,
    matchScore: isFallback ? 70 : index === 1 ? 82 : 76,
    comparableConfidence: isFallback ? 60 : index === 1 ? 84 : 78,
  };
}

function buildSemanticCandidates({ brand, model, title, bodyType, fuelType, electrified }) {
  const baseTitle = [brand, model].filter(Boolean).join(" ");
  const isSuv = bodyType === "SUV";
  const isElectric = fuelType === "EV" || electrified || isEvFocusedBrand(brand);
  const isLuxury = isLuxuryBrand(brand);

  return [
    {
      id: buildCandidateId(brand, model, 1),
      sourceMode: "semantic-url-feed",
      sourceStatus: "ok",
      title: title || `${baseTitle} oportunidad mercado`,
      brand,
      model,
      year: 2022,
      price: isLuxury ? 119900 : isElectric ? 28900 : isSuv ? 31900 : 18900,
      mileage: isLuxury ? 28500 : isElectric ? 42000 : isSuv ? 58500 : 39500,
      roi: isLuxury ? 5 : isElectric ? 7 : isSuv ? 6 : 5,
      profit: isLuxury ? 7200 : isElectric ? 2100 : isSuv ? 2400 : 1150,
      matchScore: 82,
      comparableConfidence: 84,
    },
    {
      id: buildCandidateId(brand, model, 2),
      sourceMode: "semantic-url-feed",
      sourceStatus: "ok",
      title: `${baseTitle} comparable mercado`,
      brand,
      model,
      year: 2021,
      price: isLuxury ? 104900 : isElectric ? 26900 : isSuv ? 29400 : 16950,
      mileage: isLuxury ? 42000 : isElectric ? 61000 : isSuv ? 73500 : 54800,
      roi: 3,
      profit: isLuxury ? 4800 : isElectric ? 950 : isSuv ? 1300 : 620,
      matchScore: 76,
      comparableConfidence: 78,
    },
    {
      id: buildCandidateId(brand, model, 3),
      sourceMode: "mock-fallback",
      sourceStatus: "ok",
      title: `${baseTitle} Demo Candidate`,
      brand,
      model,
      year: 2025,
      price: isLuxury ? 139900 : isElectric ? 30900 : isSuv ? 33900 : 19900,
      mileage: 15000,
      roi: -2,
      profit: -420,
      matchScore: 70,
      comparableConfidence: 60,
    },
  ];
}

function buildAudiA3Candidates() {
  return [
    {
      id: "preview-audi-a3-1",
      sourceMode: "real-feed",
      sourceStatus: "ok",
      title: "Audi A3 Sportback 35 TFSI S tronic",
      brand: "Audi",
      model: "A3",
      year: 2023,
      price: 24890,
      mileage: 31500,
      roi: 8,
      profit: 2200,
      matchScore: 88,
      comparableConfidence: 91,
    },
    {
      id: "preview-audi-a3-2",
      sourceMode: "real-feed",
      sourceStatus: "ok",
      title: "Audi A3 40 TFSIe Advanced",
      brand: "Audi",
      model: "A3",
      year: 2022,
      price: 26900,
      mileage: 27821,
      roi: 6,
      profit: 1630,
      matchScore: 82,
      comparableConfidence: 88,
    },
    {
      id: "preview-audi-a3-3",
      sourceMode: "real-feed",
      sourceStatus: "ok",
      title: "Audi A3 30 TDI S tronic",
      brand: "Audi",
      model: "A3",
      year: 2021,
      price: 16950,
      mileage: 37212,
      roi: -7,
      profit: -1207,
      matchScore: 78,
      comparableConfidence: 84,
    },
    {
      id: "preview-audi-a3-4",
      sourceMode: "mock-fallback",
      sourceStatus: "ok",
      title: "Audi A3 Demo Candidate",
      brand: "Audi",
      model: "A3",
      year: 2025,
      price: 16995,
      mileage: 15000,
      roi: -2,
      profit: -351,
      matchScore: 70,
      comparableConfidence: 60,
    },
  ];
}

function buildBmwCandidates() {
  return [
    {
      id: "preview-bmw-1",
      sourceMode: "real-feed",
      sourceStatus: "ok",
      title: "BMW Serie 3 320d automático",
      brand: "BMW",
      model: "Serie 3",
      year: 2022,
      price: 28900,
      mileage: 56000,
      roi: 7,
      profit: 2100,
      matchScore: 84,
      comparableConfidence: 88,
    },
    {
      id: "preview-bmw-2",
      sourceMode: "real-feed",
      sourceStatus: "ok",
      title: "BMW X5 45e xDrive",
      brand: "BMW",
      model: "X5",
      year: 2021,
      price: 52900,
      mileage: 69000,
      roi: 9,
      profit: 4600,
      matchScore: 86,
      comparableConfidence: 89,
    },
    {
      id: "preview-bmw-3",
      sourceMode: "mock-fallback",
      sourceStatus: "ok",
      title: "BMW Demo Candidate",
      brand: "BMW",
      model: "",
      year: 0,
      price: 0,
      mileage: null,
      roi: 0,
      profit: 0,
      matchScore: 35,
      comparableConfidence: 25,
    },
  ];
}

function buildUnknownCandidates() {
  return [
    {
      id: "preview-unknown-1",
      sourceMode: "review",
      sourceStatus: "unknown",
      title: "Candidato pendiente de identificación",
      brand: "",
      model: "",
      year: 0,
      price: 0,
      mileage: null,
      roi: 0,
      profit: 0,
      matchScore: 30,
      comparableConfidence: 30,
    },
    {
      id: "preview-unknown-2",
      sourceMode: "mock-fallback",
      sourceStatus: "ok",
      title: "Candidato fallback de ejemplo",
      brand: "",
      model: "",
      year: 0,
      price: 0,
      mileage: null,
      roi: 0,
      profit: 0,
      matchScore: 20,
      comparableConfidence: 20,
    },
  ];
}

function isEvFocusedBrand(brand) {
  return [
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
    "Seres",
    "Aiways",
    "Tesla",
    "Smart",
  ].includes(brand);
}

function isLuxuryBrand(brand) {
  return [
    "Ferrari",
    "Maserati",
    "Lamborghini",
    "Bentley",
    "Aston Martin",
    "McLaren",
    "Rolls-Royce",
  ].includes(brand);
}

function buildEstimatedPrice({ isLuxury, isEvBrand, index, isFallback }) {
  if (isLuxury) {
    if (isFallback) return 139900;
    return index === 1 ? 119900 : 104900;
  }

  if (isEvBrand) {
    if (isFallback) return 33900;
    return index === 1 ? 31900 : 28400;
  }

  if (isFallback) return 24900;

  return index === 1 ? 22900 : 20400;
}

function buildCandidateId(brand, model, index) {
  return ["preview", normalizeIdPart(brand), normalizeIdPart(model), index].join("-");
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