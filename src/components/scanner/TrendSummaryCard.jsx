export default function TrendSummaryCard({
  trendProfile,
  SmallMetric,
  marketInsightStyle,
}) {
  if (!trendProfile) return null;

  return (
    <div style={trendBoxStyle}>
      <p style={trendBadgeStyle}>📈 Tendencia de mercado</p>

      <h3 style={trendTitleStyle}>{trendProfile.mainTrend.label}</h3>

      <div style={trendMetricGridStyle}>
        <SmallMetric
          label="Demanda"
          value={trendProfile.mainTrend.demand}
        />

        <SmallMetric
          label="Tendencia"
          value={trendProfile.mainTrend.trend}
        />

        <SmallMetric
          label="Riesgo"
          value={trendProfile.mainTrend.risk}
        />
      </div>

      <p style={marketInsightStyle}>{trendProfile.summary}</p>
    </div>
  );
}

const trendBoxStyle = {
  marginTop: "24px",
  padding: "20px",
  borderRadius: "22px",
  background: "rgba(14,165,233,0.10)",
  border: "1px solid rgba(14,165,233,0.20)",
};

const trendBadgeStyle = {
  color: "#7dd3fc",
  fontWeight: "900",
  marginTop: 0,
};

const trendTitleStyle = {
  fontSize: "22px",
  marginTop: 0,
};

const trendMetricGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
  gap: "10px",
  marginBottom: "16px",
};