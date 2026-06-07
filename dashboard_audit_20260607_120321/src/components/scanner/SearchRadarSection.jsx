import SmallMetric from "./SmallMetric";

export default function SearchRadarSection({ searchRadar }) {
  if (!searchRadar) return null;

  return (
    <div style={radarSectionStyle}>
      <div style={radarHeaderStyle}>
        <p style={radarBadgeStyle}>🧠 Radar IA de búsqueda</p>

        <h2 style={radarTitleStyle}>Qué líneas conviene atacar ahora</h2>

        <p style={radarSummaryStyle}>{searchRadar.summary}</p>
      </div>

      <div style={radarGridStyle}>
        {searchRadar.recommendedSearches.map((item) => (
          <div key={item.id} style={radarCardStyle}>
            <div style={radarPriorityStyle}>{item.priority}/100</div>

            <h3 style={radarVehicleStyle}>{item.label}</h3>

            <div style={radarMetaGridStyle}>
              <SmallMetric label="Liquidez" value={item.liquidity} />
              <SmallMetric label="Riesgo" value={item.risk} />
              <SmallMetric label="Margen" value={item.marginPotential} />
              <SmallMetric label="Presupuesto" value={item.budgetTarget} />
            </div>

            <p style={radarCountriesStyle}>
              🌍 {item.countriesTarget.join(" · ")}
            </p>

            <p style={marketInsightStyle}>{item.reason}</p>
          </div>
        ))}
      </div>

      <div style={avoidBoxStyle}>
        <h3 style={avoidTitleStyle}>⚠️ Modelos y situaciones a evitar</h3>

        <div style={avoidGridStyle}>
          {searchRadar.avoidSearches.map((item) => (
            <div key={item.id} style={avoidCardStyle}>
              <strong>{item.label}</strong>

              <p style={avoidRiskStyle}>Riesgo: {item.risk}</p>

              <p style={marketInsightStyle}>{item.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const radarSectionStyle = {
  marginTop: "42px",
};

const radarHeaderStyle = {
  marginBottom: "22px",
};

const radarBadgeStyle = {
  color: "#86efac",
  fontWeight: "900",
};

const radarTitleStyle = {
  fontSize: "32px",
  marginBottom: "10px",
};

const radarSummaryStyle = {
  color: "#cbd5e1",
  lineHeight: "1.6",
  maxWidth: "920px",
};

const radarGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
  gap: "18px",
};

const radarCardStyle = {
  background: "rgba(15,23,42,0.82)",
  borderRadius: "24px",
  padding: "24px",
  border: "1px solid rgba(34,197,94,0.18)",
};

const radarPriorityStyle = {
  display: "inline-block",
  padding: "10px 16px",
  borderRadius: "999px",
  background: "rgba(34,197,94,0.14)",
  color: "#86efac",
  fontWeight: "900",
  marginBottom: "18px",
};

const radarVehicleStyle = {
  fontSize: "24px",
  marginTop: 0,
};

const radarMetaGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  marginTop: "18px",
  marginBottom: "18px",
};

const radarCountriesStyle = {
  color: "#93c5fd",
  fontWeight: "700",
};

const marketInsightStyle = {
  marginBottom: 0,
  color: "#e5e7eb",
  lineHeight: "1.55",
  fontSize: "14px",
};

const avoidBoxStyle = {
  marginTop: "28px",
  padding: "24px",
  borderRadius: "24px",
  background: "rgba(239,68,68,0.08)",
  border: "1px solid rgba(239,68,68,0.18)",
};

const avoidTitleStyle = {
  marginTop: 0,
  marginBottom: "18px",
};

const avoidGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
  gap: "16px",
};

const avoidCardStyle = {
  background: "rgba(2,6,23,0.45)",
  borderRadius: "18px",
  padding: "18px",
};

const avoidRiskStyle = {
  color: "#fca5a5",
  fontWeight: "800",
};