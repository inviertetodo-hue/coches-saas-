import { useState } from "react";
import { supabase } from "../lib/supabase";
import { analyzeCar } from "../services/profitAnalyzer";

export default function Importer() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const car = {
    title: "BMW 320d Touring",
    price: 18900,
    km: 95000,
    year: 2020,
    country: "Alemania",
    url: "https://suchen.mobile.de/fahrzeuge/details.html?id=397445030",
  };

  const analysis = analyzeCar(car);

  async function saveAnalysis() {
    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("import_analyses").insert({
      country: car.country,
      profit: Math.round(analysis.estimatedProfit),
      roi: Math.round((analysis.estimatedProfit / car.price) * 100),
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
        }}
      >
        <h2>{car.title}</h2>

        <p>Precio Alemania: {car.price} €</p>
        <p>Kilómetros: {car.km}</p>
        <p>Año: {car.year}</p>
        <p>País: {car.country}</p>

        <hr />

        <h2>ANÁLISIS IA</h2>

        <p>Score IA: {analysis.score}/100</p>
        <p>Recomendación: {analysis.recommendation}</p>
        <p>Precio estimado venta España: {Math.round(analysis.estimatedSalePrice)} €</p>
        <p>Beneficio estimado: {Math.round(analysis.estimatedProfit)} €</p>
        <p>ROI estimado: {Math.round((analysis.estimatedProfit / car.price) * 100)}%</p>

        <button
          onClick={saveAnalysis}
          disabled={saving}
          style={{
            marginTop: "20px",
            padding: "14px 22px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {saving ? "Guardando..." : "Guardar análisis"}
        </button>

        {message && (
          <p style={{ marginTop: "20px", fontWeight: "bold" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}