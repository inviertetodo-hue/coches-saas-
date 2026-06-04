export default function MarketIntelligencePanel({ intelligence }) {
  if (!intelligence || intelligence.totalAnalyses === 0) {
    return (
      <div style={cardStyle}>
        <p style={labelStyle}>Market Intelligence</p>

        <h3 style={titleStyle}>Aún no hay inteligencia suficiente</h3>

        <p style={textStyle}>
          Guarda más análisis para activar recomendaciones automáticas,
          tendencias de mercado y detección de oportunidades.
        </p>
      </div>
    );
  }

  const bestModernBrand = intelligence.brandModernRanking?.[0];
  const bestModernModel = intelligence.modelModernRanking?.[0];

  return (
    <div style={cardStyle}>
      <p style={labelStyle}>Market Intelligence · V2</p>

      <h3 style={titleStyle}>Inteligencia estratégica moderna del histórico</h3>

      <div style={gridStyle}>
        <Metric label="Análisis procesados" value={intelligence.totalAnalyses} />
        <Metric label="Tendencia clásica" value={intelligence.marketTrend} />
        <Metric label="Tendencia moderna" value={intelligence.modernMarketTrend} />
        <Metric
          label="Mejor oportunidad"
          value={
            intelligence.bestOpportunity?.score
              ? `${intelligence.bestOpportunity.score}/100`
              : "-"
          }
        />
      </div>

      <div style={decisionBoxStyle}>
        <p style={decisionTitleStyle}>🎯 Recomendación IA</p>
        <p style={textStyle}>{intelligence.buyRecommendation}</p>
      </div>

      <div style={decisionBoxStyle}>
        <p style={decisionTitleStyle}>📅 Recomendación semanal</p>
        <p style={textStyle}>{intelligence.weeklyRecommendation}</p>
      </div>

      <div style={twoColumnStyle}>
        <OpportunityCard
          title="🏆 Mejor oportunidad moderna"
          item={intelligence.bestOpportunity}
          positive
        />

        <OpportunityCard
          title="⚠️ Oportunidad más débil"
          item={intelligence.worstOpportunity}
        />
      </div>

      <div style={twoColumnStyle}>
        <ModernRankingCard
          title="🏷️ Mejor marca moderna"
          item={bestModernBrand}
        />

        <ModernRankingCard
          title="🚗 Mejor modelo moderno"
          item={bestModernModel}
        />
      </div>

      <div style={insightsBoxStyle}>
        <h4 style={sectionTitleStyle}>🧠 Insights automáticos V2</h4>

        {intelligence.marketInsights?.length ? (
          intelligence.marketInsights.map((insight, index) => (
            <div key={`${insight}-${index}`} style={insightCardStyle}>
              {insight}
            </div>
          ))
        ) : (
          <p style={textStyle}>Sin insights de mercado todavía.</p>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={metricStyle}>
      <p style={metricLabelStyle}>{label}</p>
      <strong style={metricValueStyle}>{value || "-"}</strong>
    </div>
  );
}

function OpportunityCard({ title, item, positive = false }) {
  return (
    <div style={positive ? positiveCardStyle : negativeCardStyle}>
      <h4 style={opportunityTitleStyle}>{title}</h4>

      {!item && <p style={textStyle}>Sin datos.</p>}

      {item && (
        <>
          <strong style={opportunityNameStyle}>
            {item.title || "Sin título"}
          </strong>

          <p style={opportunityTextStyle}>Score clásico {item.score}/100</p>
          <p style={opportunityTextStyle}>Decision Score {item.decisionScore || 0}/100</p>
          <p style={opportunityTextStyle}>Allocation {item.allocationScore || 0}/100</p>
          <p style={opportunityTextStyle}>
            Executive {item.executiveBuySignalScore || 0}/100
          </p>
          <p style={opportunityTextStyle}>
            Market Timing {item.marketTimingScore || 0}/100
          </p>
          <p style={opportunityTextStyle}>
            Capital Efficiency {item.capitalEfficiencyScore || 0}/100
          </p>
          <p style={opportunityTextStyle}>
            Momentum {item.timelineMomentumScore || 0}/100
          </p>
          <p style={opportunityTextStyle}>
            Success {item.successProbability || 0}/100
          </p>
          <p style={opportunityTextStyle}>ROI {item.roi}%</p>
          <p style={opportunityTextStyle}>Beneficio {item.profit} €</p>
        </>
      )}
    </div>
  );
}

function ModernRankingCard({ title, item }) {
  return (
    <div style={rankingCardStyle}>
      <h4 style={opportunityTitleStyle}>{title}</h4>

      {!item && <p style={textStyle}>Sin datos modernos suficientes.</p>}

      {item && (
        <>
          <strong style={opportunityNameStyle}>{item.label}</strong>

          <p style={opportunityTextStyle}>
            Modern Score medio {item.averageModernScore || 0}/100
          </p>
          <p style={opportunityTextStyle}>
            Allocation medio {item.averageAllocationScore || 0}/100
          </p>
          <p style={opportunityTextStyle}>
            Executive medio {item.averageExecutiveScore || 0}/100
          </p>
          <p style={opportunityTextStyle}>
            Market Timing medio {item.averageMarketTimingScore || 0}/100
          </p>
          <p style={opportunityTextStyle}>
            Capital Efficiency medio {item.averageCapitalEfficiencyScore || 0}/100
          </p>
          <p style={opportunityTextStyle}>
            Momentum medio {item.averageTimelineMomentumScore || 0}/100
          </p>
          <p style={opportunityTextStyle}>
            Success medio {item.averageSuccessProbability || 0}/100
          </p>
          <p style={opportunityTextStyle}>
            ROI medio {item.averageROI || 0}%
          </p>
          <p style={opportunityTextStyle}>
            Beneficio medio {item.averageProfit || 0} €
          </p>
        </>
      )}
    </div>
  );
}

const cardStyle = {
  marginBottom: "28px",
  padding: "26px",
  borderRadius: "24px",
  background: "rgba(15,23,42,0.82)",
  border: "1px solid rgba(59,130,246,0.20)",
};

const labelStyle = {
  margin: 0,
  color: "#93c5fd",
  fontWeight: "900",
};

const titleStyle = {
  marginTop: "10px",
  marginBottom: "18px",
  fontSize: "24px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
  gap: "14px",
  marginBottom: "18px",
};

const metricStyle = {
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(2,6,23,0.55)",
};

const metricLabelStyle = {
  margin: 0,
  color: "#cbd5e1",
  fontSize: "13px",
};

const metricValueStyle = {
  display: "block",
  marginTop: "8px",
  fontSize: "20px",
};

const decisionBoxStyle = {
  marginTop: "12px",
  marginBottom: "20px",
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(37,99,235,0.14)",
  border: "1px solid rgba(96,165,250,0.18)",
};

const decisionTitleStyle = {
  margin: "0 0 10px 0",
  color: "#bfdbfe",
  fontWeight: "900",
};

const twoColumnStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
  gap: "16px",
  marginBottom: "16px",
};

const positiveCardStyle = {
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(22,101,52,0.18)",
  border: "1px solid rgba(34,197,94,0.18)",
};

const negativeCardStyle = {
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(127,29,29,0.18)",
  border: "1px solid rgba(248,113,113,0.18)",
};

const rankingCardStyle = {
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(30,64,175,0.18)",
  border: "1px solid rgba(96,165,250,0.18)",
};

const opportunityTitleStyle = {
  marginTop: 0,
};

const opportunityNameStyle = {
  display: "block",
  marginBottom: "12px",
};

const opportunityTextStyle = {
  margin: "4px 0",
  color: "#e5e7eb",
};

const insightsBoxStyle = {
  marginTop: "20px",
};

const sectionTitleStyle = {
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

const textStyle = {
  color: "#e5e7eb",
  lineHeight: "1.55",
};