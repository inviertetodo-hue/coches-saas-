import { useMemo, useState } from "react";
import { buildMarketScan } from "../services/marketScanner";

export default function Scanner() {
  const [form, setForm] = useState({
    query: "BMW X5 45e",
    maxBudget: "60000",
    country: "Europa",
    useCase: "reventa",
  });

  const scan = useMemo(() => buildMarketScan(form), [form]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <p style={badgeStyle}>
            AI Automotive Opportunity Scanner
          </p>

          <h1 style={titleStyle}>
            Encuentra chollos reales en Europa
          </h1>

          <p style={subtitleStyle}>
            Escribe qué coche quieres comprar y el
            sistema prepara una búsqueda inteligente
            para detectar oportunidades con margen,
            liquidez y bajo riesgo.
          </p>
        </div>

        <div style={gridStyle}>
          <div style={cardStyle}>
            <label style={labelStyle}>
              Vehículo objetivo
            </label>

            <input
              value={form.query}
              onChange={(event) =>
                updateField(
                  "query",
                  event.target.value
                )
              }
              placeholder="BMW X5 45e, Audi Q7 TFSIe..."
              style={inputStyle}
            />

            <label style={labelStyle}>
              Presupuesto máximo
            </label>

            <input
              value={form.maxBudget}
              onChange={(event) =>
                updateField(
                  "maxBudget",
                  event.target.value
                )
              }
              placeholder="60000"
              style={inputStyle}
            />

            <label style={labelStyle}>
              Mercado
            </label>

            <select
              value={form.country}
              onChange={(event) =>
                updateField(
                  "country",
                  event.target.value
                )
              }
              style={inputStyle}
            >
              <option>Europa</option>
              <option>Alemania</option>
              <option>Holanda</option>
              <option>Bélgica</option>
              <option>Francia</option>
              <option>España</option>
            </select>

            <label style={labelStyle}>
              Objetivo de compra
            </label>

            <select
              value={form.useCase}
              onChange={(event) =>
                updateField(
                  "useCase",
                  event.target.value
                )
              }
              style={inputStyle}
            >
              <option value="reventa">
                Comprar para reventa
              </option>

              <option value="quedarmelo">
                Comprar para quedármelo
              </option>
            </select>
          </div>

          <div style={cardStyle}>
            <p style={sectionLabelStyle}>
              Resumen IA
            </p>

            <h2 style={summaryStyle}>
              {scan.summary}
            </h2>

            <div style={semanticGridStyle}>
              <SemanticBadge
                active={scan.semantic?.isPremium}
                label="Premium"
              />

              <SemanticBadge
                active={scan.semantic?.isPhev}
                label="PHEV / Hybrid"
              />

              <SemanticBadge
                active={scan.semantic?.isSuv}
                label="SUV líquido"
              />

              <SemanticBadge
                active={
                  scan.semantic?.isPerformance
                }
                label="Performance"
              />
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>
            Búsquedas rápidas del mercado
          </h2>

          <div style={linksGridStyle}>
            {scan.searchLinks.map(
              (item, index) => (
                <a
                  key={`${item.source}-${item.country}-${index}`}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  style={linkCardStyle}
                >
                  <div>
                    <p style={sourceStyle}>
                      {item.source}
                    </p>

                    <h3 style={linkTitleStyle}>
                      {item.label}
                    </h3>

                    <p style={countryStyle}>
                      Prioridad: {item.priority}
                    </p>
                  </div>

                  <span style={openStyle}>
                    Abrir búsqueda →
                  </span>
                </a>
              )
            )}
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>
            Criterios para detectar el chollo
          </h2>

          <div style={logicGridStyle}>
            {scan.buyingLogic.map(
              (item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  style={{
                    ...logicCardStyle,
                    ...getLogicStyle(item.type),
                  }}
                >
                  <h3 style={logicTitleStyle}>
                    {item.title}
                  </h3>

                  <p style={logicTextStyle}>
                    {item.text}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        <div style={nextStepStyle}>
          <strong>Siguiente fase:</strong>{" "}
          conectar este scanner con una Edge
          Function para leer anuncios reales,
          extraer título/precio/km/año,
          analizarlos automáticamente y devolver
          TOP oportunidades reales.
        </div>
      </div>
    </div>
  );
}

function SemanticBadge({ active, label }) {
  return (
    <div
      style={{
        ...semanticBadgeStyle,
        opacity: active ? 1 : 0.42,
        borderColor: active
          ? "rgba(34,197,94,0.45)"
          : "rgba(148,163,184,0.18)",
      }}
    >
      {active ? "✅" : "○"} {label}
    </div>
  );
}

function getLogicStyle(type) {
  if (type === "positive") {
    return {
      border:
        "1px solid rgba(34,197,94,0.28)",
      background:
        "rgba(34,197,94,0.10)",
    };
  }

  if (type === "warning") {
    return {
      border:
        "1px solid rgba(250,204,21,0.28)",
      background:
        "rgba(250,204,21,0.10)",
    };
  }

  return {
    border:
      "1px solid rgba(148,163,184,0.18)",
    background: "rgba(255,255,255,0.05)",
  };
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
  maxWidth: "1300px",
  margin: "0 auto",
};

const headerStyle = {
  marginBottom: "34px",
};

const badgeStyle = {
  display: "inline-block",
  background:
    "rgba(34,197,94,0.14)",
  color: "#86efac",
  padding: "8px 14px",
  borderRadius: "999px",
  fontWeight: "900",
  marginBottom: "18px",
};

const titleStyle = {
  fontSize: "clamp(36px, 6vw, 58px)",
  margin: 0,
  letterSpacing: "-0.04em",
};

const subtitleStyle = {
  color: "#cbd5e1",
  marginTop: "16px",
  lineHeight: "1.65",
  maxWidth: "780px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "24px",
};

const cardStyle = {
  background: "rgba(15,23,42,0.82)",
  border:
    "1px solid rgba(148,163,184,0.16)",
  borderRadius: "28px",
  padding: "28px",
  boxShadow:
    "0 24px 80px rgba(0,0,0,0.22)",
};

const labelStyle = {
  display: "block",
  marginTop: "16px",
  marginBottom: "8px",
  color: "#cbd5e1",
  fontWeight: "800",
  fontSize: "14px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "16px",
  borderRadius: "16px",
  border:
    "1px solid rgba(148,163,184,0.20)",
  background: "rgba(2,6,23,0.86)",
  color: "white",
  outline: "none",
  fontWeight: "700",
};

const sectionLabelStyle = {
  color: "#93c5fd",
  fontWeight: "900",
  marginTop: 0,
};

const summaryStyle = {
  fontSize: "28px",
  lineHeight: "1.25",
  marginTop: "12px",
};

const semanticGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  marginTop: "24px",
};

const semanticBadgeStyle = {
  padding: "14px",
  borderRadius: "16px",
  background: "rgba(2,6,23,0.65)",
  border:
    "1px solid rgba(148,163,184,0.18)",
  color: "#e5e7eb",
  fontWeight: "900",
};

const sectionStyle = {
  marginTop: "28px",
};

const sectionTitleStyle = {
  fontSize: "24px",
  marginBottom: "18px",
};

const linksGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "16px",
};

const linkCardStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  minHeight: "155px",
  textDecoration: "none",
  color: "white",
  background: "rgba(15,23,42,0.78)",
  border:
    "1px solid rgba(148,163,184,0.16)",
  borderRadius: "22px",
  padding: "20px",
};

const sourceStyle = {
  color: "#86efac",
  fontWeight: "900",
  margin: 0,
};

const linkTitleStyle = {
  margin: "10px 0",
  fontSize: "18px",
};

const countryStyle = {
  color: "#cbd5e1",
};

const openStyle = {
  color: "#93c5fd",
  fontWeight: "900",
  marginTop: "18px",
};

const logicGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "16px",
};

const logicCardStyle = {
  borderRadius: "22px",
  padding: "20px",
};

const logicTitleStyle = {
  marginTop: 0,
};

const logicTextStyle = {
  color: "#e5e7eb",
  lineHeight: "1.55",
};

const nextStepStyle = {
  marginTop: "30px",
  padding: "22px",
  borderRadius: "22px",
  background:
    "rgba(59,130,246,0.12)",
  border:
    "1px solid rgba(59,130,246,0.28)",
  color: "#dbeafe",
  lineHeight: "1.55",
};