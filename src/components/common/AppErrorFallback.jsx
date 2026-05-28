import StatusPage from "./StatusPage";

export default function AppErrorFallback({ onReload }) {
  return (
    <StatusPage
      badge="Error"
      title="No se pudo cargar esta sección"
      text="La aplicación sigue protegida. Recarga la página para volver a intentar cargar el módulo."
      action={
        <button type="button" style={buttonStyle} onClick={onReload}>
          Recargar aplicación
        </button>
      }
    />
  );
}

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