import { Link } from "react-router-dom";

import { ROUTE_PATHS } from "../config/routePaths";

export default function NotFound() {
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <p style={badgeStyle}>404</p>

        <h1 style={titleStyle}>Página no encontrada</h1>

        <p style={textStyle}>
          Esta sección no existe o todavía no está disponible en Coches SaaS.
        </p>

        <Link to={ROUTE_PATHS.scanner} style={buttonStyle}>
          Volver al Scanner IA
        </Link>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "70vh",
  display: "grid",
  placeItems: "center",
  color: "white",
  padding: "40px",
};

const cardStyle = {
  maxWidth: "560px",
  padding: "34px",
  borderRadius: "28px",
  background: "rgba(15,23,42,0.82)",
  border: "1px solid rgba(148,163,184,0.18)",
  textAlign: "center",
};

const badgeStyle = {
  color: "#93c5fd",
  fontWeight: "900",
  fontSize: "15px",
  marginBottom: "10px",
};

const titleStyle = {
  fontSize: "34px",
  marginBottom: "12px",
};

const textStyle = {
  color: "#cbd5e1",
  lineHeight: "1.6",
  marginBottom: "24px",
};

const buttonStyle = {
  display: "inline-block",
  padding: "13px 18px",
  borderRadius: "16px",
  background: "rgba(59,130,246,0.18)",
  border: "1px solid rgba(59,130,246,0.35)",
  color: "#dbeafe",
  fontWeight: "900",
  textDecoration: "none",
};