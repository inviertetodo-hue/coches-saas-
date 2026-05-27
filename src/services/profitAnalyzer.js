export function analyzeCar(car) {
  let score = 0;

  const title = (car.title || "").toLowerCase();

  // =========================
  // PRECIO
  // =========================

  if (car.price < 15000) {
    score += 30;
  } else if (car.price < 25000) {
    score += 20;
  } else if (car.price < 40000) {
    score += 10;
  }

  // =========================
  // KILÓMETROS
  // =========================

  if (car.km < 80000) {
    score += 30;
  } else if (car.km < 120000) {
    score += 20;
  } else if (car.km < 180000) {
    score += 10;
  } else {
    score -= 20;
  }

  // =========================
  // AÑO
  // =========================

  if (car.year >= 2021) {
    score += 30;
  } else if (car.year >= 2018) {
    score += 20;
  } else if (car.year >= 2015) {
    score += 10;
  } else {
    score -= 20;
  }

  // =========================
  // MARCAS PREMIUM
  // =========================

  const premiumBrands = [
    "bmw",
    "audi",
    "mercedes",
    "porsche",
    "lexus",
    "range rover",
  ];

  const isPremium = premiumBrands.some((brand) =>
    title.includes(brand)
  );

  if (isPremium) {
    score += 15;
  }

  // =========================
  // BENEFICIO ESTIMADO
  // =========================

  let multiplier = 1.25;

  if (isPremium) {
    multiplier = 1.32;
  }

  const estimatedSalePrice = car.price * multiplier;

  const estimatedProfit =
    estimatedSalePrice - car.price;

  // =========================
  // ROI
  // =========================

  const roi =
    (estimatedProfit / car.price) * 100;

  if (roi >= 30) {
    score += 20;
  } else if (roi >= 20) {
    score += 10;
  }

  // =========================
  // BENEFICIO
  // =========================

  if (estimatedProfit >= 8000) {
    score += 20;
  } else if (estimatedProfit >= 5000) {
    score += 10;
  }

  // =========================
  // NORMALIZAR SCORE
  // =========================

  if (score > 100) {
    score = 100;
  }

  if (score < 0) {
    score = 0;
  }

  // =========================
  // RECOMENDACIÓN
  // =========================

  let recommendation = "DESCARTAR";

  if (score >= 80) {
    recommendation = "🔥 CHOLLO IA";
  } else if (score >= 60) {
    recommendation = "🟡 ANALIZAR";
  }

  return {
    score,
    recommendation,
    estimatedSalePrice,
    estimatedProfit,
    roi,
    isPremium,
  };
}