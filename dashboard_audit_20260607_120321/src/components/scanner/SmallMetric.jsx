export default function SmallMetric({ label, value }) {
  return (
    <div style={smallMetricStyle}>
      <p style={smallMetricLabelStyle}>{label}</p>
      <strong style={smallMetricValueStyle}>{value}</strong>
    </div>
  );
}

const smallMetricStyle = {
  background: "rgba(2,6,23,0.45)",
  borderRadius: "14px",
  padding: "12px",
};

const smallMetricLabelStyle = {
  color: "#cbd5e1",
  fontSize: "12px",
  margin: 0,
};

const smallMetricValueStyle = {
  display: "block",
  marginTop: "8px",
  fontSize: "16px",
};