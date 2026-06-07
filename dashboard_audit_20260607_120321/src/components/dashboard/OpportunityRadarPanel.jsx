import { MetricCard } from "./DashboardBlocks";

export default function OpportunityRadarPanel({ radar }) {
  const opportunities = Array.isArray(radar?.priorityOpportunities)
    ? radar.priorityOpportunities.slice(0, 12)
    : [];

  const feed = buildOpportunityFeedFromRadar(opportunities);

  const discoverNow = opportunities.filter(
    (item) => item.discoveryLevel === "DISCOVER_NOW"
  ).length;

  const fastSell = opportunities.filter(
    (item) => Number(item.sellSpeedScore || 0) >= 80
  ).length;

  const averagePriority = calculateAverage(opportunities, "radarPriority");

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>📡 Opportunity Radar V4</h2>

      <p style={subtitleStyle}>
        Radar de descubrimiento conectado a señales BUY, descuento, rotación,
        confianza, comparables y prioridad real de oportunidad.
      </p>

      <div style={gridStyle}>
        <MetricCard label="Radar Score" value={`${radar?.radarScore || 0}/100`} />
        <MetricCard label="Radar Level" value={radar?.radarLevel || "-"} />
        <MetricCard label="Discovery Now" value={discoverNow} />
        <MetricCard label="Priority Media" value={`${averagePriority}/100`} />
      </div>

      <div style={signalGridStyle}>
        <SignalCard
          title="Descubrir ya"
          value={discoverNow}
          text="Oportunidades con prioridad inmediata."
        />
        <SignalCard
          title="Fast Sell"
          value={fastSell}
          text="Candidatos con alta rotación prevista."
        />
        <SignalCard
          title="Radar mode"
          value={getRadarMode(opportunities)}
          text="Lectura rápida del estado actual del mercado."
        />
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>🔥 Opportunity Feed</p>

        {feed.length === 0 && (
          <p style={emptyStyle}>Todavía no hay eventos prioritarios.</p>
        )}

        {feed.map((event, index) => (
          <div key={`${event.type}-${event.title}-${index}`} style={feedCardStyle}>
            <div>
              <p style={feedTypeStyle}>{event.type}</p>
              <h3 style={feedTitleStyle}>{event.title}</h3>
              <p style={feedTextStyle}>{event.text}</p>
            </div>

            <span style={feedPriorityStyle}>{event.priority}/100</span>
          </div>
        ))}
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
          <p style={emptyStyle}>No hay oportunidades prioritarias todavía.</p>
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
  const decisionScore = Number(item.decisionScore || 0);
  const confidence = Number(item.confidence || 0);
  const comparableCount = Number(item.comparableCount || 0);
  const roi = Number(item.roi || 0);
  const profit = Number(item.profit || 0);
  const sellSpeedScore = Number(item.sellSpeedScore || 0);
  const estimatedSellDays = Number(item.estimatedSellDays || 0);
  const discountPercent = Number(item.discountPercent || 0);
  const radarPriority = Number(item.radarPriority || 0);
  const action = item.action || "WATCH";
  const discoveryLevel = item.discoveryLevel || "OBSERVE";

  return (
    <div style={dealCardStyle}>
      <div style={dealHeaderStyle}>
        <div>
          <p style={rankStyle}>Radar #{index + 1}</p>
          <h3 style={dealTitleStyle}>{item.title || "Oportunidad sin título"}</h3>
        </div>

        <span style={levelPillStyle}>{discoveryLevel}</span>
      </div>

      <div style={miniGridStyle}>
        <MiniMetric label="Acción" value={action} />
        <MiniMetric label="Priority" value={`${radarPriority}/100`} />
        <MiniMetric label="Decision" value={`${decisionScore}/100`} />
        <MiniMetric label="Score" value={`${score}/100`} />
        <MiniMetric label="Confianza" value={`${confidence}/100`} />
        <MiniMetric label="Comparables" value={comparableCount} />
        <MiniMetric label="Sell Speed" value={`${sellSpeedScore}/100`} />
        <MiniMetric label="Venta est." value={`${estimatedSellDays} días`} />
        <MiniMetric label="Descuento" value={`${discountPercent}%`} />
        <MiniMetric label="ROI" value={`${roi}%`} />
        <MiniMetric label="Beneficio" value={`${profit} €`} />
      </div>

      <div style={barTrackStyle}>
        <div
          style={{
            ...barFillStyle,
            width: `${Math.min(Math.max(radarPriority || decisionScore || score, 0), 100)}%`,
          }}
        />
      </div>

      <p style={reasonStyle}>
        {item.reason || buildRadarReason(item)}
      </p>

      {Array.isArray(item.discoverySignals) && item.discoverySignals.length > 0 && (
        <div style={signalsBoxStyle}>
          {item.discoverySignals.slice(0, 3).map((signal, signalIndex) => (
            <p key={`${signal.type}-${signalIndex}`} style={signalLineStyle}>
              {signal.label}
            </p>
          ))}
        </div>
      )}

      <p style={actionStyle}>
        Acción sugerida: {getRadarAction(item)}
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

function buildOpportunityFeedFromRadar(items = []) {
  const events = [];

  items.forEach((item) => {
    if (item.discoveryLevel === "DISCOVER_NOW") {
      events.push({
        type: "DISCOVERY_NOW",
        priority: 100,
        title: item.title || "Oportunidad IA",
        text: `Revisar ya: prioridad radar ${item.radarPriority || 0}/100.`,
      });
    }

    if (item.action === "BUY") {
      events.push({
        type: "BUY_SIGNAL",
        priority: 92,
        title: item.title || "Oportunidad IA",
        text: `BUY confirmado con Decision Score ${item.decisionScore || 0}/100.`,
      });
    }

    if (Number(item.sellSpeedScore || 0) >= 80) {
      events.push({
        type: "FAST_SELL",
        priority: 82,
        title: item.title || "Oportunidad IA",
        text: `Alta rotación prevista. Sell Speed ${item.sellSpeedScore}/100.`,
      });
    }

    if (Number(item.discountPercent || 0) >= 8) {
      events.push({
        type: "VALUATION_DISCOUNT",
        priority: 78,
        title: item.title || "Oportunidad IA",
        text: `Descuento relevante frente a valoración: ${item.discountPercent}%.`,
      });
    }
  });

  return events
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 8);
}

function getRadarMode(items = []) {
  const discoverNow = items.filter((item) => item.discoveryLevel === "DISCOVER_NOW").length;
  const buy = items.filter((item) => item.action === "BUY").length;

  if (discoverNow >= 2) return "Cazar oportunidades";
  if (buy >= 1) return "Comprar selectivo";
  if (items.length >= 5) return "Vigilar mercado";
  return "Esperar datos";
}

function getRadarAction(item) {
  if (item?.discoveryLevel === "DISCOVER_NOW") {
    return "revisar ya y contactar vendedor";
  }

  if (item?.action === "BUY") {
    return "validar evidencia antes de comprar";
  }

  if (item?.action === "WATCH") {
    return "seguir precio y confirmar datos";
  }

  return "mantener fuera de prioridad";
}

function buildRadarReason(item = {}) {
  if (item.action === "BUY") {
    return `BUY confirmado. Prioridad ${item.radarPriority || 0}/100 y Decision Score ${item.decisionScore || 0}/100.`;
  }

  return `WATCH. Prioridad ${item.radarPriority || 0}/100. Requiere validación adicional.`;
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

const feedCardStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "14px",
  alignItems: "flex-start",
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(34,197,94,0.12)",
  border: "1px solid rgba(34,197,94,0.22)",
  marginBottom: "12px",
};

const feedTypeStyle = {
  margin: "0 0 6px 0",
  color: "#86efac",
  fontSize: "11px",
  fontWeight: "900",
};

const feedTitleStyle = {
  margin: "0 0 6px 0",
  fontSize: "17px",
};

const feedTextStyle = {
  margin: 0,
  color: "#d1fae5",
  fontSize: "13px",
  lineHeight: "1.45",
};

const feedPriorityStyle = {
  minWidth: "66px",
  textAlign: "center",
  padding: "7px 10px",
  borderRadius: "999px",
  background: "rgba(15,23,42,0.65)",
  color: "#bbf7d0",
  fontSize: "12px",
  fontWeight: "900",
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
  background: "linear-gradient(135deg, rgba(34,197,94,0.14), rgba(37,99,235,0.12))",
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

const signalsBoxStyle = {
  marginBottom: "10px",
  padding: "12px",
  borderRadius: "14px",
  background: "rgba(15,23,42,0.55)",
  border: "1px solid rgba(34,197,94,0.16)",
};

const signalLineStyle = {
  margin: "0 0 6px 0",
  color: "#d1fae5",
  fontSize: "12px",
  lineHeight: "1.4",
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