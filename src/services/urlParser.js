export function parseCarFromUrl(url) {
  if (!url || typeof url !== "string") {
    return null;
  }

  const cleanUrl = normalizeText(url);
  const tokens = tokenize(cleanUrl);
  const normalizedText = tokens.join(" ");

  const detectedBrand = detectBrand(normalizedText, tokens);
  const detectedModel = detectModel(normalizedText, detectedBrand);
  const detectedYear = detectYear(normalizedText);
  const detectedEngine = detectEngine(normalizedText);
  const detectedTransmission = detectTransmission(normalizedText);
  const detectedDrivetrain = detectDrivetrain(normalizedText);
  const detectedPerformance = detectPerformancePackage(normalizedText);
  const detectedFuelType = detectFuelType(normalizedText);
  const detectedBodyType = detectBodyType(normalizedText, detectedModel);
  const electrified = detectElectrified(normalizedText);
  const premiumConfig = detectPremiumConfig(normalizedText, {
    brand: detectedBrand,
    model: detectedModel,
    drivetrain: detectedDrivetrain,
    performancePackage: detectedPerformance,
    fuelType: detectedFuelType,
    bodyType: detectedBodyType,
  });

  const finalTitle = buildTitle({
    brand: detectedBrand,
    model: detectedModel,
    year: detectedYear,
    engine: detectedEngine,
    transmission: detectedTransmission,
    drivetrain: detectedDrivetrain,
    performancePackage: detectedPerformance,
  });

  return {
    brand: detectedBrand,
    model: detectedModel,
    year: detectedYear,
    engine: detectedEngine,
    transmission: detectedTransmission,
    drivetrain: detectedDrivetrain,
    performancePackage: detectedPerformance,
    fuelType: detectedFuelType,
    bodyType: detectedBodyType,
    electrified,
    premiumConfig,
    title: finalTitle || buildFallbackTitle(tokens),
  };
}

function normalizeText(value) {
  return decodeURIComponent(String(value))
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("+", " ")
    .replaceAll("_", " ")
    .replaceAll("%20", " ")
    .replace(/[?&=.#,/|()[\]{}:;]/g, " ")
    .replace(/[-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  const stopWords = new Set([
    "http",
    "https",
    "www",
    "mobile",
    "autoscout24",
    "auto",
    "autos",
    "cars",
    "vehicle",
    "details",
    "search",
    "campaign",
    "ref",
    "ad",
    "offer",
    "angebote",
    "gebrauchtwagen",
    "neuwagen",
    "de",
    "com",
    "es",
    "it",
    "fr",
    "nl",
    "be",
    "at",
  ]);

  return text
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => part.length >= 2)
    .filter((part) => !stopWords.has(part))
    .filter((part) => !/^\d{6,}$/.test(part));
}

const BRAND_ALIASES = [
  { keys: ["mercedes benz", "mercedes", "benz"], value: "Mercedes-Benz" },
  { keys: ["land rover", "range rover"], value: "Land Rover" },
  { keys: ["alfa romeo"], value: "Alfa Romeo" },
  { keys: ["vw", "volkswagen"], value: "Volkswagen" },
  { keys: ["bmw"], value: "BMW" },
  { keys: ["audi"], value: "Audi" },
  { keys: ["porsche"], value: "Porsche" },
  { keys: ["volvo"], value: "Volvo" },
  { keys: ["tesla"], value: "Tesla" },
  { keys: ["mini"], value: "MINI" },
  { keys: ["lexus"], value: "Lexus" },
  { keys: ["jaguar"], value: "Jaguar" },
  { keys: ["maserati"], value: "Maserati" },
  { keys: ["ferrari"], value: "Ferrari" },
  { keys: ["lamborghini"], value: "Lamborghini" },
  { keys: ["cupra"], value: "Cupra" },
  { keys: ["seat"], value: "SEAT" },
  { keys: ["skoda"], value: "Skoda" },
  { keys: ["toyota"], value: "Toyota" },
  { keys: ["ford"], value: "Ford" },
  { keys: ["peugeot"], value: "Peugeot" },
  { keys: ["renault"], value: "Renault" },
  { keys: ["kia"], value: "Kia" },
  { keys: ["hyundai"], value: "Hyundai" },
  { keys: ["opel"], value: "Opel" },
  { keys: ["mazda"], value: "Mazda" },
  { keys: ["nissan"], value: "Nissan" },
  { keys: ["fiat"], value: "Fiat" },
  { keys: ["honda"], value: "Honda" },
  { keys: ["dacia"], value: "Dacia" },
  { keys: ["citroen"], value: "Citroën" },
  { keys: ["ds"], value: "DS" },
  { keys: ["jeep"], value: "Jeep" },
  { keys: ["smart"], value: "Smart" },
];

const MODEL_GROUPS = {
  BMW: [
    "serie 1", "serie 2", "serie 3", "serie 4", "serie 5", "serie 7", "serie 8",
    "118", "120", "125", "128", "135", "140",
    "218", "220", "225", "230", "235", "240",
    "318", "320", "325", "330", "335", "340",
    "420", "430", "435", "440",
    "520", "525", "530", "535", "540", "545", "550",
    "730", "740", "745", "750", "760",
    "x1", "x2", "x3", "x4", "x5", "x6", "x7",
    "m2", "m3", "m4", "m5", "m8",
    "ix", "i3", "i4", "i5", "i7", "i8",
    "z4",
  ],

  Audi: [
    "a1", "a3", "a4", "a5", "a6", "a7", "a8",
    "q2", "q3", "q4", "q5", "q7", "q8",
    "rs3", "rs4", "rs5", "rs6", "rs7", "rsq3", "rsq8",
    "s3", "s4", "s5", "s6", "s7", "s8",
    "e tron", "etron", "tt", "r8",
  ],

  "Mercedes-Benz": [
    "classe a", "classe b", "classe c", "classe e", "classe s",
    "class a", "class b", "class c", "class e", "class s",
    "a 180", "a 200", "a 220", "a 250", "a35", "a45",
    "c 200", "c 220", "c 300", "c 400", "c 43", "c 63",
    "e 200", "e 220", "e 300", "e 400", "e 43", "e 53", "e 63",
    "s 350", "s 400", "s 500", "s 580", "s 63",
    "cla", "cls", "gla", "glb", "glc", "gle", "gls", "g class",
    "eqc", "eqa", "eqb", "eqe", "eqs",
    "sl", "slk", "amg gt",
  ],

  Porsche: [
    "911", "992", "991", "997",
    "cayenne", "macan", "panamera", "taycan",
    "boxster", "cayman",
  ],

  Volvo: [
    "xc40", "xc60", "xc90",
    "v60", "v90", "s60", "s90",
    "ex30", "ex40", "ex90",
  ],

  "Land Rover": [
    "range rover", "range rover sport", "range rover velar", "range rover evoque",
    "defender", "discovery", "discovery sport",
    "sport", "velar", "evoque",
  ],

  Tesla: [
    "model 3", "model y", "model s", "model x",
  ],

  Cupra: [
    "formentor", "ateca", "leon", "born", "tavascan",
  ],

  Volkswagen: [
    "golf", "polo", "passat", "tiguan", "touareg", "arteon", "id 3", "id 4", "id 5", "id buzz",
  ],

  Toyota: [
    "rav4", "land cruiser", "corolla", "camry", "yaris", "chr", "c hr", "supra",
  ],

  Lexus: [
    "nx", "rx", "ux", "es", "ls", "lc", "rc",
  ],

  Jaguar: [
    "f pace", "e pace", "i pace", "xe", "xf", "xj", "f type",
  ],
};

const GENERIC_MODELS = Object.values(MODEL_GROUPS).flat();

function detectBrand(text, tokens) {
  for (const brand of BRAND_ALIASES) {
    if (brand.keys.some((key) => hasPhrase(text, key))) {
      return brand.value;
    }
  }

  for (const token of tokens) {
    const match = BRAND_ALIASES.find((brand) => brand.keys.includes(token));
    if (match) return match.value;
  }

  return "";
}

function detectModel(text, brand) {
  const models = brand && MODEL_GROUPS[brand] ? MODEL_GROUPS[brand] : GENERIC_MODELS;

  const sortedModels = [...models].sort((a, b) => b.length - a.length);

  for (const model of sortedModels) {
    if (hasPhrase(text, model)) {
      return formatModel(model, brand);
    }
  }

  return "";
}

function detectYear(text) {
  const years = text.match(/\b(200[5-9]|201[0-9]|202[0-7])\b/g);
  return years ? years[0] : "";
}

function detectEngine(text) {
  const patterns = [
    /\b(18|20|25|28|30|35|40|45|50|55|60)\s?(tdi|tfsi|tfsi e|tfsie)\b/,
    /\b(300de|300e|350de|350e|400e|450e|580e)\b/,
    /\b(xdrive\s?)?(30e|40e|45e|50e)\b/,
    /\b(t6|t8|recharge)\b/,
    /\b(p400e|p440e|p460e|p510e|p550e)\b/,
    /\b(e hybrid|e-hybrid|phev|plug in hybrid|plug-in hybrid)\b/,
    /\b\d\.\d\s?(tdi|tfsi|tsi|dci|hdi|hybrid|phev)\b/,
    /\b\d{2,3}\s?(cv|ps|kw)\b/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return formatEngine(match[0]);
  }

  return "";
}

function detectTransmission(text) {
  const automaticWords = [
    "automatic",
    "automatik",
    "automatico",
    "automatica",
    "dsg",
    "s tronic",
    "stronic",
    "tiptronic",
    "steptronic",
    "pdk",
    "9g tronic",
    "7g tronic",
    "zf",
  ];

  if (automaticWords.some((word) => hasPhrase(text, word))) {
    return "Automático";
  }

  if (hasPhrase(text, "manual")) {
    return "Manual";
  }

  return "";
}

function detectDrivetrain(text) {
  if (hasPhrase(text, "quattro")) return "quattro AWD";
  if (hasPhrase(text, "xdrive")) return "xDrive AWD";
  if (hasPhrase(text, "4matic")) return "4MATIC AWD";
  if (hasPhrase(text, "4 motion") || hasPhrase(text, "4motion")) return "4Motion AWD";
  if (hasPhrase(text, "awd")) return "AWD";
  if (hasPhrase(text, "4wd")) return "4WD";
  if (hasPhrase(text, "rwd")) return "RWD";
  if (hasPhrase(text, "fwd")) return "FWD";

  return "";
}

function detectPerformancePackage(text) {
  const packages = [
    { keys: ["amg line", "amg-line"], value: "AMG Line" },
    { keys: ["amg"], value: "AMG" },
    { keys: ["m sport", "m-sport", "msport"], value: "M Sport" },
    { keys: ["competition"], value: "Competition" },
    { keys: ["s line", "s-line", "sline"], value: "S Line" },
    { keys: ["rs"], value: "RS" },
    { keys: ["gti"], value: "GTI" },
    { keys: ["gtd"], value: "GTD" },
    { keys: ["r line", "r-line", "rline"], value: "R Line" },
    { keys: ["vignale"], value: "Vignale" },
    { keys: ["autobiography"], value: "Autobiography" },
    { keys: ["hse"], value: "HSE" },
    { keys: ["r dynamic", "r-dynamic"], value: "R-Dynamic" },
    { keys: ["inscription"], value: "Inscription" },
    { keys: ["r design", "r-design"], value: "R-Design" },
    { keys: ["recharge"], value: "Recharge" },
  ];

  for (const item of packages) {
    if (item.keys.some((key) => hasPhrase(text, key))) {
      return item.value;
    }
  }

  return "";
}

function detectFuelType(text) {
  if (
    hasPhrase(text, "phev") ||
    hasPhrase(text, "plug in hybrid") ||
    hasPhrase(text, "plug-in hybrid") ||
    hasPhrase(text, "tfsie") ||
    hasPhrase(text, "tfsi e") ||
    /\b(30e|40e|45e|50e|300e|300de|350e|350de|400e|450e|580e|p400e|p440e|p460e|p510e|p550e)\b/.test(text)
  ) {
    return "PHEV";
  }

  if (
    hasPhrase(text, "hybrid") ||
    hasPhrase(text, "hibrido") ||
    hasPhrase(text, "mhev") ||
    hasPhrase(text, "mild hybrid") ||
    hasPhrase(text, "recharge")
  ) {
    return "Hybrid";
  }

  if (
    hasPhrase(text, "electric") ||
    hasPhrase(text, "electrico") ||
    hasPhrase(text, "ev") ||
    hasPhrase(text, "bev") ||
    hasPhrase(text, "e tron") ||
    hasPhrase(text, "etron") ||
    hasPhrase(text, "taycan")
  ) {
    return "EV";
  }

  if (
    hasPhrase(text, "diesel") ||
    /\b(tdi|dci|hdi|cdi|bluetech|300de|350de)\b/.test(text)
  ) {
    return "Diesel";
  }

  if (
    hasPhrase(text, "gasolina") ||
    hasPhrase(text, "petrol") ||
    hasPhrase(text, "benzina") ||
    /\b(tfsi|tsi)\b/.test(text)
  ) {
    return "Gasolina";
  }

  return "";
}

function detectBodyType(text, model) {
  const combined = `${text} ${String(model || "").toLowerCase()}`;

  if (
    hasPhrase(combined, "suv") ||
    /\b(x1|x2|x3|x4|x5|x6|x7|q2|q3|q4|q5|q7|q8|glc|gle|gls|gla|glb|cayenne|macan|xc40|xc60|xc90|touareg|tiguan|formentor|rav4|range rover|defender|discovery)\b/.test(combined)
  ) {
    return "SUV";
  }

  if (
    hasPhrase(combined, "wagon") ||
    hasPhrase(combined, "touring") ||
    hasPhrase(combined, "avant") ||
    hasPhrase(combined, "estate") ||
    hasPhrase(combined, "variant") ||
    hasPhrase(combined, "sportbrake")
  ) {
    return "Wagon";
  }

  if (
    hasPhrase(combined, "sedan") ||
    hasPhrase(combined, "berlina") ||
    hasPhrase(combined, "limousine")
  ) {
    return "Sedan";
  }

  if (
    hasPhrase(combined, "coupe") ||
    hasPhrase(combined, "coupe")
  ) {
    return "Coupe";
  }

  if (
    hasPhrase(combined, "cabrio") ||
    hasPhrase(combined, "cabriolet") ||
    hasPhrase(combined, "convertible") ||
    hasPhrase(combined, "roadster")
  ) {
    return "Cabrio";
  }

  return "";
}

function detectElectrified(text) {
  return (
    detectFuelType(text) === "PHEV" ||
    detectFuelType(text) === "Hybrid" ||
    detectFuelType(text) === "EV"
  );
}

function detectPremiumConfig(text, data) {
  const signals = [];

  if (data.drivetrain) signals.push(data.drivetrain);
  if (data.performancePackage) signals.push(data.performancePackage);
  if (data.fuelType === "PHEV") signals.push("PHEV vendible");
  if (data.fuelType === "EV") signals.push("EV premium");
  if (data.bodyType === "SUV") signals.push("SUV alta demanda");

  if (hasPhrase(text, "panoramic") || hasPhrase(text, "panorama")) {
    signals.push("Techo panorámico");
  }

  if (hasPhrase(text, "head up") || hasPhrase(text, "hud")) {
    signals.push("Head-Up Display");
  }

  if (hasPhrase(text, "matrix") || hasPhrase(text, "laser light")) {
    signals.push("Iluminación premium");
  }

  if (hasPhrase(text, "air suspension") || hasPhrase(text, "luftfederung")) {
    signals.push("Suspensión neumática");
  }

  if (hasPhrase(text, "soft close")) {
    signals.push("Soft Close");
  }

  if (hasPhrase(text, "burmester") || hasPhrase(text, "bowers") || hasPhrase(text, "bang olufsen")) {
    signals.push("Sonido premium");
  }

  if (hasPhrase(text, "7 sitzer") || hasPhrase(text, "7 seats") || hasPhrase(text, "7 plazas")) {
    signals.push("7 plazas");
  }

  return signals.join(" · ");
}

function buildTitle({
  brand,
  model,
  year,
  engine,
  transmission,
  drivetrain,
  performancePackage,
}) {
  return [
    brand,
    model,
    year,
    engine,
    transmission,
    drivetrain,
    performancePackage,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildFallbackTitle(tokens) {
  return tokens
    .filter((token) => !/^\d+$/.test(token))
    .slice(0, 5)
    .map(capitalizeWord)
    .join(" ")
    .trim();
}

function hasPhrase(text, phrase) {
  const normalizedPhrase = normalizeText(phrase);
  const escaped = normalizedPhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\s)${escaped}(\\s|$)`, "i").test(text);
}

function formatModel(model, brand) {
  const normalized = normalizeText(model);

  const directFormats = {
    "ix": "iX",
    "i3": "i3",
    "i4": "i4",
    "i5": "i5",
    "i7": "i7",
    "i8": "i8",
    "e tron": "e-tron",
    "etron": "e-tron",
    "rsq3": "RS Q3",
    "rsq8": "RS Q8",
    "amg gt": "AMG GT",
    "g class": "G-Class",
    "id 3": "ID.3",
    "id 4": "ID.4",
    "id 5": "ID.5",
    "id buzz": "ID. Buzz",
    "c hr": "C-HR",
    "f pace": "F-Pace",
    "e pace": "E-Pace",
    "i pace": "I-Pace",
    "f type": "F-Type",
  };

  if (directFormats[normalized]) {
    return directFormats[normalized];
  }

  if (brand === "Mercedes-Benz") {
    return normalized
      .replace(/^classe /, "Clase ")
      .replace(/^class /, "Clase ")
      .replace(/\bglc\b/, "GLC")
      .replace(/\bgle\b/, "GLE")
      .replace(/\bgls\b/, "GLS")
      .replace(/\bgla\b/, "GLA")
      .replace(/\bglb\b/, "GLB")
      .replace(/\bcla\b/, "CLA")
      .replace(/\bcls\b/, "CLS")
      .replace(/\beqa\b/, "EQA")
      .replace(/\beqb\b/, "EQB")
      .replace(/\beqc\b/, "EQC")
      .replace(/\beqe\b/, "EQE")
      .replace(/\beqs\b/, "EQS")
      .replace(/\bslk\b/, "SLK")
      .replace(/\bsl\b/, "SL")
      .replace(/\s+/g, " ")
      .trim();
  }

  if (brand === "Land Rover") {
    return normalized
      .split(" ")
      .map(capitalizeWord)
      .join(" ")
      .replace("Hse", "HSE");
  }

  return normalized
    .split(" ")
    .map((word) => {
      if (/^[aqsx]\d$/i.test(word)) return word.toUpperCase();
      if (/^rs\d$/i.test(word)) return word.toUpperCase();
      if (/^s\d$/i.test(word)) return word.toUpperCase();
      if (/^m\d$/i.test(word)) return word.toUpperCase();
      if (/^xc\d+$/i.test(word)) return word.toUpperCase();
      if (/^v\d+$/i.test(word)) return word.toUpperCase();
      if (/^s\d+$/i.test(word)) return word.toUpperCase();
      if (/^nx|rx|ux|es|ls|lc|rc$/i.test(word)) return word.toUpperCase();
      return capitalizeWord(word);
    })
    .join(" ");
}

function formatEngine(engine) {
  return String(engine)
    .replace(/\s+/g, " ")
    .replace(/\btfsi e\b/g, "TFSIe")
    .replace(/\btfsie\b/g, "TFSIe")
    .replace(/\btdi\b/g, "TDI")
    .replace(/\btfsi\b/g, "TFSI")
    .replace(/\btsi\b/g, "TSI")
    .replace(/\bdci\b/g, "DCI")
    .replace(/\bhdi\b/g, "HDI")
    .replace(/\bphev\b/g, "PHEV")
    .replace(/\bhybrid\b/g, "Hybrid")
    .replace(/\be hybrid\b/g, "E-Hybrid")
    .replace(/\bcv\b/g, "CV")
    .replace(/\bps\b/g, "PS")
    .replace(/\bkw\b/g, "kW")
    .replace(/\bxdrive\s?/g, "xDrive ")
    .replace(/\bt8\b/g, "T8")
    .replace(/\bt6\b/g, "T6")
    .replace(/\brecharge\b/g, "Recharge")
    .trim();
}

function capitalizeWord(word) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
}