export default function BulkImportMemoryExplorerPanel({ records = [] }) {
  if (!Array.isArray(records) || records.length === 0) return null;

  const brands = [...new Set(records.map((item) => item.brand).filter(Boolean))];
  const models = [
    ...new Set(
      records
        .map((item) => `${item.brand || ""} ${item.model || ""}`.trim())
        .filter(Boolean)
    ),
  ];

  return (
    <div style={panelStyle}>
      <h2 style={titleStyle}>🧭 Memory Explorer</h2>

      <div style={gridStyle}>
        <Metric label="Registros" value={records.length} />
        <Metric label="Marcas" value={brands.length} />
        <Metric label="Modelos" value={models.length} />
      </div>

      <h3 style={subtitleStyle}>Últimos registros guardados</h3>

      {records.slice(-5).reverse().map((item) => (
        <div key={item.id} style={recordStyle}>
          <strong>{item.title}</strong>
          <p style={metaStyle}>
            {item.brand} · {item.model} · {item.year} · ROI {item.roi}% · Margen{" "}
            {item.profit} €
          </p>
          <p style={metaStyle}>
            Guardado: {formatDate(item.savedAt)}
          </p>
        </div>
      ))}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={metricStyle}>
      <span style={metricLabelStyle}>{label}</span>
      <strong style={metricValueStyle}>{value}</strong>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("es-ES");
}

const panelStyle = {
  padding: "20px",
  borderRadius: "22px",
  background: "rgba(168,85,247,0.12)",
  border: "1px solid rgba(168,85,247,0.25)",
  marginBottom: "28px",
};

const titleStyle = {
  fontSize: "18px",
  fontWeight: "900",
  marginBottom: "14px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
  gap: "12px",
  marginBottom: "16px",
};

const metricStyle = {
  padding: "12px",
  borderRadius: "14px",
  background: "rgba(15,23,42,0.52)",
};

const metricLabelStyle = {
  display: "block",
  color: "#ddd6fe",
  fontSize: "12px",
  marginBottom: "6px",
};

const metricValueStyle = {
  color: "#f5f3ff",
  fontSize: "20px",
};

const subtitleStyle = {
  fontSize: "15px",
  fontWeight: "900",
  margin: "18px 0 12px 0",
  color: "#ede9fe",
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