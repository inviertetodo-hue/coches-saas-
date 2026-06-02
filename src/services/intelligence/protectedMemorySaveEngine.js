const MIN_PRICE = 500;
const MAX_PRICE = 500000;
const MIN_YEAR = 1980;
const MAX_YEAR = new Date().getFullYear() + 1;
const MIN_KM = 0;
const MAX_KM = 1000000;

export function buildProtectedMemorySave({
  approvedImport,
  simulation,
  minQuality = 70,
}) {
  const approvedItems = Array.isArray(approvedImport?.approvedItems)
    ? approvedImport.approvedItems
    : [];

  const evaluatedRecords = approvedItems.map((item) =>
    evaluateMemoryCandidate(item, minQuality)
  );

  const acceptedRecords = evaluatedRecords
    .filter((result) => result.accepted)
    .map((result) => result.record);

  const rejectedRecords = evaluatedRecords
    .filter((result) => !result.accepted)
    .map((result) => result.record);

  const canSave =
    acceptedRecords.length > 0 &&
    simulation &&
    Number(simulation.totalSimulated || 0) > 0;

  return {
    canSave,
    totalCandidates: approvedItems.length,
    acceptedCount: acceptedRecords.length,
    rejectedCount: rejectedRecords.length,
    acceptedRecords,
    rejectedRecords,
    summary: canSave
      ? `${acceptedRecords.length} registros verificados pueden guardarse en memoria histórica.`
      : "No existen registros suficientemente fiables para guardar.",
    insights: [
      `${acceptedRecords.length} registros superan el filtro de veracidad.`,
      `${rejectedRecords.length} registros quedan bloqueados.`,
      `Calidad mínima requerida: ${minQuality}.`,
      "Regla activa: sin origen verificable, precio, marca, modelo, año y kilómetros válidos, no se guarda.",
      canSave
        ? "La importación está preparada para guardado protegido."
        : "La importación no cumple todavía los requisitos de verdad de mercado.",
    ],
  };
}

function evaluateMemoryCandidate(item, minQuality) {
  const quality = Number(item?.dataQualityScore ?? item?.qualityScore ?? item?.score ?? 0);
  const status = item?.importStatus || item?.status || "";

  const sourceUrl = getSourceUrl(item);
  const brand = cleanText(item?.brand);
  const model = cleanText(item?.model);
  const price = readNumber(item?.price ?? item?.salePrice ?? item?.listingPrice);
  const year = readNumber(item?.year ?? item?.registrationYear);
  const km = readNumber(item?.km ?? item?.kilometers ?? item?.mileage);

  const rejectionReasons = [];

  if (!item) rejectionReasons.push("missing_record");
  if (item?.memoryEligible === false) rejectionReasons.push("not_memory_eligible");
  if (status !== "approved") rejectionReasons.push("not_approved");
  if (quality < minQuality) rejectionReasons.push("quality_below_minimum");
  if (!sourceUrl) rejectionReasons.push("missing_source_url");
  if (!isValidUrl(sourceUrl)) rejectionReasons.push("invalid_source_url");
  if (!brand) rejectionReasons.push("missing_brand");
  if (!model) rejectionReasons.push("missing_model");
  if (!isValidPrice(price)) rejectionReasons.push("invalid_price");
  if (!isValidYear(year)) rejectionReasons.push("invalid_year");
  if (!isValidKm(km)) rejectionReasons.push("invalid_km");

  const accepted = rejectionReasons.length === 0;
  const now = new Date().toISOString();

  return {
    accepted,
    record: {
      ...item,
      source_url: sourceUrl || item?.source_url || item?.sourceUrl || "",
      sourceUrl: sourceUrl || item?.sourceUrl || item?.source_url || "",
      source: item?.source || item?.sourceSite || detectSourceFromUrl(sourceUrl),
      captured_at: item?.captured_at || item?.capturedAt || now,
      verification_level: accepted ? "VERIFIED_SOURCE_DATA" : "REJECTED_UNVERIFIED_DATA",
      confidence_score: accepted ? quality : Math.min(quality, 49),
      data_truth_status: accepted ? "FACT" : "REJECTED",
      rejectionReasons,
      memoryEligible: accepted,
    },
  };
}

function getSourceUrl(item) {
  return cleanText(
    item?.source_url ||
      item?.sourceUrl ||
      item?.url ||
      item?.listingUrl ||
      item?.originalUrl
  );
}

function cleanText(value) {
  return String(value || "").trim();
}

function readNumber(value) {
  if (typeof value === "number") return value;

  const cleaned = String(value || "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/[^\d.]/g, "");

  const parsed = Number(cleaned);

  return Number.isFinite(parsed) ? parsed : 0;
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function isValidPrice(value) {
  return Number.isFinite(value) && value >= MIN_PRICE && value <= MAX_PRICE;
}

function isValidYear(value) {
  return Number.isFinite(value) && value >= MIN_YEAR && value <= MAX_YEAR;
}

function isValidKm(value) {
  return Number.isFinite(value) && value >= MIN_KM && value <= MAX_KM;
}

function detectSourceFromUrl(value) {
  if (!value || !isValidUrl(value)) return "unknown";

  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}