export default function DealDecisionPill({ action, label }) {
  return (
    <div
      style={{
        ...pillStyle,
        background: getBackground(action),
        color: getTextColor(action),
        border: `1px solid ${getBorderColor(action)}`,
      }}
    >
      {label}
    </div>
  );
}

export function getDecisionColor(action) {
  switch (action) {
    case "CONTACTAR_PRIMERO":
      return "rgba(34,197,94,0.45)";
    case "VIGILAR":
      return "rgba(59,130,246,0.40)";
    case "EVITAR":
      return "rgba(245,158,11,0.40)";
    case "DESCARTAR":
      return "rgba(239,68,68,0.45)";
    default:
      return "rgba(148,163,184,0.18)";
  }
}

function getBackground(action) {
  switch (action) {
    case "CONTACTAR_PRIMERO":
      return "rgba(34,197,94,0.12)";
    case "VIGILAR":
      return "rgba(59,130,246,0.12)";
    case "EVITAR":
      return "rgba(245,158,11,0.12)";
    case "DESCARTAR":
      return "rgba(239,68,68,0.12)";
    default:
      return "rgba(148,163,184,0.10)";
  }
}

function getTextColor(action) {
  switch (action) {
    case "CONTACTAR_PRIMERO":
      return "#86efac";
    case "VIGILAR":
      return "#93c5fd";
    case "EVITAR":
      return "#fbbf24";
    case "DESCARTAR":
      return "#fca5a5";
    default:
      return "#cbd5e1";
  }
}

function getBorderColor(action) {
  switch (action) {
    case "CONTACTAR_PRIMERO":
      return "rgba(34,197,94,0.35)";
    case "VIGILAR":
      return "rgba(59,130,246,0.35)";
    case "EVITAR":
      return "rgba(245,158,11,0.35)";
    case "DESCARTAR":
      return "rgba(239,68,68,0.35)";
    default:
      return "rgba(148,163,184,0.18)";
  }
}

const pillStyle = {
  marginTop: "18px",
  padding: "14px",
  borderRadius: "16px",
  fontWeight: "900",
  textAlign: "center",
};