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
    <div
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1>Importador IA</h1>

      <div
        style={{
          background: "#111827",
          padding: "30px",
          borderRadius: "12px",
          marginTop: "30px",
          maxWidth: "700px",
        }}
      >
        <h2>Datos del vehículo</h2>

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

        {analysis && (
          <div
            style={{
              marginTop: "30px",
              background: "#020617",
              padding: "25px",
              borderRadius: "12px",
            }}
          >
            <h2>{car.title || "Vehículo analizado"}</h2>

            <p>Score IA: {analysis.score}/100</p>
            <p>Recomendación: {analysis.recommendation}</p>
            <p>
              Precio estimado venta España:{" "}
              {Math.round(analysis.estimatedSalePrice)} €
            </p>
            <p>Beneficio estimado: {Math.round(analysis.estimatedProfit)} €</p>
            <p>
              ROI estimado:{" "}
              {Math.round(
                (analysis.estimatedProfit / Number(car.price)) * 100
              )}
              %
            </p>

            <button
              onClick={saveAnalysis}
              disabled={saving}
              style={buttonStyle}
            >
              {saving ? "Guardando..." : "Guardar análisis"}
            </button>

            {message && <p style={{ fontWeight: "bold" }}>{message}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "14px",
  marginTop: "14px",
  borderRadius: "10px",
  border: "none",
  fontSize: "16px",
};

const buttonStyle = {
  marginTop: "20px",
  padding: "14px 22px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  fontSize: "16px",
};