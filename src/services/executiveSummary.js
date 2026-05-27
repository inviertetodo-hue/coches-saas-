export function generateExecutiveSummary({
  market,
  trends,
  temporal,
  opportunityAlerts,
  portfolio,
  risk,
  confidence,
  learning,
}) {
  const summary = [];
  const priorities = [];
  const nextActions = [];

  if (risk?.riskLevel === "Alto") {
    summary.push(
      "🔴 El dashboard detecta riesgo elevado en el dataset actual."
    );

    priorities.push(
      "Revisar operaciones con score bajo y ROI débil."
    );
  }

  if (risk?.riskLevel === "Medio") {
    summary.push(
      "🟡 El perfil de riesgo es moderado y necesita revisión selectiva."
    );
  }

  if (risk?.riskLevel === "Bajo") {
    summary.push(
      "✅ El riesgo general parece controlado."
    );
  }

  if (
    opportunityAlerts?.criticalAlerts?.length > 0
  ) {
    summary.push(
      "🚨 Existen alertas críticas que conviene revisar primero."
    );

    priorities.push(
      "Priorizar coches con score IA alto y ROI alto."
    );
  }

  if (
    portfolio?.strategy &&
    portfolio.strategy !== "Sin datos suficientes"
  ) {
    summary.push(
      `📈 Estrategia sugerida: ${portfolio.strategy}.`
    );
  }

  if (
    confidence?.confidenceLevel === "Alta"
  ) {
    summary.push(
      "🧠 La IA muestra una confianza alta sobre el dataset."
    );
  }

  if (
    confidence?.confidenceLevel === "Baja"
  ) {
    summary.push(
      "⚠️ La confianza IA todavía es baja; faltan datos o estabilidad."
    );

    priorities.push(
      "Aumentar número de análisis guardados."
    );
  }

  if (
    learning?.learningLevel === "Avanzado"
  ) {
    summary.push(
      "🔥 El sistema ya muestra aprendizaje avanzado sobre patrones de oportunidad."
    );
  }

  if (
    trends?.hotSegments?.length > 0
  ) {
    summary.push(
      `🔥 Segmentos calientes detectados: ${trends.hotSegments.join(", ")}.`
    );
  }

  if (
    temporal?.freshnessScore >= 80
  ) {
    summary.push(
      "🕒 El dataset tiene buena frescura temporal."
    );
  }

  if (
    temporal?.freshnessScore < 50
  ) {
    summary.push(
      "📉 La frescura temporal es baja; conviene analizar oportunidades recientes."
    );

    priorities.push(
      "Guardar análisis nuevos para mejorar lectura de mercado."
    );
  }

  if (
    market?.bestConfiguration
  ) {
    summary.push(
      `🎯 Configuración dominante: ${market.bestConfiguration}.`
    );
  }

  if (summary.length === 0) {
    summary.push(
      "📊 Todavía no hay datos suficientes para una lectura ejecutiva fuerte."
    );
  }

  if (priorities.length === 0) {
    priorities.push(
      "Seguir ampliando el dataset con análisis de calidad."
    );
  }

  nextActions.push(
    "Analizar más vehículos premium comparables."
  );

  nextActions.push(
    "Priorizar oportunidades con ROI alto, score alto y riesgo bajo."
  );

  nextActions.push(
    "Evitar escalar operaciones si la confianza IA baja."
  );

  return {
    summary,
    priorities,
    nextActions,
  };
}