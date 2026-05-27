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

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <p style={badgeStyle}>Coches SaaS · Importador Inteligente</p>
          <h1 style={titleStyle}>Analiza oportunidades de importación con IA</h1>
          <p style={subtitleStyle}>
            Introduce los datos del vehículo y calcula score, ROI y beneficio estimado.
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

          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>Resultado IA</h2>

            {!analysis && (
              <div style={emptyStateStyle}>
                <p style={emptyIconStyle}>🚗</p>
                <p>Aún no hay análisis.</p>
                <p style={mutedTextStyle}>
                  Rellena el formulario y pulsa “Analizar vehículo”.
                </p>
              </div>
            )}

            {analysis && (
              <div>
                <div style={recommendationStyle}>
                  {analysis.recommendation}
                </div>

                <h2 style={carTitleStyle}>{car.title || "Vehículo analizado"}</h2>

                <div style={kpiGridStyle}>
                  <div style={kpiCardStyle}>
                    <p style={kpiLabelStyle}>Score IA</p>
                    <p style={kpiValueStyle}>{analysis.score}/100</p>
                  </div>

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
    "radial-gradient(circle at top left, #1e3a8a 0, #020617 35%, #020617 100%)",
  color: "white",
  padding: "48px",
  fontFamily: "Arial, sans-serif",
};

const containerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
};

const headerStyle = {
  marginBottom: "36px",
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
  fontSize: "44px",
  lineHeight: "1.1",
  margin: 0,
  maxWidth: "760px",
};

const subtitleStyle = {
  color: "#cbd5e1",
  fontSize: "18px",
  maxWidth: "680px",
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
  borderRadius: "24px",
  backdropFilter: "blur(14px)",
};

const sectionTitleStyle = {
  fontSize: "22px",
  marginTop: 0,
  marginBottom: "20px",
};

const inputStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "15px 16px",
  marginTop: "14px",
  borderRadius: "14px",
  border: "1px solid rgba(148, 163, 184, 0.25)",
  background: "rgba(15, 23, 42, 0.9)",
  color: "white",
  fontSize: "16px",
  outline: "none",
};

const buttonStyle = {
  marginTop: "22px",
  width: "100%",
  padding: "15px 22px",
  borderRadius: "14px",
  border: "none",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "800",
  color: "white",
  background: "linear-gradient(135deg, #2563eb, #16a34a)",
  boxShadow: "0 18px 40px rgba(37, 99, 235, 0.35)",
};

const emptyStateStyle = {
  minHeight: "360px",
  border: "1px dashed rgba(148, 163, 184, 0.3)",
  borderRadius: "20px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "#cbd5e1",
  textAlign: "center",
};

const emptyIconStyle = {
  fontSize: "48px",
  margin: 0,
};

const mutedTextStyle = {
  color: "#94a3b8",
  marginTop: "4px",
};

const recommendationStyle = {
  display: "inline-block",
  padding: "10px 14px",
  borderRadius: "999px",
  background: "rgba(34, 197, 94, 0.16)",
  color: "#86efac",
  fontWeight: "900",
  marginBottom: "18px",
};

const carTitleStyle = {
  fontSize: "26px",
  marginTop: 0,
  marginBottom: "22px",
};

const kpiGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "14px",
};

const kpiCardStyle = {
  background: "rgba(2, 6, 23, 0.7)",
  border: "1px solid rgba(148, 163, 184, 0.14)",
  borderRadius: "18px",
  padding: "18px",
};

const kpiLabelStyle = {
  color: "#94a3b8",
  fontSize: "14px",
  margin: 0,
};

const kpiValueStyle = {
  fontSize: "26px",
  fontWeight: "900",
  margin: "8px 0 0",
};

const messageStyle = {
  marginTop: "18px",
  fontWeight: "900",
  color: "#93c5fd",
};