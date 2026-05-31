export function buildMemoryAnalytics(records = []) {
  const validRecords = records.filter(Boolean);

  const totalRecords = validRecords.length;

  const brands = [
    ...new Set(validRecords.map((item) => item.brand).filter(Boolean)),
  ];

  const models = [
    ...new Set(
      validRecords
        .map((item) => `${item.brand || ""} ${item.model || ""}`.trim())
        .filter(Boolean)
    ),
  ];

  const avgROI = calculateAverage(
    validRecords.map((item) => Number(item.roi || 0))
  );

  const avgProfit = calculateAverage(
    validRecords.map((item) => Number(item.profit || 0))
  );

  const bestOpportunity = [...validRecords].sort(
    (a, b) => Number(b.profit || 0) - Number(a.profit || 0)
  )[0];

  const worstOpportunity = [...validRecords].sort(
    (a, b) => Number(a.profit || 0) - Number(b.profit || 0)
  )[0];

  return {
    totalRecords,
    brandsCount: brands.length,
    modelsCount: models.length,
    avgROI: Math.round(avgROI),
    avgProfit: Math.round(avgProfit),
    bestOpportunity,
    worstOpportunity,
  };
}

function calculateAverage(values = []) {
  if (!values.length) return 0;

  const total = values.reduce(
    (sum, value) => sum + Number(value || 0),
    0
  );

  return total / values.length;
}