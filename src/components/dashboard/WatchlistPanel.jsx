import { MetricCard } from "./DashboardBlocks";

export default function WatchlistPanel({
  watchlist,
}) {
  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>
        📋 AI Watchlist
      </h2>

      <div style={gridStyle}>
        <MetricCard
          label="Watchlist Score"
          value={`${watchlist.watchlistScore || 0}/100`}
        />

        <MetricCard
          label="Watchlist Level"
          value={watchlist.watchlistLevel || "-"}
        />

        <MetricCard
          label="Candidates"
          value={watchlist.items?.length || 0}
        />
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>
          🧠 Watchlist Insights
        </p>

        {watchlist.insights?.map((item, index) => (
          <div key={index} style={insightCardStyle}>
            {item}
          </div>
        ))}
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>
          📌 Candidates To Watch
        </p>

        {watchlist.items?.length === 0 && (
          <p style={emptyStyle}>
            Todavía no hay candidatos para seguimiento.
          </p>
        )}

        {watchlist.items?.map((item) => (
          <div key={item.id} style={itemCardStyle}>
            <h3 style={itemTitleStyle}>
              {item.title}
            </h3>

            <p style={itemTextStyle}>
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
  background: "rgba(14,165,233,0.12)",
  border: "1px solid rgba(14,165,233,0.25)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
  fontWeight: "800",
};

const itemCardStyle = {
  background:
    "linear-gradient(135deg, rgba(14,165,233,0.16), rgba(34,197,94,0.12))",
  border: "1px solid rgba(14,165,233,0.25)",
  padding: "18px",
  borderRadius: "20px",
  marginBottom: "14px",
};

const itemTitleStyle = {
  fontSize: "20px",
  marginBottom: "8px",
};

const itemTextStyle = {
  color: "#cbd5e1",
  marginBottom: "8px",
};

const reasonStyle = {
  color: "#7dd3fc",
  fontWeight: "900",
};

const emptyStyle = {
  color: "#94a3b8",
};