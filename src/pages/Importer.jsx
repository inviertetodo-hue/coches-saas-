import { useState } from "react";
import { supabase } from "../lib/supabase";
import { analyzeCar } from "../services/profitAnalyzer";

export default function Importer() {
  const [car, setCar] = useState({
    title: "",
    price: "",
    km: "",
    year: "",
    country: "Alemania",
    url: "",
  });

  const [analysis, setAnalysis] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function updateField(field, value) {
    setCar({
      ...car,
      [field]: value,
    });
  }

  function analyzeManualCar() {
    const carData = {
      ...car,
      price: Number(car.price),
      km: Number(car.km),
      year: Number(car.year),
    };

    const result = analyzeCar(carData);
    setAnalysis(result);
    setMessage("");
  }

  async function saveAnalysis() {
    if (!analysis) return;

    setSaving(true);
    setMessage("");

    const price = Number(car.price);

    const { error } = await supabase.from("import_analyses").insert({
      country: car.country,
      profit: Math.round(analysis.estimatedProfit),
      roi: Math.round((analysis.estimatedProfit / price) * 100),
      score: analysis.score,
      url: car.url,
    });

    if (error) {
      console.log(error);
      setMessage("ERROR AL GUARDAR");
    } else {
      setMessage("ANÁLISIS GUARDADO EN HISTORIAL");
    }

    setSaving(false);
  }

  function getRecommendationStyles(recommendation) {
    if (recommendation?.includes("CHOLLO")) {
      return {
        background: "rgba(34, 197, 94, 0.18)",
        color: "#86efac",
        border: "1px solid rgba(34, 197, 94, 0.4)",
        glow: "0 0 40px rgba(34,197,94,0.25)",
      };
    }

    if (recommendation?.includes("ANALIZAR")) {
      return {
        background: "rgba(250, 204, 21, 0.15)",
        color: "#fde68a",
        border: "1px solid rgba(250, 204, 21, 0.35)",
        glow: "0 0 40px rgba(250,204,21,0.18)",
      };
    }

    return {
      background: "rgba(239, 68, 68, 0.15)",
      color: "#fca5a5",
      border: "1px solid rgba(239, 68, 68, 0.35)",
      glow: "0 0 40px rgba(239,68,68,0.18)",
    };
  }

  const recommendationStyles = analysis
    ? getRecommendationStyles(analysis.recommendation)
    : null;

  return (
    <div style={pageStyle}>
      <div style={backgroundGlowOne}></div>
      <div style={backgroundGlowTwo}></div>

      <div style={containerStyle}>
        <div style={headerStyle}>
          <p style={badgeStyle}>Coches SaaS · Importador Inteligente</p>

          <h1 style={titleStyle}>
            Analiza oportunidades de importación con IA
          </h1>

          <p style={subtitleStyle}>
            Score inteligente, ROI, beneficio estimado y oportunidades reales
            de importación.
          </p>
        </div>

        <div style={gridStyle}>
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>Datos del vehículo</h2>

            <input
              placeholder="Ej: BMW 320d Touring"
              value={car.title}
              onChange={(e) => updateField("title", e.target.value)}
              style={inputStyle}
            />

            <input
              placeholder="Precio compra Alemania"
              value={car.price}
              onChange={(e) => updateField("price", e.target.value)}
              style={inputStyle}
            />

            <input
              placeholder="Kilómetros"
              value={car.km}
              onChange={(e) => updateField("km", e.target.value)}
              style={inputStyle}
            />

            <input
              placeholder="Año"
              value={car.year}
              onChange={(e) => updateField("year", e.target.value)}
              style={inputStyle}
            />

            <input
              placeholder="País"
              value={car.country}
              onChange={(e) => updateField("country", e.target.value)}
              style={inputStyle}
            />

            <input
              placeholder="URL del anuncio"
              value={car.url}
              onChange={(e) => updateField("url", e.target.value)}
              style={inputStyle}
            />

            <button onClick={analyzeManualCar} style={buttonStyle}>
              Analizar vehículo
            </button>
          </div>

          <div
            style={{
              ...cardStyle,
              boxShadow: recommendationStyles
                ? recommendationStyles.glow
                : cardStyle.boxShadow,
            }}
          >
            <h2 style={sectionTitleStyle}>Resultado IA</h2>

            {!analysis && (
              <div style={emptyStateStyle}>
                <p style={emptyIconStyle}>🚘</p>

                <p style={emptyTitleStyle}>
                  Esperando análisis inteligente
                </p>

                <p style={mutedTextStyle}>
                  Introduce un vehículo y deja que la IA calcule el potencial
                  de importación.
                </p>
              </div>
            )}

            {analysis && (
              <div>
                <div
                  style={{
                    ...recommendationStyle,
                    background: recommendationStyles.background,
                    color: recommendationStyles.color,
                    border: recommendationStyles.border,
                  }}
                >
                  {analysis.recommendation}
                </div>

                <h2 style={carTitleStyle}>
                  {car.title || "Vehículo analizado"}
                </h2>

                <div style={scoreContainerStyle}>
                  <div style={scoreCircleStyle}>
                    <span style={scoreNumberStyle}>
                      {analysis.score}
                    </span>

                    <span style={scoreTextStyle}>SCORE IA</span>
                  </div>
                </div>

                <div style={kpiGridStyle}>
                  <div style={kpiCardStyle}>
                    <p style={kpiLabelStyle}>ROI estimado</p>

                    <p style={kpiValueStyle}>
                      {Math.round(
                        (analysis.estimatedProfit / Number(car.price)) * 100
                      )}
                      %
                    </p>
                  </div>

                  <div style={kpiCardStyle}>
                    <p style={kpiLabelStyle}>Beneficio</p>

                    <p style={kpiValueStyle}>
                      {Math.round(analysis.estimatedProfit)} €
                    </p>
                  </div>

                  <div style={kpiCardStyle}>
                    <p style={kpiLabelStyle}>Venta España</p>

                    <p style={kpiValueStyle}>
                      {Math.round(analysis.estimatedSalePrice)} €
                    </p>
                  </div>

                  <div style={kpiCardStyle}>
                    <p style={kpiLabelStyle}>Mercado</p>

                    <p style={kpiValueStyle}>ES</p>
                  </div>
                </div>

                <button
                  onClick={saveAnalysis}
                  disabled={saving}
                  style={buttonStyle}
                >
                  {saving ? "Guardando..." : "Guardar análisis"}
                </button>

                {message && <p style={messageStyle}>{message}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, #1e3a8a 0, #020617 40%, #020617 100%)",
  color: "white",
  padding: "48px",
  fontFamily: "Arial, sans-serif",
  position: "relative",
  overflow: "hidden",
};

const backgroundGlowOne = {
  position: "absolute",
  width: "400px",
  height: "400px",
  background: "#2563eb",
  filter: "blur(140px)",
  opacity: 0.18,
  top: "-100px",
  left: "-100px",
};

const backgroundGlowTwo = {
  position: "absolute",
  width: "300px",
  height: "300px",
  background: "#16a34a",
  filter: "blur(120px)",
  opacity: 0.12,
  bottom: "-80px",
  right: "-60px",
};

const containerStyle = {
  maxWidth: "1250px",
  margin: "0 auto",
  position: "relative",
  zIndex: 10,
};

const headerStyle = {
  marginBottom: "42px",
};

const badgeStyle = {
  display: "inline-block",
  background: "rgba(59, 130, 246, 0.18)",
  color: "#93c5fd",
  padding: "8px 14px",
  borderRadius: "999px",
  fontSize: "14px",
  fontWeight: "700",
  marginBottom: "18px",
};

const titleStyle = {
  fontSize: "52px",
  lineHeight: "1.05",
  margin: 0,
  maxWidth: "800px",
};

const subtitleStyle = {
  color: "#cbd5e1",
  fontSize: "19px",
  maxWidth: "700px",
  marginTop: "16px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "28px",
  alignItems: "start",
};

const cardStyle = {
  background: "rgba(15, 23, 42, 0.82)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
  padding: "30px",
  borderRadius: "28px",
  backdropFilter: "blur(18px)",
  transition: "0.3s",
};

const sectionTitleStyle = {
  fontSize: "24px",
  marginTop: 0,
  marginBottom: "22px",
};

const inputStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "16px",
  marginTop: "14px",
  borderRadius: "16px",
  border: "1px solid rgba(148, 163, 184, 0.22)",
  background: "rgba(2, 6, 23, 0.85)",
  color: "white",
  fontSize: "16px",
  outline: "none",
};

const buttonStyle = {
  marginTop: "24px",
  width: "100%",
  padding: "16px 22px",
  borderRadius: "16px",
  border: "none",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "900",
  color: "white",
  background: "linear-gradient(135deg, #2563eb, #16a34a)",
  boxShadow: "0 18px 40px rgba(37, 99, 235, 0.35)",
};

const emptyStateStyle = {
  minHeight: "480px",
  border: "1px dashed rgba(148, 163, 184, 0.22)",
  borderRadius: "22px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "#cbd5e1",
  textAlign: "center",
  padding: "30px",
};

const emptyIconStyle = {
  fontSize: "56px",
  margin: 0,
};

const emptyTitleStyle = {
  fontSize: "24px",
  fontWeight: "800",
  marginTop: "14px",
};

const mutedTextStyle = {
  color: "#94a3b8",
  marginTop: "6px",
  maxWidth: "380px",
  lineHeight: "1.6",
};

const recommendationStyle = {
  display: "inline-block",
  padding: "12px 16px",
  borderRadius: "999px",
  fontWeight: "900",
  marginBottom: "22px",
};

const carTitleStyle = {
  fontSize: "30px",
  marginTop: 0,
  marginBottom: "28px",
};

const scoreContainerStyle = {
  display: "flex",
  justifyContent: "center",
  marginBottom: "30px",
};

const scoreCircleStyle = {
  width: "180px",
  height: "180px",
  borderRadius: "999px",
  background:
    "linear-gradient(135deg, rgba(37,99,235,0.35), rgba(34,197,94,0.25))",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 20px 60px rgba(37,99,235,0.25)",
};

const scoreNumberStyle = {
  fontSize: "56px",
  fontWeight: "900",
  lineHeight: 1,
};

const scoreTextStyle = {
  marginTop: "10px",
  color: "#cbd5e1",
  fontSize: "13px",
  fontWeight: "700",
  letterSpacing: "2px",
};

const kpiGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
};

const kpiCardStyle = {
  background: "rgba(2, 6, 23, 0.75)",
  border: "1px solid rgba(148, 163, 184, 0.12)",
  borderRadius: "20px",
  padding: "20px",
};

const kpiLabelStyle = {
  color: "#94a3b8",
  fontSize: "14px",
  margin: 0,
};

const kpiValueStyle = {
  fontSize: "30px",
  fontWeight: "900",
  margin: "10px 0 0",
};

const messageStyle = {
  marginTop: "20px",
  fontWeight: "900",
  color: "#93c5fd",
};