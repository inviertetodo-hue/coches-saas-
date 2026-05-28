export function analyzeCar(data) {
  const price = safeNumber(data.price);
  const estimatedMarketPrice = safeNumber(data.estimatedMarketPrice);
  const kilometers = safeNumber(data.kilometers || data.km);
  const year = safeNumber(data.year);

  const brand = String(data.brand || "").toLowerCase();
  const transmission = String(data.transmission || "").toLowerCase();
  const drivetrain = String(data.drivetrain || "").toLowerCase();
  const performancePackage = String(data.performancePackage || "").toLowerCase();
  const fuelType = String(data.fuelType || "").toLowerCase();
  const bodyType = String(data.bodyType || "").toLowerCase();
  const electrified = Boolean(data.electrified);

  const currentYear = new Date().getFullYear();
  const age = year > 0 ? currentYear - year : 99;

  const estimatedProfit = estimatedMarketPrice - price;
  const roi = price > 0 ? Math.round((estimatedProfit / price) * 100) : 0;

  let score = 50;
  let demandScore = 50;
  let resaleScore = 50;
  let liquidityScore = 50;
  let futurePotential = 50;

  const insights = [];
  const alerts = [];

  if (price <= 0 || estimatedMarketPrice <= 0 || year <= 0) {
    return buildInvalidAnalysis();
  }

  const premiumBrands = [
    "bmw",
    "audi",
    "mercedes",
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
    score += 22;
    demandScore += 10;
    insights.push({ type: "positive", text: "ROI muy alto detectado" });
    alerts.push({ type: "success", text: "🔥 Oportunidad fuerte por ROI" });
  } else if (roi >= 25) {
    score += 16;
    insights.push({ type: "positive", text: "Buen ROI potencial" });
  } else if (roi >= 15) {
    score += 9;
    insights.push({ type: "neutral", text: "ROI aceptable" });
  } else if (roi >= 5) {
    score -= 5;
    insights.push({ type: "neutral", text: "ROI justo" });
  } else {
    score -= 22;
    liquidityScore -= 12;
    insights.push({ type: "negative", text: "ROI demasiado bajo" });
    alerts.push({ type: "danger", text: "⚠️ ROI bajo o negativo" });
  }

  if (estimatedProfit <= 0) {
    score -= 25;
    liquidityScore -= 15;
    resaleScore -= 10;
    alerts.push({ type: "danger", text: "❌ Beneficio estimado negativo" });
  } else if (estimatedProfit >= 10000) {
    score += 5;
    liquidityScore += 8;
    alerts.push({ type: "success", text: "💰 Beneficio alto detectado" });
  }

  if (kilometers <= 50000) {
    score += 14;
    resaleScore += 15;
    liquidityScore += 10;
    insights.push({ type: "positive", text: "Kilometraje bajo" });
  } else if (kilometers <= 100000) {
    score += 8;
    resaleScore += 6;
    insights.push({ type: "positive", text: "Kilometraje razonable" });
  } else if (kilometers >= 180000) {
    score -= 18;
    resaleScore -= 18;
    liquidityScore -= 15;
    insights.push({ type: "negative", text: "Muchos kilómetros" });
    alerts.push({ type: "danger", text: "🚨 Kilometraje muy elevado" });
  }

  if (year >= currentYear - 3) {
    score += 14;
    resaleScore += 15;
    futurePotential += 10;
    insights.push({ type: "positive", text: "Vehículo moderno" });
  } else if (year >= currentYear - 6) {
    score += 8;
    resaleScore += 6;
    insights.push({ type: "positive", text: "Año competitivo" });
  } else if (age >= 15) {
    score -= 18;
    resaleScore -= 15;
    futurePotential -= 10;
    insights.push({ type: "negative", text: "Vehículo antiguo" });
    alerts.push({ type: "warning", text: "⏳ Vehículo antiguo" });
  }

  if (isPremium) {
    score += 8;
    demandScore += 10;
    resaleScore += 8;
    insights.push({ type: "positive", text: "Marca premium detectada" });
  }

  if (transmission.includes("autom")) {
    score += 5;
    demandScore += 5;
    insights.push({ type: "positive", text: "Cambio automático" });
  }

  if (hasPremiumAWD) {
    score += 8;
    demandScore += 10;
    resaleScore += 8;
    insights.push({ type: "positive", text: "Sistema AWD premium detectado" });
  }

  if (hasPerformancePack) {
    score += 9;
    demandScore += 8;
    resaleScore += 5;
    insights.push({ type: "positive", text: "Pack performance detectado" });
  }

  if (electrified || fuelType.includes("phev") || fuelType.includes("ev")) {
    score += 7;
    futurePotential += 14;
    demandScore += 8;
    insights.push({ type: "positive", text: "Motorización electrificada" });
  }

  if (bodyType.includes("suv")) {
    score += 4;
    demandScore += 10;
    liquidityScore += 8;
    insights.push({ type: "positive", text: "SUV con demanda fuerte" });
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
    score += 8;
    demandScore += 15;
    liquidityScore += 12;
    alerts.push({
      type: "success",
      text: "📈 Configuración premium demandada",
    });
  }

  if (hasPerformancePack && kilometers >= 150000) {
    score -= 14;
    resaleScore -= 14;
    liquidityScore -= 10;
    alerts.push({ type: "warning", text: "⚠️ Riesgo mecánico elevado" });
  }

  if (brand.includes("tesla") && age >= 8) {
    score -= 10;
    resaleScore -= 14;
    futurePotential -= 12;
    alerts.push({ type: "warning", text: "🔋 Posible desgaste de batería" });
  }

  if (price <= 5000) {
    score -= 12;
    resaleScore -= 10;
    alerts.push({ type: "warning", text: "🕵️ Precio anormalmente bajo" });
  }

  if (price >= 15000 && price <= 40000) {
    score += 5;
    liquidityScore += 6;
  }

  if (roi <= 0 && score > 55) {
    score = 55;
    alerts.push({
      type: "danger",
      text: "🛡️ Score limitado por ROI negativo",
    });
  }

  if (estimatedProfit <= 0 && score > 50) {
    score = 50;
  }

  if (kilometers >= 220000 && score > 65) {
    score = 65;
    alerts.push({
      type: "warning",
      text: "🛡️ Score limitado por kilometraje extremo",
    });
  }

  demandScore = clampScore(demandScore);
  resaleScore = clampScore(resaleScore);
  liquidityScore = clampScore(liquidityScore);
  futurePotential = clampScore(futurePotential);
  score = clampScore(score);

  let recommendation = "🟡 ANALIZAR";

  if (score >= 85 && roi >= 15 && estimatedProfit > 0) {
    recommendation = "🔥 CHOLLO IA";
    alerts.push({ type: "success", text: "🏆 Score IA muy alto" });
  } else if (score <= 45 || roi <= 0 || estimatedProfit <= 0) {
    recommendation = "❌ DESCARTAR";
    alerts.push({ type: "danger", text: "❌ Riesgo elevado detectado" });
  }

  return {
    score,
    recommendation,
    estimatedProfit: Math.round(estimatedProfit),
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

export function analyzeMarketIntelligence(analyses = []) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    return {
      total: 0,
      bestBrand: "",
      bestFuelType: "",
      bestDrivetrain: "",
      bestPerformance: "",
      bestConfiguration: "",
      averageScore: 0,
      averageROI: 0,
      marketInsights: [],
    };
  }

  const total = analyses.length;

  const averageScore = Math.round(
    analyses.reduce((acc, item) => acc + Number(item.score || 0), 0) / total
  );

  const averageROI = Math.round(
    analyses.reduce((acc, item) => acc + Number(item.roi || 0), 0) / total
  );

  const bestBrand = getTopValue(analyses, "brand");
  const bestFuelType = getTopValue(analyses, "fuel_type");
  const bestDrivetrain = getTopValue(analyses, "drivetrain");
  const bestPerformance = getTopValue(analyses, "performance_package");

  const marketInsights = [];

  if (averageScore >= 80) {
    marketInsights.push("📈 El histórico muestra oportunidades de alta calidad.");
  }

  if (averageROI >= 25) {
    marketInsights.push("💰 El ROI medio del mercado analizado es fuerte.");
  }

  if (bestBrand) {
    marketInsights.push(`🚘 ${bestBrand} aparece como marca dominante en tu dataset.`);
  }

  if (bestFuelType) {
    marketInsights.push(`⚡ ${bestFuelType} destaca como motorización relevante.`);
  }

  if (bestDrivetrain) {
    marketInsights.push(`🛞 ${bestDrivetrain} aparece como tracción importante.`);
  }

  if (bestPerformance) {
    marketInsights.push(`🏁 ${bestPerformance} muestra presencia premium.`);
  }

  return {
    total,
    averageScore,
    averageROI,
    bestBrand,
    bestFuelType,
    bestDrivetrain,
    bestPerformance,
    bestConfiguration: [
      bestBrand,
      bestFuelType,
      bestDrivetrain,
      bestPerformance,
    ]
      .filter(Boolean)
      .join(" · "),
    marketInsights,
  };
}

function buildInvalidAnalysis() {
  return {
    score: 0,
    recommendation: "❌ DESCARTAR",
    estimatedProfit: 0,
    roi: 0,
    demandScore: 0,
    resaleScore: 0,
    liquidityScore: 0,
    futurePotential: 0,
    insights: [
      {
        type: "negative",
        text: "Datos insuficientes o inválidos para analizar",
      },
    ],
    alerts: [
      {
        type: "danger",
        text: "❌ No se puede confiar en este análisis",
      },
    ],
  };
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function getTopValue(items, key) {
  const counter = {};

  for (const item of items) {
    const value = item[key];

    if (!value) continue;

    counter[value] = (counter[value] || 0) + 1;
  }

  const sorted = Object.entries(counter).sort((a, b) => b[1] - a[1]);

  return sorted[0]?.[0] || "";
}

function clampScore(value) {
  if (value > 100) return 100;
  if (value < 0) return 0;
  return Math.round(value);
}