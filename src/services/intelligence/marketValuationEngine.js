export function buildMarketValuation(vehicle = {}) {
  const price = Number(vehicle.price || 0);
  const roi = Number(vehicle.roi || 0);
  const profit = Number(vehicle.profit || 0);

  const estimatedMarketValue =
    profit > 0
      ? Math.round(price + profit)
      : Math.round(price * (1 + roi / 100));

  const discountValue = estimatedMarketValue - price;

  const discountPercent =
    price > 0
      ? Number(((discountValue / price) * 100).toFixed(2))
      : 0;

  const valuationScore = calculateValuationScore({
    discountPercent,
    roi,
    profit,
  });

  return {
    price,
    estimatedMarketValue,
    discountValue,
    discountPercent,
    valuationScore,
    valuationLabel: buildValuationLabel(valuationScore),
  };
}

function calculateValuationScore({
  discountPercent,
  roi,
  profit,
}) {
  let score = 50;

  score += discountPercent * 2;
  score += roi * 2;

  if (profit > 0) {
    score += 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildValuationLabel(score) {
  if (score >= 85) {
    return "Muy infravalorado";
  }

  if (score >= 70) {
    return "Infravalorado";
  }

  if (score >= 50) {
    return "Precio razonable";
  }

  return "Sobrevalorado";
}