export default function AIInsightsSection({ insights }) {
  if (!insights || insights.length === 0) return null;

  return (
    <div style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Inteligencia IA</h2>

      <div style={insightGridStyle}>
        {insights.map((insight, index) => (
          <div key={index} style={insightCardStyle}>
            {insight}
          </div>
        ))}
      </div>
    </div>
  );
}

const sectionStyle = {
  marginTop: "34px",
};

const sectionTitleStyle = {
  fontSize: "28px",
};

const insightGridStyle = {
  display: "grid",
  gap: "14px",
};

const insightCardStyle = {
  background: "rgba(255,255,255,0.05)",
  borderRadius: "18px",
  padding: "18px",
  fontWeight: "700",
};