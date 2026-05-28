import MetricCard from "./MetricCard";

export default function BestDealCard({ best }) {
  if (!best) return null;

  return (
    <div style={bestDealStyle}>
      <p style={bestDealLabelStyle}>🏆 Mejor oportunidad detectada</p>

      <h3 style={bestDealTitleStyle}>{best.title}</h3>

      <div style={finalDecisionHeroStyle}>{best.finalDecision.label}</div>

      <p style={bestDealDecisionStyle}>{best.finalDecision.explanation}</p>

      <div style={bestDealGridStyle}>
        <MetricCard
          label="Score final"
          value={`${best.finalDecision.finalScore}/100`}
        />

        <MetricCard
          label="Margen neto"
          value={`${best.netProfit.toLocaleString("es-ES")} €`}
        />

        <MetricCard
          label="Liquidez"
          value={`${best.liquidity.liquidityScore}/100`}
        />

        <MetricCard
          label="Riesgo"
          value={`${best.dealRisk.riskScore}/100`}
        />
      </div>

      <div style={riskBoxStyle}>
        <h4 style={miniTitleStyle}>🧭 Decisión consolidada</h4>

        <p style={marketInsightStyle}>{best.finalDecision.explanation}</p>
      </div>
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

const bestDealDecisionStyle = {
  color: "#facc15",
  fontWeight: "900",
  lineHeight: "1.6",
};

const finalDecisionHeroStyle = {
  display: "inline-block",
  padding: "12px 18px",
  borderRadius: "999px",
  background: "rgba(250,204,21,0.14)",
  color: "#fde68a",
  fontWeight: "900",
  marginBottom: "14px",
};

const bestDealGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
  gap: "14px",
  marginTop: "22px",
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

const marketInsightStyle = {
  marginBottom: 0,
  color: "#e5e7eb",
  lineHeight: "1.55",
  fontSize: "14px",
};