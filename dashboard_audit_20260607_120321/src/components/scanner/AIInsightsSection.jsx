export default function AIInsightsSection({ insights, best }) {
  if ((!insights || insights.length === 0) && !best) return null;

  const cleanInsights = Array.isArray(insights)
    ? insights.filter(
        (insight) =>
          !String(insight || "").includes("Mejor oportunidad detectada")
      )
    : [];

  const finalInsights = best
    ? [`🥇 Mejor oportunidad detectada: ${best.title}.`, ...cleanInsights]
    : cleanInsights;

  return (
    <div style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Inteligencia IA</h2>

      <div style={insightGridStyle}>
        {finalInsights.map((insight, index) => (
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