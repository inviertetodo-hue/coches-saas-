export default function ScannerHeader() {
  return (
    <div style={headerStyle}>
      <p style={badgeStyle}>RADAR AUTOMÁTICO DE OPORTUNIDADES</p>

      <h1 style={titleStyle}>
        Encuentra oportunidades de compra antes que el mercado
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
  background: "rgba(34,197,94,0.12)",
  color: "#86efac",
  padding: "8px 14px",
  borderRadius: "999px",
  fontWeight: "900",
  marginBottom: "18px",
};

const titleStyle = {
  fontSize: "clamp(38px, 6vw, 62px)",
  margin: 0,
};

const subtitleStyle = {
  color: "#cbd5e1",
  marginTop: "16px",
  lineHeight: "1.7",
  maxWidth: "780px",
};