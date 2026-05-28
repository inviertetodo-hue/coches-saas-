import CarAnalysisCard from "./CarAnalysisCard";

export default function AnalysisGrid({
  analyses = [],
  onDelete,
}) {
  const safeAnalyses = Array.isArray(analyses)
    ? analyses
    : [];

  if (safeAnalyses.length === 0) {
    return (
      <div style={emptyStateStyle}>
        <div style={emptyIconStyle}>🚘</div>

        <h2 style={emptyTitleStyle}>
          No hay análisis para mostrar
        </h2>

        <p style={emptyTextStyle}>
          Cuando tengas coches válidos analizados,
          aparecerán aquí con su score, ROI,
          beneficio y calidad de datos.
        </p>
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>
            Analysis Results
          </p>

          <h2 style={titleStyle}>
            🚗 Vehículos analizados
          </h2>
        </div>

        <div style={countBadgeStyle}>
          {safeAnalyses.length} análisis
        </div>
      </div>

      <div style={gridStyle}>
        {safeAnalyses.map((item) => (
          <CarAnalysisCard
            key={item.id || item.title}
            item={item}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

const wrapperStyle = {
  marginTop: "28px",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  marginBottom: "22px",
};

const eyebrowStyle = {
  color: "#93c5fd",
  fontSize: "12px",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "1px",
  marginBottom: "8px",
};

const titleStyle = {
  fontSize: "30px",
  fontWeight: "900",
  margin: 0,
};

const countBadgeStyle = {
  padding: "10px 14px",
  borderRadius: "999px",
  background: "rgba(59,130,246,0.14)",
  border: "1px solid rgba(59,130,246,0.24)",
  color: "#bfdbfe",
  fontWeight: "900",
  fontSize: "13px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(360px, 1fr))",
  gap: "24px",
};

const emptyStateStyle = {
  marginTop: "28px",
  minHeight: "280px",
  borderRadius: "28px",
  padding: "34px",
  background: "rgba(15,23,42,0.78)",
  border: "1px solid rgba(148,163,184,0.16)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
};

const emptyIconStyle = {
  fontSize: "52px",
  marginBottom: "14px",
};

const emptyTitleStyle = {
  fontSize: "28px",
  fontWeight: "900",
  margin: 0,
  marginBottom: "12px",
};

const emptyTextStyle = {
  color: "#94a3b8",
  maxWidth: "520px",
  lineHeight: "1.6",
  margin: 0,
};