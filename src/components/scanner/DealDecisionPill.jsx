export default function DealDecisionPill({ action, label }) {
  const normalizedAction = normalizeDecisionAction(action);

  return (
    <div
      style={{
        ...pillStyle,
        background: getBackground(normalizedAction),
        color: getTextColor(normalizedAction),
        border: `1px solid ${getBorderColor(normalizedAction)}`,
      }}
    >
      {label || getDefaultLabel(normalizedAction)}
    </div>
  );
}

export function getDecisionColor(action) {
  const normalizedAction = normalizeDecisionAction(action);

  switch (normalizedAction) {
    case "BUY":
      return "rgba(34,197,94,0.45)";
    case "WATCH":
      return "rgba(59,130,246,0.40)";
    case "REJECT":
      return "rgba(239,68,68,0.40)";
    default:
      return "rgba(148,163,184,0.18)";
  }
}

function getBackground(action) {
  switch (action) {
    case "BUY":
      return "rgba(34,197,94,0.12)";
    case "WATCH":
      return "rgba(59,130,246,0.12)";
    case "REJECT":
      return "rgba(239,68,68,0.12)";
    default:
      return "rgba(148,163,184,0.10)";
  }
}

function getTextColor(action) {
  switch (action) {
    case "BUY":
      return "#86efac";
    case "WATCH":
      return "#93c5fd";
    case "REJECT":
      return "#fca5a5";
    default:
      return "#cbd5e1";
  }
}

function getBorderColor(action) {
  switch (action) {
    case "BUY":
      return "rgba(34,197,94,0.35)";
    case "WATCH":
      return "rgba(59,130,246,0.35)";
    case "REJECT":
      return "rgba(239,68,68,0.35)";
    default:
      return "rgba(148,163,184,0.22)";
  }
}

function getDefaultLabel(action) {
  switch (action) {
    case "BUY":
      return "Comprar";
    case "WATCH":
      return "Validar oportunidad";
    case "REJECT":
      return "Descartar";
    default:
      return "Sin decisión";
  }
}

function normalizeDecisionAction(action) {
  const value = String(action || "").trim().toUpperCase();

  if (value === "BUY" || value === "COMPRAR" || value === "CONTACTAR_PRIMERO") {
    return "BUY";
  }

  if (
    value === "WATCH" ||
    value === "WATCHLIST" ||
    value === "VALIDAR" ||
    value === "VALIDAR_OPORTUNIDAD" ||
    value === "VIGILAR" ||
    value === "OBSERVAR" ||
    value === "OBSERVAR_MERCADO"
  ) {
    return "WATCH";
  }

  if (
    value === "REJECT" ||
    value === "DESCARTAR" ||
    value === "AVOID" ||
    value === "EVITAR"
  ) {
    return "REJECT";
  }

  return value || "NONE";
}

const pillStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "fit-content",
  padding: "7px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "900",
  letterSpacing: "0.02em",
};
