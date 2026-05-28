import { Link } from "react-router-dom";

export default function AppSidebar() {
  return (
    <aside>
      <h1>🚘 Coches SaaS</h1>

      <p style={subtitleStyle}>AI Automotive Opportunity Platform</p>

      <nav style={navStyle}>
        <Link to="/scanner">🔎 Scanner IA</Link>

        <Link to="/importer">🔗 Importador IA</Link>

        <Link to="/history">📊 Inteligencia Mercado</Link>
      </nav>

      <div style={objectiveBoxStyle}>
        <p style={objectiveLabelStyle}>Objetivo</p>

        <p style={objectiveTextStyle}>
          Detectar los mejores coches disponibles en Europa para comprar mejor
          que el mercado.
        </p>
      </div>
    </aside>
  );
}

const subtitleStyle = {
  color: "#94a3b8",
  fontSize: "13px",
  lineHeight: "1.5",
  marginTop: "12px",
};

const navStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
  marginTop: "30px",
};

const objectiveBoxStyle = {
  marginTop: "40px",
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(59,130,246,0.10)",
  border: "1px solid rgba(59,130,246,0.18)",
};

const objectiveLabelStyle = {
  margin: 0,
  color: "#93c5fd",
  fontWeight: "900",
  fontSize: "13px",
};

const objectiveTextStyle = {
  marginTop: "10px",
  color: "#cbd5e1",
  lineHeight: "1.5",
  fontSize: "13px",
};