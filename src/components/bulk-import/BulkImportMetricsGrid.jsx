import BulkImportMetricCard from "./BulkImportMetricCard";

export default function BulkImportMetricsGrid({ metrics = [] }) {
  if (!Array.isArray(metrics) || metrics.length === 0) {
    return null;
  }

  return (
    <div style={gridStyle}>
      {metrics.map((metric) => (
        <BulkImportMetricCard
          key={metric.label}
          label={metric.label}
          value={metric.value}
        />
      ))}
    </div>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
  gap: "16px",
  marginBottom: "22px",
};