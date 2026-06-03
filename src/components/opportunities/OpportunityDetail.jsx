export default function OpportunityDetail({ opportunity = {} }) {
  const decision = opportunity.decision || {};
  const valuation = opportunity.valuation || {};
  const vehicleValuation = opportunity.vehicleValuation || {};
  const comparables = opportunity.comparables || {};
  const sellSpeed = opportunity.sellSpeed || {};
  const opportunityData = opportunity.opportunity || {};

  const action = decision.action || opportunity.action || "WATCH";
  const title = opportunity.title || buildVehicleTitle(opportunity);
  const badge = getBadge(action);

  const profit = getNumber(
    opportunity.profit ??
      opportunity.netProfit ??
      opportunity.expectedProfit ??
      valuation.profit
  );

  const roi = getNumber(
    opportunity.roi ??
      opportunity.netRoi ??
      opportunity.expectedROI ??
      valuation.roi
  );

  const price = getNumber(opportunity.price ?? opportunity.purchasePrice);
  const estimatedMarketValue = getNumber(
    opportunity.estimatedMarketValue ??
      opportunity.marketValuation?.estimatedMarketValue ??
      vehicleValuation.estimatedMarketValue
  );

  const confidenceScore = getNumber(
    decision.confidence?.score ??
      opportunity.confidenceScore ??
      opportunity.comparableConfidence ??
      vehicleValuation.confidence ??
      opportunity.qualityScore
  );

  const reasons = getReasons({
    decision,
    opportunityData,
    vehicleValuation,
    opportunity,
  });

  return (
    <article style={detailStyle}>
      <div style={headerStyle}>
        <div>
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

          <h2 style={titleStyle}>{title}</h2>

          <p style={summaryStyle}>
            {decision.summary ||
              vehicleValuation.summary ||
              opportunity.reason ||
              "Oportunidad detectada por señales combinadas de mercado."}
          </p>
        </div>

        <div style={confidenceBoxStyle}>
          <span style={confidenceLabelStyle}>Confianza</span>
          <strong style={confidenceValueStyle}>{confidenceScore || 0}%</strong>
        </div>
      </div>

      <div style={metricsGridStyle}>
        <Metric label="Precio" value={price ? formatEuro(price) : "-"} />
        <Metric
          label="Valor IA"
          value={estimatedMarketValue ? formatEuro(estimatedMarketValue) : "-"}
        />
        <Metric
          label="Beneficio"
          value={profit ? `${profit > 0 ? "+" : ""}${formatEuro(profit)}` : "-"}
          highlight={profit > 0}
        />
        <Metric label="ROI" value={`${formatNumber(roi)}%`} />
      </div>

      <section style={sectionStyle}>
        <p style={sectionTitleStyle}>🧠 Motivos de la decisión</p>

        {reasons.length === 0 ? (
          <p style={emptyTextStyle}>
            Todavía no hay motivos suficientes para explicar esta oportunidad.
          </p>
        ) : (
          <div style={reasonListStyle}>
            {reasons.slice(0, 6).map((reason, index) => (
              <p key={`${reason}-${index}`} style={reasonStyle}>
                ✓ {reason}
              </p>
            ))}
          </div>
        )}
      </section>

      <section style={sectionStyle}>
        <p style={sectionTitleStyle}>📈 Mercado</p>

        <div style={miniGridStyle}>
          <MiniMetric
            label="Valor estimado"
            value={estimatedMarketValue ? formatEuro(estimatedMarketValue) : "-"}
          />
          <MiniMetric
            label="Comparables"
            value={comparables.totalComparables || 0}
          />
          <MiniMetric
            label="Descuento"
            value={`${formatNumber(vehicleValuation.discountPercent)}%`}
          />
          <MiniMetric
            label="Valoración"
            value={valuation.valuationLabel || "Sin dato"}
          />
        </div>

        <p style={sectionTextStyle}>
          {vehicleValuation.summary ||
            "La validación de mercado se construye combinando valoración IA, descuento estimado y comparables disponibles."}
        </p>
      </section>

      <section style={sectionStyle}>
        <p style={sectionTitleStyle}>⚡ Sell Speed</p>

        <div style={miniGridStyle}>
          <MiniMetric
            label="Rotación"
            value={sellSpeed.speedLabel || "SIN_DATO"}
          />
          <MiniMetric
            label="Score"
            value={`${formatNumber(sellSpeed.sellSpeedScore)}/100`}
          />
          <MiniMetric
            label="Venta estimada"
            value={`${sellSpeed.estimatedSellDays || 0} días`}
          />
          <MiniMetric
            label="Liquidez"
            value={sellSpeed.liquidityLabel || sellSpeed.speedLabel || "Sin dato"}
          />
        </div>

        <p style={sectionTextStyle}>
          {sellSpeed.summary ||
            "Todavía no hay suficiente señal de rotación para estimar la velocidad de venta con precisión."}
        </p>
      </section>

      <section style={sectionStyle}>
        <p style={sectionTitleStyle}>🛡️ Evaluación IA</p>

        <div style={miniGridStyle}>
          <MiniMetric
            label="Margen"
            value={profit ? formatEuro(profit) : "-"}
          />
          <MiniMetric label="ROI" value={`${formatNumber(roi)}%`} />
          <MiniMetric
            label="Score decisión"
            value={`${decision.decisionScore || 0}/100`}
          />
          <MiniMetric
            label="Nivel"
            value={decision.label || opportunityData.opportunityLevelV2 || action}
          />
        </div>

        <p style={sectionTextStyle}>
          {decision.summary ||
            "La evaluación IA combina margen, ROI, confianza, valoración y señales de mercado para priorizar la decisión."}
        </p>
      </section>
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

function MiniMetric({ label, value }) {
  return (
    <div style={miniMetricStyle}>
      <span style={miniMetricLabelStyle}>{label}</span>
      <strong style={miniMetricValueStyle}>{value}</strong>
    </div>
  );
}

function getReasons({ decision, opportunityData, vehicleValuation, opportunity }) {
  if (Array.isArray(decision.reasons) && decision.reasons.length > 0) {
    return decision.reasons;
  }

  if (
    Array.isArray(opportunityData.opportunityReasonsV2) &&
    opportunityData.opportunityReasonsV2.length > 0
  ) {
    return opportunityData.opportunityReasonsV2;
  }

  if (vehicleValuation.summary) {
    return [vehicleValuation.summary];
  }

  if (opportunity.reason) {
    return [opportunity.reason];
  }

  return [];
}

function buildVehicleTitle(item = {}) {
  return (
    [item.brand, item.model, item.version, item.year].filter(Boolean).join(" ") ||
    item.title ||
    "Vehículo sin identificar"
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

const detailStyle = {
  padding: "24px",
  borderRadius: "26px",
  background:
    "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.88))",
  border: "1px solid rgba(148,163,184,0.18)",
  boxShadow: "0 22px 70px rgba(2,6,23,0.35)",
};

const headerStyle = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: "18px",
  alignItems: "flex-start",
  marginBottom: "18px",
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

const titleStyle = {
  margin: "16px 0 10px",
  color: "white",
  fontSize: "28px",
  lineHeight: 1.2,
};

const summaryStyle = {
  margin: 0,
  color: "#dbeafe",
  lineHeight: 1.6,
  fontWeight: "700",
};

const confidenceBoxStyle = {
  minWidth: "126px",
  padding: "14px",
  borderRadius: "18px",
  background: "rgba(37,99,235,0.10)",
  border: "1px solid rgba(59,130,246,0.18)",
  textAlign: "center",
};

const confidenceLabelStyle = {
  display: "block",
  color: "#93c5fd",
  fontSize: "12px",
  fontWeight: "900",
  marginBottom: "6px",
};

const confidenceValueStyle = {
  color: "#ffffff",
  fontSize: "26px",
  fontWeight: "950",
};

const metricsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
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

const sectionStyle = {
  marginTop: "16px",
  padding: "16px",
  borderRadius: "20px",
  background: "rgba(2,6,23,0.35)",
  border: "1px solid rgba(148,163,184,0.12)",
};

const sectionTitleStyle = {
  margin: "0 0 12px 0",
  color: "#fde68a",
  fontSize: "15px",
  fontWeight: "950",
};

const miniGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
  gap: "10px",
};

const miniMetricStyle = {
  padding: "10px",
  borderRadius: "14px",
  background: "rgba(15,23,42,0.72)",
  border: "1px solid rgba(148,163,184,0.10)",
};

const miniMetricLabelStyle = {
  display: "block",
  color: "#94a3b8",
  fontSize: "11px",
  marginBottom: "5px",
  fontWeight: "800",
};

const miniMetricValueStyle = {
  color: "#f8fafc",
  fontSize: "14px",
  fontWeight: "950",
};

const reasonListStyle = {
  display: "grid",
  gap: "8px",
};

const reasonStyle = {
  margin: 0,
  color: "#bbf7d0",
  fontWeight: "850",
  lineHeight: "1.45",
};

const sectionTextStyle = {
  margin: "12px 0 0 0",
  color: "#cbd5e1",
  lineHeight: "1.55",
  fontSize: "13px",
  fontWeight: "700",
};

const emptyTextStyle = {
  color: "#94a3b8",
  margin: 0,
  lineHeight: "1.45",
};