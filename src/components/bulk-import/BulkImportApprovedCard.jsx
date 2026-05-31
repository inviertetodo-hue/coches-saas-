import BulkImportMiniMetric from "./BulkImportMiniMetric";

export default function BulkImportApprovedCard({ item }) {
  return (
    <div style={approvedCardStyle}>
      <div style={cardHeaderStyle}>
        <div>
          <h3 style={cardTitleStyle}>{item.title}</h3>

          <p style={cardMetaStyle}>
            {item.brand || "Marca desconocida"} ·{" "}
            {item.model || "Modelo desconocido"} · {item.year || "Año sin dato"}
          </p>
        </div>

        <span style={approvedPillStyle}>
          {item.dataQualityLabel} · {item.dataQualityScore}/100
        </span>
      </div>

      <div style={miniGridStyle}>
        <BulkImportMiniMetric label="Precio" value={`${item.price || 0} €`} />
        <BulkImportMiniMetric label="Km" value={item.mileage || "-"} />
        <BulkImportMiniMetric label="ROI" value={`${item.roi || 0}%`} />
        <BulkImportMiniMetric label="Margen" value={`${item.profit || 0} €`} />
        <BulkImportMiniMetric label="Estado" value={item.importStatus} />
        <BulkImportMiniMetric label="Memoria" value="Aprobado" />
      </div>

      <p style={approvedTextStyle}>
        Este candidato puede pasar a memoria histórica porque supera el filtro
        de calidad. Si tiene ROI negativo, se guarda como dato fiable de mercado,
        no como oportunidad de compra.
      </p>
    </div>
  );
}

const approvedCardStyle = {
  padding: "18px",
  borderRadius: "20px",
  background:
    "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(14,165,233,0.10))",
  border: "1px solid rgba(34,197,94,0.28)",
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

const approvedPillStyle = {
  padding: "7px 11px",
  borderRadius: "999px",
  background: "rgba(34,197,94,0.22)",
  border: "1px solid rgba(34,197,94,0.32)",
  color: "#dcfce7",
  fontSize: "12px",
  fontWeight: "900",
};

const miniGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
  gap: "10px",
};

const approvedTextStyle = {
  color: "#dcfce7",
  margin: "12px 0 0 0",
  lineHeight: "1.45",
  fontSize: "13px",
};