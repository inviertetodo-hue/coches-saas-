export const MODEL_RULES = {
  "bmw x5 45e": {
    fuel: "PHEV",
    minKw: 250,
    maxKw: 330,
    minYear: 2019,
    maxMileage: 180000,
    minPrice: 25000,
    maxPrice: 90000,
  },

  "audi q7 tfsie": {
    fuel: "PHEV",
    minKw: 250,
    maxKw: 350,
    minYear: 2019,
    maxMileage: 190000,
    minPrice: 30000,
    maxPrice: 95000,
  },

  "mercedes glc 300de": {
    fuel: "PHEV",
    minKw: 180,
    maxKw: 260,
    minYear: 2019,
    maxMileage: 180000,
    minPrice: 28000,
    maxPrice: 85000,
  },
};

export const MODEL_LIQUIDITY = {
  "bmw x5 45e": {
    liquidityScore: 86,
    expectedDaysToSell: 36,
    demand: "Alta",
    buyerPool: "Medio-alto",
    risk: "Medio",
  },

  "audi q7 tfsie": {
    liquidityScore: 78,
    expectedDaysToSell: 52,
    demand: "Media-alta",
    buyerPool: "Medio",
    risk: "Medio-alto",
  },

  "mercedes glc 300de": {
    liquidityScore: 88,
    expectedDaysToSell: 32,
    demand: "Alta",
    buyerPool: "Amplio",
    risk: "Bajo-medio",
  },
};

export const MODEL_RISK = {
  "bmw x5 45e": {
    batteryRisk: "low",
    gearboxRisk: "low",
    demandRisk: "low",
    scoreModifier: 4,
    riskWeight: -6,
  },

  "audi q7 tfsie": {
    batteryRisk: "medium",
    gearboxRisk: "low",
    demandRisk: "medium",
    scoreModifier: -2,
    riskWeight: 4,
  },

  "mercedes glc 300de": {
    batteryRisk: "low",
    gearboxRisk: "low",
    demandRisk: "low",
    scoreModifier: 6,
    riskWeight: -8,
  },

  "range rover sport phev": {
    batteryRisk: "medium",
    gearboxRisk: "high",
    demandRisk: "medium",
    scoreModifier: -8,
    riskWeight: 14,
  },
};

export const MODEL_SCORE_MODIFIERS = {
  "bmw x5 45e": {
    finalScoreModifier: 4,
  },

  "audi q7 tfsie": {
    finalScoreModifier: -2,
  },

  "mercedes glc 300de": {
    finalScoreModifier: 5,
  },

  "range rover sport phev": {
    finalScoreModifier: -8,
  },
};

export function findModelKnowledge(text = "") {
  const normalized = normalize(text);

  const ruleEntry = findMatch(MODEL_RULES, normalized);
  const liquidityEntry = findMatch(MODEL_LIQUIDITY, normalized);
  const riskEntry = findMatch(MODEL_RISK, normalized);
  const scoreEntry = findMatch(MODEL_SCORE_MODIFIERS, normalized);

  return {
    model: ruleEntry?.key || liquidityEntry?.key || riskEntry?.key || scoreEntry?.key || null,

    rules: ruleEntry?.value || null,
    liquidity: liquidityEntry?.value || null,
    risk: riskEntry?.value || null,
    score: scoreEntry?.value || null,
  };
}

function findMatch(source, normalizedText) {
  for (const [key, value] of Object.entries(source)) {
    if (normalizedText.includes(normalize(key))) {
      return {
        key,
        value,
      };
    }
  }

  return null;
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_/+.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}