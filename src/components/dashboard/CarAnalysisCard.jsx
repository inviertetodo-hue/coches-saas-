import { Badge } from "./DashboardBlocks";

export default function CarAnalysisCard({ item, onDelete }) {
  const quality = getDataQuality(item);

  return (
    <div style={cardStyle}>
      <div style={topRowStyle}>
        <div style={recommendationStyle}>{getLabel(item.score)}</div>

        <div style={scoreStyle}>{item.score}</div>
      </div>

      <h2 style={titleCardStyle}>{item.title || "Vehículo IA"}</h2>

      <div style={qualityBoxStyle}>
        <div style={qualityHeaderStyle}>
          <strong>{quality.label}</strong>
          <span style={qualityScoreStyle}>{quality.score}/100</span>
        </div>

        {quality.warnings.length > 0 && (
          <div style={warningListStyle}>
            {quality.warnings.map((warning) => (
              <div key={warning} style={warningStyle}>
                ⚠️ {warning}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={badgesGridStyle}>
        {item.brand && <Badge>🚘 {item.brand}</Badge>}
        {item.drivetrain && <Badge>🛞 {item.drivetrain}</Badge>}
        {item.fuel_type && <Badge>⚡ {item.fuel_type}</Badge>}
        {item.performance_package && (
          <Badge>🏁 {item.performance_package}</Badge>
        )}
      </div>

      <div style={infoGridStyle}>
        <div style={infoCardStyle}>
          <p style={labelStyle}>ROI</p>
          <p style={valueStyle}>{item.roi}%</p>
        </div>

        <div style={infoCardStyle}>
          <p style={labelStyle}>Beneficio</p>
          <p style={valueStyle}>{item.profit} €</p>
        </div>
      </div>

      <button onClick={() => onDelete(item.id)} style={deleteButtonStyle}>
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

function getDataQuality(item) {
  const warnings = [];
  let score = 100;

  if (!item.title) {
    warnings.push("Falta título del vehículo");
    score -= 15;
  }

  if (!item.brand) {
    warnings.push("Falta marca detectada");
    score -= 15;
  }

  if (!Number.isFinite(Number(item.score))) {
    warnings.push("Score IA no válido");
    score -= 30;
  }

  if (!Number.isFinite(Number(item.roi))) {
    warnings.push("ROI no válido");
    score -= 20;
  }

  if (!Number.isFinite(Number(item.profit))) {
    warnings.push("Beneficio no válido");
    score -= 20;
  }

  if (Number(item.score) >= 85 && Number(item.roi) <= 0) {
    warnings.push("Score alto con ROI bajo o negativo");
    score -= 20;
  }

  if (Number(item.profit) < 0 && Number(item.score) >= 60) {
    warnings.push("Beneficio negativo con recomendación positiva");
    score -= 20;
  }

  const finalScore = Math.max(0, score);

  if (finalScore >= 85) {
    return {
      label: "✅ Datos fiables",
      score: finalScore,
      warnings,
    };
  }

  if (finalScore >= 60) {
    return {
      label: "🟡 Revisar datos",
      score: finalScore,
      warnings,
    };
  }

  return {
    label: "🔴 Datos débiles",
    score: finalScore,
    warnings,
  };
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

const qualityBoxStyle = {
  marginBottom: "20px",
  padding: "14px",
  borderRadius: "18px",
  background: "rgba(2,6,23,0.72)",
  border: "1px solid rgba(148,163,184,0.18)",
};

const qualityHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  color: "#e5e7eb",
  fontSize: "14px",
};

const qualityScoreStyle = {
  color: "#93c5fd",
  fontWeight: "900",
};

const warningListStyle = {
  marginTop: "10px",
  display: "grid",
  gap: "6px",
};

const warningStyle = {
  color: "#fde68a",
  fontSize: "13px",
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