export function analyzeAILearning(analyses = []) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    return {
      learningScore: 0,
      learningLevel: "Sin datos",
      learnedPatterns: [],
      learningInsights: [],
    };
  }

  const learnedPatterns = [];
  const learningInsights = [];

  const total = analyses.length;

  const highScoreCars = analyses.filter(
    (item) => Number(item.score || 0) >= 85
  );

  const premiumCars = analyses.filter((item) =>
    ["bmw", "audi", "mercedes", "porsche"].includes(
      String(item.brand || "").toLowerCase()
    )
  );

  const hybridCars = analyses.filter((item) =>
    String(item.fuel_type || "").toLowerCase().includes("hybrid")
  );

  const awdCars = analyses.filter((item) =>
    String(item.drivetrain || "").toLowerCase().includes("awd") ||
    String(item.drivetrain || "").toLowerCase().includes("xdrive") ||
    String(item.drivetrain || "").toLowerCase().includes("quattro")
  );

  let learningScore =
    40 +
    highScoreCars.length * 6 +
    premiumCars.length * 4 +
    hybridCars.length * 5 +
    awdCars.length * 4;

  learningScore = clampScore(learningScore);

  let learningLevel = "Inicial";

  if (learningScore >= 80) {
    learningLevel = "Avanzado";
  } else if (learningScore >= 60) {
    learningLevel = "Intermedio";
  }

  if (premiumCars.length >= 2) {
    learnedPatterns.push(
      "💎 La IA detecta potencial consistente en marcas premium."
    );
  }

  if (hybridCars.length >= 2) {
    learnedPatterns.push(
      "⚡ Los híbridos muestran señales positivas recurrentes."
    );
  }

  if (awdCars.length >= 2) {
    learnedPatterns.push(
      "🛞 Las configuraciones AWD aparecen repetidamente en operaciones fuertes."
    );
  }

  if (highScoreCars.length >= 3) {
    learnedPatterns.push(
      "🚀 El sistema empieza a reconocer patrones de alto rendimiento."
    );
  }

  if (learningLevel === "Inicial") {
    learningInsights.push(
      "📊 La IA todavía necesita más operaciones para consolidar patrones."
    );
  }

  if (learningLevel === "Intermedio") {
    learningInsights.push(
      "🧠 La IA ya empieza a reconocer segmentos estratégicos."
    );
  }

  if (learningLevel === "Avanzado") {
    learningInsights.push(
      "🔥 La IA muestra aprendizaje sólido sobre oportunidades reales."
    );
  }

  return {
    learningScore,
    learningLevel,
    learnedPatterns,
    learningInsights,
  };
}

function clampScore(value) {
  if (value > 100) return 100;
  if (value < 0) return 0;
  return Math.round(value);
}