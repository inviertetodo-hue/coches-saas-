export function analyzeCar(data) {
  const price = Number(data.price || 0);
  const estimatedMarketPrice =
    Number(data.estimatedMarketPrice || 0);

  const kilometers =
    Number(data.kilometers || data.km || 0);

  const year = Number(data.year || 0);

  const brand = String(data.brand || "").toLowerCase();

  const transmission = String(
    data.transmission || ""
  ).toLowerCase();

  const engine = String(
    data.engine || ""
  ).toLowerCase();

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

  const insights = [];

  /*
    ROI
  */

  if (roi >= 35) {
    score += 25;

    insights.push({
      type: "positive",
      text: "ROI muy alto detectado",
    });
  } else if (roi >= 25) {
    score += 18;

    insights.push({
      type: "positive",
      text: "Buen ROI potencial",
    });
  } else if (roi >= 15) {
    score += 10;

    insights.push({
      type: "neutral",
      text: "ROI aceptable",
    });
  } else if (roi < 5) {
    score -= 15;

    insights.push({
      type: "negative",
      text: "ROI demasiado bajo",
    });
  }

  /*
    KILOMETERS
  */

  if (kilometers <= 50000) {
    score += 15;

    insights.push({
      type: "positive",
      text: "Kilometraje bajo",
    });
  } else if (kilometers <= 100000) {
    score += 8;

    insights.push({
      type: "positive",
      text: "Kilometraje razonable",
    });
  } else if (kilometers >= 180000) {
    score -= 15;

    insights.push({
      type: "negative",
      text: "Muchos kilómetros",
    });
  }

  /*
    YEAR
  */

  const age = currentYear - year;

  if (year >= currentYear - 3) {
    score += 15;

    insights.push({
      type: "positive",
      text: "Vehículo moderno",
    });
  } else if (year >= currentYear - 6) {
    score += 8;

    insights.push({
      type: "positive",
      text: "Año competitivo",
    });
  } else if (age >= 15) {
    score -= 15;

    insights.push({
      type: "negative",
      text: "Vehículo antiguo",
    });
  }

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

    insights.push({
      type: "positive",
      text: "Marca premium detectada",
    });
  }

  /*
    TRANSMISSION
  */

  if (transmission.includes("autom")) {
    score += 5;

    insights.push({
      type: "positive",
      text: "Cambio automático",
    });
  }

  /*
    ENGINE
  */

  if (
    engine.includes("hybrid") ||
    engine.includes("eléctrico") ||
    engine.includes("electric")
  ) {
    score += 5;

    insights.push({
      type: "positive",
      text: "Motorización eficiente",
    });
  }

  /*
    PRICE LOGIC
  */

  if (price <= 5000) {
    score -= 10;

    insights.push({
      type: "negative",
      text: "Precio sospechosamente bajo",
    });
  }

  if (price >= 15000 && price <= 40000) {
    score += 5;

    insights.push({
      type: "positive",
      text: "Rango de precio saludable",
    });
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
    insights,
  };
}