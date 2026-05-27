import { MetricCard } from "./DashboardBlocks";

export default function GlobalStatsPanel({
  market,
  risk,
  confidence,
  learning,
  portfolio,
  trends,
  opportunityAlerts,
  temporal,
}) {
  return (
    <>
      <div style={marketGridStyle}>
        <MetricCard label="ROI Medio" value={`${market.averageROI || 0}%`} />
        <MetricCard label="Risk Score" value={`${risk.riskScore || 0}/100`} />
        <MetricCard label="Confidence Score" value={`${confidence.confidenceScore || 0}/100`} />
        <MetricCard label="Learning Score" value={`${learning.learningScore || 0}/100`} />
      </div>

      <div style={marketGridStyle}>
        <MetricCard label="Risk Level" value={risk.riskLevel || "-"} />
        <MetricCard label="Confidence" value={confidence.confidenceLevel || "-"} />
        <MetricCard label="Learning Level" value={learning.learningLevel || "-"} />
        <MetricCard label="Strategy" value={portfolio.strategy || "-"} />
      </div>

      <div style={marketGridStyle}>
        <MetricCard label="Trend Score" value={`${trends.trendScore || 0}/100`} />
        <MetricCard label="Alert Score" value={`${opportunityAlerts.alertScore || 0}/100`} />
        <MetricCard label="Freshness Score" value={`${temporal.freshnessScore || 0}/100`} />
        <MetricCard label="Total Análisis" value={trends.total || 0} />
      </div>
    </>
  );
}

const marketGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: "18px",
  marginBottom: "24px",
};