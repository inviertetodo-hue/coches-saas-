export function evaluateAnalysisHealth(
  validation = {}
) {
  const qualityScore = safeNumber(
    validation.qualityScore
  );

  const errorCount = safeNumber(
    validation.errorCount
  );

  const warningCount = safeNumber(
    validation.warningCount
  );

  const total = safeNumber(
    validation.total
  );

  const validCount = safeNumber(
    validation.validCount
  );

  let status = "critical";

  let canShowAdvanced = false;

  let color = "#ef4444";

  let label = "Sistema crítico";

  const insights = [];

  if (total === 0) {
    insights.push(
      "Todavía no hay análisis suficientes."
    );

    return {
      status,
      label,
      color,
      canShowAdvanced: false,
      qualityScore: 0,
      insights,
    };
  }

  if (
    qualityScore >= 85 &&
    errorCount === 0
  ) {
    status = "healthy";

    canShowAdvanced = true;

    color = "#22c55e";

    label = "Sistema estable";

    insights.push(
      "La calidad general del sistema es alta."
    );
  } else if (
    qualityScore >= 70 &&
    errorCount <= 1
  ) {
    status = "warning";

    canShowAdvanced = true;

    color = "#facc15";

    label = "Sistema estable con avisos";

    insights.push(
      "El sistema tiene avisos menores pero sigue siendo usable."
    );
  } else {
    status = "critical";

    canShowAdvanced = false;

    color = "#ef4444";

    label = "Sistema inestable";

    insights.push(
      "La calidad del dataset es insuficiente para IA avanzada."
    );
  }

  if (warningCount > 0) {
    insights.push(
      `${warningCount} análisis contienen incoherencias.`
    );
  }

  if (errorCount > 0) {
    insights.push(
      `${errorCount} análisis fueron bloqueados por seguridad.`
    );
  }

  insights.push(
    `${validCount}/${total} análisis válidos actualmente.`
  );

  return {
    status,
    label,
    color,
    canShowAdvanced,
    qualityScore,
    insights,
  };
}

function safeNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}