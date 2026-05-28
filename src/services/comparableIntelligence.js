export function analyzeComparableMarket(car) {
  const price = safeNumber(car.price);
  const km = safeNumber(car.km || car.kilometers);
  const year = safeNumber(car.year);

  if (!price || !year) {
    return buildLowConfidenceComparable();
  }

  const fairPrice = estimateFairMarketPrice(car);
  const deviationAmount = fairPrice - price;
  const deviationPercent =
    fairPrice > 0 ? Math.round((deviationAmount / fairPrice) * 100) : 0;

  const confidence = calculateComparableConfidence(car);
  const underpricingScore = calculateUnderpricingScore({
    deviationPercent,
    confidence,
    car,
  });

  return {
    fairPrice,
    deviationAmount: Math.round(deviationAmount),
    deviationPercent,
    confidence,
    underpricingScore,
    label: buildComparableLabel(deviationPercent, confidence),
    insight: buildComparableInsight({
      car,
      price,
      fairPrice,
      deviationPercent,
      confidence,
      underpricingScore,
    }),
    kmBand: buildKmBand(km),
    yearBand: buildYearBand(year),
  };
}

function estimateFairMarketPrice(car) {
  const price = safeNumber(car.price);
  const km = safeNumber(car.km || car.kilometers);
  const year = safeNumber(car.year);

  const text = normalize(
    `${car.title} ${car.brand} ${car.model} ${car.fuelType} ${car.bodyType} ${car.performancePackage}`
  );

  let multiplier = 1.08;

  if (text.includes("bmw") && text.includes("x5")) {
    multiplier = 1.18;
  }

  if (text.includes("xdrive45e") || text.includes("45e")) {
    multiplier += 0.04;
  }

  if (text.includes("xdrive50e") || text.includes("50e")) {
    multiplier += 0.02;
  }

  if (text.includes("m sport")) {
    multiplier += 0.03;
  }

  if (text.includes("suv")) {
    multiplier += 0.02;
  }

  if (text.includes("phev") || text.includes("hybrid")) {
    multiplier += 0.03;
  }

  if (text.includes("amg") || text.includes(" rs") || text.includes("m5")) {
    multiplier += 0.05;
  }

  if (year >= new Date().getFullYear() - 2) {
    multiplier += 0.03;
  }

  if (km <= 25000) {
    multiplier += 0.04;
  } else if (km <= 60000) {
    multiplier += 0.02;
  } else if (km >= 120000) {
    multiplier -= 0.05;
  }

  return Math.round(price * multiplier);
}

function calculateComparableConfidence(car) {
  let confidence = 35;

  if (car.title) confidence += 15;
  if (car.brand) confidence += 15;
  if (car.model) confidence += 15;
  if (car.fuelType) confidence += 8;
  if (car.bodyType) confidence += 6;
  if (car.drivetrain) confidence += 4;
  if (car.performancePackage) confidence += 4;

  return clampScore(confidence);
}

function calculateUnderpricingScore({ deviationPercent, confidence, car }) {
  let score = 50;

  if (deviationPercent >= 18) score += 30;
  else if (deviationPercent >= 12) score += 22;
  else if (deviationPercent >= 8) score += 14;
  else if (deviationPercent >= 4) score += 7;
  else if (deviationPercent <= -5) score -= 18;

  if (confidence >= 80) score += 8;
  else if (confidence < 50) score -= 16;

  const text = normalize(
    `${car.title} ${car.performancePackage} ${car.bodyType}`
  );

  if (
    text.includes("amg") ||
    text.includes("rs") ||
    text.includes("m5") ||
    text.includes("turbo")
  ) {
    score -= 8;
  }

  return clampScore(score);
}

function buildComparableLabel(deviationPercent, confidence) {
  if (confidence < 45) {
    return "Baja confianza";
  }

  if (deviationPercent >= 15) {
    return "Muy por debajo de mercado";
  }

  if (deviationPercent >= 8) {
    return "Por debajo de mercado";
  }

  if (deviationPercent >= 0) {
    return "Precio razonable";
  }

  return "Por encima de mercado";
}

function buildComparableInsight({
  car,
  price,
  fairPrice,
  deviationPercent,
  confidence,
  underpricingScore,
}) {
  const title = car.title || "Vehículo";

  if (confidence < 45) {
    return `${title}: faltan datos para comparar con seguridad frente a mercado.`;
  }

  if (deviationPercent >= 12) {
    return `${title}: precio estimado ${deviationPercent}% por debajo del mercado comparable. Señal fuerte de oportunidad.`;
  }

  if (deviationPercent >= 6) {
    return `${title}: precio algo inferior al mercado comparable. Conviene validar estado e historial.`;
  }

  if (deviationPercent >= 0) {
    return `${title}: precio cercano a mercado. La oportunidad depende del margen neto y la liquidez.`;
  }

  return `${title}: precio por encima del mercado estimado. No parece chollo salvo configuración excepcional.`;
}

function buildLowConfidenceComparable() {
  return {
    fairPrice: 0,
    deviationAmount: 0,
    deviationPercent: 0,
    confidence: 0,
    underpricingScore: 0,
    label: "Sin comparables",
    insight: "Datos insuficientes para calcular comparables.",
    kmBand: "",
    yearBand: "",
  };
}

function buildKmBand(km) {
  if (!km) return "";

  if (km <= 25000) return "0-25k km";
  if (km <= 60000) return "25-60k km";
  if (km <= 100000) return "60-100k km";
  if (km <= 150000) return "100-150k km";

  return "+150k km";
}

function buildYearBand(year) {
  const currentYear = new Date().getFullYear();

  if (!year) return "";

  if (year >= currentYear - 1) return "casi nuevo";
  if (year >= currentYear - 3) return "moderno";
  if (year >= currentYear - 6) return "competitivo";

  return "antiguo";
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function clampScore(value) {
  const number = Math.round(Number(value || 0));

  if (number > 100) return 100;
  if (number < 0) return 0;

  return number;
}
