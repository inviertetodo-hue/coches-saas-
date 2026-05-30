export function buildExecutiveBuySignal({
  executiveScore = 0,
  successProbability = 0,
  confidenceScore = 0,
  liquidityScore = 60,
  riskScore = 50,
} = {}) {
  const score =
    executiveScore * 0.35 +
    successProbability * 0.35 +
    confidenceScore * 0.15 +
    liquidityScore * 0.10 +
    (100 - riskScore) * 0.05;

  const finalScore = clamp(Math.round(score), 0, 100);

  return {
    finalScore,
    signal: getSignal(finalScore),
    color: getColor(finalScore),
    summary: buildSummary(finalScore),
  };
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

function buildSummary(score) {
  if (score >= 90) {
    return "Señal ejecutiva extremadamente fuerte.";
  }

  if (score >= 78) {
    return "Compra potencial con alta prioridad.";
  }

  if (score >= 62) {
    return "Mantener en seguimiento.";
  }

  if (score >= 45) {
    return "No priorizar actualmente.";
  }

  return "Descartar salvo circunstancia excepcional.";
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}