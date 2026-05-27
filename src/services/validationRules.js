export function validateAnalysisRecord(item = {}) {
  const warnings = [];
  const errors = [];

  const score = Number(item.score || 0);
  const roi = Number(item.roi || 0);
  const profit = Number(item.profit || 0);
  const price = Number(item.price || 0);
  const kilometers = Number(item.kilometers || 0);
  const year = Number(item.year || 0);

  if (!item.title && !item.brand && !item.model) {
    warnings.push("Falta información básica del vehículo.");
  }

  if (score < 0 || score > 100) {
    errors.push("Score IA fuera de rango.");
  }

  if (!Number.isFinite(roi)) {
    errors.push("ROI no válido.");
  }

  if (!Number.isFinite(profit)) {
    errors.push("Beneficio no válido.");
  }

  if (price < 0) {
    errors.push("Precio negativo no válido.");
  }

  if (kilometers < 0) {
    errors.push("Kilómetros negativos no válidos.");
  }

  if (year > 0 && (year < 1980 || year > new Date().getFullYear() + 1)) {
    warnings.push("Año del vehículo poco probable.");
  }

  if (score >= 85 && roi < 5) {
    warnings.push("Score alto con ROI bajo: revisar coherencia.");
  }

  if (roi >= 25 && profit <= 0) {
    warnings.push("ROI alto pero beneficio nulo o negativo.");
  }

  if (profit > 15000 && roi < 5) {
    warnings.push("Beneficio alto con ROI bajo: revisar cálculo.");
  }

  return {
    isValid: errors.length === 0,
    hasWarnings: warnings.length > 0,
    errors,
    warnings,
  };
}

export function validateAnalysesDataset(analyses = []) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    return {
      isHealthy: false,
      qualityScore: 0,
      total: 0,
      validCount: 0,
      warningCount: 0,
      errorCount: 0,
      insights: ["No hay análisis suficientes para validar el dataset."],
    };
  }

  const results = analyses.map(validateAnalysisRecord);

  const total = analyses.length;
  const validCount = results.filter((item) => item.isValid).length;
  const warningCount = results.filter((item) => item.hasWarnings).length;
  const errorCount = results.filter((item) => !item.isValid).length;

  const qualityScore = Math.max(
    0,
    Math.round(
      100 -
        errorCount * 18 -
        warningCount * 6
    )
  );

  const insights = [];

  insights.push(`Dataset validado: ${validCount}/${total} registros válidos.`);

  if (warningCount > 0) {
    insights.push(`${warningCount} registro(s) tienen avisos de coherencia.`);
  }

  if (errorCount > 0) {
    insights.push(`${errorCount} registro(s) tienen errores críticos.`);
  }

  if (qualityScore >= 85) {
    insights.push("La calidad del dataset parece alta.");
  } else if (qualityScore >= 60) {
    insights.push("La calidad del dataset es aceptable, pero mejorable.");
  } else {
    insights.push("La calidad del dataset necesita revisión antes de escalar.");
  }

  return {
    isHealthy: qualityScore >= 70 && errorCount === 0,
    qualityScore,
    total,
    validCount,
    warningCount,
    errorCount,
    insights,
  };
}