export default function FeedMetric({ label, value }) {
  return (
    <div style={feedMetricStyle}>
      <p style={feedMetricLabelStyle}>{label}</p>
      <h4 style={feedMetricValueStyle}>{value}</h4>
    </div>
  );
}

const feedMetricStyle = {
  background: "rgba(255,255,255,0.05)",
  borderRadius: "16px",
  padding: "14px",
};

const feedMetricLabelStyle = {
  color: "#cbd5e1",
  fontSize: "12px",
};

const feedMetricValueStyle = {
  fontSize: "20px",
};