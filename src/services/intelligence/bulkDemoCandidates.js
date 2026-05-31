export function buildDemoCandidates(url) {
  const normalized = String(url || "").toLowerCase();

  if (normalized.includes("audi") && normalized.includes("a3")) {
    return buildAudiA3Candidates();
  }

  if (normalized.includes("bmw")) {
    return buildBmwCandidates();
  }

  return buildUnknownCandidates();
}

function buildAudiA3Candidates() {
  return [
    {
      id: "preview-audi-a3-1",
      sourceMode: "real-feed",
      sourceStatus: "ok",
      title: "Audi A3 Sportback 35 TFSI S tronic",
      brand: "Audi",
      model: "A3",
      year: 2023,
      price: 24890,
      mileage: 31500,
      roi: 8,
      profit: 2200,
      matchScore: 88,
      comparableConfidence: 91,
    },
    {
      id: "preview-audi-a3-2",
      sourceMode: "real-feed",
      sourceStatus: "ok",
      title: "Audi A3 40 TFSIe Advanced",
      brand: "Audi",
      model: "A3",
      year: 2022,
      price: 26900,
      mileage: 27821,
      roi: 6,
      profit: 1630,
      matchScore: 82,
      comparableConfidence: 88,
    },
    {
      id: "preview-audi-a3-3",
      sourceMode: "real-feed",
      sourceStatus: "ok",
      title: "Audi A3 30 TDI S tronic",
      brand: "Audi",
      model: "A3",
      year: 2021,
      price: 16950,
      mileage: 37212,
      roi: -7,
      profit: -1207,
      matchScore: 78,
      comparableConfidence: 84,
    },
    {
      id: "preview-audi-a3-4",
      sourceMode: "mock-fallback",
      sourceStatus: "ok",
      title: "Audi A3 Demo Candidate",
      brand: "Audi",
      model: "A3",
      year: 2025,
      price: 16995,
      mileage: 15000,
      roi: -2,
      profit: -351,
      matchScore: 70,
      comparableConfidence: 60,
    },
  ];
}

function buildBmwCandidates() {
  return [
    {
      id: "preview-bmw-1",
      sourceMode: "real-feed",
      sourceStatus: "ok",
      title: "BMW Serie 3 320d automático",
      brand: "BMW",
      model: "Serie 3",
      year: 2022,
      price: 28900,
      mileage: 56000,
      roi: 7,
      profit: 2100,
      matchScore: 84,
      comparableConfidence: 88,
    },
    {
      id: "preview-bmw-2",
      sourceMode: "real-feed",
      sourceStatus: "ok",
      title: "BMW X5 45e xDrive",
      brand: "BMW",
      model: "X5",
      year: 2021,
      price: 52900,
      mileage: 69000,
      roi: 9,
      profit: 4600,
      matchScore: 86,
      comparableConfidence: 89,
    },
    {
      id: "preview-bmw-3",
      sourceMode: "mock-fallback",
      sourceStatus: "ok",
      title: "BMW Demo Candidate",
      brand: "BMW",
      model: "",
      year: 0,
      price: 0,
      mileage: null,
      roi: 0,
      profit: 0,
      matchScore: 35,
      comparableConfidence: 25,
    },
  ];
}

function buildUnknownCandidates() {
  return [
    {
      id: "preview-unknown-1",
      sourceMode: "review",
      sourceStatus: "unknown",
      title: "Candidato pendiente de identificación",
      brand: "",
      model: "",
      year: 0,
      price: 0,
      mileage: null,
      roi: 0,
      profit: 0,
      matchScore: 30,
      comparableConfidence: 30,
    },
    {
      id: "preview-unknown-2",
      sourceMode: "mock-fallback",
      sourceStatus: "ok",
      title: "Candidato fallback de ejemplo",
      brand: "",
      model: "",
      year: 0,
      price: 0,
      mileage: null,
      roi: 0,
      profit: 0,
      matchScore: 20,
      comparableConfidence: 20,
    },
  ];
}