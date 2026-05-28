export function validateAnalysisRecord(item = {}) {
  const warnings = [];
  const errors = [];

  const score = safeNumber(item.score);
  const roi = safeNumber(item.roi);
  const profit = safeNumber(item.profit);
  const price = safeNumber(item.price);
  const kilometers = safeNumber(item.kilometers || item.km);
  const year = safeNumber(item.year);

  const currentYear = new Date().getFullYear();

  if (!item.title && !item.brand && !item.model) {
    warnings.push("Falta información básica del vehículo.");
  }

  if (!Number.isFinite(score)) {
    errors.push("Score IA inválido.");
  }

  if (!Number.isFinite(roi)) {
    errors.push("ROI inválido.");
  }

  if (!Number.isFinite(profit)) {
    errors.push("Beneficio inválido.");
  }

  if (score < 0 || score > 100) {
    errors.push("Score IA fuera de rango.");
  }

  if (price < 0) {
    errors.push("Precio negativo no válido.");
  }

  if (kilometers < 0) {
    errors.push("Kilómetros negativos no válidos.");
  }

  if (
    year > 0 &&
    (year < 1980 || year > currentYear + 1)
  ) {
    warnings.push("Año del vehículo poco probable.");
  }

  if (price > 300000) {
    warnings.push("Precio extremadamente alto.");
  }

  if (price > 0 && price < 1000) {
    warnings.push("Precio sospechosamente bajo.");
  }

  if (kilometers > 350000) {
    warnings.push("Kilometraje extremadamente alto.");
  }

  if (score >= 85 && roi < 15) {
    warnings.push(
      "Score muy alto con ROI insuficiente."
    );
  }

  if (score >= 85 && profit <= 0) {
    errors.push(
      "Score extremo con beneficio negativo."
    );
  }

  if (roi >= 25 && profit <= 0) {
    errors.push(
      "ROI alto con beneficio negativo."
    );
  }

  if (profit > 15000 && roi < 5) {
    warnings.push(
      "Beneficio alto con ROI demasiado bajo."
    );
  }

  if (roi <= 0 && score > 55) {
    warnings.push(
      "ROI negativo con score demasiado optimista."
    );
  }

  if (kilometers >= 220000 && score > 65) {
    warnings.push(
      "Score alto para kilometraje extremo."
    );
  }

  if (
    score <= 20 &&
    roi >= 25 &&
    profit > 5000
  ) {
    warnings.push(
      "Vehículo potencialmente infravalorado por score."
    );
  }

  return {
    isValid: errors.length === 0,
    hasWarnings: warnings.length > 0,
    errors,
    warnings,
  };
}

export function validateAnalysesDataset(
  analyses = []
) {
  if (
    !Array.isArray(analyses) ||
    analyses.length === 0
  ) {
    return {
      isHealthy: false,
      qualityScore: 0,
      total: 0,
      validCount: 0,
      warningCount: 0,
      errorCount: 0,
      insights: [
        "No hay análisis suficientes para validar el dataset.",
      ],
    };
  }

  const results = analyses.map(
    validateAnalysisRecord
  );

  const total = analyses.length;

  const validCount = results.filter(
    (item) => item.isValid
  ).length;

  const warningCount = results.filter(
    (item) => item.hasWarnings
  ).length;

  const errorCount = results.filter(
    (item) => !item.isValid
  ).length;

  const qualityScore = Math.max(
    0,
    Math.round(
      100 -
        errorCount * 20 -
        warningCount * 5
    )
  );

  const insights = [];

  insights.push(
    `Dataset validado: ${validCount}/${total} registros válidos.`
  );

  if (warningCount > 0) {
    insights.push(
      `${warningCount} registro(s) tienen avisos de coherencia.`
    );
  }

  if (errorCount > 0) {
    insights.push(
      `${errorCount} registro(s) tienen errores críticos.`
    );
  }

  if (qualityScore >= 85) {
    insights.push(
      "La calidad del dataset parece alta."
    );
  } else if (qualityScore >= 60) {
    insights.push(
      "La calidad del dataset es aceptable, pero mejorable."
    );
  } else {
    insights.push(
      "La calidad del dataset necesita revisión antes de escalar."
    );
  }

  return {
    isHealthy:
      qualityScore >= 70 &&
      errorCount === 0,

    qualityScore,

    total,

    validCount,

    warningCount,

    errorCount,

    insights,
  };
}

function safeNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}