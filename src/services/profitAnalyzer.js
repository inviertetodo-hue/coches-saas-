export function analyzeCar(data) {
  const price = Number(data.price || 0);
  const estimatedMarketPrice =
    Number(data.estimatedMarketPrice || 0);

  const kilometers = Number(data.kilometers || 0);
  const year = Number(data.year || 0);

  const brand = String(data.brand || "").toLowerCase();

  const transmission = String(
    data.transmission || ""
  ).toLowerCase();

  const engine = String(data.engine || "").toLowerCase();

  const currentYear = new Date().getFullYear();

  const estimatedProfit =
    estimatedMarketPrice - price;

  const roi =
    price > 0
      ? Math.round(
          (estimatedProfit / price) * 100
        )
      : 0;

  let score = 50;

  /*
    ROI
  */

  if (roi >= 35) score += 25;
  else if (roi >= 25) score += 18;
  else if (roi >= 15) score += 10;
  else if (roi < 5) score -= 15;

  /*
    KILOMETERS
  */

  if (kilometers <= 50000) score += 15;
  else if (kilometers <= 100000) score += 8;
  else if (kilometers >= 180000) score -= 15;

  /*
    YEAR
  */

  const age = currentYear - year;

  if (year >= currentYear - 3) score += 15;
  else if (year >= currentYear - 6) score += 8;
  else if (age >= 15) score -= 15;

  /*
    PREMIUM BRANDS
  */

  const premiumBrands = [
    "bmw",
    "audi",
    "mercedes-benz",
    "porsche",
    "tesla",
    "lexus",
    "land rover",
    "jaguar",
    "ferrari",
    "lamborghini",
    "maserati",
  ];

  if (
    premiumBrands.some((b) =>
      brand.includes(b)
    )
  ) {
    score += 10;
  }

  /*
    TRANSMISSION
  */

  if (transmission.includes("autom")) {
    score += 5;
  }

  /*
    ENGINE BONUS
  */

  if (
    engine.includes("hybrid") ||
    engine.includes("eléctrico") ||
    engine.includes("electric")
  ) {
    score += 5;
  }

  /*
    PRICE LOGIC
  */

  if (price <= 5000) {
    score -= 10;
  }

  if (price >= 15000 && price <= 40000) {
    score += 5;
  }

  /*
    LIMITS
  */

  if (score > 100) score = 100;
  if (score < 0) score = 0;

  /*
    RECOMMENDATION
  */

  let recommendation = "🟡 ANALIZAR";

  if (score >= 85) {
    recommendation = "🔥 CHOLLO IA";
  } else if (score <= 45) {
    recommendation = "❌ DESCARTAR";
  }

  return {
    score,
    recommendation,
    estimatedProfit,
    roi,
  };
}