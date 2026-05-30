import { findModelKnowledge } from "./marketKnowledgeBase";

const RISK_RULES = [
  {
    id: "too-cheap",
    label: "Precio demasiado bajo",
    severity: "Alta",
    weight: 24,
    check: ({ item }) => item.comparable?.deviationPercent <= -18,
    reason:
      "El anuncio está muy por debajo del precio justo estimado. Puede esconder daños, fraude o costes ocultos.",
  },
  {
    id: "low-confidence",
    label: "Confianza insuficiente",
    severity: "Alta",
    weight: 22,
    check: ({ item }) => item.comparable?.confidence < 55,
    reason:
      "La IA tiene poca confianza en los comparables detectados.",
  },
  {
    id: "high-ticket",
    label: "Ticket alto",
    severity: "Media",
    weight: 16,
    check: ({ item }) => item.price >= 70000,
    reason:
      "Capital inmovilizado elevado.",
  },
  {
    id: "slow-resale",
    label: "Venta lenta estimada",
    severity: "Media",
    weight: 18,
    check: ({ item }) => item.memory?.resaleSpeed?.days >= 75,
    reason:
      "La salida puede tardar demasiado.",
  },
  {
    id: "high-risk-memory",
    label: "Riesgo de mercado alto",
    severity: "Alta",
    weight: 22,
    check: ({ item }) =>
      String(item.memory?.riskLevel || "")
        .toLowerCase()
        .includes("alto"),
    reason:
      "La memoria de mercado clasifica el vehículo como riesgo alto.",
  },
  {
    id: "low-demand",
    label: "Demanda baja",
    severity: "Media",
    weight: 14,
    check: ({ item }) =>
      ["baja", "selectiva"].some((word) =>
        String(item.memory?.demandLevel || "")
          .toLowerCase()
          .includes(word)
      ),
    reason:
      "Demanda limitada.",
  },
  {
    id: "negative-profit",
    label: "Margen neto negativo",
    severity: "Crítica",
    weight: 35,
    check: ({ item }) => item.netProfit <= 0,
    reason:
      "El margen neto no compensa.",
  },
  {
    id: "weak-roi",
    label: "ROI débil",
    severity: "Media",
    weight: 15,
    check: ({ item }) => item.netRoi < 6,
    reason:
      "Retorno insuficiente para el riesgo asumido.",
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

  let riskScore = triggeredRules.reduce(
    (total, rule) => total + rule.weight,
    0
  );

  const modelRisk = getModelRisk(item);

  if (modelRisk) {
    riskScore += modelRisk.riskWeight || 0;

    triggeredRules.push({
      id: "model-risk",
      label: `Riesgo específico ${modelRisk.model}`,
      severity: modelRisk.riskWeight > 0 ? "Alta" : "Baja",
      reason: buildModelRiskReason(modelRisk),
    });
  }

  riskScore = clamp(riskScore, 0, 100);

  const level = getRiskLevel(riskScore, triggeredRules);
  const recommendation = buildRiskRecommendation(level, triggeredRules);

  return {
    riskScore,
    level,
    recommendation,

    modelRisk: modelRisk
      ? {
          active: true,
          model: modelRisk.model,
          batteryRisk: modelRisk.batteryRisk,
          gearboxRisk: modelRisk.gearboxRisk,
          demandRisk: modelRisk.demandRisk,
          riskWeight: modelRisk.riskWeight,
        }
      : {
          active: false,
        },

    alerts: triggeredRules.map(
      ({ id, label, severity, reason }) => ({
        id,
        label,
        severity,
        reason,
      })
    ),
  };
}

export function enrichDealsWithRisk(items = []) {
  return items.map((item) => ({
    ...item,
    dealRisk: analyzeDealRisk(item),
  }));
}

function getModelRisk(item) {
  const searchText = [
    item.title,
    item.brand,
    item.model,
    item.engine,
  ].join(" ");

  const knowledge = findModelKnowledge(searchText);

  if (!knowledge.risk) return null;

  return {
    model: knowledge.model,
    ...knowledge.risk,
  };
}

function buildModelRiskReason(modelRisk) {
  return `Riesgo batería ${modelRisk.batteryRisk}, caja ${modelRisk.gearboxRisk}, demanda ${modelRisk.demandRisk}.`;
}

function getRiskLevel(score, rules) {
  const hasCritical = rules.some(
    (rule) => rule.severity === "Crítica"
  );

  if (hasCritical || score >= 70) return "Crítico";
  if (score >= 45) return "Alto";
  if (score >= 25) return "Medio";

  return "Bajo";
}

function buildRiskRecommendation(level, rules) {
  if (level === "Crítico") {
    return "No priorizar. Validar muy a fondo o descartar.";
  }

  if (level === "Alto") {
    return "Contactar solo si el margen mejora.";
  }

  if (level === "Medio") {
    return "Requiere validación adicional.";
  }

  if (rules.length === 0) {
    return "Riesgo controlado.";
  }

  return "Riesgo bajo.";
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}