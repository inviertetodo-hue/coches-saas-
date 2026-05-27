import { MetricCard } from "./DashboardBlocks";

export default function OpportunityRadarPanel({
  radar,
}) {
  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>
        📡 Opportunity Radar
      </h2>

      <div style={gridStyle}>
        <MetricCard
          label="Radar Score"
          value={`${radar.radarScore || 0}/100`}
        />

        <MetricCard
          label="Radar Level"
          value={radar.radarLevel || "-"}
        />

        <MetricCard
          label="Priority Deals"
          value={
            radar.priorityOpportunities?.length || 0
          }
        />
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>
          🚀 Radar Insights
        </p>

        {radar.radarInsights?.map((item, index) => (
          <div key={index} style={insightCardStyle}>
            {item}
          </div>
        ))}
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>
          🏆 Priority Opportunities
        </p>

        {radar.priorityOpportunities?.length === 0 && (
          <p style={emptyStyle}>
            No hay oportunidades prioritarias todavía.
          </p>
        )}

        {radar.priorityOpportunities?.map((item) => (
          <div key={item.id} style={dealCardStyle}>
            <h3 style={dealTitleStyle}>
              {item.title}
            </h3>

            <p style={dealTextStyle}>
              Score {item.score} · ROI {item.roi}% · Beneficio {item.profit} €
            </p>

            <p style={reasonStyle}>
              {item.reason}
            </p>
          </div>
        ))}
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
  marginBottom: "24px",
};

const sectionStyle = {
  marginBottom: "24px",
};

const sectionTitleStyle = {
  fontSize: "16px",
  fontWeight: "900",
  marginBottom: "14px",
};

const insightCardStyle = {
  background: "rgba(59,130,246,0.10)",
  border: "1px solid rgba(59,130,246,0.20)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
  fontWeight: "800",
};

const dealCardStyle = {
  background:
    "linear-gradient(135deg, rgba(34,197,94,0.14), rgba(37,99,235,0.12))",
  border: "1px solid rgba(34,197,94,0.25)",
  padding: "18px",
  borderRadius: "20px",
  marginBottom: "14px",
};

const dealTitleStyle = {
  fontSize: "20px",
  marginBottom: "8px",
};

const dealTextStyle = {
  color: "#cbd5e1",
  marginBottom: "8px",
};

const reasonStyle = {
  color: "#86efac",
  fontWeight: "900",
};

const emptyStyle = {
  color: "#94a3b8",
};