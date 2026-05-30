import MarketFeedSection from "./MarketFeedSection";
import AIInsightsSection from "./AIInsightsSection";
import SearchRadarSection from "./SearchRadarSection";

export default function ScannerResultsSection({
  marketFeed,
  searchRadar,
  scan,
}) {
  if (!marketFeed) return null;

  return (
    <>
      <ScannerCoverageSection scan={scan} />

      <MarketFeedSection marketFeed={marketFeed} />

      <AIInsightsSection insights={marketFeed.insights} />

      <SearchRadarSection searchRadar={searchRadar} />
    </>
  );
}

function ScannerCoverageSection({ scan }) {
  const searchLinks = scan?.searchLinks || [];

  if (searchLinks.length === 0) {
    return null;
  }

  const countries = [...new Set(searchLinks.map((item) => item.country))];
  const highPriorityCount = searchLinks.filter(
    (item) => item.priority === "Alta"
  ).length;

  return (
    <section style={coverageStyle}>
      <div>
        <p style={eyebrowStyle}>Cobertura europea</p>
        <h2 style={titleStyle}>
          {countries.length} mercados · {searchLinks.length} búsquedas preparadas
        </h2>
        <p style={textStyle}>
          El sistema ya prepara búsquedas por país y fuente para detectar
          oportunidades de importación sin inventar datos.
        </p>
      </div>

      <div style={statsGridStyle}>
        <StatCard label="Mercados" value={countries.length} />
        <StatCard label="Fuentes" value="2" />
        <StatCard label="Alta prioridad" value={highPriorityCount} />
      </div>
    </section>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={statCardStyle}>
      <strong style={statValueStyle}>{value}</strong>
      <span style={statLabelStyle}>{label}</span>
    </div>
  );
}

const coverageStyle = {
  marginTop: "28px",
  marginBottom: "24px",
  padding: "24px",
  borderRadius: "28px",
  background:
    "linear-gradient(135deg, rgba(37,99,235,0.22), rgba(22,163,74,0.16))",
  border: "1px solid rgba(147,197,253,0.22)",
  display: "grid",
  gridTemplateColumns: "1.3fr 1fr",
  gap: "20px",
};

const eyebrowStyle = {
  margin: 0,
  color: "#93c5fd",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontSize: "12px",
};

const titleStyle = {
  margin: "8px 0",
  color: "white",
  fontSize: "24px",
};

const textStyle = {
  margin: 0,
  color: "#cbd5e1",
  lineHeight: 1.6,
  fontWeight: "700",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "12px",
};

const statCardStyle = {
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(2,6,23,0.62)",
  border: "1px solid rgba(148,163,184,0.18)",
  textAlign: "center",
};

const statValueStyle = {
  display: "block",
  color: "white",
  fontSize: "26px",
  fontWeight: "900",
};

const statLabelStyle = {
  display: "block",
  marginTop: "6px",
  color: "#94a3b8",
  fontSize: "12px",
  fontWeight: "800",
};