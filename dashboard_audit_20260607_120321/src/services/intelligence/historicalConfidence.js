export function calculateHistoricalConfidence(analysis = {}, intelligence = {}) {
  const brand = cleanText(analysis.brand);
  const model = cleanText(analysis.model);
  const title = cleanText(analysis.title);

  const brandMatch = findRankingMatch(intelligence.brandProfitRanking, brand);
  const modelMatch = findRankingMatch(
    intelligence.modelProfitRanking,
    buildModelLabel(brand, model)
  );

  const brandSignal = evaluateRankingSignal(brandMatch, "marca");
  const modelSignal = evaluateRankingSignal(modelMatch, "modelo");

  const confidenceBonus = clampConfidenceBonus(
    brandSignal.bonus + modelSignal.bonus
  );

  const confidenceLevel = detectConfidenceLevel(confidenceBonus);

  const reasons = [
    ...brandSignal.reasons,
    ...modelSignal.reasons,
  ];

  if (!reasons.length) {
    reasons.push(
      title
        ? `${title} todavía no tiene suficiente histórico comparable.`
        : "Todavía no hay suficiente histórico comparable para este vehículo."
    );
  }

  return {
    confidenceBonus,
    confidenceLevel,
    confidenceReason: reasons[0],
    confidenceReasons: reasons,
  };
}

export function applyHistoricalConfidence(decision = {}, intelligence = {}) {
  const confidence = calculateHistoricalConfidence(decision, intelligence);

  const adjustedDecisionScore = clampScore(
    Number(decision.decisionScore || 0) + confidence.confidenceBonus
  );

  return {
    ...decision,
    decisionScore: adjustedDecisionScore,
    historicalConfidence: confidence,
    historicalConfidenceBonus: confidence.confidenceBonus,
    historicalConfidenceLevel: confidence.confidenceLevel,
    historicalConfidenceReason: confidence.confidenceReason,
  };
}

function findRankingMatch(ranking = [], label = "") {
  const target = normalize(label);

  if (!target || !Array.isArray(ranking)) {
    return null;
  }

  return ranking.find((item) => {
    return normalize(item?.label) === target;
  }) || null;
}

function evaluateRankingSignal(match, typeLabel) {
  if (!match) {
    return {
      bonus: 0,
      reasons: [],
    };
  }

  const averageProfit = safeNumber(match.averageProfit);
  const averageROI = safeNumber(match.averageROI);
  const averageScore = safeNumber(match.averageScore);
  const count = safeNumber(match.count);

  let bonus = 0;
  const reasons = [];

  if (count >= 3) {
    bonus += 3;
    reasons.push(
      `Histórico suficiente para esta ${typeLabel}: ${count} análisis.`
    );
  } else if (count >= 1) {
    bonus += 1;
    reasons.push(
      `Histórico inicial para esta ${typeLabel}: ${count} análisis.`
    );
  }

  if (averageProfit >= 3000) {
    bonus += 5;
    reasons.push(
      `La ${typeLabel} tiene beneficio medio alto: ${averageProfit} €.`
    );
  } else if (averageProfit >= 1000) {
    bonus += 2;
    reasons.push(
      `La ${typeLabel} tiene beneficio medio positivo: ${averageProfit} €.`
    );
  } else if (averageProfit > 0 && averageProfit < 500) {
    bonus -= 2;
    reasons.push(
      `La ${typeLabel} tiene beneficio medio bajo: ${averageProfit} €.`
    );
  }

  if (averageROI >= 25) {
    bonus += 4;
    reasons.push(
      `La ${typeLabel} tiene ROI histórico fuerte: ${averageROI}%.`
    );
  } else if (averageROI >= 15) {
    bonus += 2;
    reasons.push(
      `La ${typeLabel} tiene ROI histórico aceptable: ${averageROI}%.`
    );
  } else if (averageROI > 0 && averageROI < 8) {
    bonus -= 3;
    reasons.push(
      `La ${typeLabel} tiene ROI histórico débil: ${averageROI}%.`
    );
  }

  if (averageScore >= 80) {
    bonus += 3;
    reasons.push(
      `La ${typeLabel} tiene score histórico alto: ${averageScore}/100.`
    );
  } else if (averageScore > 0 && averageScore < 60) {
    bonus -= 3;
    reasons.push(
      `La ${typeLabel} tiene score histórico bajo: ${averageScore}/100.`
    );
  }

  return {
    bonus,
    reasons,
  };
}

function buildModelLabel(brand, model) {
  return [brand, model].filter(Boolean).join(" ");
}

function detectConfidenceLevel(bonus) {
  if (bonus >= 10) return "Alta";
  if (bonus >= 4) return "Media";
  if (bonus <= -6) return "Baja";
  return "Inicial";
}

function clampConfidenceBonus(value) {
  return Math.max(-15, Math.min(15, Math.round(Number(value || 0))));
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value || 0))));
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