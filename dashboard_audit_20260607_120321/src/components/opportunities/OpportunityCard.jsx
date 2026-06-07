import { normalizeOpportunityAction } from "../../services/intelligence/opportunityActionNormalizer";

export default function OpportunityCard({ opportunity = {}, onOpen }) {
  const decision = opportunity.decision || {};
  const action = normalizeOpportunityAction(
    decision.action || opportunity.action || "WATCH"
  );
  const title = opportunity.title || "Oportunidad detectada";

  const profit = getNumber(
    opportunity.profit ??
      opportunity.netProfit ??
      opportunity.expectedProfit ??
      opportunity.valuation?.profit
  );

  const roi = getNumber(
    opportunity.roi ??
      opportunity.netRoi ??
      opportunity.expectedROI ??
      opportunity.valuation?.roi
  );

  const confidenceScore = getNumber(
    decision.confidence?.score ??
      opportunity.confidenceScore ??
      opportunity.comparableConfidence ??
      opportunity.qualityScore
  );

  const executiveBuySignalScore = getNumber(opportunity.executiveBuySignalScore);
  const executiveBuySignalLabel =
    opportunity.executiveBuySignalLabel || "SIN_DATO";

  const timelineMomentumScore = getNumber(opportunity.timelineMomentumScore);
  const timelineMomentumLabel =
    opportunity.timelineMomentumLabel || "SIN_DATO";

  const price = getNumber(opportunity.price ?? opportunity.purchasePrice);
  const estimatedMarketValue = getNumber(
    opportunity.estimatedMarketValue ??
      opportunity.marketValuation?.estimatedMarketValue ??
      opportunity.vehicleValuation?.estimatedMarketValue
  );

  const reason =
    decision.reasons?.[0] ||
    decision.summary ||
    opportunity.reason ||
    "Oportunidad detectada por señales combinadas de mercado.";

  const badge = getBadge(action);

  return (
    <article style={cardStyle}>
      <div style={headerStyle}>
        <span
          style={{
            ...badgeStyle,
            background: badge.background,
            color: badge.color,
            border: badge.border,
          }}
        >
          {badge.icon} {action}
        </span>

        <span style={confidenceStyle}>Confianza {confidenceScore || 0}%</span>
      </div>

      <h3 style={titleStyle}>{title}</h3>

      <div style={metricsGridStyle}>
        <Metric label="Precio" value={price ? `${formatEuro(price)}` : "-"} />
        <Metric
          label="Valor IA"
          value={estimatedMarketValue ? `${formatEuro(estimatedMarketValue)}` : "-"}
        />
        <Metric
          label="Beneficio"
          value={profit ? `${profit > 0 ? "+" : ""}${formatEuro(profit)}` : "-"}
          highlight={profit > 0}
        />
        <Metric label="ROI" value={`${formatNumber(roi)}%`} />
        <Metric
          label="Executive"
          value={`${executiveBuySignalLabel} ${formatNumber(
            executiveBuySignalScore
          )}/100`}
        />
        <Metric
          label="Momentum"
          value={`${timelineMomentumLabel} ${formatNumber(
            timelineMomentumScore
          )}/100`}
        />
      </div>

      <p style={reasonStyle}>{reason}</p>

      {typeof onOpen === "function" && (
        <button type="button" onClick={() => onOpen(opportunity)} style={buttonStyle}>
          Ver oportunidad
        </button>
      )}
    </article>
  );
}

function Metric({ label, value, highlight = false }) {
  return (
    <div style={metricStyle}>
      <span style={metricLabelStyle}>{label}</span>
      <strong
        style={{
          ...metricValueStyle,
          color: highlight ? "#86efac" : "white",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function getBadge(action) {
  if (action === "BUY") {
    return {
      icon: "🚨",
      color: "#bbf7d0",
      background: "rgba(34,197,94,0.18)",
      border: "1px solid rgba(34,197,94,0.35)",
    };
  }

  if (action === "REJECT") {
    return {
      icon: "⛔",
      color: "#fecaca",
      background: "rgba(239,68,68,0.16)",
      border: "1px solid rgba(239,68,68,0.32)",
    };
  }

  return {
    icon: "👀",
    color: "#fde68a",
    background: "rgba(245,158,11,0.16)",
    border: "1px solid rgba(245,158,11,0.32)",
  };
}

function getNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatEuro(value) {
  return `${Math.round(getNumber(value)).toLocaleString("es-ES")} €`;
}

function formatNumber(value) {
  return getNumber(value).toLocaleString("es-ES", {
    maximumFractionDigits: 1,
  });
}

const cardStyle = {
  padding: "24px",
  borderRadius: "26px",
  background:
    "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.88))",
  border: "1px solid rgba(148,163,184,0.18)",
  boxShadow: "0 22px 70px rgba(2,6,23,0.35)",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "center",
  marginBottom: "16px",
};

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "9px 14px",
  borderRadius: "999px",
  fontWeight: "950",
  letterSpacing: "0.03em",
};

const confidenceStyle = {
  color: "#cbd5e1",
  fontSize: "13px",
  fontWeight: "850",
};

const titleStyle = {
  margin: "0 0 18px",
  color: "white",
  fontSize: "24px",
  lineHeight: 1.2,
};

const metricsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "12px",
  marginBottom: "18px",
};

const metricStyle = {
  padding: "14px",
  borderRadius: "18px",
  background: "rgba(2,6,23,0.45)",
  border: "1px solid rgba(148,163,184,0.12)",
};

const metricLabelStyle = {
  display: "block",
  color: "#94a3b8",
  fontSize: "12px",
  fontWeight: "800",
  marginBottom: "6px",
};

const metricValueStyle = {
  display: "block",
  fontSize: "18px",
  fontWeight: "950",
};

const reasonStyle = {
  margin: 0,
  color: "#dbeafe",
  lineHeight: "1.55",
  fontSize: "14px",
};

const buttonStyle = {
  marginTop: "18px",
  width: "100%",
  border: "none",
  borderRadius: "18px",
  padding: "13px 16px",
  background: "linear-gradient(135deg,#2563eb,#22c55e)",
  color: "white",
  fontWeight: "950",
  cursor: "pointer",
};