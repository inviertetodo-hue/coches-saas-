export function canProcessAnalysis(item = {}) {
  if (!item) {
    return false;
  }

  const score = Number(item.score);
  const roi = Number(item.roi);
  const profit = Number(item.profit);

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

  return true;
}

export function filterValidAnalyses(analyses = []) {
  if (!Array.isArray(analyses)) {
    return [];
  }

  return analyses.filter(canProcessAnalysis);
}