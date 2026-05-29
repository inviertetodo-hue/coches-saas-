import { MetricCard } from "./DashboardBlocks";

export default function WatchlistPanel({ watchlist }) {
  const items = Array.isArray(watchlist?.items)
    ? watchlist.items.slice(0, 12)
    : [];

  const urgentItems = items.filter((item) => getWatchStatus(item) === "Negociar").length;
  const callItems = items.filter((item) => getWatchStatus(item) === "Llamar").length;
  const averageScore = calculateAverage(items, "score");

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>📋 AI Watchlist V2</h2>

      <p style={subtitleStyle}>
        Lista inteligente de seguimiento para detectar coches que merecen vigilancia,
        llamada, negociación o descarte rápido.
      </p>

      <div style={gridStyle}>
        <MetricCard
          label="Watchlist Score"
          value={`${watchlist?.watchlistScore || 0}/100`}
        />

        <MetricCard
          label="Watchlist Level"
          value={watchlist?.watchlistLevel || "-"}
        />

        <MetricCard
          label="Candidates"
          value={items.length}
        />

        <MetricCard
          label="Score medio"
          value={`${averageScore}/100`}
        />
      </div>

      <div style={statusGridStyle}>
        <StatusCard
          title="Negociar"
          value={urgentItems}
          text="Candidatos con señales fuertes para actuar."
        />

        <StatusCard
          title="Llamar"
          value={callItems}
          text="Buenos candidatos para validar datos."
        />

        <StatusCard
          title="Vigilar"
          value={items.length - urgentItems - callItems}
          text="Casos útiles para seguimiento posterior."
        />
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>🧠 Watchlist Insights</p>

        {!watchlist?.insights?.length && (
          <p style={emptyStyle}>Aún no hay insights suficientes para la watchlist.</p>
        )}

        {watchlist?.insights?.map((item, index) => (
          <div key={index} style={insightCardStyle}>
            {item}
          </div>
        ))}
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>📌 Candidates To Watch</p>

        {items.length === 0 && (
          <p style={emptyStyle}>
            Todavía no hay candidatos para seguimiento.
          </p>
        )}

        {items.map((item, index) => (
          <WatchItem key={item.id || `${item.title}-${index}`} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}

function WatchItem({ item, index }) {
  const score = Number(item.score || 0);
  const roi = Number(item.roi || 0);
  const profit = Number(item.profit || 0);
  const status = getWatchStatus(item);
  const priority = getPriority(score, roi, profit);

  return (
    <div style={itemCardStyle}>
      <div style={itemHeaderStyle}>
        <div>
          <p style={rankStyle}>#{index + 1} · Prioridad {priority}</p>
          <h3 style={itemTitleStyle}>{item.title || "Candidato sin título"}</h3>
        </div>

        <span style={statusPillStyle}>{status}</span>
      </div>

      <div style={miniGridStyle}>
        <MiniMetric label="Score" value={`${score}/100`} />
        <MiniMetric label="ROI" value={`${roi}%`} />
        <MiniMetric label="Beneficio" value={`${profit} €`} />
      </div>

      <p style={reasonStyle}>
        {item.reason || buildFallbackReason(score, roi, profit)}
      </p>

      <p style={nextActionStyle}>
        Próxima acción: {getNextAction(status)}
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

function StatusCard({ title, value, text }) {
  return (
    <div style={statusCardStyle}>
      <p style={statusTitleStyle}>{title}</p>
      <strong style={statusValueStyle}>{value}</strong>
      <p style={statusTextStyle}>{text}</p>
    </div>
  );
}

function getWatchStatus(item) {
  const score = Number(item?.score || 0);
  const roi = Number(item?.roi || 0);
  const profit = Number(item?.profit || 0);

  if (score >= 85 && roi >= 25 && profit >= 2500) {
    return "Negociar";
  }

  if (score >= 75 && roi >= 15) {
    return "Llamar";
  }

  if (score >= 60) {
    return "Vigilar";
  }

  return "Descartar";
}

function getPriority(score, roi, profit) {
  const value = Math.round(
    score * 0.5 +
    Math.min(roi, 40) * 0.8 +
    Math.min(profit / 100, 40) * 0.4
  );

  if (value >= 85) return "Alta";
  if (value >= 65) return "Media";
  return "Baja";
}

function getNextAction(status) {
  if (status === "Negociar") return "contactar rápido y validar margen real";
  if (status === "Llamar") return "pedir detalles, historial y disponibilidad";
  if (status === "Vigilar") return "seguir precio y comparar con mercado";
  return "no priorizar salvo cambio de precio";
}

function buildFallbackReason(score, roi, profit) {
  if (score >= 85 && roi >= 25) {
    return `Candidato fuerte por score ${score}, ROI ${roi}% y beneficio estimado de ${profit} €.`;
  }

  if (score >= 75) {
    return `Candidato interesante, pero necesita validación adicional antes de compra.`;
  }

  return `Candidato para observación, no para acción inmediata.`;
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

const statusGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
  gap: "14px",
  marginBottom: "26px",
};

const statusCardStyle = {
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(14,165,233,0.12)",
  border: "1px solid rgba(14,165,233,0.22)",
};

const statusTitleStyle = {
  margin: 0,
  color: "#7dd3fc",
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
  background: "rgba(14,165,233,0.12)",
  border: "1px solid rgba(14,165,233,0.25)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
  fontWeight: "800",
};

const itemCardStyle = {
  background:
    "linear-gradient(135deg, rgba(14,165,233,0.16), rgba(34,197,94,0.12))",
  border: "1px solid rgba(14,165,233,0.25)",
  padding: "18px",
  borderRadius: "20px",
  marginBottom: "14px",
};

const itemHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "14px",
  alignItems: "flex-start",
  flexWrap: "wrap",
  marginBottom: "12px",
};

const rankStyle = {
  margin: "0 0 6px 0",
  color: "#7dd3fc",
  fontSize: "12px",
  fontWeight: "900",
};

const itemTitleStyle = {
  fontSize: "20px",
  margin: 0,
};

const statusPillStyle = {
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

const reasonStyle = {
  color: "#7dd3fc",
  fontWeight: "900",
  lineHeight: "1.45",
  margin: "0 0 10px 0",
};

const nextActionStyle = {
  color: "#d1fae5",
  margin: 0,
  fontSize: "13px",
  lineHeight: "1.45",
};

const emptyStyle = {
  color: "#94a3b8",
};