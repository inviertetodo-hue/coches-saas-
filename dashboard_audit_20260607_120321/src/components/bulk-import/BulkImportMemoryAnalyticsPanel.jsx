import { buildMemoryAnalytics } from "../../services/intelligence/memoryAnalyticsEngine";

export default function BulkImportMemoryAnalyticsPanel({ records = [] }) {
  if (!Array.isArray(records) || records.length === 0) return null;

  const analytics = buildMemoryAnalytics(records);

  return (
    <div style={panelStyle}>
      <h2 style={titleStyle}>📊 Memory Analytics</h2>

      <div style={gridStyle}>
        <Metric label="Registros" value={analytics.totalRecords} />
        <Metric label="Marcas" value={analytics.brandsCount} />
        <Metric label="Modelos" value={analytics.modelsCount} />
        <Metric label="ROI medio" value={`${analytics.avgROI}%`} />
        <Metric label="Margen medio" value={`${analytics.avgProfit} €`} />
      </div>

      <div style={cardsGridStyle}>
        <OpportunityCard title="Mejor oportunidad" item={analytics.bestOpportunity} />
        <OpportunityCard title="Peor oportunidad" item={analytics.worstOpportunity} />
      </div>
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

function OpportunityCard({ title, item }) {
  if (!item) return null;

  return (
    <div style={opportunityStyle}>
      <h3 style={opportunityTitleStyle}>{title}</h3>
      <strong>{item.title || "Sin título"}</strong>
      <p style={metaStyle}>
        {item.brand} · {item.model} · {item.year}
      </p>
      <p style={metaStyle}>
        ROI {item.roi}% · Margen {item.profit} €
      </p>
    </div>
  );
}

const panelStyle = {
  padding: "20px",
  borderRadius: "22px",
  background: "rgba(14,165,233,0.12)",
  border: "1px solid rgba(56,189,248,0.25)",
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

const cardsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
  gap: "12px",
};

const metricStyle = {
  padding: "12px",
  borderRadius: "14px",
  background: "rgba(15,23,42,0.52)",
};

const metricLabelStyle = {
  display: "block",
  color: "#bae6fd",
  fontSize: "12px",
  marginBottom: "6px",
};

const metricValueStyle = {
  color: "#f0f9ff",
  fontSize: "20px",
};

const opportunityStyle = {
  padding: "14px",
  borderRadius: "16px",
  background: "rgba(2,6,23,0.42)",
  border: "1px solid rgba(148,163,184,0.16)",
};

const opportunityTitleStyle = {
  margin: "0 0 8px 0",
  fontSize: "14px",
  color: "#e0f2fe",
};

const metaStyle = {
  color: "#cbd5e1",
  margin: "6px 0 0 0",
  fontSize: "13px",
};