export function buildFinalDealDecision(item = {}) {
  const opportunityScore = toNumber(item.opportunityScore, 0);
  const netProfit = toNumber(item.netProfit, 0);
  const netRoi = toNumber(item.netRoi, 0);
  const riskScore = toNumber(item.dealRisk?.riskScore, 0);
  const riskLevel = item.dealRisk?.level || "Medio";
  const liquidityScore = toNumber(item.liquidity?.liquidityScore, 60);

  let finalScore = opportunityScore;

  finalScore += netRoi >= 12 ? 8 : 0;
  finalScore += netProfit >= 5000 ? 6 : 0;
  finalScore += liquidityScore >= 80 ? 8 : 0;

  finalScore -= riskScore >= 70 ? 30 : 0;
  finalScore -= riskScore >= 45 ? 16 : 0;
  finalScore -= netProfit <= 0 ? 35 : 0;
  finalScore -= netRoi < 6 ? 12 : 0;
  finalScore -= liquidityScore < 55 ? 10 : 0;

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
    }),
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
}) {
  if (action === "CONTACTAR_PRIMERO") {
    return `Prioridad alta: score final ${finalScore}/100, margen neto ${formatMoney(
      netProfit
    )}, ROI ${netRoi}% y riesgo ${riskLevel.toLowerCase()}.`;
  }

  if (action === "VIGILAR") {
    return `Interesante pero no urgente: score final ${finalScore}/100, riesgo ${riskLevel.toLowerCase()} y liquidez ${liquidityScore}/100. Conviene seguirlo o negociar mejor precio.`;
  }

  if (action === "EVITAR") {
    return `No priorizar: riesgo ${riskLevel.toLowerCase()} (${riskScore}/100), ROI ${netRoi}% y liquidez ${liquidityScore}/100. Puede consumir tiempo o capital sin suficiente compensación.`;
  }

  return `Descartar: el margen, riesgo o retorno no compensan. Score final ${finalScore}/100 y riesgo ${riskLevel.toLowerCase()} (${riskScore}/100).`;
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