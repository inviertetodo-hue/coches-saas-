// src/services/decisionBadgeTheme.js

export const getDecisionTheme = (action = "") => {
  const normalized = String(action).toUpperCase();

  if (normalized.includes("CONTACTAR")) {
    return {
      background: "rgba(34,197,94,0.18)",
      border: "1px solid rgba(34,197,94,0.35)",
      color: "#86efac",
    };
  }

  if (normalized.includes("VIGILAR")) {
    return {
      background: "rgba(59,130,246,0.16)",
      border: "1px solid rgba(59,130,246,0.32)",
      color: "#93c5fd",
    };
  }

  if (normalized.includes("EVITAR")) {
    return {
      background: "rgba(245,158,11,0.16)",
      border: "1px solid rgba(245,158,11,0.32)",
      color: "#fcd34d",
    };
  }

  if (normalized.includes("DESCARTAR")) {
    return {
      background: "rgba(239,68,68,0.16)",
      border: "1px solid rgba(239,68,68,0.32)",
      color: "#fca5a5",
    };
  }

  return {
    background: "rgba(148,163,184,0.16)",
    border: "1px solid rgba(148,163,184,0.28)",
    color: "#cbd5e1",
  };
};