export default function AdvancedIntelligencePanel({
  children,
}) {
  return (
    <details style={containerStyle}>
      <summary style={summaryStyle}>
        <div>
          <p style={eyebrowStyle}>
            Advanced Intelligence
          </p>

          <h2 style={titleStyle}>
            Abrir análisis avanzado IA
          </h2>

          <p style={subtitleStyle}>
            Radar, ranking, pipeline, watchlist, portfolio, métricas e insights.
          </p>
        </div>

        <span style={badgeStyle}>
          PRO
        </span>
      </summary>

      <div style={contentStyle}>
        {children}
      </div>
    </details>
  );
}

const containerStyle = {
  marginBottom: "40px",
  background: "rgba(15,23,42,0.72)",
  border: "1px solid rgba(148,163,184,0.18)",
  borderRadius: "28px",
  overflow: "hidden",
};

const summaryStyle = {
  cursor: "pointer",
  listStyle: "none",
  padding: "28px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "18px",
};

const eyebrowStyle = {
  color: "#93c5fd",
  fontSize: "13px",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: "8px",
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "900",
  margin: 0,
  marginBottom: "8px",
};

const subtitleStyle = {
  color: "#94a3b8",
  margin: 0,
  lineHeight: "1.5",
};

const badgeStyle = {
  background: "rgba(37,99,235,0.22)",
  color: "#bfdbfe",
  padding: "10px 14px",
  borderRadius: "999px",
  fontWeight: "900",
  border: "1px solid rgba(59,130,246,0.35)",
};

const contentStyle = {
  padding: "0 28px 28px",
};