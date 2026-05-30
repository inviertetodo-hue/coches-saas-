import SmallMetric from "./SmallMetric";
import FeedMetric from "./FeedMetric";
import DealDecisionPill, { getDecisionColor } from "./DealDecisionPill";

export default function MarketFeedSection({ marketFeed }) {
  if (!marketFeed) return null;

  return (
    <div style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Feed IA de oportunidades</h2>

      <div style={feedGridStyle}>
        {marketFeed.opportunities.map((item, index) => (
          <div
            key={item.id}
            style={{
              ...feedCardStyle,
              border: `1px solid ${getDecisionColor(item.finalDecision.action)}`,
            }}
          >
            {index === 0 && (
              <div style={topOpportunityStyle}>
                🏆 TOP OPPORTUNITY
              </div>
            )}

            <div>
              <p style={feedSourceStyle}>{item.source}</p>

              <h3 style={feedTitleStyle}>{item.title}</h3>

              <p style={feedPriceStyle}>
                {item.price.toLocaleString("es-ES")} €
              </p>

              <p style={feedMetaStyle}>
                {item.year} · {item.km.toLocaleString("es-ES")} km
              </p>
            </div>

            <DealDecisionPill
              action={item.finalDecision.action}
              label={item.finalDecision.label}
            />

            <div style={opportunityBoxStyle}>
              <div style={opportunityHeaderStyle}>
                🎯 Opportunity Engine
              </div>

              <div style={marketGridStyle}>
                <SmallMetric
                  label="Opportunity Score"
                  value={`${item.opportunityScore || 0}/100`}
                />

                <SmallMetric
                  label="Opportunity Level"
                  value={item.opportunityLevel || "NONE"}
                />
              </div>
            </div>

            <div style={feedMetricsStyle}>
              <FeedMetric
                label="Score final"
                value={`${item.finalDecision.finalScore}/100`}
              />

              <FeedMetric
                label="ROI neto"
                value={`${item.netRoi}%`}
              />

              <FeedMetric
                label="Margen"
                value={`${item.netProfit.toLocaleString("es-ES")} €`}
              />
            </div>

            <div style={decisionStyle}>
              {item.finalDecision.explanation}
            </div>

            <div style={liquidityBoxStyle}>
              <h4 style={miniTitleStyle}>💧 Liquidez</h4>

              <div style={marketGridStyle}>
                <SmallMetric
                  label="Liquidez"
                  value={`${item.liquidity.liquidityScore}/100`}
                />

                <SmallMetric
                  label="Venta estimada"
                  value={`${item.liquidity.expectedDaysToSell} días`}
                />

                <SmallMetric
                  label="Demanda"
                  value={item.liquidity.demand}
                />

                <SmallMetric
                  label="Compradores"
                  value={item.liquidity.buyerPool}
                />
              </div>

              <p style={marketInsightStyle}>
                {item.liquidity.summary}
              </p>
            </div>

            <div style={riskBoxStyle}>
              <h4 style={miniTitleStyle}>🛡️ Riesgo de operación</h4>

              <div style={marketGridStyle}>
                <SmallMetric
                  label="Nivel"
                  value={item.dealRisk.level}
                />

                <SmallMetric
                  label="Risk score"
                  value={`${item.dealRisk.riskScore}/100`}
                />
              </div>

              <p style={marketInsightStyle}>
                {item.dealRisk.recommendation}
              </p>
            </div>

            <div style={marketBoxStyle}>
              <h4 style={miniTitleStyle}>📊 Comparables de mercado</h4>

              <div style={marketGridStyle}>
                <SmallMetric
                  label="Precio actual"
                  value={`${item.price.toLocaleString("es-ES")} €`}
                />

                <SmallMetric
                  label="Precio justo IA"
                  value={`${item.comparable.fairPrice.toLocaleString(
                    "es-ES"
                  )} €`}
                />

                <SmallMetric
                  label="Desviación"
                  value={`${item.comparable.deviationPercent}%`}
                />

                <SmallMetric
                  label="Confianza"
                  value={`${item.comparable.confidence}/100`}
                />
              </div>

              <p style={marketInsightStyle}>
                {item.comparable.insight}
              </p>
            </div>

            <div style={memoryBoxStyle}>
              <h4 style={miniTitleStyle}>🧠 Memoria de mercado</h4>

              <div style={marketGridStyle}>
                <SmallMetric
                  label="Venta estimada"
                  value={`${item.memory.resaleSpeed.days} días`}
                />

                <SmallMetric
                  label="Demanda"
                  value={item.memory.demandLevel}
                />

                <SmallMetric
                  label="Riesgo"
                  value={item.memory.riskLevel}
                />

                <SmallMetric
                  label="Precio máx."
                  value={`${item.memory.recommendedMaxBid.toLocaleString(
                    "es-ES"
                  )} €`}
                />
              </div>

              <p style={marketInsightStyle}>
                {item.memory.strategy.reason}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const sectionStyle = {
  marginTop: "34px",
};

const sectionTitleStyle = {
  fontSize: "28px",
};

const feedGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
  gap: "18px",
};

const feedCardStyle = {
  background: "rgba(15,23,42,0.82)",
  borderRadius: "24px",
  padding: "24px",
  transition: "0.25s ease",
};

const topOpportunityStyle = {
  marginBottom: "14px",
  padding: "10px",
  borderRadius: "12px",
  textAlign: "center",
  fontWeight: "900",
  background: "rgba(250,204,21,0.20)",
  color: "#fde68a",
};

const opportunityBoxStyle = {
  marginTop: "16px",
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(168,85,247,0.10)",
  border: "1px solid rgba(168,85,247,0.22)",
};

const opportunityHeaderStyle = {
  marginBottom: "12px",
  fontWeight: "900",
};

const feedSourceStyle = {
  color: "#86efac",
  fontWeight: "900",
};

const feedTitleStyle = {
  fontSize: "22px",
};

const feedPriceStyle = {
  fontSize: "34px",
  fontWeight: "900",
};

const feedMetaStyle = {
  color: "#cbd5e1",
};

const feedMetricsStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "12px",
  marginTop: "20px",
};

const decisionStyle = {
  marginTop: "20px",
  padding: "14px",
  borderRadius: "16px",
  background: "rgba(34,197,94,0.12)",
  color: "#86efac",
  fontWeight: "900",
  textAlign: "center",
};

const marketBoxStyle = {
  marginTop: "20px",
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(59,130,246,0.10)",
  border: "1px solid rgba(59,130,246,0.20)",
};

const memoryBoxStyle = {
  marginTop: "16px",
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(34,197,94,0.09)",
  border: "1px solid rgba(34,197,94,0.18)",
};

const liquidityBoxStyle = {
  marginTop: "18px",
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(20,184,166,0.10)",
  border: "1px solid rgba(20,184,166,0.22)",
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

const marketInsightStyle = {
  marginBottom: 0,
  color: "#e5e7eb",
  lineHeight: "1.55",
  fontSize: "14px",
};