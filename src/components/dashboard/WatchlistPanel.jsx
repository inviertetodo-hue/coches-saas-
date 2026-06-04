import { MetricCard } from "./DashboardBlocks";

export default function WatchlistPanel({ watchlist }) {
  const items = Array.isArray(watchlist?.items)
    ? watchlist.items.slice(0, 12)
    : [];

  const alerts = Array.isArray(watchlist?.alerts) ? watchlist.alerts : [];

  const urgentItems = items.filter(
    (item) => item.watchStatus === "Actuar ahora"
  ).length;

  const validationItems = items.filter(
    (item) => item.watchStatus === "Validar hoy"
  ).length;

  const watchItems = items.filter(
    (item) => item.watchStatus === "Vigilar precio"
  ).length;

  const averageWatchScore = calculateAverage(items, "watchScore");

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>📋 Watchlist de Oportunidades</h2>

      <p style={subtitleStyle}>
        Seguimiento inteligente de oportunidades para saber qué coches conviene
        revisar ahora, validar hoy o vigilar por cambios de precio.
      </p>

      {watchlist?.summary && (
        <div style={summaryStyle}>
          <strong>Resumen:</strong> {watchlist.summary}
        </div>
      )}

      <div style={gridStyle}>
        <MetricCard
          label="Watchlist Score"
          value={`${watchlist?.watchlistScore || 0}/100`}
        />

        <MetricCard
          label="Nivel"
          value={watchlist?.watchlistLevel || "-"}
        />

        <MetricCard
          label="En seguimiento"
          value={items.length}
        />

        <MetricCard
          label="Score medio"
          value={`${averageWatchScore}/100`}
        />
      </div>

      <div style={statusGridStyle}>
        <StatusCard
          title="Actuar ahora"
          value={urgentItems}
          text="Oportunidades candidatas a contacto inmediato."
        />

        <StatusCard
          title="Validar hoy"
          value={validationItems}
          text="Coches que necesitan confirmar datos antes de decidir."
        />

        <StatusCard
          title="Vigilar precio"
          value={watchItems}
          text="Casos útiles para seguir bajadas o cambios de señal."
        />
      </div>

      {alerts.length > 0 && (
        <div style={sectionStyle}>
          <p style={sectionTitleStyle}>🚨 Alertas de seguimiento</p>

          {alerts.map((item, index) => (
            <div key={`${item}-${index}`} style={alertCardStyle}>
              {item}
            </div>
          ))}
        </div>
      )}

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>🧠 Insights de Watchlist</p>

        {!watchlist?.insights?.length && (
          <p style={emptyStyle}>
            Aún no hay insights suficientes para la watchlist.
          </p>
        )}

        {watchlist?.insights?.map((item, index) => (
          <div key={`${item}-${index}`} style={insightCardStyle}>
            {item}
          </div>
        ))}
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>📌 Oportunidades en seguimiento</p>

        {items.length === 0 && (
          <p style={emptyStyle}>
            Todavía no hay oportunidades suficientemente claras para seguimiento.
          </p>
        )}

        {items.map((item, index) => (
          <WatchItem
            key={item.id || item.sourceId || `${item.title}-${index}`}
            item={item}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

function WatchItem({ item, index }) {
  const watchScore = Number(item.watchScore || item.score || 0);
  const roi = Number(item.roi || 0);
  const profit = Number(item.profit || 0);
  const discountAmount = Number(item.discountAmount || 0);
  const status = item.watchStatus || "Observación";
  const priority = item.priority || "Media";
  const nextAction = item.nextAction || getFallbackNextAction(status);

  return (
    <div style={itemCardStyle}>
      <div style={itemHeaderStyle}>
        <div>
          <p style={rankStyle}>
            #{index + 1} · Prioridad {priority} · {item.action || "WATCH"}
          </p>

          <h3 style={itemTitleStyle}>{item.title || "Oportunidad sin título"}</h3>
        </div>

        <span style={statusPillStyle}>{status}</span>
      </div>

      <div style={miniGridStyle}>
        <MiniMetric label="Watch Score" value={`${watchScore}/100`} />
        <MiniMetric label="ROI" value={`${formatNumber(roi)}%`} />
        <MiniMetric label="Beneficio" value={formatEuro(profit)} />
        <MiniMetric
          label="Descuento"
          value={discountAmount > 0 ? formatEuro(discountAmount) : "-"}
        />
      </div>

      {item.alert && (
        <p style={itemAlertStyle}>
          🚨 {item.alert}
        </p>
      )}

      <p style={reasonStyle}>
        {item.reason || buildFallbackReason(watchScore, roi, profit)}
      </p>

      <p style={nextActionStyle}>
        Próxima acción: {nextAction}
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

function getFallbackNextAction(status) {
  if (status === "Actuar ahora") {
    return "contactar rápido y validar disponibilidad.";
  }

  if (status === "Validar hoy") {
    return "pedir historial, fotos, daños y precio final.";
  }

  if (status === "Vigilar precio") {
    return "seguir precio y comparar con nuevas oportunidades.";
  }

  return "no priorizar salvo cambio relevante.";
}

function buildFallbackReason(score, roi, profit) {
  if (score >= 85 && roi >= 25) {
    return `Candidato fuerte por score ${score}, ROI ${roi}% y beneficio estimado de ${profit} €.`;
  }

  if (score >= 75) {
    return "Candidato interesante, pero necesita validación adicional antes de compra.";
  }

  return "Candidato para observación, no para acción inmediata.";
}

function calculateAverage(items, field) {
  if (!items.length) return 0;

  const values = items
    .map((item) => Number(item[field] || 0))
    .filter((value) => Number.isFinite(value));

  if (!values.length) return 0;

  return Math.round(values.reduce((acc, value) => acc + value, 0) / values.length);
}

function formatEuro(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "-";

  return `${Math.round(number).toLocaleString("es-ES")} €`;
}

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "0";

  return number.toLocaleString("es-ES", {
    maximumFractionDigits: 1,
  });
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
  marginBottom: "18px",
};

const summaryStyle = {
  background: "linear-gradient(135deg, rgba(34,197,94,0.16), rgba(37,99,235,0.14))",
  border: "1px solid rgba(34,197,94,0.24)",
  padding: "16px 18px",
  borderRadius: "18px",
  color: "#d1fae5",
  fontWeight: "850",
  lineHeight: "1.55",
  marginBottom: "22px",
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

const alertCardStyle = {
  background: "rgba(245,158,11,0.14)",
  border: "1px solid rgba(245,158,11,0.28)",
  color: "#fde68a",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
  fontWeight: "900",
  lineHeight: "1.45",
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

const itemAlertStyle = {
  color: "#fde68a",
  background: "rgba(245,158,11,0.12)",
  border: "1px solid rgba(245,158,11,0.22)",
  borderRadius: "14px",
  padding: "10px 12px",
  fontWeight: "900",
  lineHeight: "1.45",
  margin: "0 0 10px 0",
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