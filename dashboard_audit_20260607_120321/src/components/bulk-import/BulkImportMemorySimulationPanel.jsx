import BulkImportMiniMetric from "./BulkImportMiniMetric";

export default function BulkImportMemorySimulationPanel({
  simulation,
}) {
  if (!simulation) return null;

  return (
    <div style={panelStyle}>
      <h2 style={titleStyle}>🧠 Simulación de memoria</h2>

      <div style={gridStyle}>
        <BulkImportMiniMetric
          label="Records"
          value={simulation.totalSimulated}
        />
        <BulkImportMiniMetric
          label="Positive"
          value={simulation.positiveRecords}
        />
        <BulkImportMiniMetric
          label="Negative"
          value={simulation.negativeRecords}
        />
        <BulkImportMiniMetric
          label="Avg ROI"
          value={`${simulation.averageROI}%`}
        />
        <BulkImportMiniMetric
          label="Avg Profit"
          value={`${simulation.averageProfit} €`}
        />
        <BulkImportMiniMetric
          label="Avg Quality"
          value={`${simulation.averageQuality}/100`}
        />
      </div>

      <p style={summaryStyle}>{simulation.summary}</p>

      {simulation.insights?.map((item, index) => (
        <div key={`${item}-${index}`} style={insightStyle}>
          {item}
        </div>
      ))}

      <h3 style={subtitleStyle}>Registros simulados</h3>

      {simulation.memoryRecords?.map((item) => (
        <div key={item.id} style={recordStyle}>
          <strong>{item.title}</strong>

          <p style={metaStyle}>
            {item.brand} · {item.model} · {item.year} · {item.opportunityType}
          </p>

          <p style={metaStyle}>
            ROI {item.roi}% · Margen {item.profit} € · Quality{" "}
            {item.dataQualityScore}/100
          </p>

          <p style={statusStyle}>
            Market Memory: {item.shouldTrainMarketMemory ? "Sí" : "No"} ·
            Opportunity Training: {item.shouldTrainOpportunity ? "Sí" : "No"}
          </p>
        </div>
      ))}
    </div>
  );
}

const panelStyle = {
  padding: "20px",
  borderRadius: "22px",
  background: "rgba(59,130,246,0.14)",
  border: "1px solid rgba(96,165,250,0.25)",
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

const summaryStyle = {
  color: "#dbeafe",
  fontWeight: "800",
  lineHeight: "1.5",
};

const insightStyle = {
  padding: "12px 14px",
  borderRadius: "14px",
  background: "rgba(96,165,250,0.12)",
  border: "1px solid rgba(96,165,250,0.22)",
  marginBottom: "10px",
  color: "#bfdbfe",
};

const subtitleStyle = {
  fontSize: "15px",
  fontWeight: "900",
  margin: "18px 0 12px 0",
  color: "#dbeafe",
};

const recordStyle = {
  padding: "14px",
  borderRadius: "16px",
  background: "rgba(2,6,23,0.42)",
  border: "1px solid rgba(148,163,184,0.16)",
  marginBottom: "10px",
};

const metaStyle = {
  color: "#cbd5e1",
  margin: "6px 0 0 0",
  fontSize: "13px",
};

const statusStyle = {
  color: "#bfdbfe",
  margin: "8px 0 0 0",
  fontSize: "13px",
  fontWeight: "800",
};