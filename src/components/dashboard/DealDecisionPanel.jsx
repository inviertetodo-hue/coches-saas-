import { MetricCard } from "./DashboardBlocks";

export default function DealDecisionPanel({
  decisions,
}) {
  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>
        ⚖️ AI Deal Decisions
      </h2>

      <div style={gridStyle}>
        <MetricCard
          label="Decision Score"
          value={`${decisions.decisionScore || 0}/100`}
        />

        <MetricCard
          label="Decision Level"
          value={decisions.decisionLevel || "-"}
        />

        <MetricCard
          label="Total Decisions"
          value={decisions.decisions?.length || 0}
        />
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>
          🧠 Decision Insights
        </p>

        {decisions.insights?.map((item, index) => (
          <div key={index} style={insightCardStyle}>
            {item}
          </div>
        ))}
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>
          ⚖️ Deal Decisions
        </p>

        {decisions.decisions?.length === 0 && (
          <p style={emptyStyle}>
            Todavía no hay decisiones IA disponibles.
          </p>
        )}

        {decisions.decisions?.map((item) => (
          <div
            key={item.id}
            style={getDecisionCardStyle(item.decision)}
          >
            <div style={topRowStyle}>
              <h3 style={dealTitleStyle}>
                {item.title}
              </h3>

              <span style={priorityBadgeStyle}>
                {item.priority}
              </span>
            </div>

            <p style={decisionStyle}>
              {item.decision}
            </p>

            <p style={dealTextStyle}>
              Score {item.score} · ROI {item.roi}% · Beneficio {item.profit} €
            </p>

            <p style={reasonStyle}>
              {item.reason}
            </p>

            <p style={scoreTextStyle}>
              Decision Score: {item.decisionScore}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function getDecisionCardStyle(decision) {
  if (decision === "Comprar / Priorizar") {
    return buyCardStyle;
  }

  if (decision === "Descartar") {
    return discardCardStyle;
  }

  return neutralCardStyle;
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
  background: "rgba(250,204,21,0.12)",
  border: "1px solid rgba(250,204,21,0.25)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
  fontWeight: "800",
};

const buyCardStyle = {
  background:
    "linear-gradient(135deg, rgba(34,197,94,0.16), rgba(37,99,235,0.10))",
  border: "1px solid rgba(34,197,94,0.28)",
  padding: "18px",
  borderRadius: "20px",
  marginBottom: "14px",
};

const neutralCardStyle = {
  background:
    "linear-gradient(135deg, rgba(250,204,21,0.14), rgba(37,99,235,0.08))",
  border: "1px solid rgba(250,204,21,0.25)",
  padding: "18px",
  borderRadius: "20px",
  marginBottom: "14px",
};

const discardCardStyle = {
  background:
    "linear-gradient(135deg, rgba(239,68,68,0.14), rgba(15,23,42,0.60))",
  border: "1px solid rgba(239,68,68,0.28)",
  padding: "18px",
  borderRadius: "20px",
  marginBottom: "14px",
};

const topRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  alignItems: "center",
};

const dealTitleStyle = {
  fontSize: "20px",
  marginBottom: "8px",
};

const priorityBadgeStyle = {
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.08)",
  fontWeight: "900",
  fontSize: "13px",
};

const decisionStyle = {
  fontSize: "18px",
  fontWeight: "900",
  marginBottom: "8px",
};

const dealTextStyle = {
  color: "#cbd5e1",
  marginBottom: "8px",
};

const reasonStyle = {
  color: "#fde68a",
  fontWeight: "900",
  marginBottom: "8px",
};

const scoreTextStyle = {
  color: "#94a3b8",
  fontSize: "13px",
};

const emptyStyle = {
  color: "#94a3b8",
};