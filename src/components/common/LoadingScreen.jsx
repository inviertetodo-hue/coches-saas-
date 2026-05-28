export default function LoadingScreen() {
  return <div style={centerBoxStyle}>Cargando inteligencia IA...</div>;
}

const centerBoxStyle = {
  minHeight: "60vh",
  display: "grid",
  placeItems: "center",
  color: "#cbd5e1",
  fontWeight: "900",
};