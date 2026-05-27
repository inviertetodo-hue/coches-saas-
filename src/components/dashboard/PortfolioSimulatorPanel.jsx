import { MetricCard } from "./DashboardBlocks";

export default function PortfolioSimulatorPanel({
  simulation,
}) {
  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>
        💼 AI Portfolio Simulator
      </h2>

      <div style={gridStyle}>
        <MetricCard
          label="Simulation Score"
          value={`${simulation.simulationScore || 0}/100`}
        />

        <MetricCard
          label="Simulation Level"
          value={simulation.simulationLevel || "-"}
        />

        <MetricCard
          label="Expected Profit"
          value={`${simulation.totalExpectedProfit || 0} €`}
        />

        <MetricCard
          label="Average ROI"
          value={`${simulation.averageROI || 0}%`}
        />
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>
          🧠 Simulation Insights
        </p>

        {simulation.insights?.map((item, index) => (
          <div key={index} style={insightCardStyle}>
            {item}
          </div>
        ))}
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>
          💼 Simulated Portfolio
        </p>

        {simulation.simulatedPortfolio?.length === 0 && (
          <p style={emptyStyle}>
            Todavía no hay suficientes operaciones para simular portfolio.
          </p>
        )}

        {simulation.simulatedPortfolio?.map((item) => (
          <div key={item.id} style={portfolioCardStyle}>
            <h3 style={dealTitleStyle}>
              {item.title}
            </h3>

            <p style={dealTextStyle}>
              Score {item.score} · ROI {item.roi}% · Beneficio {item.profit} €
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
  background: "rgba(34,197,94,0.12)",
  border: "1px solid rgba(34,197,94,0.25)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
  fontWeight: "800",
};

const portfolioCardStyle = {
  background:
    "linear-gradient(135deg, rgba(34,197,94,0.16), rgba(14,165,233,0.12))",
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
};

const emptyStyle = {
  color: "#94a3b8",
};
