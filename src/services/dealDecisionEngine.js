export function generateDealDecisions(analyses = []) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    return {
      decisionScore: 0,
      decisionLevel: "Sin datos",
      decisions: [],
      insights: ["⚖️ Todavía no hay datos para generar decisiones IA."],
    };
  }

  const decisions = analyses
    .filter((item) => item && Number.isFinite(Number(item.score)))
    .map(buildDealDecision)
    .sort((a, b) => b.decisionScore - a.decisionScore);

  const buyDecisions = decisions.filter((item) => item.decision === "Comprar");
  const negotiateDecisions = decisions.filter((item) => item.decision === "Negociar");
  const watchDecisions = decisions.filter((item) => item.decision === "Vigilar");
  const discardDecisions = decisions.filter((item) => item.decision === "Descartar");

  const decisionScore = calculateGlobalDecisionScore({
    buyDecisions,
    negotiateDecisions,
    watchDecisions,
    discardDecisions,
    total: decisions.length,
  });

  const decisionLevel = getDecisionLevel(decisionScore);
  const insights = buildDecisionInsights({
    buyDecisions,
    negotiateDecisions,
    watchDecisions,
    discardDecisions,
    decisionLevel,
  });

  return {
    decisionScore,
    decisionLevel,
    decisions,
    insights,
  };
}

function buildDealDecision(item) {
  const score = safeNumber(item.score);
  const roi = safeNumber(item.roi);
  const profit = safeNumber(item.profit);

  const riskLevel = detectRiskLevel({ score, roi, profit });
  const liquidityLevel = detectLiquidityLevel({ score, roi, profit });
  const decisionScore = calculateDecisionScore({ score, roi, profit });
  const decision = detectDecision({ score, roi, profit, decisionScore });
  const priority = detectPriority(decision, decisionScore);
  const reasons = buildReasons({ score, roi, profit, riskLevel, liquidityLevel, decision });
  const reason = reasons[0] || "Datos mixtos: conviene revisar antes de actuar.";
  const nextAction = buildNextAction(decision);

  return {
    id: item.id,
    title: item.title || "Vehículo IA",
    brand: item.brand || "",
    model: item.model || "",
    score,
    roi,
    profit,
    decision,
    priority,
    reason,
    reasons,
    nextAction,
    riskLevel,
    liquidityLevel,
    decisionScore,
  };
}

function detectDecision({ score, roi, profit, decisionScore }) {
  if (score >= 85 && roi >= 25 && profit >= 2500 && decisionScore >= 80) {
    return "Comprar";
  }

  if (score >= 75 && roi >= 15 && profit > 0) {
    return "Negociar";
  }

  if (score >= 60 && roi >= 8 && profit > 0) {
    return "Vigilar";
  }

  return "Descartar";
}

function detectPriority(decision, decisionScore) {
  if (decision === "Comprar") return "Alta";
  if (decision === "Negociar") return decisionScore >= 75 ? "Alta" : "Media";
  if (decision === "Vigilar") return "Media";
  return "Baja";
}

function calculateDecisionScore({ score, roi, profit }) {
  const normalizedProfit = Math.min(Math.max(profit / 100, 0), 45);
  const normalizedROI = Math.min(Math.max(roi, 0), 45);

  return Math.min(
    100,
    Math.round(score * 0.5 + normalizedROI * 0.8 + normalizedProfit * 0.4)
  );
}

function detectRiskLevel({ score, roi, profit }) {
  if (score >= 85 && roi >= 25 && profit >= 2500) {
    return "Bajo";
  }

  if (score >= 70 && roi >= 12 && profit > 0) {
    return "Medio";
  }

  return "Alto";
}

function detectLiquidityLevel({ score, roi, profit }) {
  if (score >= 85 && roi >= 20 && profit > 0) {
    return "Alta";
  }

  if (score >= 65 && roi >= 10 && profit > 0) {
    return "Media";
  }

  return "Baja";
}

function buildReasons({ score, roi, profit, riskLevel, liquidityLevel, decision }) {
  const reasons = [];

  if (decision === "Comprar") {
    reasons.push("Score alto, ROI fuerte y beneficio suficiente para priorizar compra.");
  }

  if (decision === "Negociar") {
    reasons.push("Operación interesante, pero conviene validar precio, historial y margen real.");
  }

  if (decision === "Vigilar") {
    reasons.push("Tiene señales útiles, pero no suficientes para actuar de inmediato.");
  }

  if (decision === "Descartar") {
    reasons.push("Rentabilidad insuficiente o riesgo elevado frente al histórico.");
  }

  if (score >= 85) {
    reasons.push(`Score IA muy alto: ${score}/100.`);
  } else if (score >= 70) {
    reasons.push(`Score IA correcto: ${score}/100.`);
  } else {
    reasons.push(`Score IA bajo o moderado: ${score}/100.`);
  }

  if (roi >= 25) {
    reasons.push(`ROI atractivo: ${roi}%.`);
  } else if (roi >= 12) {
    reasons.push(`ROI aceptable: ${roi}%.`);
  } else {
    reasons.push(`ROI débil: ${roi}%.`);
  }

  if (profit >= 2500) {
    reasons.push(`Beneficio estimado interesante: ${profit} €.`);
  } else if (profit > 0) {
    reasons.push(`Beneficio positivo pero limitado: ${profit} €.`);
  } else {
    reasons.push("Beneficio estimado insuficiente o negativo.");
  }

  reasons.push(`Riesgo estimado: ${riskLevel}.`);
  reasons.push(`Liquidez estimada: ${liquidityLevel}.`);

  return reasons;
}

function buildNextAction(decision) {
  if (decision === "Comprar") {
    return "Contactar rápido, verificar historial y preparar negociación.";
  }

  if (decision === "Negociar") {
    return "Pedir más datos, revisar mantenimiento y negociar precio.";
  }

  if (decision === "Vigilar") {
    return "Guardar en seguimiento y esperar mejora de precio o más datos.";
  }

  return "Descartar salvo bajada fuerte de precio o nueva información.";
}

function calculateGlobalDecisionScore({
  buyDecisions,
  negotiateDecisions,
  watchDecisions,
  discardDecisions,
  total,
}) {
  if (!total) return 0;

  const rawScore =
    35 +
    buyDecisions.length * 14 +
    negotiateDecisions.length * 8 +
    watchDecisions.length * 3 -
    discardDecisions.length * 5;

  return Math.min(100, Math.max(0, Math.round(rawScore)));
}

function getDecisionLevel(score) {
  if (score >= 85) return "Muy fuerte";
  if (score >= 70) return "Fuerte";
  if (score >= 55) return "Intermedio";
  if (score > 0) return "Débil";
  return "Sin datos";
}

function buildDecisionInsights({
  buyDecisions,
  negotiateDecisions,
  watchDecisions,
  discardDecisions,
  decisionLevel,
}) {
  const insights = [];

  insights.push(`⚖️ Nivel global de decisión: ${decisionLevel}.`);

  if (buyDecisions.length > 0) {
    insights.push(`🔥 ${buyDecisions.length} operación(es) listas para priorizar compra.`);
  }

  if (negotiateDecisions.length > 0) {
    insights.push(`🟢 ${negotiateDecisions.length} operación(es) interesantes para negociar.`);
  }

  if (watchDecisions.length > 0) {
    insights.push(`🟡 ${watchDecisions.length} operación(es) conviene mantener en vigilancia.`);
  }

  if (discardDecisions.length > 0) {
    insights.push(`🔴 ${discardDecisions.length} operación(es) deberían descartarse.`);
  }

  if (buyDecisions.length === 0 && negotiateDecisions.length === 0) {
    insights.push("No hay compras claras ahora mismo; conviene seguir buscando mejores oportunidades.");
  }

  return insights;
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}