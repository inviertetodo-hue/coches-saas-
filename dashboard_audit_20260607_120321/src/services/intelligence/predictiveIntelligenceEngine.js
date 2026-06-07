import { buildOpportunityPredictor } from "./opportunityPredictorEngine";

export function buildPredictiveIntelligence({
  opportunities = [],
  historicalModelMemory = [],
} = {}) {
  if (!Array.isArray(opportunities) || opportunities.length === 0) {
    return createEmptyPredictiveIntelligence();
  }

  const predictedOpportunities = opportunities
    .map((item) => {
      const prediction = buildOpportunityPredictor({
        vehicle: item,
        historicalModelMemory,
      });

      return {
        ...item,
        opportunityPrediction: prediction,
        predictiveScore: prediction.active
          ? prediction.successProbability
          : safeNumber(item.executiveScore || item.priorityScore || item.score),
      };
    })
    .sort((a, b) => {
      return safeNumber(b.predictiveScore) - safeNumber(a.predictiveScore);
    });

  const strongestPrediction = predictedOpportunities[0] || null;

  return {
    active: predictedOpportunities.some(
      (item) => item.opportunityPrediction?.active
    ),
    totalPredictions: predictedOpportunities.length,
    predictedOpportunities,
    strongestPrediction,
    averageSuccessProbability:
      calculateAverageSuccessProbability(predictedOpportunities),
    predictionInsights: buildPredictionInsights(predictedOpportunities),
  };
}

function createEmptyPredictiveIntelligence() {
  return {
    active: false,
    totalPredictions: 0,
    predictedOpportunities: [],
    strongestPrediction: null,
    averageSuccessProbability: 0,
    predictionInsights: [
      "Sin oportunidades suficientes para generar predicción histórica.",
    ],
  };
}

function calculateAverageSuccessProbability(items = []) {
  const valid = items
    .map((item) => safeNumber(item.opportunityPrediction?.successProbability))
    .filter((value) => value > 0);

  if (!valid.length) return 0;

  return Math.round(
    valid.reduce((total, value) => total + value, 0) / valid.length
  );
}

function buildPredictionInsights(items = []) {
  if (!items.length) {
    return ["Sin oportunidades suficientes para predicción."];
  }

  const activePredictions = items.filter(
    (item) => item.opportunityPrediction?.active
  );

  if (!activePredictions.length) {
    return [
      "Todavía no hay coincidencias suficientes entre oportunidades e histórico por modelo.",
    ];
  }

  const best = activePredictions[0];
  const prediction = best.opportunityPrediction;

  const insights = [
    `🔮 Predicción generada sobre ${activePredictions.length} oportunidades con histórico útil.`,
    `🥇 Mejor predicción: ${best.title || prediction.model} con probabilidad de éxito ${prediction.successProbability}/100.`,
    `📈 ROI esperado del modelo: ${prediction.expectedROI}%.`,
    `💰 Beneficio esperado del modelo: ${prediction.expectedProfit} €.`,
    `💧 Liquidez esperada: ${prediction.expectedLiquidity}.`,
    `🛡️ Riesgo esperado: ${prediction.expectedRisk}.`,
  ];

  if (prediction.confidenceScore >= 70) {
    insights.push(
      `✅ Confianza histórica ${prediction.confidence.toLowerCase()} basada en ${prediction.analyses} análisis.`
    );
  } else {
    insights.push(
      "🟡 Confianza histórica todavía inicial: conviene acumular más operaciones guardadas."
    );
  }

  return insights;
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}