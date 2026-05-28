export function generateSearchRecommendations() {
  const recommendations = buildRecommendations()
    .map((item) => ({
      ...item,
      priorityScore: calculatePriorityScore(item),
      decision: buildDecision(item),
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  return {
    topRecommendations: recommendations.slice(0, 6),
    avoidList: buildAvoidList(),
    summary: buildSummary(recommendations),
  };
}

function buildRecommendations() {
  return [
    {
      id: "bmw-x5-45e",
      title: "BMW X5 xDrive45e",
      segment: "SUV premium PHEV",
      budgetRange: "52.000 € - 62.000 €",
      targetCountries: ["Alemania", "Holanda", "Bélgica"],
      resaleSpeed: 82,
      marginPotential: 84,
      risk: 42,
      liquidity: 86,
      confidence: 86,
      reason:
        "Alta demanda, buena liquidez, configuración premium vendible y margen interesante si aparece por debajo de mercado.",
    },
    {
      id: "mercedes-glc-300de",
      title: "Mercedes GLC 300de / 300e",
      segment: "SUV premium PHEV",
      budgetRange: "42.000 € - 58.000 €",
      targetCountries: ["Alemania", "Bélgica", "Francia"],
      resaleSpeed: 78,
      marginPotential: 78,
      risk: 46,
      liquidity: 82,
      confidence: 82,
      reason:
        "SUV premium con demanda sólida, buen encaje para importación y comprador amplio.",
    },
    {
      id: "audi-q7-tfsie",
      title: "Audi Q7 55 TFSIe quattro",
      segment: "SUV premium PHEV grande",
      budgetRange: "55.000 € - 70.000 €",
      targetCountries: ["Alemania", "Holanda"],
      resaleSpeed: 70,
      marginPotential: 80,
      risk: 52,
      liquidity: 72,
      confidence: 78,
      reason:
        "Buen margen potencial, pero ticket alto y rotación algo más lenta que X5 o GLC.",
    },
    {
      id: "bmw-serie-3-diesel",
      title: "BMW Serie 3 320d / 330d automático",
      segment: "Berlina premium líquida",
      budgetRange: "24.000 € - 38.000 €",
      targetCountries: ["Alemania", "Bélgica"],
      resaleSpeed: 84,
      marginPotential: 68,
      risk: 38,
      liquidity: 88,
      confidence: 84,
      reason:
        "Rotación rápida, demanda estable y ticket más accesible para reventa.",
    },
    {
      id: "mercedes-clase-a-auto",
      title: "Mercedes Clase A automático",
      segment: "Compacto premium",
      budgetRange: "22.000 € - 34.000 €",
      targetCountries: ["Alemania", "Francia", "Bélgica"],
      resaleSpeed: 86,
      marginPotential: 62,
      risk: 36,
      liquidity: 90,
      confidence: 82,
      reason:
        "Producto fácil de vender, comprador amplio y menor riesgo de capital inmovilizado.",
    },
    {
      id: "toyota-hybrid",
      title: "Toyota híbridos",
      segment: "Híbrido eficiente",
      budgetRange: "18.000 € - 32.000 €",
      targetCountries: ["Francia", "Bélgica", "Alemania"],
      resaleSpeed: 88,
      marginPotential: 58,
      risk: 28,
      liquidity: 86,
      confidence: 80,
      reason:
        "Bajo riesgo, alta confianza mecánica y venta rápida, aunque margen normalmente menor.",
    },
  ];
}

function calculatePriorityScore(item) {
  const score =
    item.resaleSpeed * 0.25 +
    item.marginPotential * 0.25 +
    item.liquidity * 0.25 +
    item.confidence * 0.15 -
    item.risk * 0.10;

  return clampScore(score);
}

function buildDecision(item) {
  const priority = calculatePriorityScore(item);

  if (priority >= 82) {
    return "🔥 Buscar primero";
  }

  if (priority >= 72) {
    return "🟢 Buena línea de búsqueda";
  }

  if (priority >= 62) {
    return "🟡 Buscar si aparece buen precio";
  }

  return "⚠️ Solo con descuento fuerte";
}

function buildAvoidList() {
  return [
    {
      id: "high-ticket-performance",
      title: "Performance de ticket alto sin comprador claro",
      reason:
        "Puede tener margen bruto, pero suele tener menor liquidez, costes altos y venta más lenta.",
    },
    {
      id: "too-cheap-listings",
      title: "Anuncios demasiado baratos",
      reason:
        "Pueden esconder daños, historial dudoso, fraude, importación compleja o costes ocultos.",
    },
    {
      id: "low-data-cars",
      title: "Coches sin datos suficientes",
      reason:
        "Si falta marca, modelo, kilometraje, año o historial, la confianza debe ser baja.",
    },
    {
      id: "slow-rotation-luxury",
      title: "Lujo muy caro sin demanda clara",
      reason:
        "Puede inmovilizar capital durante demasiado tiempo aunque el margen aparente sea alto.",
    },
  ];
}

function buildSummary(recommendations) {
  const best = recommendations[0];

  if (!best) {
    return "Todavía no hay líneas de búsqueda recomendadas.";
  }

  return `Ahora mismo la mejor línea de búsqueda es ${best.title}, con prioridad ${best.priorityScore}/100.`;
}

function clampScore(value) {
  const number = Math.round(Number(value || 0));

  if (number > 100) return 100;
  if (number < 0) return 0;

  return number;
}