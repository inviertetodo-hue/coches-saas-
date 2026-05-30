import { useEffect, useMemo, useState } from "react";

import ScannerHeader from "../components/scanner/ScannerHeader";
import ScannerSummaryCard from "../components/scanner/ScannerSummaryCard";
import ScannerResultsSection from "../components/scanner/ScannerResultsSection";
import ScannerForm from "../components/ScannerForm";

import { buildMarketScan } from "../services/marketScanner";
import { useEnrichedMarketFeed } from "../hooks/useEnrichedMarketFeed";
import { useSearchRadar } from "../hooks/useSearchRadar";
import { useMarketTrendProfile } from "../hooks/useMarketTrendProfile";

export default function Scanner() {
  const [form, setForm] = useState({
    query: "BMW X5 45e",
    maxBudget: "60000",
    country: "Europa",
    useCase: "reventa",
  });

  const [searchTriggered, setSearchTriggered] = useState(false);
  const [loadingOverlayVisible, setLoadingOverlayVisible] = useState(false);

  const scan = useMemo(() => buildMarketScan(form), [form]);

  const trendProfile = useMarketTrendProfile({
    form,
    scan,
  });

  const marketFeed = useEnrichedMarketFeed({
    searchTriggered,
    scan,
    form,
  });

  const searchRadar = useSearchRadar({
    searchTriggered,
    form,
    scan,
    marketFeed,
  });

  useEffect(() => {
    if (!marketFeed) return;

    const timeout = window.setTimeout(() => {
      setLoadingOverlayVisible(false);
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [marketFeed]);

  function updateField(field, value) {
    setSearchTriggered(false);
    setLoadingOverlayVisible(false);

    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSearch() {
    setLoadingOverlayVisible(true);
    setSearchTriggered(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    setTimeout(() => {
      setSearchTriggered(true);
    }, 50);
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <ScannerHeader />

        {loadingOverlayVisible ? (
          <ScannerSearchOverlay scan={scan} />
        ) : (
          <>
            <div style={gridStyle}>
              <ScannerForm
                form={form}
                updateField={updateField}
                handleSearch={handleSearch}
              />

              <ScannerSummaryCard
                scan={scan}
                trendProfile={trendProfile}
                searchTriggered={searchTriggered}
                marketFeed={marketFeed}
              />
            </div>

            <ScannerResultsSection
              marketFeed={marketFeed}
              searchRadar={searchRadar}
              scan={scan}
              searchTriggered={searchTriggered}
            />
          </>
        )}
      </div>
    </div>
  );
}

function ScannerSearchOverlay({ scan }) {
  const [seconds, setSeconds] = useState(8);

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

  const searchLinks = scan?.searchLinks || [];
  const countries = [...new Set(searchLinks.map((item) => item.country))];
  const progress = Math.min(
    100,
    Math.max(15, Math.round(((9 - seconds) / 8) * 100))
  );

  const steps = [
    "Consultando mobile.de",
    "Consultando AutoScout24",
    "Analizando precios europeos",
    "Calculando liquidez",
    "Evaluando riesgo",
    "Generando ranking IA",
  ];

  const activeStepIndex = Math.min(
    steps.length - 1,
    Math.floor((progress / 100) * steps.length)
  );

  return (
    <section style={overlayStyle}>
      <div style={overlayCardStyle}>
        <div style={globeStyle}>🌍</div>

        <p style={eyebrowStyle}>Búsqueda en curso</p>

        <h1 style={overlayTitleStyle}>
          Escaneando mercado europeo del automóvil
        </h1>

        <p style={overlayTextStyle}>
          Estamos comparando oportunidades, precios, liquidez, riesgo y margen
          potencial antes de generar el ranking final.
        </p>

        <div style={overlayStatsStyle}>
          <div style={overlayStatStyle}>
            <strong>{countries.length || 1}</strong>
            <span>mercados europeos</span>
          </div>

          <div style={overlayStatStyle}>
            <strong>{searchLinks.length || 1}</strong>
            <span>búsquedas preparadas</span>
          </div>

          <div style={overlayStatStyle}>
            <strong>{seconds}</strong>
            <span>segundos</span>
          </div>
        </div>

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
          <span>Preparando ranking IA</span>
        </div>

        <div style={stepsGridStyle}>
          {steps.map((step, index) => (
            <div
              key={step}
              style={{
                ...stepStyle,
                ...(index <= activeStepIndex ? stepActiveStyle : {}),
              }}
            >
              {index < activeStepIndex
                ? "✓"
                : index === activeStepIndex
                  ? "⏳"
                  : "○"}{" "}
              {step}
            </div>
          ))}
        </div>

        <p style={smallNoteStyle}>
          Este proceso puede tardar unos segundos, igual que un comparador de
          seguros o vuelos.
        </p>
      </div>
    </section>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, #1e3a8a 0, #020617 42%, #020617 100%)",
  color: "white",
  padding: "48px",
  fontFamily: "Arial, sans-serif",
};

const containerStyle = {
  maxWidth: "1400px",
  margin: "0 auto",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "24px",
};

const overlayStyle = {
  minHeight: "72vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "34px 0",
};

const overlayCardStyle = {
  width: "100%",
  maxWidth: "980px",
  padding: "42px",
  borderRadius: "34px",
  background:
    "linear-gradient(135deg, rgba(15,23,42,0.94), rgba(30,64,175,0.78), rgba(20,184,166,0.28))",
  border: "1px solid rgba(147,197,253,0.30)",
  boxShadow: "0 30px 90px rgba(2,6,23,0.55)",
  textAlign: "center",
};

const globeStyle = {
  width: "84px",
  height: "84px",
  margin: "0 auto 18px",
  borderRadius: "28px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "44px",
  background: "rgba(59,130,246,0.24)",
  boxShadow: "0 0 46px rgba(59,130,246,0.45)",
};

const eyebrowStyle = {
  margin: 0,
  color: "#93c5fd",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "0.10em",
  fontSize: "12px",
};

const overlayTitleStyle = {
  margin: "12px 0",
  fontSize: "38px",
  lineHeight: 1.1,
};

const overlayTextStyle = {
  maxWidth: "760px",
  margin: "0 auto",
  color: "#dbeafe",
  lineHeight: 1.7,
  fontWeight: "800",
  fontSize: "16px",
};

const overlayStatsStyle = {
  marginTop: "28px",
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "14px",
};

const overlayStatStyle = {
  padding: "18px",
  borderRadius: "22px",
  background: "rgba(2,6,23,0.56)",
  border: "1px solid rgba(148,163,184,0.18)",
};

const progressTrackStyle = {
  marginTop: "28px",
  width: "100%",
  height: "14px",
  borderRadius: "999px",
  background: "rgba(2,6,23,0.72)",
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
  marginTop: "10px",
  display: "flex",
  justifyContent: "space-between",
  color: "#bfdbfe",
  fontSize: "12px",
  fontWeight: "900",
};

const stepsGridStyle = {
  marginTop: "22px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: "10px",
};

const stepStyle = {
  padding: "12px",
  borderRadius: "999px",
  background: "rgba(2,6,23,0.42)",
  border: "1px solid rgba(148,163,184,0.16)",
  color: "#94a3b8",
  fontWeight: "900",
  fontSize: "13px",
};

const stepActiveStyle = {
  color: "#dcfce7",
  background: "rgba(34,197,94,0.16)",
  border: "1px solid rgba(34,197,94,0.28)",
};

const smallNoteStyle = {
  marginTop: "22px",
  marginBottom: 0,
  color: "#cbd5e1",
  fontSize: "13px",
  fontWeight: "700",
};