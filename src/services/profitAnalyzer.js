export function analyzeCar(data) {
  const price = safeNumber(data.price);
  const estimatedMarketPrice = safeNumber(data.estimatedMarketPrice);
  const kilometers = safeNumber(data.kilometers || data.km);
  const year = safeNumber(data.year);

  const title = normalize(data.title);
  const brand = normalize(data.brand);
  const model = normalize(data.model);
  const engine = normalize(data.engine);
  const transmission = normalize(data.transmission);
  const drivetrain = normalize(data.drivetrain);
  const performancePackage = normalize(data.performancePackage);
  const fuelType = normalize(data.fuelType);
  const bodyType = normalize(data.bodyType);
  const marketSegment = normalize(data.marketSegment);
  const liquidityProfile = normalize(data.liquidityProfile);
  const riskProfile = normalize(data.riskProfile);
  const luxuryScore = safeNumber(data.luxuryScore);
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

  const semanticQuality = calculateSemanticQuality({
    brand,
    model,
    fuelType,
    bodyType,
    drivetrain,
    title,
  });

  const isPremium = isPremiumBrand(brand);
  const hasPremiumAWD = detectPremiumAWD(drivetrain);
  const hasPerformancePack = detectPerformancePackage(
    performancePackage,
    title,
    model
  );

  const engineProfile = detectEuropeanEngineProfile({
    brand,
    model,
    engine,
    title,
    fuelType,
    transmission,
    bodyType,
  });

  const segment = detectSegment({
    brand,
    model,
    title,
    bodyType,
    fuelType,
    performancePackage,
    price,
    hasPerformancePack,
  });

  if (semanticQuality <= 25) {
    score -= 28;
    demandScore -= 16;
    resaleScore -= 18;
    liquidityScore -= 22;
    futurePotential -= 10;

    insights.push({
      type: "negative",
      text: "Datos semánticos insuficientes: análisis con baja confianza",
    });

    alerts.push({
      type: "warning",
      text: "🧠 Falta marca/modelo/configuración: score limitado",
    });
  } else if (semanticQuality <= 50) {
    score -= 12;
    liquidityScore -= 10;

    insights.push({
      type: "neutral",
      text: "Datos del vehículo parcialmente detectados",
    });
  } else {
    score += 4;
    insights.push({
      type: "positive",
      text: "Datos semánticos útiles para el análisis",
    });
  }

  if (roi >= 35) {
    score += 18;
    demandScore += 8;
    insights.push({ type: "positive", text: "ROI muy alto detectado" });
    alerts.push({ type: "success", text: "🔥 Oportunidad fuerte por ROI" });
  } else if (roi >= 25) {
    score += 12;
    insights.push({ type: "positive", text: "Buen ROI potencial" });
  } else if (roi >= 15) {
    score += 7;
    insights.push({ type: "neutral", text: "ROI aceptable" });
  } else if (roi >= 5) {
    score -= 6;
    insights.push({ type: "neutral", text: "ROI justo" });
  } else {
    score -= 24;
    liquidityScore -= 14;
    insights.push({ type: "negative", text: "ROI demasiado bajo" });
    alerts.push({ type: "danger", text: "⚠️ ROI bajo o negativo" });
  }

  if (estimatedProfit <= 0) {
    score -= 25;
    liquidityScore -= 15;
    resaleScore -= 10;
    alerts.push({ type: "danger", text: "❌ Beneficio estimado negativo" });
  } else if (estimatedProfit >= 25000) {
    score += 3;
    liquidityScore -= 4;
    alerts.push({
      type: "success",
      text: "💰 Beneficio alto, pero exige validar liquidez real",
    });
  } else if (estimatedProfit >= 10000) {
    score += 5;
    liquidityScore += 5;
    alerts.push({ type: "success", text: "💰 Beneficio alto detectado" });
  }

  if (kilometers <= 10000) {
    score += 10;
    resaleScore += 12;
    liquidityScore += 7;
    insights.push({ type: "positive", text: "Kilometraje muy bajo" });
  } else if (kilometers <= 50000) {
    score += 9;
    resaleScore += 10;
    liquidityScore += 6;
    insights.push({ type: "positive", text: "Kilometraje bajo" });
  } else if (kilometers <= 100000) {
    score += 5;
    resaleScore += 5;
    insights.push({ type: "positive", text: "Kilometraje razonable" });
  } else if (kilometers >= 180000) {
    score -= 18;
    resaleScore -= 18;
    liquidityScore -= 15;
    insights.push({ type: "negative", text: "Muchos kilómetros" });
    alerts.push({ type: "danger", text: "🚨 Kilometraje muy elevado" });
  }

  if (year >= currentYear - 2) {
    score += 10;
    resaleScore += 12;
    futurePotential += 8;
    insights.push({ type: "positive", text: "Vehículo muy moderno" });
  } else if (year >= currentYear - 4) {
    score += 7;
    resaleScore += 7;
    futurePotential += 4;
    insights.push({ type: "positive", text: "Vehículo moderno" });
  } else if (year >= currentYear - 7) {
    score += 4;
    resaleScore += 4;
    insights.push({ type: "positive", text: "Año competitivo" });
  } else if (age >= 15) {
    score -= 18;
    resaleScore -= 15;
    futurePotential -= 10;
    insights.push({ type: "negative", text: "Vehículo antiguo" });
    alerts.push({ type: "warning", text: "⏳ Vehículo antiguo" });
  }

  if (isPremium) {
    score += 6;
    demandScore += 8;
    resaleScore += 6;
    insights.push({ type: "positive", text: "Marca premium detectada" });
  }

  if (transmission.includes("autom")) {
    score += 4;
    demandScore += 4;
    insights.push({ type: "positive", text: "Cambio automático" });
  }

  if (hasPremiumAWD) {
    score += 6;
    demandScore += 8;
    resaleScore += 6;
    insights.push({ type: "positive", text: "Sistema AWD premium detectado" });
  }

  if (hasPerformancePack) {
    score += 4;
    demandScore += 10;
    resaleScore += 4;
    liquidityScore -= 6;

    insights.push({
      type: "positive",
      text: "Configuración performance con atractivo comercial",
    });

    alerts.push({
      type: "warning",
      text: "🏁 Performance detectado: validar coste, garantía y demanda real",
    });
  }

  if (electrified || fuelType.includes("phev") || fuelType.includes("ev")) {
    score += 6;
    futurePotential += 12;
    demandScore += 7;
    insights.push({ type: "positive", text: "Motorización electrificada" });
  }

  if (bodyType.includes("suv")) {
    score += 5;
    demandScore += 10;
    liquidityScore += 9;
    insights.push({ type: "positive", text: "SUV con demanda fuerte" });
  }

  if (bodyType.includes("wagon")) {
    score += 1;
    resaleScore += 5;
    liquidityScore -= hasPerformancePack ? 8 : 0;

    insights.push({
      type: "positive",
      text: "Carrocería familiar valorada en Europa",
    });
  }

  applyEuropeanEngineCalibration(engineProfile, {
    scoreRef: (value) => {
      score += value;
    },
    demandRef: (value) => {
      demandScore += value;
    },
    resaleRef: (value) => {
      resaleScore += value;
    },
    liquidityRef: (value) => {
      liquidityScore += value;
    },
    futureRef: (value) => {
      futurePotential += value;
    },
    insights,
    alerts,
  });

  applySegmentCalibration(segment, {
    scoreRef: (value) => {
      score += value;
    },
    demandRef: (value) => {
      demandScore += value;
    },
    resaleRef: (value) => {
      resaleScore += value;
    },
    liquidityRef: (value) => {
      liquidityScore += value;
    },
    futureRef: (value) => {
      futurePotential += value;
    },
    insights,
    alerts,
  });

  applyMarketAdapterCalibration({
    marketSegment,
    liquidityProfile,
    riskProfile,
    luxuryScore,
    scoreRef: (value) => {
      score += value;
    },
    demandRef: (value) => {
      demandScore += value;
    },
    resaleRef: (value) => {
      resaleScore += value;
    },
    liquidityRef: (value) => {
      liquidityScore += value;
    },
    futureRef: (value) => {
      futurePotential += value;
    },
    insights,
    alerts,
  });

  if (isPremium && hasPremiumAWD && bodyType.includes("suv")) {
    score += 8;
    demandScore += 15;
    liquidityScore += 12;
    alerts.push({
      type: "success",
      text: "📈 Configuración premium demandada",
    });
  }

  if (hasPerformancePack && kilometers >= 100000) {
    score -= 10;
    resaleScore -= 10;
    liquidityScore -= 10;
    alerts.push({
      type: "warning",
      text: "⚠️ Performance con kilómetros: revisar riesgo mecánico",
    });
  }

  if (hasPerformancePack && price >= 90000) {
    score -= 10;
    liquidityScore -= 14;
    demandScore -= 3;

    insights.push({
      type: "negative",
      text: "Ticket alto y comprador objetivo reducido",
    });

    alerts.push({
      type: "warning",
      text: "🎯 Coche nicho: puede tardar más en venderse",
    });
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

  if (price >= 15000 && price <= 40000 && semanticQuality >= 50) {
    score += 5;
    liquidityScore += 6;
  }

  if (price >= 100000) {
    liquidityScore -= 12;
    demandScore -= 4;

    alerts.push({
      type: "warning",
      text: "💎 Ticket alto: liquidez más limitada",
    });
  }

  const maxScore = calculateScoreCap({
    semanticQuality,
    segment,
    roi,
    estimatedProfit,
    kilometers,
    price,
    hasPerformancePack,
    marketSegment,
    liquidityProfile,
    riskProfile,
    luxuryScore,
  });

  if (score > maxScore) {
    score = maxScore;
    alerts.push({
      type: "warning",
      text: `🛡️ Score limitado por fiabilidad: máximo ${maxScore}`,
    });
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

  if (
    score >= 85 &&
    roi >= 15 &&
    estimatedProfit > 0 &&
    semanticQuality >= 60 &&
    segment !== "unknown" &&
    !isHardRiskProfile(riskProfile)
  ) {
    recommendation = "🔥 CHOLLO IA";
    alerts.push({ type: "success", text: "🏆 Score IA muy alto" });
  } else if (
    score <= 45 ||
    roi <= 0 ||
    estimatedProfit <= 0 ||
    isHardRiskProfile(riskProfile)
  ) {
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
    insights: dedupeItems(insights),
    alerts: dedupeItems(alerts),
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

function applyEuropeanEngineCalibration(
  engineProfile,
  {
    scoreRef,
    demandRef,
    resaleRef,
    liquidityRef,
    futureRef,
    insights,
    alerts,
  }
) {
  if (!engineProfile || engineProfile.type === "unknown") {
    return;
  }

  scoreRef(engineProfile.score);
  demandRef(engineProfile.demand);
  resaleRef(engineProfile.resale);
  liquidityRef(engineProfile.liquidity);
  futureRef(engineProfile.future);

  insights.push({
    type: engineProfile.insightType,
    text: engineProfile.insight,
  });

  if (engineProfile.alert) {
    alerts.push(engineProfile.alert);
  }
}

function detectEuropeanEngineProfile({
  brand,
  model,
  engine,
  title,
  fuelType,
  transmission,
  bodyType,
}) {
  const text = normalize(
    `${brand} ${model} ${engine} ${title} ${fuelType} ${transmission} ${bodyType}`
  );

  if (
    text.includes("phev") ||
    text.includes("plug in") ||
    text.includes("plug-in") ||
    text.includes("e-hybrid") ||
    text.includes("tfsie") ||
    text.includes("tfsi e") ||
    /\b(30e|40e|45e|50e|300e|350e|400e|450e|580e)\b/.test(text)
  ) {
    return {
      type: "phev",
      score: 5,
      demand: 7,
      resale: 8,
      liquidity: 4,
      future: 10,
      insightType: "positive",
      insight: "Motor PHEV europeo con buen potencial de reventa",
    };
  }

  if (
    text.includes("hybrid") ||
    text.includes("hibrido") ||
    text.includes("mhev") ||
    text.includes("mild hybrid")
  ) {
    return {
      type: "hybrid",
      score: 4,
      demand: 6,
      resale: 6,
      liquidity: 5,
      future: 8,
      insightType: "positive",
      insight: "Motorización híbrida con demanda creciente",
    };
  }

  if (
    text.includes("electric") ||
    text.includes("electrico") ||
    text.includes("ev") ||
    text.includes("bev") ||
    text.includes("e tron") ||
    text.includes("etron") ||
    text.includes("taycan")
  ) {
    return {
      type: "ev",
      score: 2,
      demand: 5,
      resale: -2,
      liquidity: 1,
      future: 12,
      insightType: "neutral",
      insight: "EV con potencial futuro, pero sensible a depreciación y batería",
      alert: {
        type: "warning",
        text: "🔋 EV: revisar batería, garantía y degradación",
      },
    };
  }

  if (
    text.includes("tdi") ||
    text.includes("dci") ||
    text.includes("bluehdi") ||
    text.includes("blue hdi") ||
    text.includes("hdi") ||
    text.includes("crdi") ||
    text.includes("crdi") ||
    text.includes("cdi")
  ) {
    return {
      type: "european_diesel",
      score: 3,
      demand: 2,
      resale: 4,
      liquidity: 6,
      future: -2,
      insightType: "positive",
      insight: "Diésel europeo vendible si kilometraje y normativa acompañan",
    };
  }

  if (
    text.includes("tsi") ||
    text.includes("tfsi") ||
    text.includes("tce") ||
    text.includes("ecoboost") ||
    text.includes("dig-t") ||
    text.includes("digt") ||
    text.includes("skyactiv")
  ) {
    return {
      type: "european_petrol_turbo",
      score: 3,
      demand: 5,
      resale: 3,
      liquidity: 5,
      future: 1,
      insightType: "positive",
      insight: "Gasolina turbo europea con buena liquidez comercial",
    };
  }

  if (
    text.includes("dsg") ||
    text.includes("stronic") ||
    text.includes("s tronic") ||
    text.includes("automatic") ||
    text.includes("automático") ||
    text.includes("automatico")
  ) {
    return {
      type: "automatic_commercial",
      score: 2,
      demand: 4,
      resale: 3,
      liquidity: 4,
      future: 0,
      insightType: "positive",
      insight: "Transmisión automática con atractivo comercial",
    };
  }

  return {
    type: "unknown",
    score: 0,
    demand: 0,
    resale: 0,
    liquidity: 0,
    future: 0,
    insightType: "neutral",
    insight: "",
  };
}

function applyMarketAdapterCalibration({
  marketSegment,
  liquidityProfile,
  riskProfile,
  luxuryScore,
  scoreRef,
  demandRef,
  resaleRef,
  liquidityRef,
  futureRef,
  insights,
  alerts,
}) {
  if (liquidityProfile.includes("high liquidity")) {
    scoreRef(5);
    demandRef(8);
    liquidityRef(12);
    resaleRef(5);

    insights.push({
      type: "positive",
      text: "Perfil de liquidez alto detectado por market adapter",
    });
  }

  if (liquidityProfile.includes("low liquidity")) {
    scoreRef(-10);
    demandRef(-4);
    liquidityRef(-22);
    resaleRef(-6);

    insights.push({
      type: "negative",
      text: "Perfil de liquidez baja: posible rotación lenta",
    });

    alerts.push({
      type: "warning",
      text: "💧 Liquidez baja detectada por market adapter",
    });
  }

  if (liquidityProfile.includes("medium liquidity")) {
    liquidityRef(-4);

    insights.push({
      type: "neutral",
      text: "Liquidez media: requiere precio correcto y comprador claro",
    });
  }

  if (riskProfile.includes("ultra premium")) {
    scoreRef(-16);
    demandRef(-8);
    liquidityRef(-18);
    resaleRef(-8);
    futureRef(-4);

    alerts.push({
      type: "danger",
      text: "🏛️ Riesgo ultra premium: ticket muy alto y mercado comprador estrecho",
    });
  } else if (riskProfile.includes("very high")) {
    scoreRef(-12);
    liquidityRef(-14);
    resaleRef(-8);

    alerts.push({
      type: "warning",
      text: "🚨 Riesgo muy alto detectado por perfil de mercado",
    });
  } else if (riskProfile.includes("high")) {
    scoreRef(-8);
    liquidityRef(-10);
    resaleRef(-5);

    alerts.push({
      type: "warning",
      text: "⚠️ Riesgo alto detectado por perfil de mercado",
    });
  } else if (riskProfile.includes("technology sensitive")) {
    scoreRef(-4);
    resaleRef(-8);
    futureRef(6);

    alerts.push({
      type: "warning",
      text: "🔋 Riesgo tecnológico: revisar batería, garantía y degradación",
    });
  }

  if (marketSegment.includes("performance luxury suv")) {
    scoreRef(-4);
    demandRef(6);
    liquidityRef(-8);

    insights.push({
      type: "neutral",
      text: "Performance Luxury SUV: deseable, pero no siempre líquido",
    });
  }

  if (marketSegment.includes("electric premium")) {
    futureRef(8);
    resaleRef(-4);

    insights.push({
      type: "neutral",
      text: "Premium eléctrico: potencial futuro con riesgo de depreciación",
    });
  }

  if (luxuryScore >= 90) {
    scoreRef(-5);
    liquidityRef(-8);

    alerts.push({
      type: "warning",
      text: "💎 Luxury score muy alto: validar comprador antes de inmovilizar capital",
    });
  } else if (luxuryScore >= 70) {
    demandRef(4);
    resaleRef(3);

    insights.push({
      type: "positive",
      text: "Luxury score alto: configuración atractiva para comprador premium",
    });
  }
}

function calculateSemanticQuality({
  brand,
  model,
  fuelType,
  bodyType,
  drivetrain,
  title,
}) {
  let quality = 0;

  if (brand) quality += 25;
  if (model) quality += 25;
  if (fuelType) quality += 15;
  if (bodyType) quality += 15;
  if (drivetrain) quality += 10;
  if (title && title.length >= 12) quality += 10;

  return clampScore(quality);
}

function isPremiumBrand(brand) {
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
    "volvo",
  ];

  return premiumBrands.some((item) => brand.includes(item));
}

function detectPremiumAWD(drivetrain) {
  return (
    drivetrain.includes("quattro") ||
    drivetrain.includes("xdrive") ||
    drivetrain.includes("4matic") ||
    drivetrain.includes("4motion")
  );
}

function detectPerformancePackage(performancePackage, title, model) {
  const text = `${performancePackage} ${title} ${model}`;

  return (
    text.includes("amg") ||
    text.includes(" rs") ||
    text.includes("rs3") ||
    text.includes("rs4") ||
    text.includes("rs5") ||
    text.includes("rs6") ||
    text.includes("rs7") ||
    text.includes("m2") ||
    text.includes("m3") ||
    text.includes("m4") ||
    text.includes("m5") ||
    text.includes("m8") ||
    text.includes("gti") ||
    text.includes("gtd") ||
    text.includes("competition") ||
    text.includes("turbo") ||
    text.includes("performance")
  );
}

function detectSegment({
  brand,
  model,
  title,
  bodyType,
  fuelType,
  performancePackage,
  price,
  hasPerformancePack,
}) {
  const text = `${brand} ${model} ${title} ${bodyType} ${fuelType} ${performancePackage}`;

  if (!brand && !model) return "unknown";

  if (
    hasPerformancePack &&
    (bodyType.includes("wagon") ||
      text.includes("touring") ||
      text.includes("avant"))
  ) {
    return "performance_wagon";
  }

  if (hasPerformancePack && price >= 80000) {
    return "high_ticket_performance";
  }

  if (bodyType.includes("suv") && fuelType.includes("phev") && isPremiumBrand(brand)) {
    return "premium_phev_suv";
  }

  if (bodyType.includes("suv") && isPremiumBrand(brand)) {
    return "premium_suv";
  }

  if (fuelType.includes("ev") && isPremiumBrand(brand)) {
    return "premium_ev";
  }

  if (bodyType.includes("wagon")) {
    return "wagon";
  }

  if (isPremiumBrand(brand) && price >= 90000) {
    return "luxury_high_ticket";
  }

  if (isPremiumBrand(brand)) {
    return "premium_general";
  }

  return "general";
}

function applySegmentCalibration(
  segment,
  {
    scoreRef,
    demandRef,
    resaleRef,
    liquidityRef,
    futureRef,
    insights,
    alerts,
  }
) {
  if (segment === "unknown") {
    scoreRef(-18);
    demandRef(-10);
    resaleRef(-10);
    liquidityRef(-16);
    futureRef(-6);

    insights.push({
      type: "negative",
      text: "Vehículo sin identificación suficiente para decisión fiable",
    });

    return;
  }

  if (segment === "premium_phev_suv") {
    scoreRef(8);
    demandRef(14);
    resaleRef(8);
    liquidityRef(12);
    futureRef(8);

    insights.push({
      type: "positive",
      text: "SUV premium PHEV: configuración muy vendible",
    });

    return;
  }

  if (segment === "premium_suv") {
    scoreRef(6);
    demandRef(12);
    resaleRef(7);
    liquidityRef(10);

    insights.push({
      type: "positive",
      text: "SUV premium con buena liquidez potencial",
    });

    return;
  }

  if (segment === "performance_wagon") {
    scoreRef(-8);
    demandRef(8);
    resaleRef(6);
    liquidityRef(-16);
    futureRef(4);

    insights.push({
      type: "neutral",
      text: "Wagon performance: deseable, pero mercado comprador más estrecho",
    });

    alerts.push({
      type: "warning",
      text: "🏁 Familiar performance: no tratar como chollo masivo sin validar demanda",
    });

    return;
  }

  if (segment === "high_ticket_performance") {
    scoreRef(-12);
    demandRef(6);
    resaleRef(3);
    liquidityRef(-20);
    futureRef(2);

    insights.push({
      type: "neutral",
      text: "Performance de ticket alto: margen posible, rotación más lenta",
    });

    return;
  }

  if (segment === "premium_ev") {
    scoreRef(1);
    demandRef(5);
    resaleRef(-2);
    liquidityRef(0);
    futureRef(8);

    insights.push({
      type: "neutral",
      text: "EV premium: futuro interesante, pero depreciación sensible",
    });

    return;
  }

  if (segment === "luxury_high_ticket") {
    scoreRef(-8);
    demandRef(-2);
    resaleRef(2);
    liquidityRef(-14);

    insights.push({
      type: "neutral",
      text: "Luxury high-ticket: oportunidad exige comprador claro",
    });

    return;
  }

  if (segment === "wagon") {
    scoreRef(2);
    resaleRef(5);
    liquidityRef(0);

    insights.push({
      type: "positive",
      text: "Familiar europeo con salida razonable si la configuración acompaña",
    });
  }
}

function calculateScoreCap({
  semanticQuality,
  segment,
  roi,
  estimatedProfit,
  kilometers,
  price,
  hasPerformancePack,
  marketSegment,
  liquidityProfile,
  riskProfile,
  luxuryScore,
}) {
  let cap = 100;

  if (semanticQuality <= 25) cap = Math.min(cap, 68);
  else if (semanticQuality <= 50) cap = Math.min(cap, 78);

  if (segment === "unknown") cap = Math.min(cap, 70);
  if (segment === "performance_wagon") cap = Math.min(cap, 88);
  if (segment === "high_ticket_performance") cap = Math.min(cap, 84);
  if (segment === "luxury_high_ticket") cap = Math.min(cap, 82);
  if (segment === "premium_ev") cap = Math.min(cap, 86);

  if (marketSegment.includes("performance luxury suv")) cap = Math.min(cap, 82);
  if (liquidityProfile.includes("low liquidity")) cap = Math.min(cap, 76);
  if (riskProfile.includes("ultra premium")) cap = Math.min(cap, 72);
  if (riskProfile.includes("very high")) cap = Math.min(cap, 78);
  if (luxuryScore >= 90) cap = Math.min(cap, 80);

  if (price >= 100000) cap = Math.min(cap, 88);
  if (hasPerformancePack && price >= 90000) cap = Math.min(cap, 86);
  if (kilometers >= 150000) cap = Math.min(cap, 76);

  if (roi < 15) cap = Math.min(cap, 74);
  if (estimatedProfit <= 0) cap = Math.min(cap, 50);

  return cap;
}

function isHardRiskProfile(riskProfile) {
  return riskProfile.includes("ultra premium");
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
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

function dedupeItems(items) {
  const seen = new Set();

  return items.filter((item) => {
    const key = `${item.type}-${item.text}`;

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

function clampScore(value) {
  if (value > 100) return 100;
  if (value < 0) return 0;
  return Math.round(value);
}