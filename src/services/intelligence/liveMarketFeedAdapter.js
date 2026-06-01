export function buildLiveMarketFeedPreview({
  url = "",
  parsed = {},
  brand = "",
  model = "",
} = {}) {
  const hasBrand = Boolean(brand);
  const hasModel = Boolean(model);

  return {
    source: "live-market-feed-adapter",
    status: hasBrand && hasModel ? "ready_for_live_feed" : "insufficient_query",
    canGenerateCandidates: false,
    needsLiveMarketFeed: true,
    url,
    query: {
      brand,
      model,
      bodyType: parsed?.bodyType || "",
      fuelType: parsed?.fuelType || "",
      electrified: Boolean(parsed?.electrified),
    },
    candidates: [],
    message: buildMessage({ hasBrand, hasModel, brand, model }),
  };
}

function buildMessage({ hasBrand, hasModel, brand, model }) {
  if (hasBrand && hasModel) {
    return `${brand} ${model} detectado. Pendiente de feed real para generar candidatos.`;
  }

  if (hasBrand) {
    return `${brand} detectado, pero falta modelo. No se generan candidatos.`;
  }

  return "No se detecta marca ni modelo. No se generan candidatos.";
}