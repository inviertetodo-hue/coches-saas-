import { Badge } from "./DashboardBlocks";

export default function CarAnalysisCard({
  item,
  onDelete,
}) {
  return (
    <div style={cardStyle}>
      <div style={topRowStyle}>
        <div style={recommendationStyle}>
          {getLabel(item.score)}
        </div>

        <div style={scoreStyle}>
          {item.score}
        </div>
      </div>

      <h2 style={titleCardStyle}>
        {item.title || "Vehículo IA"}
      </h2>

      <div style={badgesGridStyle}>
        {item.brand && (
          <Badge>🚘 {item.brand}</Badge>
        )}

        {item.drivetrain && (
          <Badge>🛞 {item.drivetrain}</Badge>
        )}

        {item.fuel_type && (
          <Badge>⚡ {item.fuel_type}</Badge>
        )}

        {item.performance_package && (
          <Badge>
            🏁 {item.performance_package}
          </Badge>
        )}
      </div>

      <div style={infoGridStyle}>
        <div style={infoCardStyle}>
          <p style={labelStyle}>ROI</p>
          <p style={valueStyle}>
            {item.roi}%
          </p>
        </div>

        <div style={infoCardStyle}>
          <p style={labelStyle}>
            Beneficio
          </p>
          <p style={valueStyle}>
            {item.profit} €
          </p>
        </div>
      </div>

      <button
        onClick={() => onDelete(item.id)}
        style={deleteButtonStyle}
      >
        Eliminar análisis
      </button>
    </div>
  );
}

function getLabel(score) {
  if (score >= 85) return "🔥 CHOLLO IA";
  if (score >= 60) return "🟡 ANALIZAR";
  return "🔴 DESCARTAR";
}

const cardStyle = {
  background: "rgba(15,23,42,0.82)",
  borderRadius: "28px",
  padding: "24px",
};

const topRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "24px",
};

const recommendationStyle = {
  padding: "10px 14px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.08)",
  fontWeight: "900",
};

const scoreStyle = {
  width: "72px",
  height: "72px",
  borderRadius: "999px",
  background:
    "linear-gradient(135deg, rgba(37,99,235,0.35), rgba(34,197,94,0.22))",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "28px",
  fontWeight: "900",
};

const titleCardStyle = {
  fontSize: "24px",
  marginBottom: "18px",
};

const badgesGridStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginBottom: "24px",
};

const infoGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "14px",
};

const infoCardStyle = {
  background: "rgba(2,6,23,0.75)",
  borderRadius: "18px",
  padding: "18px",
};

const labelStyle = {
  color: "#94a3b8",
};

const valueStyle = {
  fontSize: "24px",
  fontWeight: "900",
};

const deleteButtonStyle = {
  marginTop: "20px",
  width: "100%",
  padding: "14px",
  borderRadius: "14px",
  border: "none",
  background: "rgba(239,68,68,0.15)",
  color: "#fca5a5",
  fontWeight: "900",
};