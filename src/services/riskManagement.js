export function analyzeRiskManagement(analyses = []) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    return {
      riskScore: 0,
      riskLevel: "Sin datos",
      riskAlerts: [],
      riskInsights: [],
    };
  }

  const riskAlerts = [];
  const riskInsights = [];

  const lowScoreCars = analyses.filter(
    (item) => Number(item.score || 0) < 60
  );

  const lowROICars = analyses.filter(
    (item) => Number(item.roi || 0) < 10
  );

  const negativeProfitCars = analyses.filter(
    (item) => Number(item.profit || 0) <= 0
  );

  const weakDataset = analyses.length < 5;

  let riskScore =
    30 +
    lowScoreCars.length * 10 +
    lowROICars.length * 8 +
    negativeProfitCars.length * 12;

  if (weakDataset) {
    riskScore += 15;
  }

  riskScore = clampScore(riskScore);

  let riskLevel = "Bajo";

  if (riskScore >= 70) {
    riskLevel = "Alto";
  } else if (riskScore >= 45) {
    riskLevel = "Medio";
  }

  if (lowScoreCars.length > 0) {
    riskAlerts.push(
      `⚠️ ${lowScoreCars.length} análisis con score IA débil.`
    );
  }

  if (lowROICars.length > 0) {
    riskAlerts.push(
      `📉 ${lowROICars.length} operación(es) con ROI bajo.`
    );
  }

  if (negativeProfitCars.length > 0) {
    riskAlerts.push(
      `🚨 ${negativeProfitCars.length} operación(es) sin beneficio positivo.`
    );
  }

  if (weakDataset) {
    riskAlerts.push(
      "📊 Dataset todavía pequeño: riesgo estadístico alto."
    );
  }

  if (riskLevel === "Bajo") {
    riskInsights.push(
      "✅ El perfil de riesgo general del dataset parece controlado."
    );
  }

  if (riskLevel === "Medio") {
    riskInsights.push(
      "🟡 Hay señales mixtas; conviene revisar operaciones antes de escalar."
    );
  }

  if (riskLevel === "Alto") {
    riskInsights.push(
      "🔴 Riesgo elevado: conviene endurecer filtros de selección."
    );
  }

  return {
    riskScore,
    riskLevel,
    riskAlerts,
    riskInsights,
  };
}

function clampScore(value) {
  if (value > 100) return 100;
  if (value < 0) return 0;
  return Math.round(value);
}