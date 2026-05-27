export function analyzeCar(car) {
  let score = 0;

  // PRECIO
  if (car.price < 15000) {
    score += 30;
  } else if (car.price < 25000) {
    score += 15;
  }

  // KILÓMETROS
  if (car.km < 100000) {
    score += 30;
  } else if (car.km < 150000) {
    score += 15;
  }

  // AÑO
  if (car.year >= 2020) {
    score += 30;
  } else if (car.year >= 2017) {
    score += 15;
  }

  // BENEFICIO ESTIMADO
  const estimatedSalePrice = car.price * 1.25;
  const estimatedProfit = estimatedSalePrice - car.price;

  // RECOMENDACIÓN
  let recommendation = "MALA COMPRA";

  if (score >= 70) {
    recommendation = "BUENA COMPRA";
  } else if (score >= 40) {
    recommendation = "COMPRA NORMAL";
  }

  return {
    score,
    recommendation,
    estimatedSalePrice,
    estimatedProfit,
  };
}