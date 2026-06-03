export function buildOpportunityChange(current = {}, previous = {}) {
  const currentPrice = toNumber(current.price ?? current.purchasePrice);
  const previousPrice = toNumber(previous.price ?? previous.purchasePrice);

  const currentAction = normalizeAction(current.decision?.action || current.action);
  const previousAction = normalizeAction(previous.decision?.action || previous.action);

  const currentScore = toNumber(
    current.decision?.decisionScore ??
      current.opportunity?.scoreV2 ??
      current.score
  );

  const previousScore = toNumber(
    previous.decision?.decisionScore ??
      previous.opportunity?.scoreV2 ??
      previous.score
  );

  const currentConfidence = toNumber(
    current.decision?.confidence?.score ??
      current.vehicleValuation?.confidence ??
      current.confidence
  );

  const previousConfidence = toNumber(
    previous.decision?.confidence?.score ??
      previous.vehicleValuation?.confidence ??
      previous.confidence
  );

  const priceChange = calculatePriceChange(currentPrice, previousPrice);
  const scoreChange = currentScore - previousScore;
  const confidenceChange = currentConfidence - previousConfidence;

  const signals = buildSignals({
    priceChange,
    scoreChange,
    confidenceChange,
    currentAction,
    previousAction,
  });

  return {
    currentPrice,
    previousPrice,
    priceChange,
    currentAction,
    previousAction,
    currentScore,
    previousScore,
    scoreChange,
    currentConfidence,
    previousConfidence,
    confidenceChange,
    signals,
    hasImportantChange: signals.some((signal) => signal.importance === "HIGH"),
    summary: buildSummary(signals),
  };
}

export function buildOpportunityChanges(currentItems = [], previousItems = []) {
  const previousByFingerprint = new Map(
    previousItems
      .filter(Boolean)
      .map((item) => [resolveFingerprint(item), item])
      .filter(([fingerprint]) => Boolean(fingerprint))
  );

  return currentItems
    .filter(Boolean)
    .map((current) => {
      const fingerprint = resolveFingerprint(current);
      const previous = previousByFingerprint.get(fingerprint);

      if (!previous) {
        return {
          fingerprint,
          isNew: true,
          current,
          previous: null,
          change: null,
          summary: "Nuevo candidato detectado.",
        };
      }

      const change = buildOpportunityChange(current, previous);

      return {
        fingerprint,
        isNew: false,
        current,
        previous,
        change,
        summary: change.summary,
      };
    });
}

function buildSignals({
  priceChange,
  scoreChange,
  confidenceChange,
  currentAction,
  previousAction,
}) {
  const signals = [];

  if (priceChange.amount < 0) {
    signals.push({
      type: "PRICE_DROP",
      importance: priceChange.percent <= -5 ? "HIGH" : "MEDIUM",
      label: `Precio baja ${Math.abs(priceChange.percent)}%.`,
    });
  }

  if (priceChange.amount > 0) {
    signals.push({
      type: "PRICE_RISE",
      importance: priceChange.percent >= 5 ? "HIGH" : "LOW",
      label: `Precio sube ${priceChange.percent}%.`,
    });
  }

  if (scoreChange >= 8) {
    signals.push({
      type: "SCORE_UP",
      importance: "HIGH",
      label: `Score mejora ${scoreChange} puntos.`,
    });
  }

  if (scoreChange <= -8) {
    signals.push({
      type: "SCORE_DOWN",
      importance: "HIGH",
      label: `Score cae ${Math.abs(scoreChange)} puntos.`,
    });
  }

  if (confidenceChange >= 8) {
    signals.push({
      type: "CONFIDENCE_UP",
      importance: "MEDIUM",
      label: `Confianza mejora ${confidenceChange} puntos.`,
    });
  }

  if (confidenceChange <= -8) {
    signals.push({
      type: "CONFIDENCE_DOWN",
      importance: "MEDIUM",
      label: `Confianza cae ${Math.abs(confidenceChange)} puntos.`,
    });
  }

  if (previousAction !== "BUY" && currentAction === "BUY") {
    signals.push({
      type: "ACTION_UPGRADE",
      importance: "HIGH",
      label: `Pasa de ${previousAction} a BUY.`,
    });
  }

  if (previousAction === "BUY" && currentAction !== "BUY") {
    signals.push({
      type: "ACTION_DOWNGRADE",
      importance: "HIGH",
      label: `Deja de ser BUY y pasa a ${currentAction}.`,
    });
  }

  if (signals.length === 0) {
    signals.push({
      type: "NO_SIGNIFICANT_CHANGE",
      importance: "LOW",
      label: "Sin cambios relevantes.",
    });
  }

  return signals;
}

function calculatePriceChange(currentPrice, previousPrice) {
  const amount = currentPrice - previousPrice;
  const percent =
    previousPrice > 0 ? Number(((amount / previousPrice) * 100).toFixed(2)) : 0;

  return {
    amount,
    percent,
  };
}

function resolveFingerprint(item = {}) {
  return (
    item.fingerprint ||
    item.market_fingerprint ||
    item.id ||
    [item.brand, item.model, item.year, item.km, item.price]
      .filter(Boolean)
      .join("-")
      .toLowerCase()
  );
}

function normalizeAction(action) {
  const normalized = String(action || "WATCH").toUpperCase();

  if (normalized === "BUY") return "BUY";
  if (normalized === "REJECT") return "REJECT";
  return "WATCH";
}

function buildSummary(signals = []) {
  const importantSignals = signals.filter((signal) => signal.importance === "HIGH");

  if (importantSignals.length > 0) {
    return importantSignals.map((signal) => signal.label).join(" ");
  }

  return signals[0]?.label || "Sin cambios relevantes.";
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}