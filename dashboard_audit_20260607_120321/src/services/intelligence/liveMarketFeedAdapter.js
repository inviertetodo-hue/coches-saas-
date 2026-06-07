export function buildLiveMarketFeedPreview({
  url = "",
  parsed = {},
  brand = "",
  model = "",
  source = "",
} = {}) {
  const normalizedBrand = normalizeText(brand);
  const normalizedModel = normalizeText(model);
  const hasBrand = Boolean(normalizedBrand);
  const hasModel = Boolean(normalizedModel);
  const sourceSite = source || detectSource(url);
  const feedStatus = buildFeedStatus({ hasBrand, hasModel });

  return {
    source: "live-market-feed-adapter",
    version: "11.2.0",
    status: feedStatus,
    canGenerateCandidates: false,
    needsLiveMarketFeed: true,
    isRealMarketData: false,
    url,
    sourceSite,
    query: {
      brand: brand || "",
      model: model || "",
      normalizedBrand,
      normalizedModel,
      bodyType: parsed?.bodyType || "",
      fuelType: parsed?.fuelType || "",
      electrified: Boolean(parsed?.electrified),
      title: parsed?.title || "",
    },
    candidates: [],
    diagnostics: buildDiagnostics({
      hasBrand,
      hasModel,
      feedStatus,
      sourceSite,
    }),
    message: buildMessage({
      hasBrand,
      hasModel,
      brand,
      model,
      feedStatus,
    }),
  };
}

function buildFeedStatus({ hasBrand, hasModel }) {
  if (hasBrand && hasModel) {
    return "ready_for_live_feed";
  }

  if (hasBrand) {
    return "missing_model";
  }

  return "insufficient_query";
}

function buildDiagnostics({ hasBrand, hasModel, feedStatus, sourceSite }) {
  const blockers = [];

  if (!hasBrand) {
    blockers.push("brand_missing");
  }

  if (!hasModel) {
    blockers.push("model_missing");
  }

  return {
    sourceSite,
    feedStatus,
    hasMinimumSearchQuery: hasBrand && hasModel,
    blockers,
    nextStep:
      hasBrand && hasModel
        ? "connect_live_market_provider"
        : "improve_url_parser_or_request_specific_model",
  };
}

function buildMessage({ hasBrand, hasModel, brand, model, feedStatus }) {
  if (feedStatus === "ready_for_live_feed") {
    return `${brand} ${model} detectado. El sistema está listo para pedir datos reales al feed de mercado.`;
  }

  if (hasBrand && !hasModel) {
    return `${brand} detectado, pero falta modelo. No se generan candidatos hasta tener una búsqueda más específica.`;
  }

  return "No se detecta marca ni modelo. No se generan candidatos para proteger la memoria.";
}

function detectSource(url) {
  const normalized = String(url || "").toLowerCase();

  if (normalized.includes("autoscout24")) return "autoscout24";
  if (normalized.includes("mobile.de")) return "mobile";
  return "unknown";
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
