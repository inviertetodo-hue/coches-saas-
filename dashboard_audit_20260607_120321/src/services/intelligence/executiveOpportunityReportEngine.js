import { buildTopOpportunities } from "./topOpportunitiesEngine";

export function buildExecutiveOpportunityReport(items = [], options = {}) {
  const topOpportunities = buildTopOpportunities(items, {
    topLimit: options.topLimit ?? 10,
    minScore: options.minScore ?? 0,
  });

  const best = topOpportunities.bestOpportunity;

  return {
    generatedAt: new Date().toISOString(),
    totalCandidates: topOpportunities.totalCandidates,
    rankedCandidates: topOpportunities.rankedCandidates,
    bestOpportunity: best,
    recommendation: topOpportunities.buyingRecommendation,
    headline: buildHeadline(best),
    summary: buildSummary(topOpportunities),
    buyReasons: buildBuyReasons(best),
    riskReasons: buildRiskReasons(best),
    confidence: buildConfidence(best),
    nextActions: buildNextActions(best),
    top3: topOpportunities.top3,
    top5: topOpportunities.top5,
    top10: topOpportunities.top10,
    rawTopOpportunities: topOpportunities,
  };
}

function buildHeadline(best) {
  if (!best) {
    return "No hay una oportunidad clara de compra en este lote.";
  }

  return `${buildVehicleName(best)} es la mejor oportunidad detectada.`;
}

function buildSummary(topOpportunities) {
  const best = topOpportunities.bestOpportunity;

  if (!best) {
    return [
      "El lote analizado no contiene una oportunidad suficientemente fuerte.",
      "La recomendación es esperar, ampliar la búsqueda o mejorar la calidad de los datos.",
    ].join(" ");
  }

  return [
    `${topOpportunities.rankedCandidates} vehículos han sido evaluados por el motor de oportunidades.`,
    `La mejor opción es ${buildVehicleName(best)} con Opportunity Score ${best.opportunityScore}/100.`,
    `ROI estimado: ${formatNumber(best.roi)}%.`,
    `Margen estimado: ${formatCurrency(best.profit)}.`,
    `Decisión: ${best.opportunityDecision}.`,
  ].join(" ");
}

function buildBuyReasons(best) {
  if (!best) {
    return ["No existe una oportunidad suficientemente clara para justificar compra."];
  }

  const reasons = [];

  if (best.opportunityScore >= 85) {
    reasons.push("Opportunity Score muy alto frente al resto del lote.");
  } else if (best.opportunityScore >= 70) {
    reasons.push("Opportunity Score interesante y superior al umbral de revisión.");
  }

  if (normalizeNumber(best.roi) > 0) {
    reasons.push(`ROI positivo estimado del ${formatNumber(best.roi)}%.`);
  }

  if (normalizeNumber(best.profit) > 0) {
    reasons.push(`Margen positivo estimado de ${formatCurrency(best.profit)}.`);
  }

  if (normalizeNumber(best.qualityScore ?? best.quality) >= 80) {
    reasons.push("Calidad de datos alta para alimentar memoria y decisión.");
  }

  if (normalizeNumber(best.comparableConfidence) >= 75) {
    reasons.push("Confianza de comparables suficiente para análisis inicial.");
  }

  return reasons.length > 0
    ? reasons
    : ["El vehículo destaca frente al lote, pero necesita revisión manual."];
}

function buildRiskReasons(best) {
  if (!best) {
    return ["No hay datos suficientes para evaluar riesgos concretos."];
  }

  const risks = [];

  if (normalizeNumber(best.roi) < 0) {
    risks.push("ROI negativo: no debe tratarse como oportunidad de compra.");
  }

  if (normalizeNumber(best.profit) < 0) {
    risks.push("Margen negativo estimado.");
  }

  if (normalizeNumber(best.qualityScore ?? best.quality) < 70) {
    risks.push("Calidad de datos insuficiente para decisión automática.");
  }

  if (normalizeNumber(best.comparableConfidence) < 70) {
    risks.push("Confianza de comparables baja.");
  }

  if (best.opportunityRiskLevel === "high") {
    risks.push("Riesgo alto según el motor de oportunidad.");
  }

  return risks.length > 0
    ? risks
    : ["No se detectan riesgos críticos en esta evaluación inicial."];
}

function buildConfidence(best) {
  if (!best) {
    return {
      level: "low",
      score: 0,
      label: "Baja",
      reason: "No hay oportunidad principal para evaluar.",
    };
  }

  const quality = normalizeNumber(best.qualityScore ?? best.quality);
  const comparableConfidence = normalizeNumber(best.comparableConfidence);
  const matchScore = normalizeNumber(best.matchScore);

  const score = Math.round((quality + comparableConfidence + matchScore) / 3);

  if (score >= 85) {
    return {
      level: "high",
      score,
      label: "Alta",
      reason: "Calidad, comparables y match score son sólidos.",
    };
  }

  if (score >= 70) {
    return {
      level: "medium",
      score,
      label: "Media",
      reason: "La señal es útil, pero conviene revisión antes de compra.",
    };
  }

  return {
    level: "low",
    score,
    label: "Baja",
    reason: "La decisión necesita más datos o validación manual.",
  };
}

function buildNextActions(best) {
  if (!best) {
    return [
      "Ampliar búsqueda.",
      "Mejorar calidad de datos.",
      "Evitar guardar registros dudosos como oportunidades.",
    ];
  }

  if (best.opportunityScore >= 85) {
    return [
      "Revisar anuncio original.",
      "Validar historial, equipamiento y estado.",
      "Comparar con 3-5 alternativas reales.",
      "Contactar rápido si la información es consistente.",
    ];
  }

  if (best.opportunityScore >= 70) {
    return [
      "Revisar manualmente antes de decidir.",
      "Comparar precio con mercado local.",
      "Validar kilometraje, equipamiento y posibles costes.",
    ];
  }

  return [
    "No priorizar compra todavía.",
    "Usar el dato como observación de mercado.",
    "Buscar alternativas con mejor margen o menor riesgo.",
  ];
}

function buildVehicleName(vehicle) {
  return [vehicle.brand, vehicle.model, vehicle.year]
    .filter(Boolean)
    .join(" ");
}

function formatCurrency(value) {
  return `${formatNumber(value)} €`;
}

function formatNumber(value) {
  return normalizeNumber(value).toLocaleString("es-ES", {
    maximumFractionDigits: 2,
  });
}

function normalizeNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return numericValue;
}