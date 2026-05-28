export default function LoadingScreen({
  title = "Cargando módulo IA...",
  text = "Preparando análisis avanzado...",
}) {
  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <div style={spinnerStyle} />

        <h2 style={titleStyle}>{title}</h2>

        <p style={textStyle}>{text}</p>
      </div>
    </div>
  );
}

const wrapperStyle = {
  minHeight: "60vh",
  display: "grid",
  placeItems: "center",
  color: "white",
};

const cardStyle = {
  width: "100%",
  maxWidth: "420px",
  padding: "34px",
  borderRadius: "28px",
  background: "rgba(15,23,42,0.78)",
  border: "1px solid rgba(148,163,184,0.18)",
  textAlign: "center",
};

const spinnerStyle = {
  width: "54px",
  height: "54px",
  margin: "0 auto 24px",
  borderRadius: "999px",
  border: "4px solid rgba(148,163,184,0.25)",
  borderTop: "4px solid #60a5fa",
  animation: "spin 1s linear infinite",
};

const titleStyle = {
  fontSize: "22px",
  fontWeight: "900",
};

const textStyle = {
  marginTop: "10px",
  color: "#cbd5e1",
  lineHeight: "1.6",
};