export default function OpportunityIntelligencePanel({ pipeline }) {
  if (!pipeline || pipeline.totalRecords === 0) {
    return (
      <div style={panelStyle}>
        <p style={eyebrowStyle}>FASE 10.6.0 · Opportunity Intelligence</p>
        <h2 style={titleStyle}>🏆 Top oportunidades detectadas</h2>
        <p style={emptyTextStyle}>
          Todavía no hay suficientes registros para construir un ranking de oportunidades.
        </p>
      </div>
    );
  }

  const summary = pipeline.summary || {};
  const topItems = pipeline.topOpportunities || [];

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>FASE 10.6.0 · Opportunity Intelligence</p>
          <h2 style={titleStyle}>🏆 Top oportunidades detectadas</h2>
        </div>

        <strong style={badgeStyle}>
          {pipeline.buyCount || 0} BUY · {pipeline.watchCount || 0} WATCH ·{" "}
          {pipeline.rejectCount || 0} REJECT
        </strong>
      </div>

      <div style={gridStyle}>
        <MetricCard label="Vehículos analizados" value={summary.totalRecords || 0} />
        <MetricCard label="Capital requerido" value={`${formatNumber(summary.requiredCapital)} €`} />
        <MetricCard label="Beneficio potencial" value={`${formatNumber(summary.expectedProfit)} €`} />
        <MetricCard label="ROI medio" value={`${formatNumber(summary.averageROI)}%`} />
      </div>

      {topItems.length === 0 ? (
        <p style={emptyTextStyle}>No hay oportunidades destacadas para mostrar todavía.</p>
      ) : (
        <div style={listStyle}>
          {topItems.slice(0, 10).map((item, index) => (
            <OpportunityRow
              key={item.id || `${item.brand}-${item.model}-${index}`}
              item={item}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OpportunityRow({ item, index }) {
  const decision = item.decision || {};
  const valuation = item.valuation || {};
  const opportunity = item.opportunity || {};

  return (
    <div style={rowStyle}>
      <div style={rankStyle}>#{index + 1}</div>

      <div style={mainStyle}>
        <strong style={vehicleStyle}>
          {[item.brand, item.model, item.year].filter(Boolean).join(" ") ||
            "Vehículo sin identificar"}
        </strong>

        <p style={summaryStyle}>
          {decision.summary || "Sin resumen de decisión disponible."}
        </p>

        <div style={tagsStyle}>
          <span style={tagStyle}>ROI {formatNumber(item.roi)}%</span>
          <span style={tagStyle}>Margen {formatNumber(item.profit)} €</span>
          <span style={tagStyle}>
            Valoración {valuation.valuationLabel || "sin dato"}
          </span>
        </div>
      </div>

      <div style={scoreBoxStyle}>
        <strong style={actionStyle}>{decision.label || "Sin decisión"}</strong>
        <span style={scoreStyle}>
          {decision.decisionScore || opportunity.opportunityScore || 0}/100
        </span>
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div style={metricCardStyle}>
      <p style={metricLabelStyle}>{label}</p>
      <strong style={metricValueStyle}>{value}</strong>
    </div>
  );
}

function formatNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  return numericValue.toLocaleString("es-ES", {
    maximumFractionDigits: 2,
  });
}

const panelStyle = {
  padding: "22px",
  borderRadius: "24px",
  background:
    "linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,41,59,0.72))",
  border: "1px solid rgba(250,204,21,0.28)",
  marginBottom: "28px",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  alignItems: "flex-start",
  marginBottom: "18px",
  flexWrap: "wrap",
};

const eyebrowStyle = {
  margin: "0 0 6px 0",
  color: "#fde68a",
  fontSize: "12px",
  fontWeight: "900",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const titleStyle = {
  margin: 0,
  fontSize: "21px",
  fontWeight: "900",
};

const badgeStyle = {
  padding: "10px 14px",
  borderRadius: "999px",
  background: "rgba(250,204,21,0.14)",
  border: "1px solid rgba(250,204,21,0.3)",
  color: "#fef3c7",
  fontSize: "12px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: "14px",
  marginBottom: "18px",
};

const metricCardStyle = {
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(2,6,23,0.45)",
  border: "1px solid rgba(148,163,184,0.18)",
};

const metricLabelStyle = {
  margin: 0,
  color: "#cbd5e1",
  fontSize: "12px",
  fontWeight: "800",
};

const metricValueStyle = {
  display: "block",
  marginTop: "8px",
  color: "#ffffff",
  fontSize: "22px",
};

const listStyle = {
  display: "grid",
  gap: "12px",
};

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "54px 1fr auto",
  gap: "14px",
  alignItems: "center",
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(15,23,42,0.66)",
  border: "1px solid rgba(148,163,184,0.18)",
};

const rankStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "14px",
  display: "grid",
  placeItems: "center",
  background: "rgba(250,204,21,0.16)",
  color: "#fef3c7",
  fontWeight: "900",
};

const mainStyle = {
  minWidth: 0,
};

const vehicleStyle = {
  display: "block",
  color: "#ffffff",
  fontSize: "15px",
  marginBottom: "6px",
};

const summaryStyle = {
  margin: "0 0 10px 0",
  color: "#cbd5e1",
  lineHeight: "1.45",
  fontSize: "13px",
};

const tagsStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const tagStyle = {
  padding: "6px 9px",
  borderRadius: "999px",
  background: "rgba(56,189,248,0.12)",
  border: "1px solid rgba(56,189,248,0.2)",
  color: "#bae6fd",
  fontSize: "12px",
  fontWeight: "800",
};

const scoreBoxStyle = {
  textAlign: "right",
  minWidth: "105px",
};

const actionStyle = {
  display: "block",
  color: "#bbf7d0",
  fontSize: "14px",
  marginBottom: "4px",
};

const scoreStyle = {
  color: "#fef3c7",
  fontWeight: "900",
};

const emptyTextStyle = {
  color: "#94a3b8",
  margin: 0,
};