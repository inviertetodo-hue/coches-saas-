import { Badge } from "./DashboardBlocks";

export default function CarAnalysisCard({ item, onDelete }) {
  const quality = getDataQuality(item);
  const recommendation = getRecommendation(item.score);

  return (
    <div style={cardStyle}>
      <div style={topRowStyle}>
        <div
          style={{
            ...recommendationStyle,
            ...recommendation.style,
          }}
        >
          {recommendation.label}
        </div>

        <div style={scoreStyle}>
          <span style={scoreNumberStyle}>{item.score}</span>
          <span style={scoreTextStyle}>IA</span>
        </div>
      </div>

      <h2 style={titleCardStyle}>{item.title || "Vehículo IA"}</h2>

      <div style={qualityBoxStyle}>
        <div style={qualityHeaderStyle}>
          <strong>{quality.label}</strong>
          <span style={qualityScoreStyle}>{quality.score}/100</span>
        </div>

        {quality.warnings.length > 0 ? (
          <div style={warningListStyle}>
            {quality.warnings.map((warning) => (
              <div key={warning} style={warningStyle}>
                ⚠️ {warning}
              </div>
            ))}
          </div>
        ) : (
          <p style={cleanDataStyle}>
            Datos coherentes para lectura rápida.
          </p>
        )}
      </div>

      <div style={badgesGridStyle}>
        {item.brand && <Badge>🚘 {item.brand}</Badge>}
        {item.model && <Badge>📌 {item.model}</Badge>}
        {item.drivetrain && <Badge>🛞 {item.drivetrain}</Badge>}
        {item.fuel_type && <Badge>⚡ {item.fuel_type}</Badge>}
        {item.performance_package && (
          <Badge>🏁 {item.performance_package}</Badge>
        )}
      </div>

      <div style={infoGridStyle}>
        <div style={infoCardStyle}>
          <p style={labelStyle}>ROI</p>
          <p style={valueStyle}>{safeValue(item.roi)}%</p>
        </div>

        <div style={infoCardStyle}>
          <p style={labelStyle}>Beneficio</p>
          <p style={valueStyle}>{safeValue(item.profit)} €</p>
        </div>
      </div>

      <div style={decisionHintStyle}>
        {getDecisionHint(item)}
      </div>

      <button onClick={() => onDelete(item.id)} style={deleteButtonStyle}>
        Eliminar análisis
      </button>
    </div>
  );
}

function getRecommendation(score) {
  const numericScore = Number(score || 0);

  if (numericScore >= 85) {
    return {
      label: "🔥 CHOLLO IA",
      style: {
        background: "rgba(34,197,94,0.16)",
        border: "1px solid rgba(34,197,94,0.28)",
        color: "#bbf7d0",
      },
    };
  }

  if (numericScore >= 60) {
    return {
      label: "🟡 ANALIZAR",
      style: {
        background: "rgba(250,204,21,0.14)",
        border: "1px solid rgba(250,204,21,0.28)",
        color: "#fef3c7",
      },
    };
  }

  return {
    label: "🔴 DESCARTAR",
    style: {
      background: "rgba(239,68,68,0.16)",
      border: "1px solid rgba(239,68,68,0.28)",
      color: "#fecaca",
    },
  };
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

function getDecisionHint(item) {
  const score = Number(item.score || 0);
  const roi = Number(item.roi || 0);
  const profit = Number(item.profit || 0);

  if (score >= 85 && roi >= 15 && profit > 0) {
    return "Acción: revisar rápido documentación y costes reales.";
  }

  if (score >= 60) {
    return "Acción: comparar con alternativas antes de avanzar.";
  }

  return "Acción: no avanzar sin revisar datos y margen real.";
}

function safeValue(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.round(number);
}

const cardStyle = {
  background: "rgba(15,23,42,0.82)",
  borderRadius: "28px",
  padding: "24px",
  border: "1px solid rgba(148,163,184,0.14)",
};

const topRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "18px",
  marginBottom: "24px",
};

const recommendationStyle = {
  padding: "10px 14px",
  borderRadius: "999px",
  fontWeight: "900",
  fontSize: "13px",
  height: "fit-content",
};

const scoreStyle = {
  width: "74px",
  height: "74px",
  borderRadius: "999px",
  background:
    "linear-gradient(135deg, rgba(37,99,235,0.35), rgba(34,197,94,0.22))",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid rgba(147,197,253,0.24)",
};

const scoreNumberStyle = {
  fontSize: "28px",
  fontWeight: "900",
  lineHeight: "1",
};

const scoreTextStyle = {
  marginTop: "4px",
  fontSize: "11px",
  color: "#cbd5e1",
  fontWeight: "900",
};

const titleCardStyle = {
  fontSize: "24px",
  marginBottom: "18px",
  lineHeight: "1.25",
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

const cleanDataStyle = {
  marginTop: "10px",
  marginBottom: 0,
  color: "#94a3b8",
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
  border: "1px solid rgba(148,163,184,0.10)",
};

const labelStyle = {
  color: "#94a3b8",
  margin: 0,
  marginBottom: "8px",
};

const valueStyle = {
  fontSize: "24px",
  fontWeight: "900",
  margin: 0,
};

const decisionHintStyle = {
  marginTop: "16px",
  padding: "14px",
  borderRadius: "16px",
  background: "rgba(59,130,246,0.10)",
  border: "1px solid rgba(59,130,246,0.18)",
  color: "#bfdbfe",
  fontSize: "14px",
  fontWeight: "800",
  lineHeight: "1.5",
};

const deleteButtonStyle = {
  marginTop: "18px",
  width: "100%",
  padding: "14px",
  borderRadius: "14px",
  border: "1px solid rgba(239,68,68,0.22)",
  background: "rgba(239,68,68,0.12)",
  color: "#fca5a5",
  fontWeight: "900",
  cursor: "pointer",
};