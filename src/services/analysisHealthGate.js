export function evaluateAnalysisHealth(validation = {}) {
  const qualityScore = Number(validation.qualityScore || 0);
  const errorCount = Number(validation.errorCount || 0);
  const warningCount = Number(validation.warningCount || 0);
  const total = Number(validation.total || 0);

  let status = "Sin datos";
  let canTrustAI = false;
  let canShowAdvanced = false;
  const messages = [];

  if (total === 0) {
    messages.push("No hay datos suficientes para evaluar la salud del sistema.");

    return {
      status,
      canTrustAI,
      canShowAdvanced,
      messages,
    };
  }

  if (errorCount > 0) {
    status = "Crítico";

    messages.push(
      "Hay errores críticos en el dataset. Revisar antes de confiar en la IA."
    );
  } else if (qualityScore >= 85) {
    status = "Saludable";
    canTrustAI = true;
    canShowAdvanced = true;

    messages.push(
      "El dataset tiene buena calidad y puede usarse con confianza."
    );
  } else if (qualityScore >= 70) {
    status = "Aceptable";
    canTrustAI = true;
    canShowAdvanced = true;

    messages.push(
      "El dataset es utilizable, aunque existen avisos menores."
    );
  } else if (qualityScore >= 50) {
    status = "Débil";
    canTrustAI = false;
    canShowAdvanced = true;

    messages.push(
      "La IA puede mostrar señales, pero conviene revisar coherencia."
    );
  } else {
    status = "No fiable";
    canTrustAI = false;
    canShowAdvanced = false;

    messages.push(
      "La calidad del dataset es baja. No conviene tomar decisiones todavía."
    );
  }

  if (warningCount > 0) {
    messages.push(
      `${warningCount} aviso(s) de coherencia detectados.`
    );
  }

  return {
    status,
    canTrustAI,
    canShowAdvanced,
    messages,
  };
}