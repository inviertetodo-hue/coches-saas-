export function calculateSemanticQuality({
  title,
  brand,
  model,
  fuelType,
  drivetrain,
  performancePackage,
}) {
  let quality = 0;

  if (title && title.length >= 12 && !title.includes("Vehículo IA")) {
    quality += 20;
  }

  if (brand) quality += 25;
  if (model) quality += 25;
  if (fuelType) quality += 12;
  if (drivetrain) quality += 10;
  if (performancePackage) quality += 8;

  return clampScore(quality);
}

export function calculateRiskPenalty({
  title,
  score,
  roi,
  profit,
  semanticQuality,
  performancePackage,
}) {
  const text = normalize(`${title} ${performancePackage}`);

  let penalty = 0;

  if (semanticQuality < 25) penalty += 24;
  else if (semanticQuality < 50) penalty += 14;

  if (score >= 90 && semanticQuality < 60) {
    penalty += 14;
  }

  if (roi >= 25 && semanticQuality < 50) {
    penalty += 10;
  }

  if (profit >= 25000) {
    penalty += 6;
  }

  if (
    text.includes("amg") ||
    text.includes(" rs") ||
    text.includes(" m5") ||
    text.includes("m5") ||
    text.includes("m4") ||
    text.includes("m3") ||
    text.includes("turbo") ||
    text.includes("performance")
  ) {
    penalty += 14;
  }

  if (
    text.includes("sl 63") ||
    text.includes("sl63") ||
    text.includes("m5 touring") ||
    text.includes("rs6") ||
    text.includes("911") ||
    text.includes("gt")
  ) {
    penalty += 10;
  }

  return penalty;
}

export function calculateLiquidityBonus({
  title,
  brand,
  model,
  fuelType,
  drivetrain,
  performancePackage,
  semanticQuality,
}) {
  const text = normalize(
    `${title} ${brand} ${model} ${fuelType} ${drivetrain} ${performancePackage}`
  );

  let bonus = 0;

  if (semanticQuality >= 75) bonus += 6;

  if (
    text.includes("x5") ||
    text.includes("x3") ||
    text.includes("glc") ||
    text.includes("gle") ||
    text.includes("q5") ||
    text.includes("q7") ||
    text.includes("cayenne") ||
    text.includes("xc90") ||
    text.includes("range rover sport")
  ) {
    bonus += 12;
  }

  if (
    text.includes("phev") ||
    text.includes("hybrid") ||
    text.includes("tfsi e") ||
    text.includes("tfsie") ||
    text.includes("300de") ||
    text.includes("350de") ||
    text.includes("45e")
  ) {
    bonus += 8;
  }

  if (
    text.includes("xdrive") ||
    text.includes("quattro") ||
    text.includes("4matic")
  ) {
    bonus += 5;
  }

  if (
    text.includes("amg") ||
    text.includes("rs") ||
    text.includes("m5") ||
    text.includes("sl 63") ||
    text.includes("sl63")
  ) {
    bonus -= 10;
  }

  return bonus;
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function clampScore(value) {
  if (value > 100) return 100;
  if (value < 0) return 0;
  return Math.round(value);
}