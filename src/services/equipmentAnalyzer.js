const EQUIPMENT_RULES = [
  {
    id: "head_up_display",
    label: "Head-up display",
    score: 8,
    terms: ["head-up", "head up", "hud"],
  },
  {
    id: "panoramic_roof",
    label: "Techo panorámico",
    score: 7,
    terms: ["panorama", "panoramic", "pano", "panoramadach", "glasschiebedach"],
  },
  {
    id: "premium_audio",
    label: "Sonido premium",
    score: 6,
    terms: [
      "harman",
      "kardon",
      "harman kardon",
      "bose",
      "burmester",
      "bang & olufsen",
      "bang olufsen",
      "bowers",
      "wilkins",
    ],
  },
  {
    id: "tow_bar",
    label: "Gancho remolque",
    score: 5,
    terms: ["anhängerkupplung", "ahk", "tow bar", "towbar"],
  },
  {
    id: "camera_360",
    label: "Cámara 360",
    score: 6,
    terms: ["360", "360°", "360 kamera", "360 camera", "surround view"],
  },
  {
    id: "adaptive_cruise",
    label: "Control crucero adaptativo",
    score: 5,
    terms: ["acc", "adaptive cruise", "abstandsregeltempomat", "adaptiver tempomat"],
  },
  {
    id: "matrix_laser_lights",
    label: "Iluminación premium",
    score: 6,
    terms: ["matrix", "laser", "laserlicht", "matrix led", "laser light"],
  },
  {
    id: "ventilated_seats",
    label: "Asientos ventilados",
    score: 5,
    terms: ["sitzbelüftung", "ventilated seats", "seat ventilation"],
  },
  {
    id: "massage_seats",
    label: "Asientos masaje",
    score: 5,
    terms: ["massage", "massagesitze", "massage seats"],
  },
  {
    id: "sport_package",
    label: "Paquete deportivo",
    score: 7,
    terms: ["m sport", "m-sport", "s line", "s-line", "amg line", "r-line"],
  },
  {
    id: "adaptive_suspension",
    label: "Suspensión adaptativa",
    score: 6,
    terms: ["adaptive suspension", "luftfederung", "air suspension", "adaptive fahrwerk"],
  },
  {
    id: "seven_seats",
    label: "7 plazas",
    score: 5,
    terms: ["7-sitzer", "7 sitzer", "7 seats", "seven seats"],
  },
];

export function analyzeEquipment(input = {}) {
  const text = buildEquipmentText(input);
  const detected = [];

  EQUIPMENT_RULES.forEach((rule) => {
    if (rule.terms.some((term) => text.includes(normalize(term)))) {
      detected.push({
        id: rule.id,
        label: rule.label,
        score: rule.score,
      });
    }
  });

  const rawScore = detected.reduce((total, item) => total + item.score, 0);
  const score = clampScore(rawScore);

  return {
    score,
    level: buildEquipmentLevel(score),
    detected,
    labels: detected.map((item) => item.label),
    summary: buildEquipmentSummary(score, detected),
  };
}

function buildEquipmentText(input) {
  const rawBlock = Array.isArray(input.raw?.block) ? input.raw.block.join(" ") : "";

  return normalize(
    [
      input.title,
      input.description,
      input.performancePackage,
      input.bodyType,
      input.drivetrain,
      input.fuelType,
      rawBlock,
    ].join(" ")
  );
}

function buildEquipmentLevel(score) {
  if (score >= 35) return "PREMIUM_PLUS";
  if (score >= 22) return "PREMIUM";
  if (score >= 12) return "GOOD";
  if (score > 0) return "BASIC_PLUS";

  return "UNKNOWN";
}

function buildEquipmentSummary(score, detected) {
  if (!detected.length) {
    return "No se han detectado extras premium claros en el texto disponible.";
  }

  const topLabels = detected.slice(0, 4).map((item) => item.label).join(", ");

  if (score >= 35) {
    return `Equipamiento premium alto detectado: ${topLabels}. Puede mejorar valor real, liquidez y atractivo de reventa.`;
  }

  if (score >= 22) {
    return `Buen equipamiento detectado: ${topLabels}. Señal positiva para valoración y demanda.`;
  }

  return `Algunos extras detectados: ${topLabels}. Conviene validar en el anuncio original.`;
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function clampScore(value) {
  const number = Math.round(Number(value || 0));

  if (number > 50) return 50;
  if (number < 0) return 0;

  return number;
}
