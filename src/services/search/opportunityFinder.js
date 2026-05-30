export function findOpportunities(listings = [], options = {}) {
  if (!Array.isArray(listings)) {
    return [];
  }

  return listings
    .filter((listing) => listing?.isValid)
    .map((listing) => calculateOpportunity(listing, options))
    .sort((a, b) => b.opportunityScore - a.opportunityScore);
}

function calculateOpportunity(listing, options = {}) {
  const price = safeNumber(listing.price);
  const mileage = safeNumber(listing.mileage);
  const year = safeNumber(listing.year);
  const maxBudget = safeNumber(options.maxBudget);

  let score = 50;

  if (year >= 2024) score += 18;
  else if (year >= 2022) score += 14;
  else if (year >= 2020) score += 8;
  else if (year >= 2018) score += 3;
  else score -= 12;

  if (mileage <= 25000) score += 18;
  else if (mileage <= 50000) score += 14;
  else if (mileage <= 90000) score += 7;
  else if (mileage <= 140000) score -= 2;
  else score -= 18;

  if (maxBudget > 0) {
    const budgetRatio = price / maxBudget;

    if (budgetRatio <= 0.75) score += 16;
    else if (budgetRatio <= 0.9) score += 10;
    else if (budgetRatio <= 1) score += 4;
    else if (budgetRatio <= 1.1) score -= 12;
    else if (budgetRatio <= 1.25) score -= 25;
    else score -= 40;
  } else {
    if (price <= 25000) score += 10;
    else if (price <= 45000) score += 6;
    else if (price <= 65000) score += 2;
    else score -= 8;
  }

  const opportunityScore = clamp(Math.round(score), 0, 100);

  return {
    ...listing,
    opportunityScore,
    opportunityLevel: getOpportunityLevel(opportunityScore),
    opportunitySignals: {
      price,
      mileage,
      year,
      maxBudget,
      isOverBudget: maxBudget > 0 && price > maxBudget,
    },
  };
}

function getOpportunityLevel(score) {
  if (score >= 82) return "EXCELLENT";
  if (score >= 68) return "GOOD";
  if (score >= 45) return "AVERAGE";
  if (score >= 25) return "LOW";

  return "AVOID";
}

function safeNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}