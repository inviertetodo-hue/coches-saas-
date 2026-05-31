export default function BulkImportMetricCard({ label, value }) {
  return (
    <div style={metricCardStyle}>
      <p style={metricLabelStyle}>{label}</p>
      <strong style={metricValueStyle}>{value}</strong>
    </div>
  );
}

const metricCardStyle = {
  padding: "18px",
  borderRadius: "18px",
  background: "rgba(14,165,233,0.14)",
  border: "1px solid rgba(56,189,248,0.24)",
};

const metricLabelStyle = {
  margin: 0,
  color: "#bae6fd",
  fontSize: "12px",
  fontWeight: "900",
};

const metricValueStyle = {
  display: "block",
  marginTop: "8px",
  fontSize: "24px",
  color: "#ffffff",
};