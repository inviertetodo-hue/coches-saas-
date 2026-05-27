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

  const [message, setMessage] = useState("");

  const [loadingUrl, setLoadingUrl] =
    useState(false);

  function updateField(field, value) {
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
    if (!analysis) return;

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
      setMessage(
        "ANÁLISIS GUARDADO EN HISTORIAL"
      );
    }

    setSaving(false);
  }

  function getRecommendationStyles(
    recommendation
  ) {
    if (
      recommendation?.includes("CHOLLO")
    ) {
      return {
        background:
          "rgba(34, 197, 94, 0.18)",

        color: "#86efac",

        border:
          "1px solid rgba(34, 197, 94, 0.4)",

        glow:
          "0 0 40px rgba(34,197,94,0.25)",
      };
    }

    if (
      recommendation?.includes("ANALIZAR")
    ) {
      return {
        background:
          "rgba(250, 204, 21, 0.15)",

        color: "#fde68a",

        border:
          "1px solid rgba(250, 204, 21, 0.35)",

        glow:
          "0 0 40px rgba(250,204,21,0.18)",
      };
    }

    return {
      background:
        "rgba(239, 68, 68, 0.15)",

      color: "#fca5a5",

      border:
        "1px solid rgba(239, 68, 68, 0.35)",

      glow:
        "0 0 40px rgba(239,68,68,0.18)",
    };
  }

  function getAlertStyle(type) {
    if (type === "success") {
      return {
        background:
          "rgba(34,197,94,0.12)",

        border:
          "1px solid rgba(34,197,94,0.25)",
      };
    }

    if (type === "warning") {
      return {
        background:
          "rgba(250,204,21,0.12)",

        border:
          "1px solid rgba(250,204,21,0.25)",
      };
    }

    return {
      background:
        "rgba(239,68,68,0.12)",

      border:
        "1px solid rgba(239,68,68,0.25)",
    };
  }

  const recommendationStyles =
    analysis
      ? getRecommendationStyles(
          analysis.recommendation
        )
      : null;

  return (
    <div style={pageStyle}>
      <div style={backgroundGlowOne}></div>

      <div style={backgroundGlowTwo}></div>

      <div style={containerStyle}>
        <div style={headerStyle}>
          <p style={badgeStyle}>
            Coches SaaS · Importador Inteligente
          </p>

          <h1 style={titleStyle}>
            Analiza oportunidades con IA
          </h1>

          <p style={subtitleStyle}>
            Score inteligente, ROI,
            beneficio estimado y alertas
            IA automáticas.
          </p>
        </div>

        <div style={gridStyle}>
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>
              Datos del vehículo
            </h2>

            <input
              placeholder="URL del anuncio"
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
                ? "Analizando URL..."
                : "Analizar URL"}
            </button>

            <input
              placeholder="BMW 320d Touring"
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

            {message && (
              <p style={messageStyle}>
                {message}
              </p>
            )}
          </div>

          <div
            style={{
              ...cardStyle,

              boxShadow:
                recommendationStyles
                  ? recommendationStyles.glow
                  : cardStyle.boxShadow,
            }}
          >
            {!analysis && (
              <div style={emptyStateStyle}>
                <p style={emptyIconStyle}>
                  🚘
                </p>

                <p style={emptyTitleStyle}>
                  Esperando análisis IA
                </p>

                <p style={mutedTextStyle}>
                  Introduce un coche para
                  generar insights y alertas.
                </p>
              </div>
            )}

            {analysis && (
              <div>
                <div
                  style={{
                    ...recommendationStyle,

                    background:
                      recommendationStyles.background,

                    color:
                      recommendationStyles.color,

                    border:
                      recommendationStyles.border,
                  }}
                >
                  {analysis.recommendation}
                </div>

                <h2 style={carTitleStyle}>
                  {car.title}
                </h2>

                <div
                  style={scoreContainerStyle}
                >
                  <div
                    style={scoreCircleStyle}
                  >
                    <span
                      style={
                        scoreNumberStyle
                      }
                    >
                      {analysis.score}
                    </span>

                    <span
                      style={scoreTextStyle}
                    >
                      SCORE IA
                    </span>
                  </div>
                </div>

                <div style={kpiGridStyle}>
                  <div style={kpiCardStyle}>
                    <p style={kpiLabelStyle}>
                      ROI
                    </p>

                    <p style={kpiValueStyle}>
                      {analysis.roi}%
                    </p>
                  </div>

                  <div style={kpiCardStyle}>
                    <p style={kpiLabelStyle}>
                      Beneficio
                    </p>

                    <p style={kpiValueStyle}>
                      {Math.round(
                        analysis.estimatedProfit
                      )}{" "}
                      €
                    </p>
                  </div>
                </div>

                <div
                  style={
                    insightsContainerStyle
                  }
                >
                  <p style={insightsTitleStyle}>
                    IA Explainability
                  </p>

                  {analysis.insights?.map(
                    (
                      insight,
                      index
                    ) => (
                      <div
                        key={index}
                        style={
                          insightCardStyle
                        }
                      >
                        {insight.text}
                      </div>
                    )
                  )}
                </div>

                <div
                  style={
                    alertsContainerStyle
                  }
                >
                  <p style={alertsTitleStyle}>
                    🚨 Smart Alerts Engine
                  </p>

                  {analysis.alerts?.map(
                    (alert, index) => (
                      <div
                        key={index}
                        style={{
                          ...alertCardStyle,

                          ...getAlertStyle(
                            alert.type
                          ),
                        }}
                      >
                        {alert.text}
                      </div>
                    )
                  )}
                </div>

                <button
                  onClick={saveAnalysis}
                  disabled={saving}
                  style={buttonStyle}
                >
                  {saving
                    ? "Guardando..."
                    : "Guardar análisis"}
                </button>
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
};

const backgroundGlowOne = {
  position: "absolute",
  width: "400px",
  height: "400px",
  background: "#2563eb",
  filter: "blur(140px)",
  opacity: 0.18,
};

const backgroundGlowTwo = {
  position: "absolute",
  width: "300px",
  height: "300px",
  background: "#16a34a",
  filter: "blur(120px)",
  opacity: 0.12,
  right: 0,
  bottom: 0,
};

const containerStyle = {
  maxWidth: "1250px",
  margin: "0 auto",
  position: "relative",
  zIndex: 10,
};

const headerStyle = {
  marginBottom: "40px",
};

const badgeStyle = {
  display: "inline-block",
  background:
    "rgba(59,130,246,0.18)",
  color: "#93c5fd",
  padding: "8px 14px",
  borderRadius: "999px",
  fontWeight: "700",
  marginBottom: "18px",
};

const titleStyle = {
  fontSize: "52px",
  margin: 0,
};

const subtitleStyle = {
  color: "#cbd5e1",
  fontSize: "18px",
  marginTop: "14px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "28px",
};

const cardStyle = {
  background:
    "rgba(15,23,42,0.82)",
  borderRadius: "28px",
  padding: "30px",
  border:
    "1px solid rgba(148,163,184,0.16)",
  boxShadow:
    "0 24px 80px rgba(0,0,0,0.35)",
};

const sectionTitleStyle = {
  fontSize: "24px",
  marginTop: 0,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "16px",
  marginTop: "14px",
  borderRadius: "16px",
  border:
    "1px solid rgba(148,163,184,0.18)",
  background:
    "rgba(2,6,23,0.8)",
  color: "white",
};

const buttonStyle = {
  marginTop: "22px",
  width: "100%",
  padding: "16px",
  borderRadius: "16px",
  border: "none",
  background:
    "linear-gradient(135deg,#2563eb,#16a34a)",
  color: "white",
  fontWeight: "900",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  marginTop: "18px",
  width: "100%",
  padding: "16px",
  borderRadius: "16px",
  border:
    "1px solid rgba(59,130,246,0.3)",
  background:
    "rgba(37,99,235,0.12)",
  color: "#93c5fd",
  fontWeight: "900",
  cursor: "pointer",
};

const messageStyle = {
  marginTop: "18px",
  color: "#93c5fd",
  fontWeight: "700",
};

const emptyStateStyle = {
  minHeight: "500px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
};

const emptyIconStyle = {
  fontSize: "56px",
};

const emptyTitleStyle = {
  fontSize: "26px",
  fontWeight: "900",
};

const mutedTextStyle = {
  color: "#94a3b8",
  maxWidth: "320px",
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
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const scoreNumberStyle = {
  fontSize: "56px",
  fontWeight: "900",
};

const scoreTextStyle = {
  marginTop: "10px",
  color: "#cbd5e1",
  fontSize: "13px",
  fontWeight: "700",
};

const kpiGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
};

const kpiCardStyle = {
  background:
    "rgba(2,6,23,0.75)",
  borderRadius: "20px",
  padding: "20px",
};

const kpiLabelStyle = {
  color: "#94a3b8",
};

const kpiValueStyle = {
  fontSize: "30px",
  fontWeight: "900",
};

const insightsContainerStyle = {
  marginTop: "28px",
};

const insightsTitleStyle = {
  fontSize: "15px",
  fontWeight: "900",
  marginBottom: "16px",
};

const insightCardStyle = {
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
  background:
    "rgba(255,255,255,0.05)",
  fontWeight: "700",
};

const alertsContainerStyle = {
  marginTop: "28px",
};

const alertsTitleStyle = {
  fontSize: "15px",
  fontWeight: "900",
  marginBottom: "16px",
};

const alertCardStyle = {
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
  fontWeight: "800",
};