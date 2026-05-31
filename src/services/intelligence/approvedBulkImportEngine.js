export function buildApprovedBulkImport({
  preview = {},
  maxItems = 50,
} = {}) {
  const items = Array.isArray(preview.items) ? preview.items : [];

  const approvedItems = items
    .filter((item) => item.memoryEligible === true)
    .slice(0, maxItems)
    .map((item, index) => {
      return buildApprovedItem(item, preview, index);
    });

  const rejectedItems = items.filter((item) => item.memoryEligible !== true);

  return {
    source: preview.source || "unknown",
    sourceUrl: preview.url || "",
    totalPreviewed: items.length,
    totalApproved: approvedItems.length,
    totalRejected: rejectedItems.length,
    maxItems,
    canSave: approvedItems.length > 0,
    approvedItems,
    rejectedItems: rejectedItems.map(buildRejectedItem),
    summary: buildSummary({
      totalPreviewed: items.length,
      totalApproved: approvedItems.length,
      totalRejected: rejectedItems.length,
    }),
    insights: buildInsights({
      approvedItems,
      rejectedItems,
      totalPreviewed: items.length,
    }),
  };
}

function buildApprovedItem(item, preview, index) {
  return {
    id: item.id || `approved-bulk-${index + 1}`,
    title: item.title || "Vehículo aprobado",
    brand: cleanText(item.brand),
    model: cleanText(item.model),
    year: safeNumber(item.year),
    price: safeNumber(item.price),
    mileage: safeNumber(item.mileage),
    roi: safeNumber(item.roi),
    profit: safeNumber(item.profit),

    source: item.source || preview.source || "unknown",
    sourceUrl: item.url || preview.url || "",
    importType: "bulk_url_preview",
    importStatus: "approved",
    memoryEligible: true,
    canSaveAnalysis: item.canSaveAnalysis === true,

    dataQualityScore: safeNumber(item.dataQualityScore),
    dataQualityLabel: item.dataQualityLabel || "UNKNOWN",
    dataQualitySummary: item.dataQualitySummary || "",
    dataQualityReasons: Array.isArray(item.dataQualityReasons)
      ? item.dataQualityReasons
      : [],

    raw: {
      sourceId: item.id,
      source: item.source || preview.source || "unknown",
      sourceUrl: item.url || preview.url || "",
      importedFromBulkPreview: true,
    },
  };
}

function buildRejectedItem(item) {
  return {
    id: item.id,
    title: item.title,
    dataQualityScore: safeNumber(item.dataQualityScore),
    dataQualityLabel: item.dataQualityLabel || "UNKNOWN",
    memoryEligible: false,
    reason:
      item.dataQualitySummary ||
      "Rechazado para proteger memoria histórica.",
  };
}

function buildSummary({
  totalPreviewed,
  totalApproved,
  totalRejected,
}) {
  if (totalPreviewed === 0) {
    return "No hay candidatos para aprobar.";
  }

  if (totalApproved === 0) {
    return "Ningún candidato supera el filtro de memoria histórica.";
  }

  return `${totalApproved} de ${totalPreviewed} candidatos pueden aprobarse para memoria. ${totalRejected} quedan fuera para evitar contaminación.`;
}

function buildInsights({
  approvedItems,
  rejectedItems,
  totalPreviewed,
}) {
  const insights = [];

  if (totalPreviewed === 0) {
    insights.push("No se ha generado preview suficiente.");
    return insights;
  }

  insights.push(
    `Se han revisado ${totalPreviewed} candidatos del preview.`
  );

  insights.push(
    `${approvedItems.length} candidatos son aptos para memoria histórica.`
  );

  if (rejectedItems.length > 0) {
    insights.push(
      `${rejectedItems.length} candidatos quedan rechazados para no contaminar la base.`
    );
  }

  const negativeProfitApproved = approvedItems.filter(
    (item) => item.profit < 0 || item.roi < 0
  ).length;

  if (negativeProfitApproved > 0) {
    insights.push(
      `${negativeProfitApproved} candidatos aprobados tienen ROI o margen negativo: son datos fiables, pero no oportunidades de compra.`
    );
  }

  return insights;
}

function cleanText(value) {
  return String(value || "").trim();
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}