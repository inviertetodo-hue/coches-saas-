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
  const modelLearning = learning?.modelLearning || [];
  const brandLearning = learning?.brandLearning || [];
  const learningSignals = learning?.learningSignals || [];

  return (
    <>
      <LearningDashboard
        modelLearning={modelLearning}
        brandLearning={brandLearning}
        learningSignals={learningSignals}
      />

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

function LearningDashboard({
  modelLearning = [],
  brandLearning = [],
  learningSignals = [],
}) {
  const topModels = modelLearning.slice(0, 5);
  const topBrands = brandLearning.slice(0, 3);

  return (
    <section style={learningDashboardStyle}>
      <div style={learningHeaderStyle}>
        <p style={learningKickerStyle}>FASE 7.3 · Learning Dashboard</p>
        <h3 style={learningTitleStyle}>Aprendizaje histórico aplicado</h3>
        <p style={learningTextStyle}>
          Modelos, marcas y señales que el sistema está aprendiendo desde tu
          memoria real de mercado.
        </p>
      </div>

      <div style={learningGridStyle}>
        <LearningMetric
          label="Modelos aprendidos"
          value={modelLearning.length}
        />

        <LearningMetric
          label="Marcas aprendidas"
          value={brandLearning.length}
        />

        <LearningMetric
          label="Modelo líder"
          value={topModels[0]?.label || "n/d"}
        />

        <LearningMetric
          label="Bonus líder"
          value={formatBonus(topModels[0]?.learningBonus || 0)}
        />
      </div>

      <div style={learningColumnsStyle}>
        <div style={learningBlockStyle}>
          <h4 style={learningBlockTitleStyle}>🚗 Top modelos aprendidos</h4>

          {!topModels.length && (
            <p style={learningMutedStyle}>
              Todavía no hay modelos suficientes para aprender.
            </p>
          )}

          {topModels.map((item, index) => (
            <LearningRow
              key={`${item.label}-${index}`}
              index={index}
              item={item}
            />
          ))}
        </div>

        <div style={learningBlockStyle}>
          <h4 style={learningBlockTitleStyle}>🏷️ Top marcas aprendidas</h4>

          {!topBrands.length && (
            <p style={learningMutedStyle}>
              Todavía no hay marcas suficientes para aprender.
            </p>
          )}

          {topBrands.map((item, index) => (
            <LearningRow
              key={`${item.label}-${index}`}
              index={index}
              item={item}
            />
          ))}
        </div>
      </div>

      <div style={learningSignalsStyle}>
        <h4 style={learningBlockTitleStyle}>🧠 Señales de aprendizaje</h4>

        {!learningSignals.length && (
          <p style={learningMutedStyle}>
            Sin señales de aprendizaje suficientes todavía.
          </p>
        )}

        {learningSignals.map((signal, index) => (
          <p key={`${signal}-${index}`} style={learningSignalItemStyle}>
            {signal}
          </p>
        ))}
      </div>
    </section>
  );
}

function LearningMetric({ label, value }) {
  return (
    <div style={learningMetricStyle}>
      <p style={learningMetricLabelStyle}>{label}</p>
      <strong style={learningMetricValueStyle}>{value}</strong>
    </div>
  );
}

function LearningRow({ index, item }) {
  return (
    <div style={learningRowStyle}>
      <div>
        <strong style={learningRowTitleStyle}>
          #{index + 1} · {item.label}
        </strong>

        <p style={learningRowTextStyle}>
          {item.analyses || item.count || 0} análisis · ROI medio{" "}
          {item.averageROI}% · Beneficio medio {item.averageProfit} €
        </p>

        <p style={learningRowTextStyle}>
          Confianza {item.confidence || "n/d"} · Score{" "}
          {item.averageScore || 0}/100
        </p>
      </div>

      <div style={learningBonusStyle}>
        {formatBonus(item.learningBonus || 0)}
      </div>
    </div>
  );
}

function formatBonus(value) {
  const number = Number(value || 0);

  if (number > 0) return `+${number}`;
  return String(number);
}

const learningDashboardStyle = {
  marginBottom: "28px",
  padding: "24px",
  borderRadius: "24px",
  background: "rgba(20,83,45,0.24)",
  border: "1px solid rgba(34,197,94,0.24)",
};

const learningHeaderStyle = {
  marginBottom: "18px",
};

const learningKickerStyle = {
  margin: 0,
  color: "#86efac",
  fontWeight: "900",
  fontSize: "13px",
};

const learningTitleStyle = {
  margin: "8px 0 8px 0",
  fontSize: "24px",
  color: "#ffffff",
};

const learningTextStyle = {
  margin: 0,
  color: "#d1fae5",
  lineHeight: "1.55",
};

const learningGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
  gap: "14px",
  marginBottom: "18px",
};

const learningMetricStyle = {
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(2,6,23,0.46)",
};

const learningMetricLabelStyle = {
  margin: 0,
  color: "#bbf7d0",
  fontSize: "12px",
  fontWeight: "800",
};

const learningMetricValueStyle = {
  display: "block",
  marginTop: "8px",
  color: "#ffffff",
  fontSize: "20px",
  lineHeight: "1.25",
};

const learningColumnsStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
  gap: "16px",
};

const learningBlockStyle = {
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(2,6,23,0.42)",
  border: "1px solid rgba(148,163,184,0.14)",
};

const learningBlockTitleStyle = {
  margin: "0 0 14px 0",
  color: "#f8fafc",
  fontSize: "16px",
};

const learningMutedStyle = {
  margin: 0,
  color: "#cbd5e1",
  fontSize: "14px",
};

const learningRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "14px",
  padding: "12px 0",
  borderTop: "1px solid rgba(148,163,184,0.12)",
};

const learningRowTitleStyle = {
  color: "#e5e7eb",
  fontSize: "14px",
};

const learningRowTextStyle = {
  margin: "6px 0 0 0",
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: "1.45",
};

const learningBonusStyle = {
  minWidth: "58px",
  alignSelf: "center",
  textAlign: "center",
  color: "#86efac",
  fontWeight: "900",
  fontSize: "18px",
};

const learningSignalsStyle = {
  marginTop: "16px",
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(2,6,23,0.38)",
  border: "1px solid rgba(34,197,94,0.16)",
};

const learningSignalItemStyle = {
  margin: "10px 0 0 0",
  padding: "12px 14px",
  borderRadius: "14px",
  background: "rgba(34,197,94,0.10)",
  color: "#dcfce7",
  fontSize: "13px",
  lineHeight: "1.5",
};

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