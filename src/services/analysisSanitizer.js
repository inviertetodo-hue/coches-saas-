export function sanitizeAnalysis(item = {}) {
  return {
    ...item,
    score: safeNumber(item.score),
    roi: safeNumber(item.roi),
    profit: safeNumber(item.profit),
    price: safeNumber(item.price),
    kilometers: safeNumber(item.kilometers),
    year: safeNumber(item.year),
    title: item.title || item.name || "Vehículo IA",
    brand: item.brand || "",
    model: item.model || "",
    drivetrain: item.drivetrain || "",
    fuel_type: item.fuel_type || "",
    performance_package: item.performance_package || "",
  };
}

export function sanitizeAnalysesDataset(analyses = []) {
  if (!Array.isArray(analyses)) {
    return [];
  }

  return analyses.map(sanitizeAnalysis);
}

function safeNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return number;
}