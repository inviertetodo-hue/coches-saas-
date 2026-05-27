import {
  InsightSection,
  AlertSection,
} from "./DashboardBlocks";

export default function AIInsightsPanel({
  learning,
  confidence,
  risk,
  portfolio,
  market,
  trends,
  temporal,
}) {
  return (
    <>
      <InsightSection
        title="🧠 AI Learning Insights"
        items={learning.learningInsights}
        empty="Sin aprendizaje IA todavía."
        cardStyle={learningCardStyle}
      />

      <InsightSection
        title="📚 Learned Patterns"
        items={learning.learnedPatterns}
        empty="Sin patrones aprendidos todavía."
        cardStyle={learningCardStyle}
      />

      <InsightSection
        title="🎯 AI Confidence"
        items={confidence.confidenceInsights}
        empty="Sin insights de confianza IA."
        cardStyle={confidenceCardStyle}
      />

      <AlertSection
        title="⚠️ Weak AI Signals"
        items={confidence.unstableSignals}
        empty="Sin señales débiles IA."
        styleType="warning"
      />

      <AlertSection
        title="🛡️ Risk Alerts"
        items={risk.riskAlerts}
        empty="Sin alertas de riesgo."
        styleType="risk"
      />

      <InsightSection
        title="🧯 Risk Insights"
        items={risk.riskInsights}
        empty="Sin insights de riesgo."
        cardStyle={riskCardStyle}
      />

      <InsightSection
        title="📈 Portfolio Strategy"
        items={portfolio.strategyInsights}
        empty="Sin estrategia suficiente todavía."
        cardStyle={portfolioCardStyle}
      />

      <InsightSection
        title="🧠 Market Insights"
        items={market.marketInsights}
        empty="Sin insights de mercado todavía."
        cardStyle={insightCardStyle}
      />

      <InsightSection
        title="📊 Trend Insights"
        items={trends.trendInsights}
        empty="Sin tendencias suficientes todavía."
        cardStyle={trendCardStyle}
      />

      <InsightSection
        title="🕒 Temporal Insights"
        items={temporal.temporalInsights}
        empty="Todavía no hay suficiente información temporal."
        cardStyle={temporalCardStyle}
      />
    </>
  );
}

const insightCardStyle = {
  background: "rgba(255,255,255,0.05)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
};

const learningCardStyle = {
  background: "rgba(34,197,94,0.10)",
  border: "1px solid rgba(34,197,94,0.20)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
  fontWeight: "800",
};

const confidenceCardStyle = {
  background: "rgba(59,130,246,0.10)",
  border: "1px solid rgba(59,130,246,0.20)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
  fontWeight: "800",
};

const riskCardStyle = {
  background: "rgba(239,68,68,0.10)",
  border: "1px solid rgba(239,68,68,0.22)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
};

const portfolioCardStyle = {
  background: "rgba(168,85,247,0.12)",
  border: "1px solid rgba(168,85,247,0.25)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
};

const trendCardStyle = {
  background: "rgba(37,99,235,0.12)",
  border: "1px solid rgba(59,130,246,0.2)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
};

const temporalCardStyle = {
  background: "rgba(34,197,94,0.10)",
  border: "1px solid rgba(34,197,94,0.2)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
};