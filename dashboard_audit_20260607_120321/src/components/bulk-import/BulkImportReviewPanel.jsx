export default function BulkImportReviewPanel({ simulation }) {
  if (!simulation) return null;

  const contaminationRisk = getContaminationRisk(simulation);
  const recommendation = getRecommendation(simulation, contaminationRisk);

  return (
    <div style={panelStyle}>
      <h2 style={titleStyle}>🛡️ Review final antes de importar</h2>

      <div style={gridStyle}>
        <ReviewMetric label="Simulados" value={simulation.totalSimulated} />
        <ReviewMetric label="Positivos" value={simulation.positiveRecords} />
        <ReviewMetric label="Negativos" value={simulation.negativeRecords} />
        <ReviewMetric label="Calidad media" value={`${simulation.averageQuality}/100`} />
        <ReviewMetric label="Riesgo" value={contaminationRisk} />
        <ReviewMetric label="Importar" value={simulation.canCreateMemory ? "Sí" : "No"} />
      </div>

      <p style={summaryStyle}>{recommendation}</p>

      <p style={warningStyle}>
        Esta revisión todavía no guarda nada en Supabase. Solo decide si la
        importación parece segura para memoria histórica.
      </p>
    </div>
  );
}

function ReviewMetric({ label, value }) {
  return (
    <div style={metricStyle}>
      <span style={metricLabelStyle}>{label}</span>
      <strong style={metricValueStyle}>{value}</strong>
    </div>
  );
}

function getContaminationRisk(simulation) {
  if (!simulation.canCreateMemory) return "Alto";
  if (simulation.averageQuality >= 90 && simulation.negativeRecords <= 1) {
    return "Bajo";
  }
  if (simulation.averageQuality >= 75) return "Medio";
  return "Alto";
}

function getRecommendation(simulation, contaminationRisk) {
  if (!simulation.canCreateMemory) {
    return "No se recomienda importar: la calidad media no es suficiente o no hay registros simulados.";
  }

  if (contaminationRisk === "Bajo") {
    return "Importación recomendable: los registros parecen aptos para memoria histórica con bajo riesgo de contaminación.";
  }

  if (contaminationRisk === "Medio") {
    return "Importación posible con cautela: conviene revisar los registros negativos antes de guardar.";
  }

  return "Importación no recomendable sin revisión manual adicional.";
}

const panelStyle = {
  padding: "20px",
  borderRadius: "22px",
  background: "rgba(250,204,21,0.12)",
  border: "1px solid rgba(250,204,21,0.28)",
  marginBottom: "28px",
};

const titleStyle = {
  fontSize: "18px",
  fontWeight: "900",
  marginBottom: "14px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
  gap: "10px",
  marginBottom: "16px",
};

const metricStyle = {
  padding: "10px",
  borderRadius: "14px",
  background: "rgba(2,6,23,0.48)",
};

const metricLabelStyle = {
  display: "block",
  color: "#fde68a",
  fontSize: "11px",
  marginBottom: "5px",
};

const metricValueStyle = {
  color: "#fef9c3",
  fontSize: "14px",
};

const summaryStyle = {
  color: "#fef9c3",
  fontWeight: "800",
  lineHeight: "1.5",
};

const warningStyle = {
  color: "#fde68a",
  margin: "10px 0 0 0",
  fontSize: "13px",
};