const LIQUIDITY_PROFILES = [
  {
    id: "toyota-hybrid",
    label: "Toyota híbrido",
    keywords: ["toyota", "hybrid", "híbrido", "corolla", "rav4", "c-hr"],
    liquidityScore: 92,
    expectedDaysToSell: 28,
    demand: "Muy alta",
    buyerPool: "Amplio",
    risk: "Bajo",
    reason:
      "Producto muy líquido por fiabilidad, consumo bajo, etiqueta favorable y público comprador amplio.",
  },
  {
    id: "premium-phev-suv",
    label: "SUV premium PHEV",
    keywords: ["x5", "45e", "glc", "300e", "300de", "q7", "tfsie", "phev"],
    liquidityScore: 84,
    expectedDaysToSell: 42,
    demand: "Alta",
    buyerPool: "Medio-alto",
    risk: "Medio",
    reason:
      "Alta demanda por etiqueta, imagen premium y uso familiar, pero exige precio correcto y buen historial.",
  },
  {
    id: "premium-diesel-auto",
    label: "Premium diésel automático",
    keywords: ["320d", "330d", "tdi", "diesel", "diésel", "automático"],
    liquidityScore: 76,
    expectedDaysToSell: 50,
    demand: "Media-alta",
    buyerPool: "Medio",
    risk: "Medio",
    reason:
      "Sigue teniendo salida entre compradores de muchos kilómetros, aunque depende de restricciones urbanas y precio.",
  },
  {
    id: "premium-compact",
    label: "Compacto premium",
    keywords: ["clase a", "a180", "a200", "serie 1", "a3", "golf"],
    liquidityScore: 82,
    expectedDaysToSell: 38,
    demand: "Alta",
    buyerPool: "Amplio",
    risk: "Bajo-medio",
    reason:
      "Alta rotación por precio de entrada a marca premium y público joven/profesional amplio.",
  },
  {
    id: "performance",
    label: "Performance premium",
    keywords: ["m3", "m4", "amg", "rs", "performance", "m competition"],
    liquidityScore: 48,
    expectedDaysToSell: 95,
    demand: "Selectiva",
    buyerPool: "Reducido",
    risk: "Alto",
    reason:
      "Puede tener margen, pero el comprador es muy específico y la rotación suele ser más lenta.",
  },
  {
    id: "high-luxury",
    label: "Lujo alto ticket",
    keywords: ["panamera", "range rover", "x7", "gle", "s class", "serie 7"],
    liquidityScore: 52,
    expectedDaysToSell: 85,
    demand: "Media",
    buyerPool: "Reducido",
    risk: "Medio-alto",
    reason:
      "Ticket alto, costes elevados y comprador final más limitado. Necesita margen de seguridad superior.",
  },
];

export function buildLiquidityProfile(input = {}) {
  const query = normalizeText(input.query || "");
  const item = input.item || {};
  const semantic = input.semantic || {};
  const price = toNumber(item.price || input.price, 0);

  const matchedProfiles = LIQUIDITY_PROFILES.filter((profile) =>
    profile.keywords.some((keyword) => query.includes(normalizeText(keyword)))
  );

  if (semantic.isPhev && semantic.isSuv) {
    matchedProfiles.push(findProfile("premium-phev-suv"));
  }

  if (semantic.isPerformance) {
    matchedProfiles.push(findProfile("performance"));
  }

  if (price >= 70000) {
    matchedProfiles.push(findProfile("high-luxury"));
  }

  const cleanProfiles = removeDuplicates(matchedProfiles).filter(Boolean);

  const mainProfile = cleanProfiles[0] || buildDefaultProfile(price);

  return {
    mainProfile,
    profiles: cleanProfiles.length > 0 ? cleanProfiles : [mainProfile],
    liquidityScore: mainProfile.liquidityScore,
    expectedDaysToSell: mainProfile.expectedDaysToSell,
    demand: mainProfile.demand,
    buyerPool: mainProfile.buyerPool,
    risk: mainProfile.risk,
    summary: buildLiquiditySummary(mainProfile),
  };
}

export function enrichDealsWithLiquidity(items = []) {
  return items.map((item) => {
    const query = `${item.title || ""} ${item.brand || ""} ${item.model || ""}`;

    return {
      ...item,
      liquidity: buildLiquidityProfile({
        query,
        item,
        semantic: item.semantic || {},
      }),
    };
  });
}

function buildDefaultProfile(price) {
  if (price >= 70000) {
    return {
      id: "default-high-ticket",
      label: "Vehículo alto ticket",
      liquidityScore: 50,
      expectedDaysToSell: 90,
      demand: "Media",
      buyerPool: "Reducido",
      risk: "Medio-alto",
      reason:
        "Sin señales claras de liquidez y con ticket alto, conviene asumir rotación lenta y exigir más margen.",
    };
  }

  return {
    id: "default",
    label: "Mercado general",
    liquidityScore: 64,
    expectedDaysToSell: 62,
    demand: "Media",
    buyerPool: "Medio",
    risk: "Medio",
    reason:
      "No hay suficientes señales para clasificar la liquidez con precisión. Conviene validar demanda real antes de priorizar.",
  };
}

function buildLiquiditySummary(profile) {
  return `${profile.label}: liquidez ${profile.liquidityScore}/100, venta estimada en ${profile.expectedDaysToSell} días, demanda ${profile.demand.toLowerCase()} y riesgo ${profile.risk.toLowerCase()}. ${profile.reason}`;
}

function findProfile(id) {
  return LIQUIDITY_PROFILES.find((profile) => profile.id === id);
}

function removeDuplicates(items) {
  const seen = new Set();

  return items.filter((item) => {
    if (!item || seen.has(item.id)) return false;

    seen.add(item.id);
    return true;
  });
}

function normalizeText(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function toNumber(value, fallback) {
  const parsed = Number(String(value).replace(/[^0-9.]/g, ""));

  return Number.isFinite(parsed) ? parsed : fallback;
}