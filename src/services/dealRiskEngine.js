const RISK_RULES = [
  {
    id: "too-cheap",
    label: "Precio demasiado bajo",
    severity: "Alta",
    weight: 24,
    check: ({ item }) => item.comparable?.deviationPercent <= -18,
    reason:
      "El anuncio está muy por debajo del precio justo estimado. Puede ser oportunidad, pero también puede esconder daños, fraude, historial incompleto o costes ocultos.",
  },
  {
    id: "low-confidence",
    label: "Confianza insuficiente",
    severity: "Alta",
    weight: 22,
    check: ({ item }) => item.comparable?.confidence < 55,
    reason:
      "La IA tiene poca confianza en los comparables. No conviene comprar agresivamente sin validar datos reales.",
  },
  {
    id: "high-ticket",
    label: "Ticket alto",
    severity: "Media",
    weight: 16,
    check: ({ item }) => item.price >= 70000,
    reason:
      "El capital inmovilizado es alto. Exige comprador claro, margen superior y control fino del riesgo.",
  },
  {
    id: "slow-resale",
    label: "Venta lenta estimada",
    severity: "Media",
    weight: 18,
    check: ({ item }) => item.memory?.resaleSpeed?.days >= 75,
    reason:
      "La salida puede tardar demasiado. El margen teórico pierde valor si el coche tarda mucho en venderse.",
  },
  {
    id: "high-risk-memory",
    label: "Riesgo de mercado alto",
    severity: "Alta",
    weight: 22,
    check: ({ item }) =>
      String(item.memory?.riskLevel || "").toLowerCase().includes("alto"),
    reason:
      "La memoria de mercado clasifica este vehículo como riesgo alto por liquidez, ticket, nicho o rotación.",
  },
  {
    id: "low-demand",
    label: "Demanda baja o selectiva",
    severity: "Media",
    weight: 14,
    check: ({ item }) =>
      ["baja", "selectiva"].some((word) =>
        String(item.memory?.demandLevel || "").toLowerCase().includes(word)
      ),
    reason:
      "La demanda no parece amplia. Puede necesitar más tiempo, descuento o comprador muy específico.",
  },
  {
    id: "negative-profit",
    label: "Margen neto negativo",
    severity: "Crítica",
    weight: 35,
    check: ({ item }) => item.netProfit <= 0,
    reason:
      "Después de costes estimados, el margen neto no compensa. No debería priorizarse salvo uso personal muy claro.",
  },
  {
    id: "weak-roi",
    label: "ROI neto débil",
    severity: "Media",
    weight: 15,
    check: ({ item }) => item.netRoi < 6,
    reason:
      "El retorno neto es demasiado bajo para el riesgo operativo de comprar, importar, preparar y revender.",
  },
];

export function analyzeDealRisk(item = {}) {
  const triggeredRules = RISK_RULES.filter((rule) => {
    try {
      return rule.check({ item });
    } catch {
      return false;
    }
  });

  const riskScore = clamp(
    triggeredRules.reduce((total, rule) => total + rule.weight, 0),
    0,
    100
  );

  const level = getRiskLevel(riskScore, triggeredRules);
  const recommendation = buildRiskRecommendation(level, triggeredRules);

  return {
    riskScore,
    level,
    recommendation,
    alerts: triggeredRules.map(({ id, label, severity, reason }) => ({
      id,
      label,
      severity,
      reason,
    })),
  };
}

export function enrichDealsWithRisk(items = []) {
  return items.map((item) => ({
    ...item,
    dealRisk: analyzeDealRisk(item),
  }));
}

function getRiskLevel(score, rules) {
  const hasCritical = rules.some((rule) => rule.severity === "Crítica");

  if (hasCritical || score >= 70) return "Crítico";
  if (score >= 45) return "Alto";
  if (score >= 25) return "Medio";
  return "Bajo";
}

function buildRiskRecommendation(level, rules) {
  if (level === "Crítico") {
    return "No priorizar. Validar muy a fondo o descartar salvo que exista una razón estratégica clara.";
  }

  if (level === "Alto") {
    return "Contactar solo si el margen mejora, los datos son verificables y el vendedor inspira confianza.";
  }

  if (level === "Medio") {
    return "Oportunidad posible, pero requiere validación de historial, equipamiento, costes y liquidez.";
  }

  if (rules.length === 0) {
    return "Riesgo controlado según los datos disponibles. Puede entrar en lista prioritaria.";
  }

  return "Riesgo bajo con pequeñas señales a revisar antes de avanzar.";
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}