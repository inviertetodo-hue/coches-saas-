export function analyzeVehicleMemory(car) {
  const text = normalize(
    `${car.title} ${car.brand} ${car.model} ${car.fuelType} ${car.bodyType} ${car.performancePackage}`
  );

  const segment = detectMemorySegment(text, car);
  const resaleSpeed = estimateResaleSpeed(segment, car);
  const demandLevel = estimateDemandLevel(segment, car);
  const riskLevel = estimateRiskLevel(segment, car);
  const confidence = estimateConfidence(car);
  const recommendedMaxBid = estimateRecommendedMaxBid(car);
  const strategy = buildStrategy({
    segment,
    resaleSpeed,
    demandLevel,
    riskLevel,
    confidence,
    recommendedMaxBid,
    car,
  });

  return {
    segment,
    resaleSpeed,
    demandLevel,
    riskLevel,
    confidence,
    recommendedMaxBid,
    strategy,
    memorySignals: buildMemorySignals({
      segment,
      resaleSpeed,
      demandLevel,
      riskLevel,
      confidence,
      car,
    }),
  };
}

function detectMemorySegment(text, car) {
  if (
    text.includes("x5") ||
    text.includes("q7") ||
    text.includes("gle") ||
    text.includes("glc") ||
    text.includes("cayenne") ||
    text.includes("xc90") ||
    text.includes("range rover sport")
  ) {
    if (
      text.includes("phev") ||
      text.includes("hybrid") ||
      text.includes("45e") ||
      text.includes("50e") ||
      text.includes("300de") ||
      text.includes("350de") ||
      text.includes("tfsi e") ||
      text.includes("tfsie")
    ) {
      return "premium_phev_suv";
    }

    return "premium_suv";
  }

  if (
    text.includes("amg") ||
    text.includes(" rs") ||
    text.includes("m3") ||
    text.includes("m4") ||
    text.includes("m5") ||
    text.includes("turbo")
  ) {
    return "performance_niche";
  }

  if (
    text.includes("a3") ||
    text.includes("serie 3") ||
    text.includes("series 3") ||
    text.includes("clase a") ||
    text.includes("class a") ||
    text.includes("golf")
  ) {
    return "fast_rotation_compact";
  }

  if (
    text.includes("toyota") ||
    text.includes("hybrid") ||
    text.includes("hibrido")
  ) {
    return "efficient_hybrid";
  }

  if (car.price >= 90000) {
    return "luxury_high_ticket";
  }

  return "general_market";
}

function estimateResaleSpeed(segment, car) {
  if (segment === "premium_phev_suv") {
    return {
      label: "Alta",
      days: 35,
      score: 82,
    };
  }

  if (segment === "premium_suv") {
    return {
      label: "Media-alta",
      days: 45,
      score: 74,
    };
  }

  if (segment === "fast_rotation_compact") {
    return {
      label: "Alta",
      days: 30,
      score: 86,
    };
  }

  if (segment === "efficient_hybrid") {
    return {
      label: "Alta",
      days: 32,
      score: 84,
    };
  }

  if (segment === "performance_niche") {
    return {
      label: "Media-baja",
      days: 75,
      score: 48,
    };
  }

  if (segment === "luxury_high_ticket") {
    return {
      label: "Baja",
      days: 90,
      score: 38,
    };
  }

  return {
    label: "Media",
    days: 55,
    score: 60,
  };
}

function estimateDemandLevel(segment, car) {
  if (segment === "premium_phev_suv") return "Alta";
  if (segment === "fast_rotation_compact") return "Alta";
  if (segment === "efficient_hybrid") return "Alta";
  if (segment === "premium_suv") return "Media-alta";
  if (segment === "performance_niche") return "Media";
  if (segment === "luxury_high_ticket") return "Baja-media";

  return "Media";
}

function estimateRiskLevel(segment, car) {
  if (segment === "performance_niche") return "Medio-alto";
  if (segment === "luxury_high_ticket") return "Alto";

  if (car.km >= 120000) return "Medio-alto";
  if (car.price >= 90000) return "Medio";
  if (segment === "premium_phev_suv") return "Medio-bajo";
  if (segment === "fast_rotation_compact") return "Bajo";

  return "Medio";
}

function estimateConfidence(car) {
  let confidence = 35;

  if (car.title) confidence += 15;
  if (car.brand) confidence += 12;
  if (car.model) confidence += 12;
  if (car.year) confidence += 8;
  if (car.km || car.kilometers) confidence += 8;
  if (car.price) confidence += 8;
  if (car.fuelType) confidence += 5;
  if (car.bodyType) confidence += 5;
  if (car.drivetrain) confidence += 4;

  return clampScore(confidence);
}

function estimateRecommendedMaxBid(car) {
  const price = safeNumber(car.price);
  const comparable = car.comparable || {};
  const fairPrice = safeNumber(comparable.fairPrice);

  if (!price) return 0;

  const referencePrice = fairPrice > 0 ? fairPrice : price * 1.12;

  const safetyMargin = price >= 90000 ? 0.84 : 0.9;

  return Math.round(referencePrice * safetyMargin);
}

function buildStrategy({
  segment,
  resaleSpeed,
  demandLevel,
  riskLevel,
  confidence,
  recommendedMaxBid,
  car,
}) {
  const netProfit = safeNumber(car.netProfit);
  const netRoi = safeNumber(car.netRoi);

  if (confidence < 55) {
    return {
      action: "ANALIZAR",
      label: "🟡 Analizar con más datos",
      reason:
        "La oportunidad necesita mejor información antes de tomar una decisión.",
    };
  }

  if (
    netProfit >= 7000 &&
    netRoi >= 12 &&
    resaleSpeed.score >= 75 &&
    !riskLevel.toLowerCase().includes("alto")
  ) {
    return {
      action: "BUY",
      label: "🔥 Comprar / contactar primero",
      reason:
        "Margen neto atractivo, buena demanda y probabilidad alta de rotación.",
    };
  }

  if (
    netProfit >= 3500 &&
    netRoi >= 7 &&
    resaleSpeed.score >= 60
  ) {
    return {
      action: "NEGOTIATE",
      label: "🟢 Buena opción si se negocia",
      reason:
        "Puede ser buena compra, pero conviene mejorar precio o validar estado.",
    };
  }

  if (
    segment === "performance_niche" ||
    segment === "luxury_high_ticket"
  ) {
    return {
      action: "CAUTION",
      label: "⚠️ Comprar solo con comprador claro",
      reason:
        "Puede tener margen, pero la rotación es más lenta y el público comprador más pequeño.",
    };
  }

  return {
    action: "WAIT",
    label: "🟡 Esperar mejor oportunidad",
    reason:
      "No hay suficiente ventaja frente a riesgo, liquidez o margen neto.",
  };
}

function buildMemorySignals({
  segment,
  resaleSpeed,
  demandLevel,
  riskLevel,
  confidence,
  car,
}) {
  return [
    `Segmento aprendido: ${formatSegment(segment)}.`,
    `Probabilidad de venta rápida: ${resaleSpeed.label} (~${resaleSpeed.days} días).`,
    `Demanda estimada: ${demandLevel}.`,
    `Riesgo estimado: ${riskLevel}.`,
    `Confianza del sistema: ${confidence}/100.`,
    `Precio máximo recomendado: ${formatMoney(
      car.memory?.recommendedMaxBid || estimateRecommendedMaxBid(car)
    )}.`,
  ];
}

function formatSegment(segment) {
  const map = {
    premium_phev_suv: "SUV premium PHEV",
    premium_suv: "SUV premium",
    performance_niche: "performance nicho",
    fast_rotation_compact: "compacto de rotación rápida",
    efficient_hybrid: "híbrido eficiente",
    luxury_high_ticket: "lujo de ticket alto",
    general_market: "mercado general",
  };

  return map[segment] || segment;
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("es-ES")} €`;
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