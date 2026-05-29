import { MetricCard } from "./DashboardBlocks";

export default function OpportunityRadarPanel({ radar }) {
  const opportunities = Array.isArray(radar?.priorityOpportunities)
    ? radar.priorityOpportunities.slice(0, 12)
    : [];

  const urgentCount = opportunities.filter((item) => getRadarLevel(item) === "Alta").length;
  const mediumCount = opportunities.filter((item) => getRadarLevel(item) === "Media").length;
  const averageROI = calculateAverage(opportunities, "roi");

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>📡 Opportunity Radar V2</h2>

      <p style={subtitleStyle}>
        Radar ejecutivo para detectar oportunidades prioritarias, urgencia de acción
        y calidad del mercado según score, ROI y beneficio.
      </p>

      <div style={gridStyle}>
        <MetricCard
          label="Radar Score"
          value={`${radar?.radarScore || 0}/100`}
        />

        <MetricCard
          label="Radar Level"
          value={radar?.radarLevel || "-"}
        />

        <MetricCard
          label="Priority Deals"
          value={opportunities.length}
        />

        <MetricCard
          label="ROI medio radar"
          value={`${averageROI}%`}
        />
      </div>

      <div style={signalGridStyle}>
        <SignalCard
          title="Alta prioridad"
          value={urgentCount}
          text="Oportunidades que merecen revisión inmediata."
        />

        <SignalCard
          title="Prioridad media"
          value={mediumCount}
          text="Candidatos interesantes para comparar."
        />

        <SignalCard
          title="Radar mode"
          value={getRadarMode(opportunities)}
          text="Lectura rápida del estado actual del mercado."
        />
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>🚀 Radar Insights</p>

        {!radar?.radarInsights?.length && (
          <p style={emptyStyle}>Aún no hay insights suficientes para el radar.</p>
        )}

        {radar?.radarInsights?.map((item, index) => (
          <div key={index} style={insightCardStyle}>
            {item}
          </div>
        ))}
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>🏆 Priority Opportunities</p>

        {opportunities.length === 0 && (
          <p style={emptyStyle}>
            No hay oportunidades prioritarias todavía.
          </p>
        )}

        {opportunities.map((item, index) => (
          <RadarDeal key={item.id || `${item.title}-${index}`} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}

function RadarDeal({ item, index }) {
  const score = Number(item.score || 0);
  const roi = Number(item.roi || 0);
  const profit = Number(item.profit || 0);
  const level = getRadarLevel(item);

  return (
    <div style={dealCardStyle}>
      <div style={dealHeaderStyle}>
        <div>
          <p style={rankStyle}>Radar #{index + 1}</p>
          <h3 style={dealTitleStyle}>{item.title || "Oportunidad sin título"}</h3>
        </div>

        <span style={levelPillStyle}>{level}</span>
      </div>

      <div style={miniGridStyle}>
        <MiniMetric label="Score" value={`${score}/100`} />
        <MiniMetric label="ROI" value={`${roi}%`} />
        <MiniMetric label="Beneficio" value={`${profit} €`} />
      </div>

      <div style={barTrackStyle}>
        <div
          style={{
            ...barFillStyle,
            width: `${Math.min(Math.max(score, 0), 100)}%`,
          }}
        />
      </div>

      <p style={reasonStyle}>
        {item.reason || buildRadarReason(score, roi, profit)}
      </p>

      <p style={actionStyle}>
        Acción sugerida: {getRadarAction(level)}
      </p>
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

function SignalCard({ title, value, text }) {
  return (
    <div style={signalCardStyle}>
      <p style={signalTitleStyle}>{title}</p>
      <strong style={signalValueStyle}>{value}</strong>
      <p style={signalTextStyle}>{text}</p>
    </div>
  );
}

function getRadarLevel(item) {
  const score = Number(item?.score || 0);
  const roi = Number(item?.roi || 0);
  const profit = Number(item?.profit || 0);

  if (score >= 85 && roi >= 25 && profit >= 2500) {
    return "Alta";
  }

  if (score >= 75 && roi >= 15) {
    return "Media";
  }

  return "Observación";
}

function getRadarMode(items = []) {
  const high = items.filter((item) => getRadarLevel(item) === "Alta").length;

  if (high >= 3) return "Mercado activo";
  if (high >= 1) return "Comprar selectivo";
  if (items.length >= 5) return "Vigilar";
  return "Esperar datos";
}

function getRadarAction(level) {
  if (level === "Alta") return "comparar ya y contactar vendedor";
  if (level === "Media") return "validar datos y seguir precio";
  return "mantener en observación";
}

function buildRadarReason(score, roi, profit) {
  if (score >= 85 && roi >= 25) {
    return `Señal fuerte por score ${score}, ROI ${roi}% y beneficio estimado de ${profit} €.`;
  }

  if (score >= 75) {
    return "Oportunidad interesante, pero todavía necesita comparación adicional.";
  }

  return "Oportunidad detectada para observación, sin prioridad inmediata.";
}

function calculateAverage(items, field) {
  if (!items.length) return 0;

  const values = items
    .map((item) => Number(item[field] || 0))
    .filter((value) => Number.isFinite(value));

  if (!values.length) return 0;

  return Math.round(values.reduce((acc, value) => acc + value, 0) / values.length);
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
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: "18px",
  marginBottom: "24px",
};

const signalGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
  gap: "14px",
  marginBottom: "26px",
};

const signalCardStyle = {
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(59,130,246,0.12)",
  border: "1px solid rgba(59,130,246,0.22)",
};

const signalTitleStyle = {
  margin: 0,
  color: "#93c5fd",
  fontWeight: "900",
  fontSize: "13px",
};

const signalValueStyle = {
  display: "block",
  marginTop: "8px",
  color: "#ffffff",
  fontSize: "28px",
};

const signalTextStyle = {
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
  background: "rgba(59,130,246,0.10)",
  border: "1px solid rgba(59,130,246,0.20)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
  fontWeight: "800",
};

const dealCardStyle = {
  background:
    "linear-gradient(135deg, rgba(34,197,94,0.14), rgba(37,99,235,0.12))",
  border: "1px solid rgba(34,197,94,0.25)",
  padding: "18px",
  borderRadius: "20px",
  marginBottom: "14px",
};

const dealHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "14px",
  alignItems: "flex-start",
  flexWrap: "wrap",
  marginBottom: "12px",
};

const rankStyle = {
  margin: "0 0 6px 0",
  color: "#93c5fd",
  fontSize: "12px",
  fontWeight: "900",
};

const dealTitleStyle = {
  fontSize: "20px",
  margin: 0,
};

const levelPillStyle = {
  padding: "7px 11px",
  borderRadius: "999px",
  background: "rgba(34,197,94,0.16)",
  border: "1px solid rgba(34,197,94,0.25)",
  color: "#bbf7d0",
  fontSize: "12px",
  fontWeight: "900",
};

const miniGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))",
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

const barTrackStyle = {
  height: "8px",
  borderRadius: "999px",
  background: "rgba(15,23,42,0.8)",
  overflow: "hidden",
  marginBottom: "12px",
};

const barFillStyle = {
  height: "100%",
  borderRadius: "999px",
  background: "linear-gradient(135deg,#3b82f6,#22c55e)",
};

const reasonStyle = {
  color: "#86efac",
  fontWeight: "900",
  lineHeight: "1.45",
  margin: "0 0 10px 0",
};

const actionStyle = {
  color: "#dbeafe",
  margin: 0,
  fontSize: "13px",
  lineHeight: "1.45",
};

const emptyStyle = {
  color: "#94a3b8",
};