import { useEffect, useMemo, useState } from "react";

import MarketFeedSection from "./MarketFeedSection";
import AIInsightsSection from "./AIInsightsSection";
import SearchRadarSection from "./SearchRadarSection";

export default function ScannerResultsSection({
  marketFeed,
  searchRadar,
  scan,
  searchTriggered,
}) {
  if (!marketFeed && searchTriggered) {
    return <ScannerLoadingSection scan={scan} />;
  }

  if (!marketFeed) return null;

  return (
    <>
      <ScannerCoverageSection scan={scan} />

      <MarketFeedSection marketFeed={marketFeed} />

      <AIInsightsSection
        insights={marketFeed.insights}
        best={marketFeed.best}
      />

      <SearchRadarSection searchRadar={searchRadar} />
    </>
  );
}

function ScannerLoadingSection({ scan }) {
  const [seconds, setSeconds] = useState(8);

  const searchLinks = scan?.searchLinks || [];
  const countries = [...new Set(searchLinks.map((item) => item.country))];

  const loadingSteps = useMemo(
    () => [
      "Consultando mobile.de",
      "Consultando AutoScout24",
      "Analizando precios europeos",
      "Calculando liquidez",
      "Evaluando riesgo",
      "Generando ranking IA",
    ],
    []
  );

  useEffect(() => {
    setSeconds(8);

    const interval = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) return 1;

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [scan?.query, scan?.country, scan?.maxBudget]);

  const progress = Math.min(100, Math.max(12, Math.round(((9 - seconds) / 8) * 100)));
  const activeStepIndex = Math.min(
    loadingSteps.length - 1,
    Math.floor((progress / 100) * loadingSteps.length)
  );

  return (
    <section style={loadingStyle}>
      <div style={loadingIconStyle}>🌍</div>

      <div>
        <p style={eyebrowStyle}>Escaneo en curso</p>

        <h2 style={loadingTitleStyle}>
          Escaneando mercado europeo del automóvil
        </h2>

        <p style={loadingTextStyle}>
          Analizando oportunidades, precios, liquidez, riesgo y margen potencial
          en los principales mercados europeos.
        </p>

        <div style={progressTrackStyle}>
          <div
            style={{
              ...progressBarStyle,
              width: `${progress}%`,
            }}
          />
        </div>

        <div style={progressMetaStyle}>
          <span>{progress}% completado</span>
          <span>{seconds} segundos</span>
        </div>

        <div style={loadingStepsStyle}>
          {loadingSteps.map((step, index) => (
            <span
              key={step}
              style={{
                ...stepPillStyle,
                ...(index <= activeStepIndex ? activeStepActiveStyle : {}),
              }}
            >
              {index < activeStepIndex ? "✓" : index === activeStepIndex ? "⏳" : "○"}{" "}
              {step}
            </span>
          ))}
        </div>
      </div>

      <div style={loadingStatsStyle}>
        <strong style={loadingNumberStyle}>{countries.length || 1}</strong>
        <span style={loadingLabelStyle}>mercados</span>

        <strong style={loadingNumberStyle}>{searchLinks.length || 1}</strong>
        <span style={loadingLabelStyle}>búsquedas</span>
      </div>
    </section>
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

const loadingStyle = {
  marginTop: "28px",
  marginBottom: "24px",
  padding: "30px",
  borderRadius: "30px",
  background:
    "linear-gradient(135deg, rgba(37,99,235,0.28), rgba(20,184,166,0.18))",
  border: "1px solid rgba(147,197,253,0.28)",
  display: "grid",
  gridTemplateColumns: "80px 1fr 160px",
  gap: "24px",
  alignItems: "center",
  boxShadow: "0 20px 60px rgba(15,23,42,0.35)",
};

const loadingIconStyle = {
  width: "68px",
  height: "68px",
  borderRadius: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "36px",
  background: "rgba(59,130,246,0.24)",
  boxShadow: "0 0 34px rgba(59,130,246,0.38)",
};

const loadingTitleStyle = {
  margin: "8px 0",
  color: "white",
  fontSize: "28px",
};

const loadingTextStyle = {
  margin: 0,
  color: "#dbeafe",
  lineHeight: 1.6,
  fontWeight: "700",
};

const progressTrackStyle = {
  marginTop: "18px",
  width: "100%",
  height: "12px",
  borderRadius: "999px",
  background: "rgba(15,23,42,0.72)",
  overflow: "hidden",
  border: "1px solid rgba(147,197,253,0.18)",
};

const progressBarStyle = {
  height: "100%",
  borderRadius: "999px",
  background: "linear-gradient(90deg,#38bdf8,#22c55e,#fde047)",
  transition: "width 0.45s ease",
};

const progressMetaStyle = {
  marginTop: "8px",
  display: "flex",
  justifyContent: "space-between",
  color: "#bfdbfe",
  fontSize: "12px",
  fontWeight: "900",
};

const loadingStepsStyle = {
  marginTop: "16px",
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
};

const stepPillStyle = {
  padding: "9px 12px",
  borderRadius: "999px",
  background: "rgba(15,23,42,0.52)",
  border: "1px solid rgba(148,163,184,0.18)",
  color: "#94a3b8",
  fontWeight: "900",
  fontSize: "12px",
};

const stepPillActiveStyle = {
  color: "#dcfce7",
  background: "rgba(34,197,94,0.16)",
  border: "1px solid rgba(34,197,94,0.28)",
};

const loadingStatsStyle = {
  padding: "18px",
  borderRadius: "22px",
  background: "rgba(2,6,23,0.62)",
  border: "1px solid rgba(148,163,184,0.18)",
  textAlign: "center",
};

const loadingNumberStyle = {
  display: "block",
  color: "white",
  fontSize: "34px",
  fontWeight: "900",
};

const loadingLabelStyle = {
  display: "block",
  marginBottom: "10px",
  color: "#94a3b8",
  fontSize: "12px",
  fontWeight: "800",
};

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