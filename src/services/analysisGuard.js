export function canProcessAnalysis(item = {}) {
  if (!item || typeof item !== "object") {
    return false;
  }

  const score = safeNumber(item.score);
  const roi = safeNumber(item.roi);
  const profit = safeNumber(item.profit);
  const price = safeNumber(item.price);
  const kilometers = safeNumber(item.kilometers || item.km);
  const year = safeNumber(item.year);

  const currentYear = new Date().getFullYear();

  if (!Number.isFinite(score)) {
    return false;
  }

  if (!Number.isFinite(roi)) {
    return false;
  }

  if (!Number.isFinite(profit)) {
    return false;
  }

  if (score < 0 || score > 100) {
    return false;
  }

  if (roi < -100 || roi > 1000) {
    return false;
  }

  if (profit < -100000 || profit > 1000000) {
    return false;
  }

  if (price < 0 || price > 1000000) {
    return false;
  }

  if (kilometers < 0 || kilometers > 1000000) {
    return false;
  }

  if (
    year > 0 &&
    (year < 1980 || year > currentYear + 1)
  ) {
    return false;
  }

  if (score >= 85 && roi < 15) {
    return false;
  }

  if (score >= 85 && profit <= 0) {
    return false;
  }

  if (roi >= 25 && profit <= 0) {
    return false;
  }

  if (roi <= 0 && score > 55) {
    return false;
  }

  if (kilometers >= 220000 && score > 65) {
    return false;
  }

  if (price > 0 && price < 1000 && score > 60) {
    return false;
  }

  return true;
}

export function filterValidAnalyses(
  analyses = []
) {
  if (!Array.isArray(analyses)) {
    return [];
  }

  return analyses.filter(
    canProcessAnalysis
  );
}

function safeNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}