export default function InstantDecisionPanel({ decisions }) {
  const bestDeal = decisions?.decisions?.[0];

  if (!bestDeal) {
    return (
      <div style={emptyContainerStyle}>
        <p style={badgeStyle}>Instant Decision</p>

        <h2 style={emptyTitleStyle}>⚡ Esperando decisión IA</h2>

        <p style={emptyStyle}>
          Todavía no hay datos suficientes para tomar una decisión fiable.
        </p>
      </div>
    );
  }

  const decisionTone = getDecisionTone(bestDeal.decision);
  const reasons = Array.isArray(bestDeal.reasons)
    ? bestDeal.reasons.slice(0, 4)
    : bestDeal.reason
    ? [bestDeal.reason]
    : [];

  return (
    <div
      style={{
        ...containerStyle,
        ...decisionTone.container,
      }}
    >
      <div style={leftStyle}>
        <p style={badgeStyle}>Instant Decision</p>

        <h2 style={titleStyle}>
          {decisionTone.emoji} {decisionTone.label}
        </h2>

        <p style={subtitleStyle}>
          {bestDeal.title || "Vehículo IA"}
        </p>

        <div style={decisionBoxStyle}>
          <p style={decisionLabelStyle}>Decisión recomendada</p>
          <p style={decisionValueStyle}>{bestDeal.decision}</p>
        </div>

        <div style={actionBoxStyle}>
          <p style={actionLabelStyle}>Siguiente acción</p>

          <p style={actionValueStyle}>
            {bestDeal.nextAction || decisionTone.action}
          </p>
        </div>
      </div>

      <div style={rightStyle}>
        <div style={metricsGridStyle}>
          <Metric label="Score IA" value={`${bestDeal.score || 0}/100`} />
          <Metric label="ROI" value={`${bestDeal.roi || 0}%`} />
          <Metric label="Beneficio" value={`${bestDeal.profit || 0} €`} />
          <Metric label="Prioridad" value={bestDeal.priority || "-"} />
          <Metric label="Riesgo" value={bestDeal.riskLevel || "-"} />
          <Metric label="Liquidez" value={bestDeal.liquidityLevel || "-"} />
        </div>

        <div style={reasonsBoxStyle}>
          <p style={reasonsTitleStyle}>Por qué</p>

          {reasons.map((reason, index) => (
            <p key={index} style={reasonStyle}>
              ✓ {reason}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={metricCardStyle}>
      <p style={metricLabelStyle}>{label}</p>

      <h3 style={metricValueStyle}>{value}</h3>
    </div>
  );
}

function getDecisionTone(decision = "") {
  const normalized = String(decision).toLowerCase();

  if (normalized.includes("comprar")) {
    return {
      emoji: "🔥",
      label: "COMPRAR",
      action: "Contactar rápido, validar historial y preparar negociación.",
      container: {
        background:
          "linear-gradient(135deg, rgba(34,197,94,0.24), rgba(37,99,235,0.14))",
      },
    };
  }

  if (normalized.includes("negociar")) {
    return {
      emoji: "🟢",
      label: "NEGOCIAR",
      action: "Pedir más datos, revisar mantenimiento y negociar precio.",
      container: {
        background:
          "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(250,204,21,0.12))",
      },
    };
  }

  if (normalized.includes("vigilar")) {
    return {
      emoji: "🟡",
      label: "VIGILAR",
      action: "Guardar en seguimiento y esperar mejora de precio.",
      container: {
        background:
          "linear-gradient(135deg, rgba(250,204,21,0.18), rgba(37,99,235,0.12))",
      },
    };
  }

  if (normalized.includes("descartar")) {
    return {
      emoji: "🔴",
      label: "DESCARTAR",
      action: "No avanzar salvo bajada fuerte de precio o nueva información.",
      container: {
        background:
          "linear-gradient(135deg, rgba(239,68,68,0.24), rgba(15,23,42,0.72))",
      },
    };
  }

  return {
    emoji: "⚖️",
    label: "REVISAR",
    action: "Analizar con calma y comparar con alternativas similares.",
    container: {
      background:
        "linear-gradient(135deg, rgba(148,163,184,0.18), rgba(37,99,235,0.12))",
    },
  };
}

const containerStyle = {
  display: "grid",
  gridTemplateColumns: "1.05fr 1fr",
  gap: "24px",
  border: "1px solid rgba(148,163,184,0.18)",
  borderRadius: "32px",
  padding: "32px",
  marginBottom: "36px",
};

const emptyContainerStyle = {
  background: "rgba(15,23,42,0.78)",
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

const rightStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
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
  fontSize: "46px",
  fontWeight: "900",
  margin: 0,
  marginBottom: "10px",
  letterSpacing: "-0.04em",
};

const emptyTitleStyle = {
  fontSize: "34px",
  fontWeight: "900",
  margin: 0,
  marginBottom: "14px",
};

const subtitleStyle = {
  color: "#e5e7eb",
  fontSize: "18px",
  lineHeight: "1.5",
  margin: 0,
  fontWeight: "800",
};

const decisionBoxStyle = {
  marginTop: "22px",
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(2,6,23,0.45)",
  border: "1px solid rgba(148,163,184,0.14)",
};

const decisionLabelStyle = {
  color: "#94a3b8",
  fontSize: "13px",
  fontWeight: "800",
  margin: "0 0 8px 0",
};

const decisionValueStyle = {
  color: "white",
  fontSize: "22px",
  fontWeight: "900",
  margin: 0,
};

const actionBoxStyle = {
  marginTop: "14px",
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(2,6,23,0.45)",
  border: "1px solid rgba(148,163,184,0.14)",
};

const actionLabelStyle = {
  color: "#94a3b8",
  fontSize: "13px",
  fontWeight: "800",
  margin: "0 0 8px 0",
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
  border: "1px solid rgba(148,163,184,0.14)",
};

const metricLabelStyle = {
  color: "#94a3b8",
  fontSize: "13px",
  fontWeight: "800",
  margin: "0 0 8px 0",
};

const metricValueStyle = {
  fontSize: "24px",
  fontWeight: "900",
  margin: 0,
};

const reasonsBoxStyle = {
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(2,6,23,0.42)",
  border: "1px solid rgba(148,163,184,0.14)",
};

const reasonsTitleStyle = {
  margin: "0 0 10px 0",
  color: "#bfdbfe",
  fontWeight: "900",
};

const reasonStyle = {
  margin: "8px 0",
  color: "#e5e7eb",
  lineHeight: "1.45",
  fontWeight: "800",
};

const emptyStyle = {
  color: "#94a3b8",
  lineHeight: "1.6",
};