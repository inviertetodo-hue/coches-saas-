import { findModelKnowledge } from "./marketKnowledgeBase";
import { calculateLearningBonus } from "./intelligence/marketLearningEngine";

export function buildFinalDealDecision(item = {}) {
  const opportunityScore = toNumber(item.opportunityScore, 0);
  const netProfit = toNumber(item.netProfit, 0);
  const netRoi = toNumber(item.netRoi, 0);

  const riskScore = toNumber(item.dealRisk?.riskScore, 0);
  const riskLevel = item.dealRisk?.level || "Medio";

  const liquidityScore = toNumber(item.liquidity?.liquidityScore, 60);

  let finalScore = opportunityScore;

  if (netRoi >= 12) finalScore += 8;
  if (netProfit >= 5000) finalScore += 6;
  if (liquidityScore >= 80) finalScore += 8;

  if (riskScore >= 70) finalScore -= 30;
  else if (riskScore >= 45) finalScore -= 16;

  if (netProfit <= 0) finalScore -= 35;
  if (netRoi < 6) finalScore -= 12;
  if (liquidityScore < 55) finalScore -= 10;

  const modelModifier = getModelScoreModifier(item);
  const learningModifier = getLearningScoreModifier(item);

  finalScore += modelModifier.finalScoreModifier;
  finalScore += learningModifier.learningBonus;

  finalScore = clamp(Math.round(finalScore), 0, 100);

  const action = getFinalAction({
    finalScore,
    riskLevel,
    riskScore,
    netProfit,
    netRoi,
    liquidityScore,
  });

  return {
    finalScore,

    modelScoreModifier: {
      active: modelModifier.active,
      model: modelModifier.model,
      modifier: modelModifier.finalScoreModifier,
    },

    learningScoreModifier: {
      active: learningModifier.active,
      model: learningModifier.model,
      modifier: learningModifier.learningBonus,
      confidence: learningModifier.confidence,
      confidenceScore: learningModifier.confidenceScore,
      analyses: learningModifier.analyses,
      averageROI: learningModifier.averageROI,
      averageProfit: learningModifier.averageProfit,
      signals: learningModifier.signals,
    },

    action,

    label: getActionLabel(action),

    explanation: buildExplanation({
      action,
      finalScore,
      netProfit,
      netRoi,
      riskLevel,
      riskScore,
      liquidityScore,
      modelModifier,
      learningModifier,
    }),

    nextAction: buildNextAction({
      action,
      netProfit,
      netRoi,
      riskScore,
      liquidityScore,
    }),

    userSummary: buildUserSummary({
      action,
      finalScore,
      netProfit,
      netRoi,
      riskLevel,
      riskScore,
      liquidityScore,
    }),
  };
}

function getModelScoreModifier(item) {
  const searchText = [item.title, item.brand, item.model, item.engine].join(" ");

  const knowledge = findModelKnowledge(searchText);

  if (!knowledge.score) {
    return {
      active: false,
      model: null,
      finalScoreModifier: 0,
    };
  }

  return {
    active: true,
    model: knowledge.model,
    finalScoreModifier: knowledge.score.finalScoreModifier || 0,
  };
}

function getLearningScoreModifier(item) {
  const historicalModelMemory =
    item.historicalModelMemory ||
    item.marketMemory?.historicalModelMemory ||
    item.memory?.historicalModelMemory ||
    [];

  return calculateLearningBonus({
    vehicle: item,
    historicalModelMemory,
  });
}

function getFinalAction({
  finalScore,
  riskLevel,
  riskScore,
  netProfit,
  netRoi,
  liquidityScore,
}) {
  if (netProfit <= 0 || riskLevel === "Crítico" || riskScore >= 75) {
    return "DESCARTAR";
  }

  if (riskScore >= 55 || liquidityScore < 50 || netRoi < 5) {
    return "EVITAR";
  }

  if (finalScore >= 78 && netProfit > 3000 && netRoi >= 8 && riskScore < 45) {
    return "CONTACTAR_PRIMERO";
  }

  if (finalScore >= 58) {
    return "VIGILAR";
  }

  return "EVITAR";
}

function getActionLabel(action) {
  const labels = {
    CONTACTAR_PRIMERO: "Contactar hoy",
    VIGILAR: "Vigilar precio",
    EVITAR: "No priorizar",
    DESCARTAR: "Descartar",
  };

  return labels[action] || "Vigilar";
}

function buildExplanation({
  action,
  finalScore,
  netProfit,
  netRoi,
  riskLevel,
  riskScore,
  liquidityScore,
  modelModifier,
  learningModifier,
}) {
  const modifierText = modelModifier.active
    ? ` Ajuste del modelo: ${modelModifier.finalScoreModifier > 0 ? "+" : ""}${modelModifier.finalScoreModifier}.`
    : "";

  const learningText = learningModifier.active
    ? ` Memoria histórica: ${learningModifier.learningBonus > 0 ? "+" : ""}${learningModifier.learningBonus} por ${learningModifier.model} (${learningModifier.confidence.toLowerCase()}).`
    : "";

  if (action === "CONTACTAR_PRIMERO") {
    return `Candidata fuerte para contactar hoy: margen neto estimado de ${formatMoney(
      netProfit
    )}, ROI ${netRoi}%, liquidez ${liquidityScore}/100 y riesgo controlado (${riskLevel.toLowerCase()}).${modifierText}${learningText}`;
  }

  if (action === "VIGILAR") {
    return `Conviene vigilarla: la señal es interesante, pero todavía no justifica actuar de inmediato. Score ${finalScore}/100, liquidez ${liquidityScore}/100 y riesgo ${riskLevel.toLowerCase()}.`;
  }

  if (action === "EVITAR") {
    return `No conviene priorizarla ahora: el riesgo, la liquidez o el ROI no compensan suficientemente. Riesgo ${riskLevel.toLowerCase()} (${riskScore}/100), ROI ${netRoi}% y liquidez ${liquidityScore}/100.`;
  }

  return `No comprar ahora: el margen neto o el riesgo no compensan la operación. Score ${finalScore}/100, riesgo ${riskLevel.toLowerCase()} (${riskScore}/100), margen ${formatMoney(
    netProfit
  )} y ROI ${netRoi}%.${modifierText}${learningText}`;
}

function buildNextAction({
  action,
  netProfit,
  netRoi,
  riskScore,
  liquidityScore,
}) {
  if (action === "CONTACTAR_PRIMERO") {
    return "Llamar hoy, confirmar disponibilidad, historial, daños, propietarios y precio final puesto en España.";
  }

  if (action === "VIGILAR") {
    return "Guardar en seguimiento y revisar si baja de precio o mejora la señal de mercado.";
  }

  if (action === "EVITAR") {
    return "No gastar tiempo ahora salvo que el precio baje claramente o aparezcan mejores datos.";
  }

  if (netProfit <= 0) {
    return "Descartar por margen neto insuficiente después de costes.";
  }

  if (netRoi < 0) {
    return "Descartar porque el ROI estimado es negativo.";
  }

  if (riskScore >= 70) {
    return "Descartar por riesgo operativo demasiado alto.";
  }

  if (liquidityScore < 50) {
    return "Descartar por liquidez insuficiente.";
  }

  return "Descartar y buscar una alternativa con mejor margen, menor riesgo o más liquidez.";
}

function buildUserSummary({
  action,
  finalScore,
  netProfit,
  netRoi,
  riskLevel,
  riskScore,
  liquidityScore,
}) {
  if (action === "CONTACTAR_PRIMERO") {
    return `Oportunidad accionable: ${formatMoney(netProfit)} de margen estimado, ROI ${netRoi}% y liquidez ${liquidityScore}/100.`;
  }

  if (action === "VIGILAR") {
    return `Oportunidad para seguimiento: score ${finalScore}/100, riesgo ${riskLevel.toLowerCase()} y liquidez ${liquidityScore}/100.`;
  }

  if (action === "EVITAR") {
    return `No prioritaria: ROI ${netRoi}%, riesgo ${riskScore}/100 y liquidez ${liquidityScore}/100.`;
  }

  return `Descartada por ahora: margen ${formatMoney(netProfit)}, ROI ${netRoi}% y riesgo ${riskScore}/100.`;
}

function formatMoney(value) {
  return `${toNumber(value, 0).toLocaleString("es-ES")} €`;
}

function toNumber(value, fallback) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}