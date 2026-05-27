import { MetricCard } from "./DashboardBlocks";

export default function OpportunityRankingPanel({
  ranking,
}) {
  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>
        🏆 Opportunity Ranking
      </h2>

      <div style={gridStyle}>
        <MetricCard
          label="Ranking Score"
          value={`${ranking.rankingScore || 0}/100`}
        />

        <MetricCard
          label="Top Deals"
          value={ranking.topOpportunities?.length || 0}
        />
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>
          🧠 Ranking Insights
        </p>

        {ranking.rankingInsights?.map((item, index) => (
          <div key={index} style={insightCardStyle}>
            {item}
          </div>
        ))}
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>
          🏁 Top Opportunities
        </p>

        {ranking.topOpportunities?.length === 0 && (
          <p style={emptyStyle}>
            Todavía no hay oportunidades suficientes para ranking.
          </p>
        )}

        {ranking.topOpportunities?.map((item, index) => (
          <div key={item.id} style={rankingCardStyle}>
            <div style={rankBadgeStyle}>
              #{index + 1}
            </div>

            <div>
              <h3 style={dealTitleStyle}>
                {item.title}
              </h3>

              <p style={dealTextStyle}>
                Score {item.score} · ROI {item.roi}% · Beneficio {item.profit} €
              </p>

              <p style={priorityStyle}>
                Priority Score: {item.priorityScore}
              </p>
            </div>
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
  background: "rgba(168,85,247,0.12)",
  border: "1px solid rgba(168,85,247,0.25)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
  fontWeight: "800",
};

const rankingCardStyle = {
  display: "flex",
  gap: "16px",
  alignItems: "center",
  background:
    "linear-gradient(135deg, rgba(168,85,247,0.16), rgba(37,99,235,0.12))",
  border: "1px solid rgba(168,85,247,0.25)",
  padding: "18px",
  borderRadius: "20px",
  marginBottom: "14px",
};

const rankBadgeStyle = {
  minWidth: "52px",
  height: "52px",
  borderRadius: "999px",
  background: "rgba(168,85,247,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "900",
  fontSize: "18px",
};

const dealTitleStyle = {
  fontSize: "20px",
  marginBottom: "8px",
};

const dealTextStyle = {
  color: "#cbd5e1",
  marginBottom: "8px",
};

const priorityStyle = {
  color: "#d8b4fe",
  fontWeight: "900",
};

const emptyStyle = {
  color: "#94a3b8",
};