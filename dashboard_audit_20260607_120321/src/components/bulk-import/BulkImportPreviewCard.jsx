import BulkImportMiniMetric from "./BulkImportMiniMetric";

export default function BulkImportPreviewCard({ item }) {
  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>
        <div>
          <h3 style={cardTitleStyle}>{item.title}</h3>

          <p style={cardMetaStyle}>
            {item.brand || "Marca desconocida"} ·{" "}
            {item.model || "Modelo desconocido"} · {item.year || "Año sin dato"}
          </p>
        </div>

        <span style={qualityPillStyle}>
          {item.dataQualityLabel} · {item.dataQualityScore}/100
        </span>
      </div>

      <div style={miniGridStyle}>
        <BulkImportMiniMetric label="Precio" value={`${item.price || 0} €`} />
        <BulkImportMiniMetric label="Km" value={item.mileage || "-"} />
        <BulkImportMiniMetric label="ROI" value={`${item.roi || 0}%`} />
        <BulkImportMiniMetric label="Margen" value={`${item.profit || 0} €`} />
        <BulkImportMiniMetric
          label="Memory"
          value={item.memoryEligible ? "Eligible" : "No"}
        />
        <BulkImportMiniMetric
          label="Can Save"
          value={item.canSaveAnalysis ? "Sí" : "No"}
        />
      </div>

      <p style={summaryStyle}>{item.dataQualitySummary}</p>

      {item.dataQualityReasons?.length > 0 && (
        <div style={reasonsStyle}>
          {item.dataQualityReasons.slice(0, 3).map((reason, index) => (
            <p key={`${reason}-${index}`} style={reasonStyle}>
              ⚠️ {reason}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  padding: "18px",
  borderRadius: "20px",
  background:
    "linear-gradient(135deg, rgba(14,165,233,0.14), rgba(34,197,94,0.10))",
  border: "1px solid rgba(56,189,248,0.22)",
  marginBottom: "14px",
};

const cardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "14px",
  flexWrap: "wrap",
  marginBottom: "14px",
};

const cardTitleStyle = {
  margin: 0,
  fontSize: "19px",
};

const cardMetaStyle = {
  margin: "6px 0 0 0",
  color: "#94a3b8",
};

const qualityPillStyle = {
  padding: "7px 11px",
  borderRadius: "999px",
  background: "rgba(34,197,94,0.16)",
  border: "1px solid rgba(34,197,94,0.25)",
  color: "#bbf7d0",
  fontSize: "12px",
  fontWeight: "900",
};

const miniGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
  gap: "10px",
};

const summaryStyle = {
  color: "#e0f2fe",
  margin: "12px 0 0 0",
  lineHeight: "1.45",
  fontSize: "13px",
};

const reasonsStyle = {
  marginTop: "10px",
};

const reasonStyle = {
  color: "#fde68a",
  margin: "6px 0 0 0",
  fontSize: "12px",
};