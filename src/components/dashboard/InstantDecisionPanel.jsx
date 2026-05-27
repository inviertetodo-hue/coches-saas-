export default function InstantDecisionPanel({
  decisions,
}) {
  const bestDeal = decisions?.decisions?.[0];

  if (!bestDeal) {
    return (
      <div style={containerStyle}>
        <h2 style={titleStyle}>⚡ Instant AI Decision</h2>
        <p style={emptyStyle}>
          Todavía no hay datos suficientes para tomar una decisión IA.
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={leftStyle}>
        <p style={badgeStyle}>Instant Decision</p>

        <h2 style={titleStyle}>
          {bestDeal.decision}
        </h2>

        <p style={subtitleStyle}>
          {bestDeal.reason}
        </p>
      </div>

      <div style={metricsGridStyle}>
        <Metric label="Score IA" value={bestDeal.score} />
        <Metric label="ROI" value={`${bestDeal.roi}%`} />
        <Metric label="Beneficio" value={`${bestDeal.profit} €`} />
        <Metric label="Riesgo" value={bestDeal.priority} />
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

const containerStyle = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr",
  gap: "24px",
  background:
    "linear-gradient(135deg, rgba(37,99,235,0.22), rgba(34,197,94,0.14))",
  border: "1px solid rgba(148,163,184,0.18)",
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

const subtitleStyle = {
  color: "#cbd5e1",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: 0,
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
  marginBottom: "8px",
};

const metricValueStyle = {
  fontSize: "24px",
  fontWeight: "900",
  margin: 0,
};

const emptyStyle = {
  color: "#94a3b8",
};