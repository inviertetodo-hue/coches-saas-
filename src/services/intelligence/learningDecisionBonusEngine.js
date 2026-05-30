export function calculateLearningDecisionBonus(decision = {}, marketLearning = {}) {
  const brand = cleanText(decision.brand);
  const model = cleanText(decision.model);
  const modelLabel = [brand, model].filter(Boolean).join(" ");

  const brandMatch = findLearningMatch(marketLearning.brandLearning, brand);
  const modelMatch = findLearningMatch(marketLearning.modelLearning, modelLabel);

  const brandSignal = evaluateLearningSignal(brandMatch, "marca");
  const modelSignal = evaluateLearningSignal(modelMatch, "modelo");

  const learningBonus = clampBonus(brandSignal.bonus + modelSignal.bonus);

  const learningLevel = detectLearningLevel(learningBonus);

  const reasons = [
    ...brandSignal.reasons,
    ...modelSignal.reasons,
  ];

  if (!reasons.length) {
    reasons.push(
      "Todavía no hay aprendizaje suficiente para ajustar esta decisión."
    );
  }

  return {
    learningBonus,
    learningLevel,
    learningReason: reasons[0],
    learningReasons: reasons,
  };
}

export function applyLearningDecisionBonus(decision = {}, marketLearning = {}) {
  const learning = calculateLearningDecisionBonus(decision, marketLearning);

  return {
    ...decision,
    learningDecisionBonus: learning.learningBonus,
    learningDecisionLevel: learning.learningLevel,
    learningDecisionReason: learning.learningReason,
    learningDecisionReasons: learning.learningReasons,
  };
}

function findLearningMatch(list = [], label = "") {
  const target = normalize(label);

  if (!target || !Array.isArray(list)) {
    return null;
  }

  return (
    list.find((item) => normalize(item?.label) === target) || null
  );
}

function evaluateLearningSignal(match, typeLabel) {
  if (!match) {
    return {
      bonus: 0,
      reasons: [],
    };
  }

  const count = safeNumber(match.count);
  const learningScore = safeNumber(match.learningScore);
  const averageProfit = safeNumber(match.averageProfit);
  const averageROI = safeNumber(match.averageROI);
  const averageScore = safeNumber(match.averageScore);

  let bonus = 0;
  const reasons = [];

  if (count >= 5) {
    bonus += 4;
    reasons.push(
      `Aprendizaje sólido para esta ${typeLabel}: ${count} análisis.`
    );
  } else if (count >= 2) {
    bonus += 2;
    reasons.push(
      `Aprendizaje inicial para esta ${typeLabel}: ${count} análisis.`
    );
  }

  if (learningScore >= 85) {
    bonus += 6;
    reasons.push(
      `La ${typeLabel} tiene patrón aprendido muy fuerte: ${learningScore}/100.`
    );
  } else if (learningScore >= 70) {
    bonus += 4;
    reasons.push(
      `La ${typeLabel} tiene patrón aprendido fuerte: ${learningScore}/100.`
    );
  } else if (learningScore < 40 && learningScore > 0) {
    bonus -= 4;
    reasons.push(
      `La ${typeLabel} tiene patrón aprendido débil: ${learningScore}/100.`
    );
  }

  if (averageProfit >= 3000) {
    bonus += 4;
    reasons.push(
      `Beneficio medio aprendido alto: ${averageProfit} €.`
    );
  } else if (averageProfit > 0 && averageProfit < 500) {
    bonus -= 3;
    reasons.push(
      `Beneficio medio aprendido bajo: ${averageProfit} €.`
    );
  }

  if (averageROI >= 25) {
    bonus += 3;
    reasons.push(
      `ROI medio aprendido fuerte: ${averageROI}%.`
    );
  } else if (averageROI > 0 && averageROI < 8) {
    bonus -= 3;
    reasons.push(
      `ROI medio aprendido débil: ${averageROI}%.`
    );
  }

  if (averageScore >= 80) {
    bonus += 2;
    reasons.push(
      `Score medio aprendido alto: ${averageScore}/100.`
    );
  } else if (averageScore > 0 && averageScore < 55) {
    bonus -= 2;
    reasons.push(
      `Score medio aprendido bajo: ${averageScore}/100.`
    );
  }

  return {
    bonus,
    reasons,
  };
}

function detectLearningLevel(bonus) {
  if (bonus >= 10) return "Muy favorable";
  if (bonus >= 5) return "Favorable";
  if (bonus <= -8) return "Desfavorable";
  if (bonus < 0) return "Débil";
  return "Neutro";
}

function clampBonus(value) {
  return Math.max(-15, Math.min(15, Math.round(Number(value || 0))));
}

function cleanText(value) {
  return String(value || "").trim();
}

function normalize(value) {
  return cleanText(value).toLowerCase();
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}