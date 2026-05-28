export default function DashboardHeader() {
  return (
    <div style={wrapperStyle}>
      <div style={backgroundGlowStyle} />

      <div style={headerStyle}>
        <div style={topRowStyle}>
          <p style={badgeStyle}>
            🚘 Coches SaaS · Executive Intelligence
          </p>

          <div style={statusStyle}>
            <span style={statusDotStyle} />

            System Stable
          </div>
        </div>

        <h1 style={titleStyle}>
          AI Opportunity Dashboard
        </h1>

        <p style={subtitleStyle}>
          Resumen ejecutivo, riesgo,
          aprendizaje IA, validación,
          oportunidades premium y portfolio
          estratégico para compraventa inteligente.
        </p>

        <div style={statsRowStyle}>
          <QuickStat
            label="Arquitectura"
            value="Estable"
          />

          <QuickStat
            label="Advanced IA"
            value="Activa"
          />

          <QuickStat
            label="Dataset"
            value="Protegido"
          />

          <QuickStat
            label="Frontend"
            value="Premium"
          />
        </div>
      </div>
    </div>
  );
}

function QuickStat({
  label,
  value,
}) {
  return (
    <div style={statCardStyle}>
      <p style={statLabelStyle}>
        {label}
      </p>

      <p style={statValueStyle}>
        {value}
      </p>
    </div>
  );
}

const wrapperStyle = {
  position: "relative",
  marginBottom: "42px",
};

const backgroundGlowStyle = {
  position: "absolute",
  inset: "-40px -20px auto -20px",
  height: "220px",
  background:
    "radial-gradient(circle at top left, rgba(59,130,246,0.22), transparent 70%)",
  pointerEvents: "none",
};

const headerStyle = {
  position: "relative",
  zIndex: 2,
};

const topRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "18px",
  marginBottom: "18px",
  flexWrap: "wrap",
};

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "10px",
  background: "rgba(59,130,246,0.16)",
  color: "#93c5fd",
  padding: "10px 16px",
  borderRadius: "999px",
  fontWeight: "900",
  border: "1px solid rgba(59,130,246,0.22)",
  margin: 0,
};

const statusStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 14px",
  borderRadius: "999px",
  background: "rgba(34,197,94,0.12)",
  border: "1px solid rgba(34,197,94,0.22)",
  color: "#bbf7d0",
  fontWeight: "900",
  fontSize: "13px",
};

const statusDotStyle = {
  width: "10px",
  height: "10px",
  borderRadius: "999px",
  background: "#22c55e",
  boxShadow:
    "0 0 12px rgba(34,197,94,0.8)",
};

const titleStyle = {
  fontSize: "56px",
  lineHeight: "1.05",
  fontWeight: "900",
  margin: 0,
  marginBottom: "18px",
  maxWidth: "900px",
};

const subtitleStyle = {
  color: "#cbd5e1",
  marginTop: 0,
  marginBottom: "28px",
  lineHeight: "1.7",
  fontSize: "17px",
  maxWidth: "900px",
};

const statsRowStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(180px,1fr))",
  gap: "16px",
};

const statCardStyle = {
  background: "rgba(15,23,42,0.72)",
  border: "1px solid rgba(148,163,184,0.14)",
  borderRadius: "20px",
  padding: "18px",
  backdropFilter: "blur(12px)",
};

const statLabelStyle = {
  color: "#94a3b8",
  fontSize: "13px",
  fontWeight: "800",
  margin: 0,
  marginBottom: "8px",
};

const statValueStyle = {
  color: "white",
  fontSize: "22px",
  fontWeight: "900",
  margin: 0,
};