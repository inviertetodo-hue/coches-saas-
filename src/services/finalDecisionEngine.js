import { findModelKnowledge } from "./marketKnowledgeBase";

export function buildFinalDealDecision(item = {}) {
  const opportunityScore = toNumber(item.opportunityScore, 0);
  const netProfit = toNumber(item.netProfit, 0);
  const netRoi = toNumber(item.netRoi, 0);

  const riskScore = toNumber(item.dealRisk?.riskScore, 0);
  const riskLevel = item.dealRisk?.level || "Medio";

  const liquidityScore = toNumber(
    item.liquidity?.liquidityScore,
    60
  );

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

  finalScore += modelModifier.finalScoreModifier;

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
    }),
  };
}

function getModelScoreModifier(item) {
  const searchText = [
    item.title,
    item.brand,
    item.model,
    item.engine,
  ].join(" ");

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
    finalScoreModifier:
      knowledge.score.finalScoreModifier || 0,
  };
}

function getFinalAction({
  finalScore,
  riskLevel,
  riskScore,
  netProfit,
  netRoi,
  liquidityScore,
}) {
  if (
    netProfit <= 0 ||
    riskLevel === "Crítico" ||
    riskScore >= 75
  ) {
    return "DESCARTAR";
  }

  if (
    riskScore >= 55 ||
    liquidityScore < 50 ||
    netRoi < 5
  ) {
    return "EVITAR";
  }

  if (
    finalScore >= 78 &&
    netProfit > 3000 &&
    netRoi >= 8 &&
    riskScore < 45
  ) {
    return "CONTACTAR_PRIMERO";
  }

  if (finalScore >= 58) {
    return "VIGILAR";
  }

  return "EVITAR";
}

function getActionLabel(action) {
  const labels = {
    CONTACTAR_PRIMERO: "Contactar primero",
    VIGILAR: "Vigilar",
    EVITAR: "Evitar",
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
}) {
  const modifierText =
    modelModifier.active
      ? ` Ajuste modelo: ${modelModifier.finalScoreModifier > 0 ? "+" : ""}${modelModifier.finalScoreModifier}.`
      : "";

  if (action === "CONTACTAR_PRIMERO") {
    return `Prioridad alta: score final ${finalScore}/100, margen neto ${formatMoney(
      netProfit
    )}, ROI ${netRoi}% y riesgo ${riskLevel.toLowerCase()}.${modifierText}`;
  }

  if (action === "VIGILAR") {
    return `Interesante pero no urgente: score final ${finalScore}/100, riesgo ${riskLevel.toLowerCase()} y liquidez ${liquidityScore}/100.${modifierText}`;
  }

  if (action === "EVITAR") {
    return `No priorizar: riesgo ${riskLevel.toLowerCase()} (${riskScore}/100), ROI ${netRoi}% y liquidez ${liquidityScore}/100.${modifierText}`;
  }

  return `Descartar: score final ${finalScore}/100 y riesgo ${riskLevel.toLowerCase()} (${riskScore}/100).${modifierText}`;
}

function formatMoney(value) {
  return `${toNumber(value, 0).toLocaleString("es-ES")} €`;
}

function toNumber(value, fallback) {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}