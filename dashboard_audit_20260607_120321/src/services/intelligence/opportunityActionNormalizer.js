export const OPPORTUNITY_ACTIONS = {
  BUY: "BUY",
  WATCH: "WATCH",
  REJECT: "REJECT",
};

export function normalizeOpportunityAction(value) {
  const normalized = String(value || "")
    .trim()
    .toUpperCase();

  if (normalized === "STRONG_BUY") {
    return OPPORTUNITY_ACTIONS.BUY;
  }

  if (normalized === "BUY") {
    return OPPORTUNITY_ACTIONS.BUY;
  }

  if (normalized === "WATCHLIST") {
    return OPPORTUNITY_ACTIONS.WATCH;
  }

  if (normalized === "WATCH") {
    return OPPORTUNITY_ACTIONS.WATCH;
  }

  if (normalized === "AVOID") {
    return OPPORTUNITY_ACTIONS.REJECT;
  }

  if (normalized === "REJECT") {
    return OPPORTUNITY_ACTIONS.REJECT;
  }

  return OPPORTUNITY_ACTIONS.WATCH;
}

export function getOpportunityActionLabel(value) {
  const action = normalizeOpportunityAction(value);

  if (action === OPPORTUNITY_ACTIONS.BUY) {
    return "Comprar";
  }

  if (action === OPPORTUNITY_ACTIONS.REJECT) {
    return "Descartar";
  }

  return "Vigilar";
}

export function isBuyAction(value) {
  return normalizeOpportunityAction(value) === OPPORTUNITY_ACTIONS.BUY;
}

export function isWatchAction(value) {
  return normalizeOpportunityAction(value) === OPPORTUNITY_ACTIONS.WATCH;
}

export function isRejectAction(value) {
  return normalizeOpportunityAction(value) === OPPORTUNITY_ACTIONS.REJECT;
}