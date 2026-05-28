export default function InstantDecisionPanel({
  decisions,
}) {
  const bestDeal = decisions?.decisions?.[0];

  if (!bestDeal) {
    return (
      <div style={emptyContainerStyle}>
        <p style={badgeStyle}>
          Instant Decision
        </p>

        <h2 style={emptyTitleStyle}>
          ⚡ Esperando decisión IA
        </h2>

        <p style={emptyStyle}>
          Todavía no hay datos suficientes para tomar una decisión fiable.
        </p>
      </div>
    );
  }

  const decisionTone = getDecisionTone(
    bestDeal.decision
  );

  return (
    <div
      style={{
        ...containerStyle,
        ...decisionTone.container,
      }}
    >
      <div style={leftStyle}>
        <p style={badgeStyle}>
          Instant Decision
        </p>

        <h2 style={titleStyle}>
          {decisionTone.emoji}{" "}
          {bestDeal.decision}
        </h2>

        <p style={subtitleStyle}>
          {bestDeal.reason}
        </p>

        <div style={actionBoxStyle}>
          <p style={actionLabelStyle}>
            Acción recomendada
          </p>

          <p style={actionValueStyle}>
            {decisionTone.action}
          </p>
        </div>
      </div>

      <div style={metricsGridStyle}>
        <Metric
          label="Score IA"
          value={bestDeal.score}
        />

        <Metric
          label="ROI"
          value={`${bestDeal.roi}%`}
        />

        <Metric
          label="Beneficio"
          value={`${bestDeal.profit} €`}
        />

        <Metric
          label="Prioridad"
          value={bestDeal.priority}
        />
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={metricCardStyle}>
      <p style={metricLabelStyle}>
        {label}
      </p>

      <h3 style={metricValueStyle}>
        {value}
      </h3>
    </div>
  );
}

function getDecisionTone(decision = "") {
  const normalized = String(decision)
    .toLowerCase();

  if (
    normalized.includes("comprar") ||
    normalized.includes("chollo") ||
    normalized.includes("alta")
  ) {
    return {
      emoji: "🔥",
      action:
        "Revisar documentación, costes reales y contactar rápido.",
      container: {
        background:
          "linear-gradient(135deg, rgba(34,197,94,0.22), rgba(37,99,235,0.14))",
      },
    };
  }

  if (
    normalized.includes("descartar") ||
    normalized.includes("evitar") ||
    normalized.includes("riesgo")
  ) {
    return {
      emoji: "⛔",
      action:
        "No avanzar sin revisar precio, kilometraje, historial y margen real.",
      container: {
        background:
          "linear-gradient(135deg, rgba(239,68,68,0.24), rgba(15,23,42,0.72))",
      },
    };
  }

  return {
    emoji: "🟡",
    action:
      "Analizar con calma y comparar con alternativas similares.",
    container: {
      background:
        "linear-gradient(135deg, rgba(250,204,21,0.18), rgba(37,99,235,0.12))",
    },
  };
}

const containerStyle = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr",
  gap: "24px",
  border: "1px solid rgba(148,163,184,0.18)",
  borderRadius: "32px",
  padding: "32px",
  marginBottom: "36px",
};

const emptyContainerStyle = {
  background:
    "rgba(15,23,42,0.78)",
  border: "1px solid rgba(148,163,184,0.16)",
  borderRadius: "32px",
  padding: "32px",
  marginBottom: "36px",
};

const leftStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const badgeStyle = {
  display: "inline-block",
  width: "fit-content",
  background: "rgba(255,255,255,0.08)",
  color: "#bfdbfe",
  padding: "8px 14px",
  borderRadius: "999px",
  fontWeight: "900",
  marginBottom: "16px",
};

const titleStyle = {
  fontSize: "42px",
  fontWeight: "900",
  margin: 0,
  marginBottom: "14px",
};

const emptyTitleStyle = {
  fontSize: "34px",
  fontWeight: "900",
  margin: 0,
  marginBottom: "14px",
};

const subtitleStyle = {
  color: "#cbd5e1",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: 0,
};

const actionBoxStyle = {
  marginTop: "22px",
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(2,6,23,0.45)",
  border:
    "1px solid rgba(148,163,184,0.14)",
};

const actionLabelStyle = {
  color: "#94a3b8",
  fontSize: "13px",
  fontWeight: "800",
  marginBottom: "8px",
};

const actionValueStyle = {
  color: "white",
  fontSize: "17px",
  fontWeight: "900",
  margin: 0,
  lineHeight: "1.5",
};

const metricsGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "14px",
};

const metricCardStyle = {
  background: "rgba(15,23,42,0.72)",
  borderRadius: "20px",
  padding: "18px",
  border:
    "1px solid rgba(148,163,184,0.14)",
};

const metricLabelStyle = {
  color: "#94a3b8",
  fontSize: "13px",
  fontWeight: "800",
  marginBottom: "8px",
};

const metricValueStyle = {
  fontSize: "24px",
  fontWeight: "900",
  margin: 0,
};

const emptyStyle = {
  color: "#94a3b8",
  lineHeight: "1.6",
};