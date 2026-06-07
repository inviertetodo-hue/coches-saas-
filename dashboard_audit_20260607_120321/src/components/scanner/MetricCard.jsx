export default function MetricCard({ label, value }) {
  return (
    <div style={metricCardStyle}>
      <p style={metricLabelStyle}>{label}</p>
      <h3 style={metricValueStyle}>{value}</h3>
    </div>
  );
}

const metricCardStyle = {
  background: "rgba(2,6,23,0.55)",
  borderRadius: "18px",
  padding: "18px",
};

const metricLabelStyle = {
  color: "#cbd5e1",
};

const metricValueStyle = {
  fontSize: "26px",
};