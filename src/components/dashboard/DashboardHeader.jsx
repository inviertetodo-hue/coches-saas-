export default function DashboardHeader() {
  return (
    <div style={headerStyle}>
      <p style={badgeStyle}>
        Coches SaaS · Executive Intelligence
      </p>

      <h1 style={titleStyle}>
        AI Opportunity Dashboard
      </h1>

      <p style={subtitleStyle}>
        Resumen ejecutivo, riesgo,
        aprendizaje IA, estabilidad,
        tendencias y portfolio estratégico.
      </p>
    </div>
  );
}

const headerStyle = {
  marginBottom: "40px",
};

const badgeStyle = {
  display: "inline-block",
  background: "rgba(59,130,246,0.18)",
  color: "#93c5fd",
  padding: "8px 14px",
  borderRadius: "999px",
  fontWeight: "700",
  marginBottom: "18px",
};

const titleStyle = {
  fontSize: "52px",
  margin: 0,
};

const subtitleStyle = {
  color: "#cbd5e1",
  marginTop: "14px",
  lineHeight: "1.6",
};