export function parseCarFromUrl(url) {
  if (!url || typeof url !== "string") {
    return null;
  }

  const cleanUrl = decodeURIComponent(url)
    .toLowerCase()
    .replaceAll("+", " ")
    .replaceAll("_", "-")
    .replace(/[?&=.#]/g, "-");

  const brandAliases = {
    bmw: "BMW",
    audi: "Audi",
    mercedes: "Mercedes-Benz",
    "mercedes-benz": "Mercedes-Benz",
    volkswagen: "Volkswagen",
    vw: "Volkswagen",
    porsche: "Porsche",
    toyota: "Toyota",
    ford: "Ford",
    seat: "SEAT",
    cupra: "Cupra",
    peugeot: "Peugeot",
    renault: "Renault",
    kia: "Kia",
    hyundai: "Hyundai",
    ferrari: "Ferrari",
    lamborghini: "Lamborghini",
    skoda: "Skoda",
    škoda: "Skoda",
    opel: "Opel",
    mazda: "Mazda",
    nissan: "Nissan",
    volvo: "Volvo",
    tesla: "Tesla",
    mini: "MINI",
    fiat: "Fiat",
    honda: "Honda",
    lexus: "Lexus",
    jaguar: "Jaguar",
    land: "Land Rover",
    "land-rover": "Land Rover",
    rover: "Land Rover",
    alfa: "Alfa Romeo",
    "alfa-romeo": "Alfa Romeo",
    maserati: "Maserati",
    dacia: "Dacia",
    citroen: "Citroën",
    citroën: "Citroën",
    ds: "DS",
    jeep: "Jeep",
    smart: "Smart",
  };

  const knownModels = [
    "a1", "a3", "a4", "a5", "a6", "a7", "a8", "q2", "q3", "q5", "q7", "q8",
    "rs3", "rs4", "rs5", "rs6", "rs7", "s3", "s4", "s5", "s6", "tt",
    "serie 1", "serie 2", "serie 3", "serie 4", "serie 5", "serie 7",
    "x1", "x2", "x3", "x4", "x5", "x6", "x7", "m2", "m3", "m4", "m5",
    "classe a", "classe b", "classe c", "classe e", "classe s",
    "cla", "cls", "gla", "glb", "glc", "gle", "gls", "amg",
    "golf", "polo", "passat", "tiguan", "touareg", "arteon", "t roc", "t cross",
    "leon", "ibiza", "ateca", "arona", "formentor",
    "911", "cayenne", "macan", "panamera", "taycan", "boxster", "cayman",
    "model 3", "model y", "model s", "model x",
    "focus", "fiesta", "kuga", "mondeo", "mustang",
    "corolla", "yaris", "rav4", "chr", "land cruiser",
    "clio", "megane", "captur", "kadjar", "koleos",
    "sportage", "ceed", "rio", "sorento",
    "tucson", "i20", "i30", "kona", "santa fe",
    "308", "3008", "5008", "208", "2008",
  ];

  const stopWords = [
    "http", "https", "www", "mobile", "autoscout24", "kleinanzeigen",
    "de", "com", "es", "it", "fr", "nl", "at", "be",
    "auto", "cars", "car", "vehiculo", "vehicle", "gebrauchtwagen",
    "neuwagen", "details", "offer", "ad", "suchen", "search",
    "id", "utm", "source", "campaign", "ref",
  ];

  const parts = cleanUrl
    .split("/")
    .join("-")
    .split("-")
    .map((part) => part.trim())
    .filter(Boolean);

  const usefulParts = parts.filter((part) => {
    if (part.length < 2) return false;
    if (stopWords.includes(part)) return false;
    if (/^\d{6,}$/.test(part)) return false;
    return true;
  });

  let detectedBrand = "";

  for (const part of usefulParts) {
    if (brandAliases[part]) {
      detectedBrand = brandAliases[part];
      break;
    }
  }

  if (!detectedBrand) {
    for (const alias of Object.keys(brandAliases)) {
      if (cleanUrl.includes(alias)) {
        detectedBrand = brandAliases[alias];
        break;
      }
    }
  }

  const normalizedText = usefulParts.join(" ");

  let detectedModel = "";

  for (const model of knownModels) {
    const modelKey = model.replaceAll(" ", "-");
    if (
      normalizedText.includes(model) ||
      cleanUrl.includes(modelKey)
    ) {
      detectedModel = formatModel(model);
      break;
    }
  }

  if (!detectedModel) {
    const brandKeys = Object.keys(brandAliases);

    const candidateParts = usefulParts.filter((part) => {
      if (brandKeys.includes(part)) return false;
      if (Object.values(brandAliases).some((brand) => brand.toLowerCase().includes(part))) return false;
      if (/^\d{4}$/.test(part)) return false;
      if (/^\d+$/.test(part)) return false;
      if (part.length > 25) return false;
      return true;
    });

    detectedModel = candidateParts
      .slice(0, 4)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const detectedYear = detectYear(cleanUrl);
  const detectedEngine = detectEngine(cleanUrl);
  const detectedTransmission = detectTransmission(cleanUrl);

  const finalTitle = [
    detectedBrand,
    detectedModel,
    detectedYear,
    detectedEngine,
    detectedTransmission,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    brand: detectedBrand,
    model: detectedModel,
    year: detectedYear,
    engine: detectedEngine,
    transmission: detectedTransmission,
    title: finalTitle,
  };
}

function detectYear(text) {
  const years = text.match(/\b(200[5-9]|201[0-9]|202[0-6])\b/g);

  if (!years || years.length === 0) {
    return "";
  }

  return years[0];
}

function detectEngine(text) {
  const enginePatterns = [
    /\b\d\.\d\s?tdi\b/,
    /\b\d\.\d\s?tfsi\b/,
    /\b\d\.\d\s?tsi\b/,
    /\b\d\.\d\s?dci\b/,
    /\b\d\.\d\s?hdi\b/,
    /\b\d\.\d\s?bluehdi\b/,
    /\b\d\.\d\s?hybrid\b/,
    /\b\d\.\d\s?phev\b/,
    /\b\d\.\d\s?turbo\b/,
    /\b\d{2,3}\s?kw\b/,
    /\b\d{2,3}\s?cv\b/,
    /\b\d{2,3}\s?ps\b/,
  ];

  for (const pattern of enginePatterns) {
    const match = text.match(pattern);
    if (match) {
      return formatEngine(match[0]);
    }
  }

  if (text.includes("diesel")) return "Diesel";
  if (text.includes("benzina") || text.includes("gasolina") || text.includes("petrol")) return "Gasolina";
  if (text.includes("hybrid") || text.includes("hibrido") || text.includes("híbrido")) return "Híbrido";
  if (text.includes("electric") || text.includes("electrico") || text.includes("eléctrico")) return "Eléctrico";

  return "";
}

function detectTransmission(text) {
  const automaticWords = [
    "automatic",
    "automatik",
    "automatica",
    "automático",
    "auto",
    "dsg",
    "s-tronic",
    "stronic",
    "tiptronic",
    "steptronic",
    "pdk",
  ];

  const manualWords = [
    "manual",
    "schaltgetriebe",
  ];

  if (automaticWords.some((word) => text.includes(word))) {
    return "Automático";
  }

  if (manualWords.some((word) => text.includes(word))) {
    return "Manual";
  }

  return "";
}

function formatModel(model) {
  return model
    .split(" ")
    .map((word) => {
      if (/^[a-z]\d$/i.test(word)) return word.toUpperCase();
      if (/^rs\d$/i.test(word)) return word.toUpperCase();
      if (/^s\d$/i.test(word)) return word.toUpperCase();
      if (/^m\d$/i.test(word)) return word.toUpperCase();
      if (/^x\d$/i.test(word)) return word.toUpperCase();
      if (/^q\d$/i.test(word)) return word.toUpperCase();
      if (word === "amg") return "AMG";
      if (word === "chr") return "C-HR";
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function formatEngine(engine) {
  return engine
    .replace(/\s+/g, " ")
    .replace("tdi", "TDI")
    .replace("tfsi", "TFSI")
    .replace("tsi", "TSI")
    .replace("dci", "DCI")
    .replace("hdi", "HDI")
    .replace("bluehdi", "BlueHDi")
    .replace("hybrid", "Hybrid")
    .replace("phev", "PHEV")
    .replace("kw", "kW")
    .replace("cv", "CV")
    .replace("ps", "PS")
    .trim();
}