export function buildHistoricalModelMemory(analyses = []) {
  const groups = {};

  for (const item of analyses) {
    const brand = String(item.brand || "").trim();
    const model = String(item.model || "").trim();

    if (!brand || !model) continue;

    const label = `${brand} ${model}`;
    const key = normalize(label);

    if (!groups[key]) {
      groups[key] = {
        model: label,
        analyses: 0,
        totalROI: 0,
        totalProfit: 0,
        totalScore: 0,
      };
    }

    groups[key].analyses += 1;
    groups[key].totalROI += safeNumber(item.roi);
    groups[key].totalProfit += safeNumber(item.profit);
    groups[key].totalScore += safeNumber(item.score);
  }

  return Object.values(groups).map((group) => {
    const confidence = getHistoricalConfidence(group.analyses);

    return {
      model: group.model,
      analyses: group.analyses,
      averageROI: Math.round(group.totalROI / group.analyses),
      averageProfit: Math.round(group.totalProfit / group.analyses),
      averageScore: Math.round(group.totalScore / group.analyses),
      confidence: confidence.label,
      confidenceScore: confidence.score,
    };
  });
}

export function getHistoricalConfidence(count) {
  if (count >= 15) {
    return {
      label: "Alta",
      score: 90,
    };
  }

  if (count >= 5) {
    return {
      label: "Media",
      score: 70,
    };
  }

  return {
    label: "Baja",
    score: 40,
  };
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number)
    ? number
    : 0;
}