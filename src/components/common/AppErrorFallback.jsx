export default function AppErrorFallback({ onReload }) {
  return (
    <div style={errorBoxStyle}>
      <h2 style={errorTitleStyle}>No se pudo cargar esta sección</h2>

      <p style={errorTextStyle}>
        La aplicación sigue protegida. Recarga la página para volver a intentar
        cargar el módulo.
      </p>

      <button type="button" style={buttonStyle} onClick={onReload}>
        Recargar aplicación
      </button>
    </div>
  );
}

const errorBoxStyle = {
  minHeight: "60vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  padding: "32px",
  color: "white",
};

const errorTitleStyle = {
  fontSize: "28px",
  marginBottom: "12px",
};

const errorTextStyle = {
  color: "#cbd5e1",
  lineHeight: "1.6",
  maxWidth: "520px",
};

const buttonStyle = {
  marginTop: "18px",
  padding: "12px 18px",
  borderRadius: "14px",
  border: "1px solid rgba(59,130,246,0.35)",
  background: "rgba(59,130,246,0.18)",
  color: "#dbeafe",
  fontWeight: "900",
  cursor: "pointer",
};