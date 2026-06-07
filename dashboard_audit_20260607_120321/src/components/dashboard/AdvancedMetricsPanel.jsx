import { MetricCard } from "./DashboardBlocks";

export default function AdvancedMetricsPanel({
  metrics,
}) {
  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>
        📊 Advanced AI Metrics
      </h2>

      <div style={gridStyle}>
        <MetricCard
          label="AI Readiness"
          value={`${metrics.aiReadiness || 0}/100`}
        />

        <MetricCard
          label="Avg Score"
          value={`${metrics.avgScore || 0}`}
        />

        <MetricCard
          label="Avg ROI"
          value={`${metrics.avgROI || 0}%`}
        />

        <MetricCard
          label="Avg Profit"
          value={`${metrics.avgProfit || 0}€`}
        />
      </div>

      <div style={gridStyle}>
        <MetricCard
          label="Premium Ratio"
          value={`${metrics.premiumRatio || 0}%`}
        />

        <MetricCard
          label="Low Risk Ratio"
          value={`${metrics.lowRiskRatio || 0}%`}
        />

        <MetricCard
          label="High Risk Ratio"
          value={`${metrics.highRiskRatio || 0}%`}
        />

        <MetricCard
          label="Dataset Quality"
          value={metrics.datasetQuality || "-"}
        />
      </div>

      <div style={healthContainerStyle}>
        <div style={healthCardStyle}>
          <p style={healthLabelStyle}>
            Market Health
          </p>

          <h2 style={healthValueStyle}>
            {metrics.marketHealth}
          </h2>
        </div>
      </div>
    </div>
  );
}

const containerStyle = {
  marginBottom: "40px",
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "900",
  marginBottom: "24px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: "18px",
  marginBottom: "20px",
};

const healthContainerStyle = {
  marginTop: "12px",
};

const healthCardStyle = {
  background:
    "linear-gradient(135deg, rgba(37,99,235,0.20), rgba(34,197,94,0.12))",
  borderRadius: "24px",
  padding: "26px",
};

const healthLabelStyle = {
  color: "#94a3b8",
  marginBottom: "12px",
};

const healthValueStyle = {
  fontSize: "34px",
  fontWeight: "900",
};