export function buildOpportunityChampion(decisions = {}) {
  const items = Array.isArray(decisions?.decisions)
    ? decisions.decisions.filter((item) => item && Number.isFinite(Number(item.decisionScore)))
    : [];

  if (!items.length) {
    return createEmptyChampion();
  }

  const ranked = items
    .map(buildChampionCandidate)
    .sort((a, b) => b.championScore - a.championScore);

  const champion = ranked[0] || null;
  const top3 = ranked.slice(0, 3);

  return {
    champion,
    championScore: champion?.championScore || 0,
    championLevel: detectChampionLevel(champion?.championScore || 0),
    championReasons: champion?.championReasons || [],
    top3,
  };
}

function createEmptyChampion() {
  return {
    champion: null,
    championScore: 0,
    championLevel: "Sin datos",
    championReasons: ["Todavía no hay decisiones suficientes para elegir una oportunidad ganadora."],
    top3: [],
  };
}

function buildChampionCandidate(item) {
  const score = safeNumber(item.score);
  const roi = safeNumber(item.roi);
  const profit = safeNumber(item.profit);
  const decisionScore = safeNumber(item.decisionScore);
  const historicalBonus = safeNumber(item.historicalConfidenceBonus);

  const championScore = calculateChampionScore({
    score,
    roi,
    profit,
    decisionScore,
    decision: item.decision,
    riskLevel: item.riskLevel,
    liquidityLevel: item.liquidityLevel,
    historicalBonus,
  });

  const championReasons = buildChampionReasons({
    item,
    score,
    roi,
    profit,
    decisionScore,
    championScore,
    historicalBonus,
  });

  return {
    ...item,
    championScore,
    championLevel: detectChampionLevel(championScore),
    championReasons,
  };
}

function calculateChampionScore({
  score,
  roi,
  profit,
  decisionScore,
  decision,
  riskLevel,
  liquidityLevel,
  historicalBonus,
}) {
  let value = 0;

  value += Math.min(score, 100) * 0.25;
  value += Math.min(roi, 45) * 0.8;
  value += Math.min(Math.max(profit / 120, 0), 40);
  value += Math.min(decisionScore, 100) * 0.25;
  value += Math.min(Math.max(historicalBonus, 0), 15);

  if (decision === "Comprar") value += 12;
  if (decision === "Negociar") value += 7;
  if (decision === "Vigilar") value += 2;
  if (decision === "Descartar") value -= 20;

  if (riskLevel === "Bajo") value += 8;
  if (riskLevel === "Medio") value += 2;
  if (riskLevel === "Alto") value -= 10;

  if (liquidityLevel === "Alta") value += 8;
  if (liquidityLevel === "Media") value += 3;
  if (liquidityLevel === "Baja") value -= 6;

  return clampScore(value);
}

function buildChampionReasons({
  item,
  score,
  roi,
  profit,
  decisionScore,
  championScore,
  historicalBonus,
}) {
  const reasons = [];

  reasons.push(`Champion Score: ${championScore}/100.`);

  if (item.decision) {
    reasons.push(`Decisión IA actual: ${item.decision}.`);
  }

  if (score >= 80) {
    reasons.push(`Score IA alto: ${score}/100.`);
  } else if (score >= 70) {
    reasons.push(`Score IA competitivo: ${score}/100.`);
  }

  if (roi >= 25) {
    reasons.push(`ROI muy atractivo: ${roi}%.`);
  } else if (roi >= 15) {
    reasons.push(`ROI interesante: ${roi}%.`);
  }

  if (profit >= 3000) {
    reasons.push(`Beneficio estimado fuerte: ${profit} €.`);
  } else if (profit > 0) {
    reasons.push(`Beneficio estimado positivo: ${profit} €.`);
  }

  if (decisionScore >= 80) {
    reasons.push(`Decision Score fuerte: ${decisionScore}/100.`);
  }

  if (item.riskLevel) {
    reasons.push(`Riesgo estimado: ${item.riskLevel}.`);
  }

  if (item.liquidityLevel) {
    reasons.push(`Liquidez estimada: ${item.liquidityLevel}.`);
  }

  if (item.historicalConfidenceLevel) {
    reasons.push(`Confianza histórica: ${item.historicalConfidenceLevel}.`);
  }

  if (historicalBonus > 0 && item.historicalConfidenceReason) {
    reasons.push(item.historicalConfidenceReason);
  }

  if (!reasons.length) {
    reasons.push("Oportunidad destacada por combinación de score, ROI, beneficio y riesgo.");
  }

  return reasons.slice(0, 8);
}

function detectChampionLevel(score) {
  if (score >= 85) return "Oportunidad dominante";
  if (score >= 70) return "Muy competitiva";
  if (score >= 55) return "Interesante";
  if (score > 0) return "Débil";
  return "Sin datos";
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value || 0))));
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}