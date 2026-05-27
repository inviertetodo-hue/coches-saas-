export function analyzeCar(data) {
  const price = Number(data.price || 0);
  const estimatedMarketPrice = Number(data.estimatedMarketPrice || 0);
  const kilometers = Number(data.kilometers || data.km || 0);
  const year = Number(data.year || 0);

  const brand = String(data.brand || "").toLowerCase();
  const transmission = String(data.transmission || "").toLowerCase();
  const drivetrain = String(data.drivetrain || "").toLowerCase();
  const performancePackage = String(data.performancePackage || "").toLowerCase();
  const fuelType = String(data.fuelType || "").toLowerCase();
  const bodyType = String(data.bodyType || "").toLowerCase();
  const electrified = Boolean(data.electrified);

  const currentYear = new Date().getFullYear();
  const age = currentYear - year;

  const estimatedProfit = estimatedMarketPrice - price;
  const roi = price > 0 ? Math.round((estimatedProfit / price) * 100) : 0;

  let score = 50;
  let demandScore = 50;
  let resaleScore = 50;
  let liquidityScore = 50;
  let futurePotential = 50;

  const insights = [];
  const alerts = [];

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

  const isPremium = premiumBrands.some((b) => brand.includes(b));

  const hasPremiumAWD =
    drivetrain.includes("quattro") ||
    drivetrain.includes("xdrive") ||
    drivetrain.includes("4matic");

  const hasPerformancePack =
    performancePackage.includes("amg") ||
    performancePackage.includes("rs") ||
    performancePackage.includes("gti") ||
    performancePackage.includes("m sport");

  if (roi >= 35) {
    score += 25;
    demandScore += 10;
    insights.push({ type: "positive", text: "ROI muy alto detectado" });
    alerts.push({ type: "success", text: "🔥 Oportunidad extrema por ROI" });
  } else if (roi >= 25) {
    score += 18;
    insights.push({ type: "positive", text: "Buen ROI potencial" });
  } else if (roi >= 15) {
    score += 10;
    insights.push({ type: "neutral", text: "ROI aceptable" });
  } else if (roi < 5) {
    score -= 15;
    liquidityScore -= 10;
    insights.push({ type: "negative", text: "ROI demasiado bajo" });
    alerts.push({ type: "danger", text: "⚠️ ROI peligrosamente bajo" });
  }

  if (kilometers <= 50000) {
    score += 15;
    resaleScore += 15;
    liquidityScore += 10;
    insights.push({ type: "positive", text: "Kilometraje bajo" });
  } else if (kilometers <= 100000) {
    score += 8;
    resaleScore += 6;
    insights.push({ type: "positive", text: "Kilometraje razonable" });
  } else if (kilometers >= 180000) {
    score -= 15;
    resaleScore -= 18;
    liquidityScore -= 15;
    insights.push({ type: "negative", text: "Muchos kilómetros" });
    alerts.push({ type: "danger", text: "🚨 Kilometraje muy elevado" });
  }

  if (year >= currentYear - 3) {
    score += 15;
    resaleScore += 15;
    futurePotential += 10;
    insights.push({ type: "positive", text: "Vehículo moderno" });
  } else if (year >= currentYear - 6) {
    score += 8;
    resaleScore += 6;
    insights.push({ type: "positive", text: "Año competitivo" });
  } else if (age >= 15) {
    score -= 15;
    resaleScore -= 15;
    futurePotential -= 10;
    insights.push({ type: "negative", text: "Vehículo antiguo" });
    alerts.push({ type: "warning", text: "⏳ Vehículo demasiado antiguo" });
  }

  if (isPremium) {
    score += 10;
    demandScore += 10;
    resaleScore += 8;
    insights.push({ type: "positive", text: "Marca premium detectada" });
    alerts.push({ type: "success", text: "💎 Vehículo premium detectado" });
  }

  if (transmission.includes("autom")) {
    score += 5;
    demandScore += 5;
    insights.push({ type: "positive", text: "Cambio automático" });
  }

  if (hasPremiumAWD) {
    score += 10;
    demandScore += 10;
    resaleScore += 8;
    insights.push({ type: "positive", text: "Sistema AWD premium detectado" });
    alerts.push({ type: "success", text: "🛞 Tracción premium detectada" });
  }

  if (hasPerformancePack) {
    score += 12;
    demandScore += 8;
    resaleScore += 5;
    insights.push({ type: "positive", text: "Pack performance detectado" });
    alerts.push({ type: "success", text: "🏁 Vehículo performance detectado" });
  }

  if (electrified) {
    score += 8;
    futurePotential += 15;
    demandScore += 8;
    insights.push({ type: "positive", text: "Vehículo electrificado" });
    alerts.push({ type: "success", text: "⚡ Tecnología electrificada detectada" });
  }

  if (fuelType.includes("phev") || fuelType.includes("ev")) {
    score += 6;
    futurePotential += 10;
    insights.push({ type: "positive", text: "Motorización moderna detectada" });
  }

  if (bodyType.includes("suv")) {
    score += 4;
    demandScore += 10;
    liquidityScore += 8;
    insights.push({ type: "positive", text: "SUV con alta demanda" });
  }

  if (bodyType.includes("wagon")) {
    score += 3;
    resaleScore += 6;
    insights.push({
      type: "positive",
      text: "Carrocería familiar valorada en Europa",
    });
  }

  if (isPremium && hasPremiumAWD && bodyType.includes("suv")) {
    score += 10;
    demandScore += 15;
    liquidityScore += 12;
    insights.push({
      type: "positive",
      text: "SUV premium AWD con alta demanda",
    });
    alerts.push({
      type: "success",
      text: "📈 Configuración premium muy demandada",
    });
  }

  if (hasPerformancePack && kilometers >= 150000) {
    score -= 12;
    resaleScore -= 14;
    liquidityScore -= 10;
    insights.push({
      type: "negative",
      text: "Vehículo performance con kilometraje elevado",
    });
    alerts.push({ type: "warning", text: "⚠️ Riesgo mecánico elevado" });
  }

  if (brand.includes("tesla") && age >= 8) {
    score -= 8;
    resaleScore -= 14;
    futurePotential -= 12;
    insights.push({
      type: "negative",
      text: "Tesla antiguo con posible degradación",
    });
    alerts.push({ type: "warning", text: "🔋 Posible desgaste de batería" });
  }

  if (fuelType.includes("phev") && age <= 5) {
    score += 8;
    demandScore += 12;
    futurePotential += 15;
    insights.push({
      type: "positive",
      text: "PHEV moderno con alta demanda urbana",
    });
    alerts.push({ type: "success", text: "🏙️ Configuración urbana premium" });
  }

  if (bodyType.includes("wagon") && isPremium && fuelType.includes("diesel")) {
    score += 7;
    liquidityScore += 10;
    resaleScore += 8;
    insights.push({
      type: "positive",
      text: "Wagon premium diesel valorado en exportación europea",
    });
    alerts.push({ type: "success", text: "🌍 Alta demanda de exportación" });
  }

  if (price <= 5000) {
    score -= 10;
    resaleScore -= 10;
    insights.push({ type: "negative", text: "Precio sospechosamente bajo" });
    alerts.push({ type: "warning", text: "🕵️ Precio anormalmente bajo" });
  }

  if (price >= 15000 && price <= 40000) {
    score += 5;
    liquidityScore += 6;
    insights.push({ type: "positive", text: "Rango de precio saludable" });
  }

  if (estimatedProfit >= 10000) {
    score += 5;
    liquidityScore += 8;
    alerts.push({ type: "success", text: "💰 Beneficio excepcional detectado" });
  }

  demandScore = clampScore(demandScore);
  resaleScore = clampScore(resaleScore);
  liquidityScore = clampScore(liquidityScore);
  futurePotential = clampScore(futurePotential);
  score = clampScore(score);

  if (demandScore >= 80) {
    alerts.push({ type: "success", text: "📊 Demanda futura alta" });
  }

  if (resaleScore <= 45) {
    alerts.push({ type: "warning", text: "📉 Reventa potencial débil" });
  }

  if (liquidityScore >= 80) {
    alerts.push({ type: "success", text: "💨 Alta probabilidad de salida rápida" });
  }

  if (futurePotential >= 80) {
    alerts.push({ type: "success", text: "🚀 Alto potencial futuro" });
  }

  let recommendation = "🟡 ANALIZAR";

  if (score >= 85) {
    recommendation = "🔥 CHOLLO IA";
    alerts.push({ type: "success", text: "🏆 Score IA extremadamente alto" });
  } else if (score <= 45) {
    recommendation = "❌ DESCARTAR";
    alerts.push({ type: "danger", text: "❌ Riesgo elevado detectado" });
  }

  return {
    score,
    recommendation,
    estimatedProfit,
    roi,
    demandScore,
    resaleScore,
    liquidityScore,
    futurePotential,
    insights,
    alerts,
  };
}

export function compareCars(currentCar, referenceCar) {
  if (!currentCar || !referenceCar) {
    return null;
  }

  const currentScore = Number(currentCar.score || 0);
  const referenceScore = Number(referenceCar.score || 0);

  const currentROI = Number(currentCar.roi || 0);
  const referenceROI = Number(referenceCar.roi || 0);

  const currentProfit = Number(
    currentCar.profit || currentCar.estimatedProfit || 0
  );

  const referenceProfit = Number(
    referenceCar.profit || referenceCar.estimatedProfit || 0
  );

  const scoreDifference = currentScore - referenceScore;
  const roiDifference = currentROI - referenceROI;
  const profitDifference = currentProfit - referenceProfit;

  let winner = "Empate técnico";
  let recommendation = "Ambas opciones requieren análisis manual.";

  if (scoreDifference > 0 && roiDifference >= 0) {
    winner = "Coche actual";
    recommendation =
      "El coche actual parece una oportunidad más fuerte por score IA y rentabilidad.";
  } else if (scoreDifference < 0 && roiDifference <= 0) {
    winner = "Coche histórico";
    recommendation =
      "El coche histórico sigue siendo mejor referencia según score IA y ROI.";
  } else if (profitDifference > 0) {
    winner = "Coche actual";
    recommendation =
      "El coche actual destaca más por beneficio estimado.";
  } else if (profitDifference < 0) {
    winner = "Coche histórico";
    recommendation =
      "El coche histórico ofrece mejor beneficio estimado.";
  }

  return {
    winner,
    recommendation,
    scoreDifference,
    roiDifference,
    profitDifference,
  };
}

function clampScore(value) {
  if (value > 100) return 100;
  if (value < 0) return 0;
  return Math.round(value);
}