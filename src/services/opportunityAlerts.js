export function analyzeOpportunityAlerts(
  analyses = [],
  changes = []
) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    return {
      alertScore: 0,
      criticalAlerts: [],
      opportunityAlerts: [],
      warningAlerts: [],
    };
  }

  const criticalAlerts = [];
  const opportunityAlerts = [];
  const warningAlerts = [];

  const buyItems = analyses.filter(
    (item) =>
      (item.decision?.action || item.action) === "BUY"
  );

  const highDecisionScore = analyses.filter(
    (item) =>
      Number(
        item.decision?.decisionScore ||
          item.decisionScore ||
          0
      ) >= 85
  );

  const highConfidence = analyses.filter(
    (item) =>
      Number(
        item.decision?.confidence?.score ||
          item.vehicleValuation?.confidence ||
          item.confidence ||
          0
      ) >= 80
  );

  const actionUpgrades = changes.filter(
    (item) =>
      item?.change?.signals?.some(
        (signal) => signal.type === "ACTION_UPGRADE"
      )
  );

  const priceDrops = changes.filter(
    (item) =>
      item?.change?.signals?.some(
        (signal) => signal.type === "PRICE_DROP"
      )
  );

  const confidenceDrops = changes.filter(
    (item) =>
      item?.change?.signals?.some(
        (signal) => signal.type === "CONFIDENCE_DOWN"
      )
  );

  let alertScore =
    40 +
    buyItems.length * 8 +
    highDecisionScore.length * 6 +
    highConfidence.length * 4 +
    actionUpgrades.length * 10 +
    priceDrops.length * 6 -
    confidenceDrops.length * 4;

  alertScore = clampScore(alertScore);

  if (buyItems.length > 0) {
    opportunityAlerts.push(
      `🚀 ${buyItems.length} oportunidad(es) BUY activas.`
    );
  }

  if (highDecisionScore.length > 0) {
    opportunityAlerts.push(
      `🏆 ${highDecisionScore.length} oportunidad(es) con Decision Score alto.`
    );
  }

  if (actionUpgrades.length > 0) {
    criticalAlerts.push(
      `🔥 ${actionUpgrades.length} oportunidad(es) han pasado de WATCH a BUY.`
    );
  }

  if (priceDrops.length > 0) {
    criticalAlerts.push(
      `📉 ${priceDrops.length} oportunidad(es) han bajado de precio.`
    );
  }

  if (confidenceDrops.length > 0) {
    warningAlerts.push(
      `⚠️ ${confidenceDrops.length} oportunidad(es) pierden confianza.`
    );
  }

  if (
    criticalAlerts.length === 0 &&
    opportunityAlerts.length === 0
  ) {
    warningAlerts.push(
      "📊 Todavía no existen alertas relevantes."
    );
  }

  return {
    alertScore,
    criticalAlerts,
    opportunityAlerts,
    warningAlerts,
  };
}

function clampScore(value) {
  if (value > 100) return 100;
  if (value < 0) return 0;
  return Math.round(value);
}