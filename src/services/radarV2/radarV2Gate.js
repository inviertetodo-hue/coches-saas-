import { detectBrand, detectModel, normalizeText } from "./radarV2Utils";

export function applyRadarV2Gate(candidate = {}, scan = {}) {
  const reasons = [];
  const warnings = [];

  const price = Number(candidate.price || 0);
  const mileage = Number(candidate.mileage || candidate.km || 0);
  const year = Number(candidate.year || 0);
  const maxBudget = Number(scan.maxBudget || scan.maxPrice || 0);
  const minYear = Number(scan.minYear || scan.yearFrom || scan.filters?.minYear || 0);
  const maxMileage = Number(scan.maxMileage || scan.maxKm || scan.filters?.maxMileage || 0);

  if (!price) reasons.push("missing_price");
  if (!mileage) reasons.push("missing_mileage");
  if (!year) reasons.push("missing_year");

  if (maxBudget > 0 && price > maxBudget) reasons.push("price_over_budget");
  if (minYear > 0 && year > 0 && year < minYear) reasons.push("year_under_filter");
  if (maxMileage > 0 && mileage > 0 && mileage > maxMileage) reasons.push("mileage_over_filter");

  const targetBrand = detectBrand(scan.query || `${scan.brand || ""} ${scan.model || ""}`);
  const targetModel = detectModel(scan.query || `${scan.brand || ""} ${scan.model || ""}`, targetBrand);

  const candidateBrand = candidate.brand || "";
  const candidateModel = candidate.model || "";

  if (targetBrand && candidateBrand && normalizeText(targetBrand) !== normalizeText(candidateBrand)) {
    reasons.push("brand_mismatch");
  }

  if (targetModel && candidateModel) {
    const target = normalizeModel(targetModel);
    const found = normalizeModel(candidateModel);

    if (target && found && target !== found) {
      reasons.push("model_mismatch");
    }
  }

  const hasOriginalUrl = Boolean(candidate.originalUrl || candidate.url);
  const hasImage = Boolean(candidate.imageUrl);
  const hasConfirmedIdentity = candidate.identitySource === "block";

  if (!hasOriginalUrl) warnings.push("missing_original_url");
  if (!hasImage) warnings.push("missing_image");
  if (!hasConfirmedIdentity) warnings.push("identity_not_confirmed");

  if (reasons.length > 0) {
    return {
      ...candidate,
      verificationStatus: "REJECTED",
      canScore: false,
      canBuy: false,
      isVerified: false,
      verificationReasons: reasons,
      verificationWarnings: warnings,
      rejectionReason: reasons[0],
    };
  }

  if (!hasOriginalUrl || !hasImage || !hasConfirmedIdentity) {
    return {
      ...candidate,
      verificationStatus: "CANDIDATE",
      canScore: false,
      canBuy: false,
      isVerified: false,
      verificationReasons: [],
      verificationWarnings: warnings,
      rejectionReason: warnings[0] || "needs_verification",
    };
  }

  return {
    ...candidate,
    verificationStatus: "VERIFIED",
    canScore: true,
    canBuy: true,
    isVerified: true,
    verificationReasons: [],
    verificationWarnings: [],
    rejectionReason: null,
  };
}

function normalizeModel(value = "") {
  return normalizeText(value)
    .replace(/^e\s+/, "e ")
    .replace(/\s+/g, " ")
    .trim();
}
