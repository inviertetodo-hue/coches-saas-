import { useMemo, useState } from "react";
import CarAnalysisCard from "./CarAnalysisCard";

const INITIAL_VISIBLE_COUNT = 12;
const LOAD_MORE_STEP = 12;

export default function AnalysisGrid({
  analyses = [],
  onDelete,
}) {
  const [visibleCount, setVisibleCount] = useState(
    INITIAL_VISIBLE_COUNT
  );

  const safeAnalyses = Array.isArray(analyses)
    ? analyses
    : [];

  const visibleAnalyses = useMemo(() => {
    return safeAnalyses.slice(0, visibleCount);
  }, [safeAnalyses, visibleCount]);

  const hiddenCount = Math.max(
    0,
    safeAnalyses.length - visibleAnalyses.length
  );

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
          {visibleAnalyses.length}/{safeAnalyses.length} visibles
        </div>
      </div>

      {safeAnalyses.length > INITIAL_VISIBLE_COUNT && (
        <div style={performanceNoticeStyle}>
          Vista optimizada: se muestran los primeros{" "}
          {visibleAnalyses.length} análisis para mantener el dashboard rápido.
        </div>
      )}

      <div style={gridStyle}>
        {visibleAnalyses.map((item) => (
          <CarAnalysisCard
            key={getAnalysisKey(item)}
            item={item}
            onDelete={onDelete}
          />
        ))}
      </div>

      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() =>
            setVisibleCount((current) =>
              current + LOAD_MORE_STEP
            )
          }
          style={loadMoreButtonStyle}
        >
          Ver {Math.min(LOAD_MORE_STEP, hiddenCount)} más · quedan{" "}
          {hiddenCount}
        </button>
      )}
    </div>
  );
}

function getAnalysisKey(item = {}) {
  return (
    item.id ||
    item.url ||
    `${item.title || "vehicle"}-${item.price || item.score || "unknown"}`
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

const performanceNoticeStyle = {
  marginBottom: "20px",
  padding: "14px 16px",
  borderRadius: "18px",
  background: "rgba(15,23,42,0.72)",
  border: "1px solid rgba(148,163,184,0.14)",
  color: "#cbd5e1",
  fontSize: "14px",
  fontWeight: "700",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(360px, 1fr))",
  gap: "24px",
};

const loadMoreButtonStyle = {
  marginTop: "26px",
  width: "100%",
  padding: "16px",
  borderRadius: "18px",
  border: "1px solid rgba(59,130,246,0.28)",
  background: "rgba(59,130,246,0.14)",
  color: "#bfdbfe",
  fontWeight: "900",
  cursor: "pointer",
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