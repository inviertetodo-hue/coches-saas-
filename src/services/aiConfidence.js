export function analyzeAIConfidence(analyses = []) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    return {
      confidenceScore: 0,
      confidenceLevel: "Sin datos",
      confidenceInsights: [],
      unstableSignals: [],
    };
  }

  const confidenceInsights = [];
  const unstableSignals = [];

  const total = analyses.length;

  const averageScore =
    analyses.reduce((acc, item) => acc + Number(item.score || 0), 0) / total;

  const highScoreCars = analyses.filter(
    (item) => Number(item.score || 0) >= 85
  );

  const lowScoreCars = analyses.filter(
    (item) => Number(item.score || 0) <= 45
  );

  const roiVariance =
    Math.max(...analyses.map((item) => Number(item.roi || 0))) -
    Math.min(...analyses.map((item) => Number(item.roi || 0)));

  let confidenceScore =
    50 +
    highScoreCars.length * 5 -
    lowScoreCars.length * 4;

  if (roiVariance <= 15) {
    confidenceScore += 15;
  }

  if (total >= 10) {
    confidenceScore += 10;
  }

  confidenceScore = clampScore(confidenceScore);

  let confidenceLevel = "Media";

  if (confidenceScore >= 80) {
    confidenceLevel = "Alta";
  }

  if (confidenceScore <= 45) {
    confidenceLevel = "Baja";
  }

  if (confidenceLevel === "Alta") {
    confidenceInsights.push(
      "✅ La IA muestra estabilidad consistente en los análisis."
    );
  }

  if (confidenceLevel === "Media") {
    confidenceInsights.push(
      "🟡 La IA necesita más datos para mejorar precisión estratégica."
    );
  }

  if (confidenceLevel === "Baja") {
    confidenceInsights.push(
      "🔴 Señales débiles: conviene aumentar dataset y calidad de inputs."
    );
  }

  if (roiVariance > 40) {
    unstableSignals.push(
      "⚠️ Alta variabilidad de ROI detectada."
    );
  }

  if (lowScoreCars.length > highScoreCars.length) {
    unstableSignals.push(
      "📉 Hay más operaciones débiles que fuertes."
    );
  }

  if (total < 5) {
    unstableSignals.push(
      "📊 Dataset demasiado pequeño para alta confianza."
    );
  }

  return {
    confidenceScore,
    confidenceLevel,
    confidenceInsights,
    unstableSignals,
  };
}

function clampScore(value) {
  if (value > 100) return 100;
  if (value < 0) return 0;
  return Math.round(value);
}