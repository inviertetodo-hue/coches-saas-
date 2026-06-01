export function buildDashboardMemoryDataset(records = []) {
  const safeRecords = records.filter(isDashboardEligible);

  const brands = new Set(
    safeRecords.map((item) => item.brand).filter(Boolean)
  );

  const models = new Set(
    safeRecords
      .map((item) => `${item.brand}-${item.model}`)
      .filter(Boolean)
  );

  const avgROI =
    safeRecords.length > 0
      ? Math.round(
          safeRecords.reduce(
            (sum, item) => sum + Number(item.roi || 0),
            0
          ) / safeRecords.length
        )
      : 0;

  const avgProfit =
    safeRecords.length > 0
      ? Math.round(
          safeRecords.reduce(
            (sum, item) => sum + Number(item.profit || 0),
            0
          ) / safeRecords.length
        )
      : 0;

  const bestOpportunity = [...safeRecords]
    .sort(
      (a, b) =>
        Number(b.profit || 0) - Number(a.profit || 0)
    )[0] || null;

  const worstOpportunity = [...safeRecords]
    .sort(
      (a, b) =>
        Number(a.profit || 0) - Number(b.profit || 0)
    )[0] || null;

  return {
    records: safeRecords,
    totalRecords: safeRecords.length,
    brandsCount: brands.size,
    modelsCount: models.size,
    avgROI,
    avgProfit,
    bestOpportunity,
    worstOpportunity,
  };
}

function isDashboardEligible(record = {}) {
  const status = String(record.status || "").toUpperCase();

  const sourceMode = String(
    record.sourceMode || ""
  ).toLowerCase();

  const model = String(
    record.model || ""
  ).trim();

  const quality =
    Number(
      record.qualityScore ??
        record.quality ??
        100
    ) || 0;

  if (status && status !== "ACTIVE") {
    return false;
  }

  if (!record.brand) {
    return false;
  }

  if (!model) {
    return false;
  }

  if (model.toLowerCase() === "gama") {
    return false;
  }

  if (sourceMode === "mock-fallback") {
    return false;
  }

  if (quality < 70) {
    return false;
  }

  return true;
}