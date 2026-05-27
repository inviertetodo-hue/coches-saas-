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
    "a1", "a3", "a4", "a5", "a6", "a7", "a8",
    "q2", "q3", "q5", "q7", "q8",
    "rs3", "rs4", "rs5", "rs6", "rs7",
    "s3", "s4", "s5", "s6",
    "tt",
    "serie 1", "serie 2", "serie 3",
    "serie 4", "serie 5", "serie 7",
    "x1", "x2", "x3", "x4", "x5",
    "x6", "x7",
    "m2", "m3", "m4", "m5",
    "classe a", "classe b",
    "classe c", "classe e",
    "classe s",
    "cla", "cls",
    "gla", "glb", "glc",
    "gle", "gls",
    "golf", "polo",
    "passat", "tiguan",
    "touareg", "arteon",
    "leon", "ibiza",
    "ateca", "formentor",
    "911", "cayenne",
    "macan", "panamera",
    "taycan",
    "model 3",
    "model y",
    "model s",
    "model x",
  ];

  const stopWords = [
    "http",
    "https",
    "www",
    "mobile",
    "autoscout24",
    "de",
    "com",
    "es",
    "it",
    "fr",
    "auto",
    "cars",
    "vehicle",
    "details",
    "search",
    "campaign",
    "ref",
  ];

  const parts = cleanUrl
    .split("/")
    .join("-")
    .split("-")
    .map((part) => part.trim())
    .filter(Boolean);

  const usefulParts = parts.filter((part) => {
    if (part.length < 2) return false;

    if (stopWords.includes(part))
      return false;

    if (/^\d{6,}$/.test(part))
      return false;

    return true;
  });

  let detectedBrand = "";

  for (const part of usefulParts) {
    if (brandAliases[part]) {
      detectedBrand =
        brandAliases[part];

      break;
    }
  }

  const normalizedText =
    usefulParts.join(" ");

  let detectedModel = "";

  for (const model of knownModels) {
    const modelKey =
      model.replaceAll(" ", "-");

    if (
      normalizedText.includes(model) ||
      cleanUrl.includes(modelKey)
    ) {
      detectedModel =
        formatModel(model);

      break;
    }
  }

  if (!detectedModel) {
    detectedModel = usefulParts
      .slice(0, 4)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const detectedYear =
    detectYear(cleanUrl);

  const detectedEngine =
    detectEngine(cleanUrl);

  const detectedTransmission =
    detectTransmission(cleanUrl);

  const detectedDrivetrain =
    detectDrivetrain(cleanUrl);

  const detectedPerformance =
    detectPerformancePackage(
      cleanUrl
    );

  const detectedFuelType =
    detectFuelType(cleanUrl);

  const detectedBodyType =
    detectBodyType(cleanUrl);

  const electrified =
    detectElectrified(cleanUrl);

  const finalTitle = [
    detectedBrand,
    detectedModel,
    detectedYear,
    detectedEngine,
    detectedTransmission,
    detectedDrivetrain,
    detectedPerformance,
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
    transmission:
      detectedTransmission,
    drivetrain:
      detectedDrivetrain,
    performancePackage:
      detectedPerformance,
    fuelType:
      detectedFuelType,
    bodyType:
      detectedBodyType,
    electrified,
    title: finalTitle,
  };
}

function detectYear(text) {
  const years = text.match(
    /\b(200[5-9]|201[0-9]|202[0-6])\b/g
  );

  if (!years) return "";

  return years[0];
}

function detectEngine(text) {
  const enginePatterns = [
    /\b\d\.\d\s?tdi\b/,
    /\b\d\.\d\s?tfsi\b/,
    /\b\d\.\d\s?tsi\b/,
    /\b\d\.\d\s?dci\b/,
    /\b\d\.\d\s?hdi\b/,
    /\b\d\.\d\s?hybrid\b/,
    /\b\d\.\d\s?phev\b/,
    /\b\d{2,3}\s?cv\b/,
    /\b\d{2,3}\s?ps\b/,
  ];

  for (const pattern of enginePatterns) {
    const match = text.match(pattern);

    if (match) {
      return formatEngine(
        match[0]
      );
    }
  }

  return "";
}

function detectTransmission(text) {
  const automaticWords = [
    "automatic",
    "automatik",
    "dsg",
    "s-tronic",
    "tiptronic",
    "steptronic",
    "pdk",
  ];

  if (
    automaticWords.some((word) =>
      text.includes(word)
    )
  ) {
    return "Automático";
  }

  if (
    text.includes("manual")
  ) {
    return "Manual";
  }

  return "";
}

function detectDrivetrain(text) {
  if (
    text.includes("quattro")
  ) {
    return "quattro AWD";
  }

  if (
    text.includes("xdrive")
  ) {
    return "xDrive AWD";
  }

  if (
    text.includes("4matic")
  ) {
    return "4Matic AWD";
  }

  if (
    text.includes("awd")
  ) {
    return "AWD";
  }

  if (
    text.includes("rwd")
  ) {
    return "RWD";
  }

  if (
    text.includes("fwd")
  ) {
    return "FWD";
  }

  return "";
}

function detectPerformancePackage(
  text
) {
  if (text.includes("amg"))
    return "AMG";

  if (text.includes("rs"))
    return "RS";

  if (text.includes("gti"))
    return "GTI";

  if (
    text.includes("m-sport") ||
    text.includes("msport")
  ) {
    return "M Sport";
  }

  if (
    text.includes("s-line") ||
    text.includes("sline")
  ) {
    return "S Line";
  }

  if (
    text.includes("cupra")
  ) {
    return "Cupra";
  }

  return "";
}

function detectFuelType(text) {
  if (
    text.includes("phev")
  ) {
    return "PHEV";
  }

  if (
    text.includes("hybrid")
  ) {
    return "Hybrid";
  }

  if (
    text.includes("electric") ||
    text.includes("electrico") ||
    text.includes("eléctrico")
  ) {
    return "EV";
  }

  if (
    text.includes("diesel")
  ) {
    return "Diesel";
  }

  if (
    text.includes("gasolina") ||
    text.includes("petrol")
  ) {
    return "Gasolina";
  }

  return "";
}

function detectBodyType(text) {
  if (
    text.includes("suv")
  ) {
    return "SUV";
  }

  if (
    text.includes("wagon") ||
    text.includes("touring") ||
    text.includes("avant")
  ) {
    return "Wagon";
  }

  if (
    text.includes("sedan") ||
    text.includes("berlina")
  ) {
    return "Sedan";
  }

  if (
    text.includes("coupe")
  ) {
    return "Coupe";
  }

  if (
    text.includes("cabrio") ||
    text.includes("cabriolet")
  ) {
    return "Cabrio";
  }

  return "";
}

function detectElectrified(
  text
) {
  return (
    text.includes("hybrid") ||
    text.includes("phev") ||
    text.includes("electric") ||
    text.includes("electrico") ||
    text.includes("eléctrico")
  );
}

function formatModel(model) {
  return model
    .split(" ")
    .map((word) => {
      if (
        /^[a-z]\d$/i.test(word)
      )
        return word.toUpperCase();

      if (
        /^rs\d$/i.test(word)
      )
        return word.toUpperCase();

      if (
        /^m\d$/i.test(word)
      )
        return word.toUpperCase();

      if (
        /^x\d$/i.test(word)
      )
        return word.toUpperCase();

      if (
        /^q\d$/i.test(word)
      )
        return word.toUpperCase();

      return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
      );
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
    .replace("hybrid", "Hybrid")
    .replace("phev", "PHEV")
    .replace("cv", "CV")
    .replace("ps", "PS")
    .trim();
}