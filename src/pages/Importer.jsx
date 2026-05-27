import { useState } from "react";
import { supabase } from "../lib/supabase";
import { analyzeCar } from "../services/profitAnalyzer";
import { parseCarFromUrl } from "../services/urlParser";

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

  const [saved, setSaved] = useState(false);

  const [message, setMessage] = useState("");

  const [loadingUrl, setLoadingUrl] =
    useState(false);

  function updateField(field, value) {
    setSaved(false);

    setCar({
      ...car,
      [field]: value,
    });
  }

  async function parseUrl() {
    if (!car.url) {
      setMessage("PEGA UNA URL");
      return;
    }

    setSaved(false);

    setLoadingUrl(true);

    setMessage("");

    setAnalysis(null);

    const semanticData =
      parseCarFromUrl(car.url);

    try {
      const { data, error } =
        await supabase.functions.invoke(
          "scrape-car",
          {
            body: {
              url: car.url,
            },
          }
        );

      if (error) {
        setCar({
          ...car,
          title:
            semanticData?.title ||
            car.title,
        });

        setMessage(
          "SCRAPER NO DISPONIBLE · DATOS DETECTADOS DESDE URL"
        );

        setLoadingUrl(false);

        return;
      }

      if (data?.blocked) {
        setCar({
          ...car,
          title:
            semanticData?.title ||
            car.title,
        });

        setMessage(
          "PORTAL BLOQUEÓ SCRAPING · TÍTULO DETECTADO DESDE URL"
        );

        setLoadingUrl(false);

        return;
      }

      if (!data?.success) {
        setCar({
          ...car,
          title:
            semanticData?.title ||
            car.title,
        });

        setMessage(
          "NO SE PUDO SCRAPEAR · TÍTULO DETECTADO DESDE URL"
        );

        setLoadingUrl(false);

        return;
      }

      const parsed = data.data;

      setCar({
        ...car,
        title:
          parsed.title ||
          semanticData?.title ||
          "",

        price: parsed.price || "",

        km: parsed.km || "",

        year: parsed.year || "",

        country:
          parsed.country ||
          "Alemania",

        url: parsed.url || car.url,
      });

      if (data.warning) {
        setMessage(
          "EXTRACCIÓN PARCIAL · REVISA LOS CAMPOS"
        );
      } else {
        setMessage(
          "DATOS EXTRAÍDOS CORRECTAMENTE"
        );
      }
    } catch (error) {
      console.log(error);

      setCar({
        ...car,
        title:
          semanticData?.title ||
          car.title,
      });

      setMessage(
        "ERROR SCRAPER · TÍTULO DETECTADO DESDE URL"
      );
    }

    setLoadingUrl(false);
  }

  function analyzeManualCar() {
    setSaved(false);

    if (
      !car.title ||
      !car.price ||
      !car.km ||
      !car.year
    ) {
      setMessage(
        "COMPLETA TÍTULO, PRECIO, KM Y AÑO"
      );

      return;
    }

    const price = Number(car.price);

    const km = Number(car.km);

    const year = Number(car.year);

    if (
      isNaN(price) ||
      isNaN(km) ||
      isNaN(year)
    ) {
      setMessage(
        "PRECIO, KM Y AÑO DEBEN SER NÚMEROS"
      );

      return;
    }

    const estimatedMarketPrice =
      Math.round(price * 1.28);

    const result = analyzeCar({
      ...car,
      price,
      km,
      year,
      estimatedMarketPrice,
    });

    setAnalysis(result);

    setMessage("");
  }

  async function saveAnalysis() {
    if (!analysis || saved) return;

    setSaving(true);

    setMessage("");

    const price = Number(car.price);

    const { error } = await supabase
      .from("import_analyses")
      .insert({
        country: car.country,
        profit: Math.round(
          analysis.estimatedProfit
        ),
        roi: Math.round(
          (analysis.estimatedProfit /
            price) *
            100
        ),
        score: analysis.score,
        url: car.url,
      });

    if (error) {
      console.log(error);

      setMessage("ERROR AL GUARDAR");
    } else {
      setSaved(true);

      setMessage(
        "ANÁLISIS GUARDADO EN HISTORIAL"
      );
    }

    setSaving(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom, #020617, #0f172a)",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            marginBottom: "10px",
          }}
        >
          Analiza oportunidades con IA
        </h1>

        <p
          style={{
            color: "#94a3b8",
            marginBottom: "30px",
          }}
        >
          Score inteligente, ROI,
          beneficio estimado y alertas
          IA automáticas.
        </p>

        <div
          style={{
            background:
              "rgba(15,23,42,0.85)",
            borderRadius: "24px",
            padding: "30px",
          }}
        >
          <input
            placeholder="URL"
            value={car.url}
            onChange={(e) =>
              updateField(
                "url",
                e.target.value
              )
            }
            style={inputStyle}
          />

          <button
            onClick={parseUrl}
            style={secondaryButtonStyle}
          >
            {loadingUrl
              ? "Analizando..."
              : "Analizar URL"}
          </button>

          <input
            placeholder="Título"
            value={car.title}
            onChange={(e) =>
              updateField(
                "title",
                e.target.value
              )
            }
            style={inputStyle}
          />

          <input
            placeholder="Precio"
            value={car.price}
            onChange={(e) =>
              updateField(
                "price",
                e.target.value
              )
            }
            style={inputStyle}
          />

          <input
            placeholder="Kilómetros"
            value={car.km}
            onChange={(e) =>
              updateField(
                "km",
                e.target.value
              )
            }
            style={inputStyle}
          />

          <input
            placeholder="Año"
            value={car.year}
            onChange={(e) =>
              updateField(
                "year",
                e.target.value
              )
            }
            style={inputStyle}
          />

          <button
            onClick={analyzeManualCar}
            style={buttonStyle}
          >
            Analizar vehículo
          </button>

          {analysis && (
            <div
              style={{
                marginTop: "30px",
              }}
            >
              <h2>
                {analysis.recommendation}
              </h2>

              <p>
                Score IA:{" "}
                {analysis.score}/100
              </p>

              <p>
                ROI: {analysis.roi}%
              </p>

              <p>
                Beneficio:{" "}
                {Math.round(
                  analysis.estimatedProfit
                )}{" "}
                €
              </p>

              <button
                onClick={saveAnalysis}
                disabled={saving || saved}
                style={{
                  ...buttonStyle,

                  opacity:
                    saving || saved
                      ? 0.6
                      : 1,

                  cursor:
                    saving || saved
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {saving
                  ? "Guardando..."
                  : saved
                  ? "✅ Guardado"
                  : "Guardar análisis"}
              </button>
            </div>
          )}

          {message && (
            <p
              style={{
                marginTop: "20px",
                color: "#93c5fd",
              }}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "16px",
  marginTop: "14px",
  borderRadius: "14px",
  border:
    "1px solid rgba(148,163,184,0.18)",
  background:
    "rgba(2,6,23,0.75)",
  color: "white",
};

const buttonStyle = {
  width: "100%",
  marginTop: "20px",
  padding: "16px",
  borderRadius: "16px",
  border: "none",
  background:
    "linear-gradient(135deg,#2563eb,#16a34a)",
  color: "white",
  fontWeight: "900",
};

const secondaryButtonStyle = {
  width: "100%",
  marginTop: "18px",
  padding: "16px",
  borderRadius: "16px",
  border:
    "1px solid rgba(59,130,246,0.3)",
  background:
    "rgba(37,99,235,0.12)",
  color: "#93c5fd",
  fontWeight: "900",
};