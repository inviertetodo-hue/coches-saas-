import { MetricCard } from "./DashboardBlocks";

export default function PortfolioSimulatorPanel({ simulation = {} }) {
  const simulatedPortfolio = Array.isArray(simulation.simulatedPortfolio)
    ? simulation.simulatedPortfolio
    : [];

  const capitalAvailable = Number(simulation.capitalAvailable || 0);
  const capitalUsed = Number(simulation.capitalUsed || 0);
  const capitalFree = Math.max(capitalAvailable - capitalUsed, 0);

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>💼 AI Portfolio Simulator</h2>

      <p style={subtitleStyle}>
        Simulación de cartera basada en asignación de capital, ROI, beneficio,
        timing, riesgo de inventario y prioridad ejecutiva.
      </p>

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

      <div style={gridStyle}>
        <MetricCard label="Capital disponible" value={`${capitalAvailable} €`} />
        <MetricCard label="Capital usado" value={`${capitalUsed} €`} />
        <MetricCard label="Capital libre" value={`${capitalFree} €`} />
        <MetricCard
          label="Operaciones simuladas"
          value={simulatedPortfolio.length}
        />
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>🧠 Simulation Insights</p>

        {!simulation.insights?.length && (
          <p style={emptyStyle}>
            Aún no hay insights suficientes para simular cartera.
          </p>
        )}

        {simulation.insights?.map((item, index) => (
          <div key={index} style={insightCardStyle}>
            {item}
          </div>
        ))}
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>💼 Simulated Portfolio</p>

        {simulatedPortfolio.length === 0 && (
          <p style={emptyStyle}>
            Todavía no hay suficientes operaciones para simular portfolio.
          </p>
        )}

        {simulatedPortfolio.map((item, index) => (
          <PortfolioCard
            key={item.id || `${item.title}-${index}`}
            item={item}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

function PortfolioCard({ item, index }) {
  const allocationScore = Number(item.allocationScore || 0);
  const allocationTier = item.allocationTier || "Sin datos";
  const price = Number(item.price || item.purchasePrice || item.budget || 0);
  const profit = Number(item.profit || 0);
  const roi = Number(item.roi || 0);
  const marketTimingLabel = item.marketTimingLabel || "Sin datos";
  const inventoryRiskLabel = item.inventoryRiskLabel || "Sin datos";
  const estimatedSellDays = Number(item.estimatedSellDays || 0);
  const capitalEfficiencyScore = Number(item.capitalEfficiencyScore || 0);

  return (
    <div style={portfolioCardStyle}>
      <div style={cardHeaderStyle}>
        <div>
          <span style={rankStyle}>#{index + 1}</span>
          <h3 style={dealTitleStyle}>{item.title || "Operación simulada"}</h3>
        </div>

        <span style={tierPillStyle}>{allocationTier}</span>
      </div>

      <div style={metricGridStyle}>
        <MiniMetric label="Allocation" value={`${allocationScore}/100`} />
        <MiniMetric label="Capital" value={`${price} €`} />
        <MiniMetric label="Beneficio" value={`${profit} €`} />
        <MiniMetric label="ROI" value={`${roi}%`} />
        <MiniMetric label="Timing" value={marketTimingLabel} />
        <MiniMetric label="Inventario" value={inventoryRiskLabel} />
        <MiniMetric label="Venta estimada" value={`${estimatedSellDays} días`} />
        <MiniMetric
          label="Capital Efficiency"
          value={`${capitalEfficiencyScore}/100`}
        />
      </div>

      {item.allocationSummary && (
        <p style={dealTextStyle}>💼 {item.allocationSummary}</p>
      )}
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div style={miniMetricStyle}>
      <span style={miniMetricLabelStyle}>{label}</span>
      <strong style={miniMetricValueStyle}>{value}</strong>
    </div>
  );
}

const containerStyle = {
  marginBottom: "40px",
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "900",
  marginBottom: "10px",
};

const subtitleStyle = {
  color: "#cbd5e1",
  lineHeight: "1.55",
  marginTop: 0,
  marginBottom: "24px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
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

const cardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "14px",
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const rankStyle = {
  display: "inline-block",
  color: "#bbf7d0",
  fontWeight: "900",
  marginBottom: "6px",
};

const dealTitleStyle = {
  fontSize: "20px",
  margin: "0 0 14px 0",
};

const tierPillStyle = {
  padding: "7px 11px",
  borderRadius: "999px",
  background: "rgba(34,197,94,0.16)",
  border: "1px solid rgba(34,197,94,0.25)",
  color: "#bbf7d0",
  fontSize: "12px",
  fontWeight: "900",
};

const metricGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
  gap: "10px",
  marginBottom: "12px",
};

const miniMetricStyle = {
  padding: "10px",
  borderRadius: "14px",
  background: "rgba(2,6,23,0.48)",
};

const miniMetricLabelStyle = {
  display: "block",
  color: "#94a3b8",
  fontSize: "11px",
  marginBottom: "5px",
};

const miniMetricValueStyle = {
  color: "#f8fafc",
  fontSize: "14px",
};

const dealTextStyle = {
  color: "#dcfce7",
  margin: "12px 0 0 0",
  lineHeight: "1.45",
  fontSize: "13px",
};

const emptyStyle = {
  color: "#94a3b8",
};