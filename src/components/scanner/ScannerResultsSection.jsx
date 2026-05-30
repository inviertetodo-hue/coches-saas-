import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

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

      <SaveBestOpportunityPanel marketFeed={marketFeed} scan={scan} />

      <MarketFeedSection marketFeed={marketFeed} />

      <AIInsightsSection
        insights={marketFeed.insights}
        best={marketFeed.best}
      />

      <RealFeedDebugPanel marketFeed={marketFeed} />

      <SearchRadarSection searchRadar={searchRadar} />
    </>
  );
}

function SaveBestOpportunityPanel({ marketFeed, scan }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");

  const candidate = useMemo(() => {
    const opportunities = marketFeed?.opportunities || [];

    return (
      opportunities.find((item) => {
        const semanticScore = Number(item.semanticScore || 0);
        const finalScore = Number(item.finalDecision?.finalScore || 0);
        const profit = Number(item.netProfit || 0);
        const roi = Number(item.netRoi || 0);

        return (
          semanticScore >= 80 &&
          finalScore >= 70 &&
          Number.isFinite(profit) &&
          Number.isFinite(roi) &&
          item.brand &&
          item.model
        );
      }) || null
    );
  }, [marketFeed]);

  if (marketFeed?.sourceMode !== "real-feed") {
    return null;
  }

  if (!candidate) {
    return (
      <section style={savePanelStyle}>
        <p style={saveEyebrowStyle}>Inteligencia Mercado</p>
        <h3 style={saveTitleStyle}>Aún no hay oportunidad suficientemente limpia para guardar</h3>
        <p style={saveTextStyle}>
          El Scanner ha encontrado datos reales, pero todavía no hay una oportunidad con match semántico alto, marca, modelo y score suficiente.
        </p>
      </section>
    );
  }

  async function saveCandidate() {
    if (saving || saved) return;

    setSaving(true);
    setMessage("");

    const payload = {
      title: candidate.title || scan?.query || "Scanner opportunity",
      brand: candidate.brand || null,
      model: candidate.model || null,
      fuel_type: candidate.fuelType || null,
      drivetrain: candidate.drivetrain || null,
      performance_package: candidate.performancePackage || null,
      country: candidate.country || scan?.country || null,
      profit: Math.round(Number(candidate.netProfit || 0)),
      roi: Number(candidate.netRoi || 0),
      score: Number(candidate.finalDecision?.finalScore || 0),
      url: candidate.url || null,
    };

    const { error } = await supabase.from("import_analyses").insert(payload);

    if (error) {
      console.error("Error saving scanner opportunity:", error);
      setMessage("No se ha podido guardar en Inteligencia Mercado.");
      setSaving(false);
      return;
    }

    setSaved(true);
    setSaving(false);
    setMessage("Oportunidad guardada. Ya alimenta Inteligencia Mercado.");
  }

  return (
    <section style={savePanelStyle}>
      <div>
        <p style={saveEyebrowStyle}>Inteligencia Mercado</p>

        <h3 style={saveTitleStyle}>Guardar oportunidad seleccionada</h3>

        <p style={saveTextStyle}>
          {candidate.title} · Score {candidate.finalDecision?.finalScore || 0}/100 · ROI {candidate.netRoi}% · Match {candidate.semanticScore || 0}/100
        </p>
      </div>

      <button
        onClick={saveCandidate}
        disabled={saving || saved}
        style={{
          ...saveButtonStyle,
          opacity: saving || saved ? 0.7 : 1,
          cursor: saving || saved ? "not-allowed" : "pointer",
        }}
      >
        {saving ? "Guardando..." : saved ? "✅ Guardado" : "💾 Guardar en Inteligencia Mercado"}
      </button>

      {message && <p style={saveMessageStyle}>{message}</p>}
    </section>
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

  const progress = Math.min(
    100,
    Math.max(12, Math.round(((9 - seconds) / 8) * 100))
  );

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
                ...(index <= activeStepIndex ? stepPillActiveStyle : {}),
              }}
            >
              {index < activeStepIndex
                ? "✓"
                : index === activeStepIndex
                  ? "⏳"
                  : "○"}{" "}
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

function RealFeedDebugPanel({ marketFeed }) {
  const errors = marketFeed?.realFeedErrors || [];
  const diagnostics = marketFeed?.realFeedDiagnostics || [];
  const sourceMode = marketFeed?.sourceMode || "unknown";

  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <section style={debugStyle}>
      <p style={debugEyebrowStyle}>Modo desarrollo</p>

      <h3 style={debugTitleStyle}>Diagnóstico del feed real</h3>

      <div style={debugGridStyle}>
        <DebugMetric label="Modo" value={sourceMode} />
        <DebugMetric label="Errores" value={errors.length} />
        <DebugMetric label="Resultados" value={marketFeed?.total || 0} />
      </div>

      {errors.length > 0 && (
        <div style={debugErrorsStyle}>
          {errors.map((error, index) => (
            <div key={`${error}-${index}`} style={debugErrorItemStyle}>
              {error}
            </div>
          ))}
        </div>
      )}

      {diagnostics.length > 0 && (
        <div style={debugErrorsStyle}>
          {diagnostics.map((item, index) => (
            <div
              key={`${item.source}-${item.country}-${index}`}
              style={debugErrorItemStyle}
            >
              <strong>
                {item.source} · {item.country}
              </strong>

              <div>Status: {item.status}</div>
              <div>Resultados reales: {item.parsedCount}</div>
              <div>Texto recibido: {item.textLength}</div>
              <div>Tiempo: {item.durationMs} ms</div>
              <div>{item.message}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function DebugMetric({ label, value }) {
  return (
    <div style={debugMetricStyle}>
      <span style={debugMetricLabelStyle}>{label}</span>
      <strong style={debugMetricValueStyle}>{value}</strong>
    </div>
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

const savePanelStyle = {
  marginTop: "24px",
  marginBottom: "24px",
  padding: "22px",
  borderRadius: "24px",
  background: "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(37,99,235,0.18))",
  border: "1px solid rgba(34,197,94,0.28)",
};

const saveEyebrowStyle = {
  margin: 0,
  color: "#86efac",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontSize: "12px",
};

const saveTitleStyle = {
  margin: "8px 0",
  color: "white",
};

const saveTextStyle = {
  margin: 0,
  color: "#dbeafe",
  lineHeight: 1.6,
  fontWeight: "800",
};

const saveButtonStyle = {
  marginTop: "16px",
  padding: "14px 18px",
  borderRadius: "16px",
  border: "none",
  background: "linear-gradient(135deg,#16a34a,#2563eb)",
  color: "white",
  fontWeight: "900",
};

const saveMessageStyle = {
  marginTop: "12px",
  color: "#bbf7d0",
  fontWeight: "900",
};

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

const debugStyle = {
  marginTop: "24px",
  padding: "20px",
  borderRadius: "22px",
  background: "rgba(127,29,29,0.16)",
  border: "1px solid rgba(248,113,113,0.24)",
};

const debugEyebrowStyle = {
  margin: 0,
  color: "#fca5a5",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontSize: "12px",
};

const debugTitleStyle = {
  margin: "8px 0 16px",
  color: "#fee2e2",
};

const debugGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "12px",
};

const debugMetricStyle = {
  padding: "14px",
  borderRadius: "16px",
  background: "rgba(2,6,23,0.54)",
};

const debugMetricLabelStyle = {
  display: "block",
  color: "#fecaca",
  fontSize: "12px",
  fontWeight: "800",
};

const debugMetricValueStyle = {
  display: "block",
  marginTop: "6px",
  color: "white",
};

const debugErrorsStyle = {
  marginTop: "14px",
  display: "grid",
  gap: "8px",
};

const debugErrorItemStyle = {
  padding: "10px",
  borderRadius: "12px",
  background: "rgba(2,6,23,0.48)",
  color: "#fecaca",
  fontSize: "12px",
  fontWeight: "700",
};