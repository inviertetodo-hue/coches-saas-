export function extractCarDataFromText(text) {
  const clean = String(text || "")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const price = extractNumber(clean, /(\d{1,3}(?:[.\s]\d{3})+|\d{4,6})\s?€/i);
  const km = extractNumber(clean, /(\d{1,3}(?:[.\s]\d{3})+|\d{4,6})\s?km/i);
  const year = extractYear(clean);
  const power = extractNumber(clean, /(\d{2,4})\s?(cv|hp|ps|kw)/i);

  const brand = detectBrand(clean);
  const fuel = detectFuel(clean);
  const gearbox = detectGearbox(clean);
  const country = detectCountry(clean);

  return {
    brand,
    model: detectModel(clean, brand),
    price,
    year,
    km,
    power,
    fuel,
    gearbox,
    country,
    sourceText: clean,
  };
}

function extractNumber(text, regex) {
  const match = text.match(regex);
  if (!match) return null;

  return Number(
    match[1]
      .replace(/\./g, "")
      .replace(/\s/g, "")
      .replace(",", "")
  );
}

function extractYear(text) {
  const year = text.match(/\b(2010|2011|2012|2013|2014|2015|2016|2017|2018|2019|2020|2021|2022|2023|2024|2025|2026)\b/);
  return year ? Number(year[1]) : null;
}

function detectBrand(text) {
  const brands = [
    "BMW", "Mercedes", "Audi", "Volkswagen", "Porsche", "Toyota",
    "Lexus", "Volvo", "Tesla", "Skoda", "Seat", "Cupra", "Peugeot",
    "Renault", "Ford", "Opel", "Hyundai", "Kia", "Mazda", "Nissan",
    "Fiat", "Mini", "Land Rover", "Jaguar"
  ];

  return brands.find((b) =>
    text.toLowerCase().includes(b.toLowerCase())
  ) || "";
}

function detectModel(text, brand) {
  if (!brand) return "";

  const words = text.split(" ");
  const index = words.findIndex((w) =>
    w.toLowerCase().includes(brand.toLowerCase())
  );

  if (index === -1) return "";

  return words.slice(index + 1, index + 4).join(" ");
}

function detectFuel(text) {
  const lower = text.toLowerCase();

  if (lower.includes("diesel")) return "Diésel";
  if (lower.includes("benzin") || lower.includes("gasolina") || lower.includes("petrol")) return "Gasolina";
  if (lower.includes("hybrid") || lower.includes("híbrido")) return "Híbrido";
  if (lower.includes("electric") || lower.includes("eléctrico") || lower.includes("elektro")) return "Eléctrico";

  return "";
}

function detectGearbox(text) {
  const lower = text.toLowerCase();

  if (lower.includes("automatic") || lower.includes("automatik") || lower.includes("automático")) {
    return "Automático";
  }

  if (lower.includes("manual") || lower.includes("schaltgetriebe")) {
    return "Manual";
  }

  return "";
}

function detectCountry(text) {
  const lower = text.toLowerCase();

  if (lower.includes("deutschland") || lower.includes("germany") || lower.includes("alemania")) return "Alemania";
  if (lower.includes("france") || lower.includes("francia")) return "Francia";
  if (lower.includes("belgium") || lower.includes("bélgica")) return "Bélgica";
  if (lower.includes("netherlands") || lower.includes("holanda")) return "Holanda";
  if (lower.includes("italy") || lower.includes("italia")) return "Italia";

  return "Europa";
}

export function buildCarAnalysis(car) {
  const importCosts = estimateImportCosts(car);
  const estimatedSpainPrice = estimateSpainMarketPrice(car);
  const totalCost = (car.price || 0) + importCosts;
  const estimatedProfit = estimatedSpainPrice - totalCost;
  const roi = car.price ? Number(((estimatedProfit / car.price) * 100).toFixed(1)) : 0;
  const score = calculateImportScore(car, estimatedProfit, roi);

  return {
    ...car,
    estimatedImportCosts: importCosts,
    estimatedSpainPrice,
    totalCost,
    estimatedProfit,
    roi,
    score,
    verdict: getVerdict(score),
  };
}

function estimateImportCosts(car) {
  let cost = 2200;

  if (car.country === "Alemania") cost += 500;
  if (car.country === "Holanda") cost += 700;
  if (car.country === "Italia") cost += 900;

  if (car.price > 40000) cost += 1200;
  if (car.price > 70000) cost += 2500;

  if (car.fuel === "Eléctrico") cost -= 600;
  if (car.power > 250) cost += 900;

  return Math.max(1800, cost);
}

function estimateSpainMarketPrice(car) {
  if (!car.price) return 0;

  let multiplier = 1.18;

  if (car.brand === "BMW") multiplier = 1.22;
  if (car.brand === "Mercedes") multiplier = 1.21;
  if (car.brand === "Porsche") multiplier = 1.28;
  if (car.brand === "Toyota") multiplier = 1.16;
  if (car.brand === "Lexus") multiplier = 1.20;

  if (car.year >= 2021) multiplier += 0.04;
  if (car.km && car.km < 70000) multiplier += 0.03;
  if (car.km && car.km > 180000) multiplier -= 0.08;

  return Math.round(car.price * multiplier);
}

function calculateImportScore(car, profit, roi) {
  let score = 50;

  if (profit > 3000) score += 10;
  if (profit > 6000) score += 15;
  if (profit > 10000) score += 15;

  if (roi > 10) score += 10;
  if (roi > 18) score += 15;

  if (car.year >= 2020) score += 10;
  if (car.km && car.km < 90000) score += 10;

  if (car.km && car.km > 180000) score -= 20;
  if (profit < 1500) score -= 25;

  return Math.max(0, Math.min(100, score));
}

function getVerdict(score) {
  if (score >= 90) return "🔥 CHOLLO PREMIUM";
  if (score >= 80) return "🟢 MUY BUENA OPORTUNIDAD";
  if (score >= 65) return "🟡 INTERESANTE";
  if (score >= 45) return "⚠️ ANALIZAR CON CUIDADO";
  return "🔴 DESCARTAR";
}