export function findOpportunities(listings = []) {
  if (!Array.isArray(listings)) {
    return [];
  }

  return listings
    .filter((listing) => listing?.isValid)
    .map(calculateOpportunity)
    .sort((a, b) => b.opportunityScore - a.opportunityScore);
}

function calculateOpportunity(listing) {
  const price = safeNumber(listing.price);
  const mileage = safeNumber(listing.mileage);
  const year = safeNumber(listing.year);

  let score = 0;

  if (year >= 2022) score += 30;
  else if (year >= 2020) score += 20;
  else if (year >= 2018) score += 10;

  if (mileage <= 50000) score += 30;
  else if (mileage <= 100000) score += 20;
  else if (mileage <= 150000) score += 10;

  if (price <= 10000) score += 40;
  else if (price <= 15000) score += 25;
  else if (price <= 20000) score += 15;

  return {
    ...listing,
    opportunityScore: score,
    opportunityLevel: getOpportunityLevel(score),
  };
}

function getOpportunityLevel(score) {
  if (score >= 80) {
    return "EXCELLENT";
  }

  if (score >= 60) {
    return "GOOD";
  }

  if (score >= 40) {
    return "AVERAGE";
  }

  return "LOW";
}

function safeNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}