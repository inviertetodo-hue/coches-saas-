export function buildProtectedMemorySave({
  approvedImport,
  simulation,
  minQuality = 70,
}) {
  const approvedItems = Array.isArray(approvedImport?.approvedItems)
    ? approvedImport.approvedItems
    : [];

  const acceptedRecords = approvedItems.filter((item) => {
    const quality = Number(
      item.dataQualityScore ??
        item.qualityScore ??
        item.score ??
        0
    );

    const status = item.importStatus || item.status || "";

    return (
      item &&
      item.memoryEligible !== false &&
      status === "approved" &&
      quality >= minQuality
    );
  });

  const rejectedRecords = approvedItems.filter(
    (item) => !acceptedRecords.includes(item)
  );

  const canSave =
    acceptedRecords.length > 0 &&
    simulation &&
    simulation.totalSimulated > 0;

  return {
    canSave,
    totalCandidates: approvedItems.length,
    acceptedCount: acceptedRecords.length,
    rejectedCount: rejectedRecords.length,
    acceptedRecords,
    rejectedRecords,
    summary: canSave
      ? `${acceptedRecords.length} registros pueden guardarse de forma segura en memoria histórica.`
      : "No existen registros suficientemente fiables para guardar.",
    insights: [
      `${acceptedRecords.length} registros superan el filtro de calidad.`,
      `${rejectedRecords.length} registros quedan bloqueados.`,
      `Calidad mínima requerida: ${minQuality}.`,
      canSave
        ? "La importación está preparada para guardado protegido."
        : "La importación no cumple todavía los requisitos.",
    ],
  };
}