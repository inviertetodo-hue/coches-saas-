import { getDecisionTheme } from "../../services/decisionBadgeTheme";

export default function BestOpportunityCard({ best }) {
  if (!best) return null;

  return (
    <div style={bestDealStyle}>
      <p style={bestDealLabelStyle}>🏆 Mejor oportunidad detectada</p>

      <h3 style={bestDealTitleStyle}>{best.title}</h3>

      <div
        style={{
          ...bestDecisionBadgeStyle,
          ...getDecisionTheme(best.finalDecision?.label),
        }}
      >
        {best.finalDecision?.label}
      </div>

      <p style={marketInsightStyle}>{best.finalDecision?.explanation}</p>

      <div style={bestDealGridStyle}>
        <MetricCard
          label="Score final"
          value={`${best.finalDecision?.finalScore || 0}/100`}
        />

        <MetricCard
          label="Margen Neto"
          value={`${best.netProfit.toLocaleString("es-ES")} €`}
        />

        <MetricCard
          label="Liquidez"
          value={`${best.liquidity?.liquidityScore || 0}/100`}
        />

        <MetricCard
          label="Riesgo real"
          value={best.dealRisk?.level || "Medio"}
        />
      </div>

      <div style={liquidityBoxStyle}>
        <h4 style={miniTitleStyle}>💧 Liquidez estimada</h4>

        <div style={marketGridStyle}>
          <SmallMetric
            label="Venta estimada"
            value={`${best.liquidity?.expectedDaysToSell || 0} días`}
          />

          <SmallMetric
            label="Compradores"
            value={best.liquidity?.buyerPool || "Medio"}
          />
        </div>

        <p style={marketInsightStyle}>{best.liquidity?.summary}</p>
      </div>

      <div style={riskBoxStyle}>
        <h4 style={miniTitleStyle}>🛡️ Lectura de riesgo</h4>

        <p style={marketInsightStyle}>{best.dealRisk?.recommendation}</p>
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div style={metricCardStyle}>
      <p style={metricLabelStyle}>{label}</p>
      <h3 style={metricValueStyle}>{value}</h3>
    </div>
  );
}

function SmallMetric({ label, value }) {
  return (
    <div style={smallMetricStyle}>
      <p style={smallMetricLabelStyle}>{label}</p>
      <strong style={smallMetricValueStyle}>{value}</strong>
    </div>
  );
}

const bestDealStyle = {
  marginTop: "30px",
  padding: "24px",
  borderRadius: "24px",
  background:
    "linear-gradient(135deg, rgba(34,197,94,0.16), rgba(59,130,246,0.14))",
};

const bestDealLabelStyle = {
  color: "#86efac",
  fontWeight: "900",
};

const bestDealTitleStyle = {
  fontSize: "28px",
};

const bestDecisionBadgeStyle = {
  display: "inline-block",
  marginTop: "14px",
  marginBottom: "14px",
  padding: "12px 18px",
  borderRadius: "999px",
  fontWeight: "900",
};

const bestDealGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
  gap: "14px",
  marginTop: "22px",
};

const metricCardStyle = {
  background: "rgba(2,6,23,0.55)",
  borderRadius: "18px",
  padding: "18px",
};

const metricLabelStyle = {
  color: "#cbd5e1",
};

const metricValueStyle = {
  fontSize: "26px",
};

const liquidityBoxStyle = {
  marginTop: "18px",
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(14,165,233,0.10)",
  border: "1px solid rgba(14,165,233,0.22)",
};

const riskBoxStyle = {
  marginTop: "18px",
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(245,158,11,0.10)",
  border: "1px solid rgba(245,158,11,0.22)",
};

const miniTitleStyle = {
  marginTop: 0,
  marginBottom: "14px",
  fontSize: "15px",
};

const marketGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
};

const smallMetricStyle = {
  background: "rgba(2,6,23,0.45)",
  borderRadius: "14px",
  padding: "12px",
};

const smallMetricLabelStyle = {
  color: "#cbd5e1",
  fontSize: "12px",
  margin: 0,
};

const smallMetricValueStyle = {
  display: "block",
  marginTop: "8px",
  fontSize: "16px",
};

const marketInsightStyle = {
  marginBottom: 0,
  color: "#e5e7eb",
  lineHeight: "1.55",
  fontSize: "14px",
};
