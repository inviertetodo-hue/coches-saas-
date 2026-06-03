export function buildOpportunityChange(current = {}, previous = {}) {
  const currentPrice = toNumber(current.price ?? current.purchasePrice);
  const previousPrice = toNumber(previous.price ?? previous.purchasePrice);

  const currentAction = normalizeAction(current.decision?.action || current.action);
  const previousAction = normalizeAction(previous.decision?.action || previous.action);

  const currentScore = resolveScore(current);
  const previousScore = resolveScore(previous);

  const currentConfidence = resolveConfidence(current);
  const previousConfidence = resolveConfidence(previous);

  const currentROI = resolveROI(current);
  const previousROI = resolveROI(previous);

  const currentProfit = resolveProfit(current);
  const previousProfit = resolveProfit(previous);

  const currentSellSpeed = resolveSellSpeed(current);
  const previousSellSpeed = resolveSellSpeed(previous);

  const priceChange = calculatePriceChange(currentPrice, previousPrice);
  const scoreChange = currentScore - previousScore;
  const confidenceChange = currentConfidence - previousConfidence;
  const roiChange = currentROI - previousROI;
  const profitChange = currentProfit - previousProfit;
  const sellSpeedChange = currentSellSpeed - previousSellSpeed;

  const signals = buildSignals({
    priceChange,
    scoreChange,
    confidenceChange,
    roiChange,
    profitChange,
    sellSpeedChange,
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

    currentROI,
    previousROI,
    roiChange,

    currentProfit,
    previousProfit,
    profitChange,

    currentSellSpeed,
    previousSellSpeed,
    sellSpeedChange,

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
  roiChange,
  profitChange,
  sellSpeedChange,
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
      label: `Score mejora ${formatNumber(scoreChange)} puntos.`,
    });
  }

  if (scoreChange <= -8) {
    signals.push({
      type: "SCORE_DOWN",
      importance: "HIGH",
      label: `Score cae ${formatNumber(Math.abs(scoreChange))} puntos.`,
    });
  }

  if (confidenceChange >= 8) {
    signals.push({
      type: "CONFIDENCE_UP",
      importance: "MEDIUM",
      label: `Confianza mejora ${formatNumber(confidenceChange)} puntos.`,
    });
  }

  if (confidenceChange <= -8) {
    signals.push({
      type: "CONFIDENCE_DOWN",
      importance: "MEDIUM",
      label: `Confianza cae ${formatNumber(Math.abs(confidenceChange))} puntos.`,
    });
  }

  if (roiChange >= 5) {
    signals.push({
      type: "ROI_UP",
      importance: roiChange >= 10 ? "HIGH" : "MEDIUM",
      label: `ROI mejora ${formatNumber(roiChange)} puntos.`,
    });
  }

  if (roiChange <= -5) {
    signals.push({
      type: "ROI_DOWN",
      importance: roiChange <= -10 ? "HIGH" : "MEDIUM",
      label: `ROI cae ${formatNumber(Math.abs(roiChange))} puntos.`,
    });
  }

  if (profitChange >= 1000) {
    signals.push({
      type: "PROFIT_UP",
      importance: profitChange >= 2500 ? "HIGH" : "MEDIUM",
      label: `Beneficio estimado mejora ${formatCurrency(profitChange)}.`,
    });
  }

  if (profitChange <= -1000) {
    signals.push({
      type: "PROFIT_DOWN",
      importance: profitChange <= -2500 ? "HIGH" : "MEDIUM",
      label: `Beneficio estimado cae ${formatCurrency(Math.abs(profitChange))}.`,
    });
  }

  if (sellSpeedChange >= 10) {
    signals.push({
      type: "SELL_SPEED_UP",
      importance: sellSpeedChange >= 20 ? "HIGH" : "MEDIUM",
      label: `Rotación mejora ${formatNumber(sellSpeedChange)} puntos.`,
    });
  }

  if (sellSpeedChange <= -10) {
    signals.push({
      type: "SELL_SPEED_DOWN",
      importance: sellSpeedChange <= -20 ? "HIGH" : "MEDIUM",
      label: `Rotación empeora ${formatNumber(Math.abs(sellSpeedChange))} puntos.`,
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

function resolveScore(item = {}) {
  return toNumber(
    item.decision?.decisionScore ??
      item.opportunity?.scoreV2 ??
      item.opportunity?.opportunityScoreV2 ??
      item.score
  );
}

function resolveConfidence(item = {}) {
  return toNumber(
    item.decision?.confidence?.score ??
      item.vehicleValuation?.confidence ??
      item.confidence
  );
}

function resolveROI(item = {}) {
  return toNumber(item.valuation?.roi ?? item.roi ?? item.expectedROI);
}

function resolveProfit(item = {}) {
  return toNumber(item.valuation?.profit ?? item.profit ?? item.expectedProfit);
}

function resolveSellSpeed(item = {}) {
  return toNumber(item.sellSpeed?.sellSpeedScore ?? item.sellSpeedScore);
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

function formatCurrency(value) {
  return `${Math.round(toNumber(value)).toLocaleString("es-ES")} €`;
}

function formatNumber(value) {
  return toNumber(value).toLocaleString("es-ES", {
    maximumFractionDigits: 2,
  });
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}