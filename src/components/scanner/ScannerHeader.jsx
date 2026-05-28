export default function ScannerHeader() {
  return (
    <div style={headerStyle}>
      <p style={badgeStyle}>AI Automotive Opportunity Scanner</p>

      <h1 style={titleStyle}>Encuentra chollos reales en Europa</h1>

      <p style={subtitleStyle}>
        Escribe el vehículo que quieres comprar y pulsa buscar. El sistema
        prioriza oportunidades por margen neto, precio bajo mercado, liquidez,
        riesgo y probabilidad de venta rápida.
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