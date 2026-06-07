export function buildImporterAnalysisPayload({
  analysis,
  semanticData,
  car,
}) {
  const finalTitle =
    semanticData?.title?.trim() ||
    car?.title?.trim() ||
    buildTitleFallback(semanticData, car);

  return {
    title: finalTitle,
    brand: semanticData?.brand || null,
    model: semanticData?.model || null,
    fuel_type: semanticData?.fuelType || null,
    drivetrain: semanticData?.drivetrain || null,
    performance_package: semanticData?.performancePackage || null,
    country: car?.country || null,
    profit: Math.round(Number(analysis?.estimatedProfit || 0)),
    roi: Number(analysis?.roi || 0),
    score: Number(analysis?.score || 0),
    url: car?.url?.trim() || null,
  };
}

function buildTitleFallback(semanticData, car) {
  const parts = [
    semanticData?.brand,
    semanticData?.model,
    car?.year,
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(" ");
  }

  return "Vehículo analizado";
}