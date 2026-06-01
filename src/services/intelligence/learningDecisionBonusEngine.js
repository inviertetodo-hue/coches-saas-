export function applyLearningDecisionBonus(item = {}, learning = {}) {
  const baseScore = Number(item.score || item.executiveScore || item.decisionScore || 0);
  const learningBonus = Number(
    learning.learningBonus ??
      learning.confidenceBonus ??
      item.learningBonus ??
      item.historicalConfidenceBonus ??
      0
  );

  const adjustedScore = clampScore(baseScore + learningBonus);

  return {
    ...item,
    learningBonus,
    adjustedScore,
    learningAdjustedScore: adjustedScore,
    decisionScore: adjustedScore,
    learningApplied: learningBonus !== 0,
    learningSummary: buildLearningSummary({ learningBonus, adjustedScore }),
  };
}

export function calculateLearningDecisionBonus(learning = {}) {
  const confidenceScore = Number(
    learning.confidenceScore ??
      learning.historicalConfidenceScore ??
      learning.score ??
      0
  );

  if (confidenceScore >= 85) return 8;
  if (confidenceScore >= 70) return 5;
  if (confidenceScore >= 55) return 2;
  if (confidenceScore > 0 && confidenceScore < 40) return -4;

  return 0;
}

function buildLearningSummary({ learningBonus, adjustedScore }) {
  if (learningBonus > 0) {
    return `Aprendizaje histórico suma ${learningBonus} puntos. Score ajustado: ${adjustedScore}/100.`;
  }

  if (learningBonus < 0) {
    return `Aprendizaje histórico resta ${Math.abs(learningBonus)} puntos. Score ajustado: ${adjustedScore}/100.`;
  }

  return `Sin ajuste por aprendizaje histórico. Score: ${adjustedScore}/100.`;
}

function clampScore(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numericValue)));
}
