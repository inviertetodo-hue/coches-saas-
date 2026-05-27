export function analyzeOpportunityAlerts(analyses = []) {
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

  const highScore = analyses.filter(
    (item) => Number(item.score || 0) >= 90
  );

  const highROI = analyses.filter(
    (item) => Number(item.roi || 0) >= 30
  );

  const highProfit = analyses.filter(
    (item) => Number(item.profit || 0) >= 10000
  );

  const riskyLowScore = analyses.filter(
    (item) => Number(item.score || 0) <= 45
  );

  let alertScore =
    50 +
    highScore.length * 8 +
    highROI.length * 7 +
    highProfit.length * 6 -
    riskyLowScore.length * 5;

  alertScore = clampScore(alertScore);

  if (highScore.length > 0) {
    opportunityAlerts.push(
      `🔥 ${highScore.length} oportunidad(es) con score IA extremo.`
    );
  }

  if (highROI.length > 0) {
    opportunityAlerts.push(
      `💰 ${highROI.length} operación(es) con ROI superior al 30%.`
    );
  }

  if (highProfit.length > 0) {
    opportunityAlerts.push(
      `🚀 ${highProfit.length} coche(s) con beneficio estimado superior a 10.000 €.`
    );
  }

  if (riskyLowScore.length > 0) {
    warningAlerts.push(
      `⚠️ ${riskyLowScore.length} análisis con riesgo elevado detectado.`
    );
  }

  if (highScore.length > 0 && highROI.length > 0) {
    criticalAlerts.push(
      "🏆 Hay coincidencia entre score IA alto y ROI alto: revisar primero."
    );
  }

  if (opportunityAlerts.length === 0) {
    warningAlerts.push(
      "📊 Todavía no hay alertas fuertes; conviene aumentar el dataset."
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