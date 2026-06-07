export function buildExecutiveBuySignal({
  executiveScore = 0,
  successProbability = 0,
  confidenceScore = 0,
  liquidityScore = 60,
  riskScore = 50,
  timelineMomentumScore = 50,
  timelineMomentumLabel = "NO_HISTORY",
} = {}) {
  const momentumScore = normalizeMomentumScore(
    timelineMomentumScore,
    timelineMomentumLabel
  );

  const score =
    executiveScore * 0.30 +
    successProbability * 0.30 +
    confidenceScore * 0.14 +
    liquidityScore * 0.09 +
    (100 - riskScore) * 0.05 +
    momentumScore * 0.12;

  const finalScore = clamp(Math.round(score), 0, 100);

  return {
    finalScore,
    signal: getSignal(finalScore),
    color: getColor(finalScore),
    summary: buildSummary(finalScore, timelineMomentumLabel),
    timelineMomentumScore: momentumScore,
    timelineMomentumLabel,
  };
}

function normalizeMomentumScore(score, label) {
  const numericScore = Number(score);

  if (Number.isFinite(numericScore) && numericScore > 0) {
    return clamp(Math.round(numericScore), 0, 100);
  }

  if (label === "IMPROVING_FAST") return 88;
  if (label === "IMPROVING") return 72;
  if (label === "STABLE") return 52;
  if (label === "DETERIORATING") return 34;
  if (label === "AVOID_TREND") return 18;

  return 50;
}

function getSignal(score) {
  if (score >= 90) return "STRONG_BUY";
  if (score >= 78) return "BUY";
  if (score >= 62) return "WATCHLIST";
  if (score >= 45) return "AVOID";
  return "REJECT";
}

function getColor(score) {
  if (score >= 90) return "green";
  if (score >= 78) return "lime";
  if (score >= 62) return "yellow";
  if (score >= 45) return "orange";
  return "red";
}

function buildSummary(score, timelineMomentumLabel) {
  const momentumText = buildMomentumSummary(timelineMomentumLabel);

  if (score >= 90) {
    return `Señal ejecutiva extremadamente fuerte. ${momentumText}`;
  }

  if (score >= 78) {
    return `Compra potencial con alta prioridad. ${momentumText}`;
  }

  if (score >= 62) {
    return `Mantener en seguimiento. ${momentumText}`;
  }

  if (score >= 45) {
    return `No priorizar actualmente. ${momentumText}`;
  }

  return `Descartar salvo circunstancia excepcional. ${momentumText}`;
}

function buildMomentumSummary(label) {
  if (label === "IMPROVING_FAST") {
    return "La evolución temporal mejora de forma clara.";
  }

  if (label === "IMPROVING") {
    return "La evolución temporal es positiva.";
  }

  if (label === "STABLE") {
    return "La evolución temporal es estable.";
  }

  if (label === "DETERIORATING") {
    return "La evolución temporal se está deteriorando.";
  }

  if (label === "AVOID_TREND") {
    return "La evolución temporal aconseja evitar la operación.";
  }

  return "Sin histórico temporal suficiente.";
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}