export default function DecisionBadge({ action, label, large = false }) {
  return (
    <div
      style={{
        ...badgeStyle,
        background: getDecisionBackground(action),
        color: getDecisionTextColor(action),
        fontSize: large ? "18px" : "14px",
        padding: large ? "14px 20px" : "12px 16px",
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

function getDecisionBackground(action) {
  switch (action) {
    case "CONTACTAR_PRIMERO":
      return "rgba(34,197,94,0.14)";
    case "VIGILAR":
      return "rgba(59,130,246,0.14)";
    case "EVITAR":
      return "rgba(245,158,11,0.14)";
    case "DESCARTAR":
      return "rgba(239,68,68,0.14)";
    default:
      return "rgba(148,163,184,0.14)";
  }
}

function getDecisionTextColor(action) {
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

const badgeStyle = {
  display: "inline-block",
  borderRadius: "999px",
  fontWeight: "900",
  textAlign: "center",
};