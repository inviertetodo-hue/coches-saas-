export default function BulkImportProtectedSavePanel({ savePlan }) {
  if (!savePlan) return null;

  return (
    <div style={panelStyle}>
      <h2 style={titleStyle}>🔒 Protected Memory Save</h2>

      <div style={gridStyle}>
        <Metric
          label="Candidatos"
          value={savePlan.totalCandidates}
        />

        <Metric
          label="Aceptados"
          value={savePlan.acceptedCount}
        />

        <Metric
          label="Bloqueados"
          value={savePlan.rejectedCount}
        />

        <Metric
          label="Puede guardar"
          value={savePlan.canSave ? "Sí" : "No"}
        />
      </div>

      <p style={summaryStyle}>
        {savePlan.summary}
      </p>

      {savePlan.insights.map((item, index) => (
        <div
          key={`${item}-${index}`}
          style={insightStyle}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={metricStyle}>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value}</div>
    </div>
  );
}

const panelStyle = {
  padding: "20px",
  borderRadius: "20px",
  background: "rgba(8,47,73,0.55)",
  border: "1px solid rgba(56,189,248,0.25)",
  marginBottom: "24px",
};

const titleStyle = {
  marginBottom: "16px",
  fontSize: "18px",
  fontWeight: "900",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: "12px",
  marginBottom: "16px",
};

const metricStyle = {
  padding: "14px",
  borderRadius: "14px",
  background: "rgba(15,23,42,0.5)",
};

const labelStyle = {
  color: "#94a3b8",
  fontSize: "12px",
  marginBottom: "6px",
};

const valueStyle = {
  color: "#f8fafc",
  fontWeight: "900",
  fontSize: "20px",
};

const summaryStyle = {
  color: "#e0f2fe",
  marginBottom: "12px",
};

const insightStyle = {
  color: "#bae6fd",
  marginBottom: "8px",
};