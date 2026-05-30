import { MetricCard } from "./DashboardBlocks";

export default function DealDecisionPanel({ decisions }) {
  const items = Array.isArray(decisions?.decisions)
    ? decisions.decisions.slice(0, 12)
    : [];

  const buyCount = items.filter((item) => item.decision === "Comprar").length;
  const negotiateCount = items.filter(
    (item) => item.decision === "Negociar"
  ).length;
  const watchCount = items.filter(
    (item) => item.decision === "Vigilar"
  ).length;
  const discardCount = items.filter(
    (item) => item.decision === "Descartar"
  ).length;

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>⚖️ AI Deal Decisions V2</h2>

      <p style={subtitleStyle}>
        Decisión ejecutiva por operación: comprar, negociar, vigilar o
        descartar.
      </p>

      <div style={gridStyle}>
        <MetricCard
          label="Decision Score"
          value={`${decisions?.decisionScore || 0}/100`}
        />

        <MetricCard
          label="Decision Level"
          value={decisions?.decisionLevel || "-"}
        />

        <MetricCard label="Comprar" value={buyCount} />

        <MetricCard label="Descartar" value={discardCount} />
      </div>

      <div style={statusGridStyle}>
        <StatusCard
          title="Comprar"
          value={buyCount}
          text="Operaciones claras para priorizar."
        />

        <StatusCard
          title="Negociar"
          value={negotiateCount}
          text="Interesantes, pero requieren validación."
        />

        <StatusCard
          title="Vigilar"
          value={watchCount}
          text="Seguimiento sin acción inmediata."
        />

        <StatusCard
          title="Descartar"
          value={discardCount}
          text="Riesgo o rentabilidad insuficiente."
        />
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>🧠 Decision Insights</p>

        {!decisions?.insights?.length && (
          <p style={emptyStyle}>
            Todavía no hay insights de decisión.
          </p>
        )}

        {decisions?.insights?.map((item, index) => (
          <div key={index} style={insightCardStyle}>
            {item}
          </div>
        ))}
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>⚖️ Deal Decisions</p>

        {items.length === 0 && (
          <p style={emptyStyle}>
            Todavía no hay decisiones IA disponibles.
          </p>
        )}

        {items.map((item, index) => (
          <DecisionCard
            key={item.id || `${item.title}-${index}`}
            item={item}
          />
        ))}
      </div>
    </div>
  );
}

function DecisionCard({ item }) {
  const reasons = Array.isArray(item.reasons)
    ? item.reasons.slice(0, 5)
    : item.reason
    ? [item.reason]
    : [];

  return (
    <div style={getDecisionCardStyle(item.decision)}>
      <div style={topRowStyle}>
        <div>
          <h3 style={dealTitleStyle}>
            {item.title || "Vehículo IA"}
          </h3>

          <p style={decisionStyle}>
            {getDecisionEmoji(item.decision)} {item.decision}
          </p>
        </div>

        <span style={priorityBadgeStyle}>
          {item.priority || "Media"}
        </span>
      </div>

      <div style={miniGridStyle}>
        <MiniMetric
          label="Score"
          value={`${item.score || 0}/100`}
        />

        <MiniMetric
          label="ROI"
          value={`${item.roi || 0}%`}
        />

        <MiniMetric
          label="Beneficio"
          value={`${item.profit || 0} €`}
        />

        <MiniMetric
          label="Decision Score"
          value={`${item.decisionScore || 0}/100`}
        />
      </div>

      <div style={miniGridStyle}>
        <MiniMetric
          label="Riesgo"
          value={item.riskLevel || "-"}
        />

        <MiniMetric
          label="Liquidez"
          value={item.liquidityLevel || "-"}
        />

        <MiniMetric
          label="Prioridad"
          value={item.priority || "-"}
        />
      </div>

      <div style={confidenceBoxStyle}>
        <p style={confidenceTitleStyle}>
          📚 Confianza histórica
        </p>

        <p style={confidenceLevelStyle}>
          {item.historicalConfidenceLevel || "Inicial"}
        </p>

        <p style={confidenceReasonStyle}>
          {item.historicalConfidenceReason ||
            "Todavía no hay suficiente histórico comparable."}
        </p>
      </div>

      <div style={reasonBoxStyle}>
        <p style={reasonTitleStyle}>Motivos</p>

        {reasons.map((reason, index) => (
          <p key={index} style={reasonStyle}>
            ✓ {reason}
          </p>
        ))}
      </div>

      <p style={nextActionStyle}>
        Próxima acción:{" "}
        {item.nextAction ||
          "Revisar operación antes de actuar."}
      </p>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div style={miniMetricStyle}>
      <span style={miniMetricLabelStyle}>{label}</span>

      <strong style={miniMetricValueStyle}>
        {value}
      </strong>
    </div>
  );
}

function StatusCard({ title, value, text }) {
  return (
    <div style={statusCardStyle}>
      <p style={statusTitleStyle}>{title}</p>

      <strong style={statusValueStyle}>
        {value}
      </strong>

      <p style={statusTextStyle}>{text}</p>
    </div>
  );
}

function getDecisionEmoji(decision) {
  if (decision === "Comprar") return "🔥";
  if (decision === "Negociar") return "🟢";
  if (decision === "Vigilar") return "🟡";
  if (decision === "Descartar") return "🔴";
  return "⚖️";
}

function getDecisionCardStyle(decision) {
  if (decision === "Comprar") return buyCardStyle;
  if (decision === "Negociar") return negotiateCardStyle;
  if (decision === "Vigilar") return watchCardStyle;
  if (decision === "Descartar") return discardCardStyle;
  return neutralCardStyle;
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
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: "18px",
  marginBottom: "24px",
};

const statusGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(180px,1fr))",
  gap: "14px",
  marginBottom: "26px",
};

const statusCardStyle = {
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(250,204,21,0.12)",
  border: "1px solid rgba(250,204,21,0.20)",
};

const statusTitleStyle = {
  margin: 0,
  color: "#fde68a",
  fontWeight: "900",
  fontSize: "13px",
};

const statusValueStyle = {
  display: "block",
  marginTop: "8px",
  color: "#ffffff",
  fontSize: "28px",
};

const statusTextStyle = {
  margin: "8px 0 0 0",
  color: "#cbd5e1",
  fontSize: "12px",
  lineHeight: "1.45",
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

const baseCardStyle = {
  padding: "18px",
  borderRadius: "20px",
  marginBottom: "14px",
};

const buyCardStyle = {
  ...baseCardStyle,
  background:
    "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(37,99,235,0.10))",
  border: "1px solid rgba(34,197,94,0.30)",
};

const negotiateCardStyle = {
  ...baseCardStyle,
  background:
    "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(250,204,21,0.10))",
  border: "1px solid rgba(34,197,94,0.24)",
};

const watchCardStyle = {
  ...baseCardStyle,
  background:
    "linear-gradient(135deg, rgba(250,204,21,0.14), rgba(37,99,235,0.08))",
  border: "1px solid rgba(250,204,21,0.25)",
};

const discardCardStyle = {
  ...baseCardStyle,
  background:
    "linear-gradient(135deg, rgba(239,68,68,0.14), rgba(15,23,42,0.60))",
  border: "1px solid rgba(239,68,68,0.28)",
};

const neutralCardStyle = {
  ...baseCardStyle,
  background: "rgba(15,23,42,0.78)",
  border: "1px solid rgba(148,163,184,0.18)",
};

const topRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  alignItems: "flex-start",
  flexWrap: "wrap",
  marginBottom: "12px",
};

const dealTitleStyle = {
  fontSize: "20px",
  margin: "0 0 8px 0",
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
  margin: 0,
};

const miniGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(120px,1fr))",
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

const confidenceBoxStyle = {
  marginTop: "8px",
  marginBottom: "12px",
  padding: "14px",
  borderRadius: "16px",
  background: "rgba(37,99,235,0.10)",
  border: "1px solid rgba(59,130,246,0.18)",
};

const confidenceTitleStyle = {
  margin: "0 0 8px 0",
  color: "#93c5fd",
  fontWeight: "900",
};

const confidenceLevelStyle = {
  margin: "0 0 8px 0",
  color: "#ffffff",
  fontWeight: "900",
  fontSize: "18px",
};

const confidenceReasonStyle = {
  margin: 0,
  color: "#cbd5e1",
  lineHeight: "1.45",
};

const reasonBoxStyle = {
  marginTop: "8px",
  padding: "14px",
  borderRadius: "16px",
  background: "rgba(2,6,23,0.35)",
};

const reasonTitleStyle = {
  margin: "0 0 8px 0",
  color: "#fde68a",
  fontWeight: "900",
};

const reasonStyle = {
  color: "#fde68a",
  fontWeight: "800",
  margin: "6px 0",
  lineHeight: "1.45",
};

const nextActionStyle = {
  color: "#e5e7eb",
  margin: "12px 0 0 0",
  lineHeight: "1.45",
  fontWeight: "800",
};

const emptyStyle = {
  color: "#94a3b8",
};