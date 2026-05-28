import { MetricCard } from "./DashboardBlocks";

export default function GlobalStatsPanel({
  market,
  risk,
  confidence,
  learning,
  portfolio,
  trends,
  opportunityAlerts,
  temporal,
}) {
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>
            Market Intelligence
          </p>

          <h2 style={titleStyle}>
            📊 Global AI Metrics
          </h2>
        </div>

        <div style={statusBadgeStyle}>
          Sistema IA activo
        </div>
      </div>

      <div style={marketGridStyle}>
        <MetricCard
          label="ROI Medio"
          value={`${market?.averageROI || 0}%`}
        />

        <MetricCard
          label="Risk Score"
          value={`${risk?.riskScore || 0}/100`}
        />

        <MetricCard
          label="Confidence Score"
          value={`${confidence?.confidenceScore || 0}/100`}
        />

        <MetricCard
          label="Learning Score"
          value={`${learning?.learningScore || 0}/100`}
        />
      </div>

      <div style={marketGridStyle}>
        <MetricCard
          label="Risk Level"
          value={risk?.riskLevel || "-"}
        />

        <MetricCard
          label="Confidence"
          value={
            confidence?.confidenceLevel || "-"
          }
        />

        <MetricCard
          label="Learning Level"
          value={
            learning?.learningLevel || "-"
          }
        />

        <MetricCard
          label="Strategy"
          value={
            portfolio?.strategy || "-"
          }
        />
      </div>

      <div style={marketGridStyle}>
        <MetricCard
          label="Trend Score"
          value={`${trends?.trendScore || 0}/100`}
        />

        <MetricCard
          label="Alert Score"
          value={`${opportunityAlerts?.alertScore || 0}/100`}
        />

        <MetricCard
          label="Freshness Score"
          value={`${temporal?.freshnessScore || 0}/100`}
        />

        <MetricCard
          label="Total Análisis"
          value={trends?.total || 0}
        />
      </div>

      <div style={footerStyle}>
        <div style={footerCardStyle}>
          <p style={footerLabelStyle}>
            🚘 Mercado dominante
          </p>

          <p style={footerValueStyle}>
            {market?.bestBrand || "Sin datos"}
          </p>
        </div>

        <div style={footerCardStyle}>
          <p style={footerLabelStyle}>
            ⚡ Motorización dominante
          </p>

          <p style={footerValueStyle}>
            {market?.bestFuelType ||
              "Sin datos"}
          </p>
        </div>

        <div style={footerCardStyle}>
          <p style={footerLabelStyle}>
            🛞 Configuración líder
          </p>

          <p style={footerValueStyle}>
            {market?.bestConfiguration ||
              "Sin datos"}
          </p>
        </div>
      </div>
    </div>
  );
}

const containerStyle = {
  marginBottom: "32px",
  padding: "28px",
  borderRadius: "28px",
  background: "rgba(15,23,42,0.78)",
  border:
    "1px solid rgba(148,163,184,0.16)",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  marginBottom: "28px",
};

const eyebrowStyle = {
  color: "#93c5fd",
  fontSize: "12px",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "1px",
  marginBottom: "8px",
};

const titleStyle = {
  fontSize: "30px",
  fontWeight: "900",
  margin: 0,
};

const statusBadgeStyle = {
  padding: "10px 14px",
  borderRadius: "999px",
  background:
    "rgba(34,197,94,0.12)",
  border:
    "1px solid rgba(34,197,94,0.24)",
  color: "#bbf7d0",
  fontWeight: "900",
  fontSize: "13px",
};

const marketGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: "18px",
  marginBottom: "24px",
};

const footerStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(240px,1fr))",
  gap: "18px",
  marginTop: "10px",
};

const footerCardStyle = {
  background:
    "rgba(255,255,255,0.04)",
  border:
    "1px solid rgba(148,163,184,0.12)",
  borderRadius: "22px",
  padding: "18px",
};

const footerLabelStyle = {
  color: "#94a3b8",
  fontSize: "13px",
  marginBottom: "10px",
};

const footerValueStyle = {
  fontSize: "18px",
  fontWeight: "900",
  color: "white",
  lineHeight: "1.4",
};