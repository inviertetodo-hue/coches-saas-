export default function ScannerHeader() {
  return (
    <div style={headerStyle}>
      <p style={badgeStyle}>🚀 Radar automático de oportunidades</p>

      <h1 style={titleStyle}>
        Encuentra oportunidades de compra{" "}
        <span style={highlightStyle}>antes que el mercado</span>
      </h1>

      <p style={subtitleStyle}>
        Define el vehículo que buscas y el sistema analizará el mercado para
        detectar, valorar y priorizar las mejores oportunidades disponibles.
        Cada resultado incluye valoración, potencial de oportunidad, riesgo y
        recomendación de decisión.
      </p>
    </div>
  );
}

const headerStyle = {
  marginBottom: "36px",
};

const badgeStyle = {
  display: "inline-block",
  background:
    "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(34,211,238,0.12))",
  border: "1px solid rgba(139,92,246,0.30)",
  color: "#ddd6fe",
  padding: "8px 16px",
  borderRadius: "999px",
  fontWeight: "700",
  fontSize: "13px",
  letterSpacing: "0.02em",
  marginBottom: "20px",
};

const titleStyle = {
  fontSize: "clamp(32px, 5.5vw, 58px)",
  lineHeight: 1.15,
  letterSpacing: "-0.01em",
  margin: 0,
};

const highlightStyle = {
  backgroundImage:
    "linear-gradient(135deg, #8b5cf6 0%, #6366f1 45%, #22d3ee 100%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
};

const subtitleStyle = {
  color: "#cbd5e1",
  marginTop: "16px",
  lineHeight: "1.7",
  maxWidth: "780px",
};