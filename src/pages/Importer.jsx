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
  const [semanticData, setSemanticData] = useState(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");

  function updateField(field, value) {
    setSaved(false);

    setCar({
      ...car,
      [field]: value,
    });
  }

  function analyzeManualCar() {
    setSaved(false);

    if (
      !car.title ||
      !car.price ||
      !car.km ||
      !car.year
    ) {
      setMessage("COMPLETA TODOS LOS CAMPOS");
      return;
    }

    const parsed = parseCarFromUrl(car.title);

    setSemanticData(parsed);

    const estimatedMarketPrice = Math.round(
      Number(car.price) * 1.28
    );

    const result = analyzeCar({
      ...car,
      ...parsed,
      price: Number(car.price),
      km: Number(car.km),
      year: Number(car.year),
      estimatedMarketPrice,
    });

    setAnalysis(result);

    setMessage("");
  }

  async function saveAnalysis() {
    if (!analysis || saved) return;

    setSaving(true);

    const { error } = await supabase
      .from("import_analyses")
      .insert({
        title: car.title,

        brand:
          semanticData?.brand || null,

        model:
          semanticData?.model || null,

        fuel_type:
          semanticData?.fuelType || null,

        drivetrain:
          semanticData?.drivetrain || null,

        performance_package:
          semanticData?.performancePackage || null,

        country: car.country,

        profit: Math.round(
          analysis.estimatedProfit
        ),

        roi: analysis.roi,

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

  function PredictiveCard({
    label,
    value,
    emoji,
  }) {
    return (
      <div style={predictiveCardStyle}>
        <p style={predictiveLabelStyle}>
          {emoji} {label}
        </p>

        <h2 style={predictiveValueStyle}>
          {value}/100
        </h2>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <p style={badgeStyle}>
            Coches SaaS · IA Premium
          </p>

          <h1 style={titleStyle}>
            Analiza oportunidades
          </h1>

          <p style={subtitleStyle}>
            Score IA, semantic intelligence,
            predictive AI y smart alerts.
          </p>
        </div>

        <div style={gridStyle}>
          <div style={cardStyle}>
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

            <input
              placeholder="BMW X5 xDrive M Sport PHEV"
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

          <div style={cardStyle}>
            {!analysis && (
              <div style={emptyStateStyle}>
                <p style={emptyIconStyle}>
                  🚘
                </p>

                <p style={emptyTitleStyle}>
                  Esperando análisis IA
                </p>
              </div>
            )}

            {analysis && (
              <>
                <div style={recommendationStyle}>
                  {analysis.recommendation}
                </div>

                <div style={scoreCircleStyle}>
                  <span style={scoreNumberStyle}>
                    {analysis.score}
                  </span>

                  <span style={scoreTextStyle}>
                    SCORE IA
                  </span>
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
                      )} €
                    </p>
                  </div>
                </div>

                <div style={sectionStyle}>
                  <p style={sectionTitleStyle}>
                    🔮 Predictive AI Engine
                  </p>

                  <div
                    style={
                      predictiveGridStyle
                    }
                  >
                    <PredictiveCard
                      label="Demand"
                      value={
                        analysis.demandScore
                      }
                      emoji="📈"
                    />

                    <PredictiveCard
                      label="Resale"
                      value={
                        analysis.resaleScore
                      }
                      emoji="💰"
                    />

                    <PredictiveCard
                      label="Liquidity"
                      value={
                        analysis.liquidityScore
                      }
                      emoji="⚡"
                    />

                    <PredictiveCard
                      label="Future"
                      value={
                        analysis.futurePotential
                      }
                      emoji="🚀"
                    />
                  </div>
                </div>

                <div style={sectionStyle}>
                  <p style={sectionTitleStyle}>
                    🧠 IA Insights
                  </p>

                  {analysis.insights?.map(
                    (insight, index) => (
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

                <div style={sectionStyle}>
                  <p style={sectionTitleStyle}>
                    🚨 Smart Alerts
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
                  disabled={
                    saving || saved
                  }
                  style={{
                    ...buttonStyle,

                    opacity:
                      saving || saved
                        ? 0.6
                        : 1,
                  }}
                >
                  {saving
                    ? "Guardando..."
                    : saved
                    ? "✅ Guardado"
                    : "Guardar análisis"}
                </button>
              </>
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
  fontFamily:
    "Arial, sans-serif",
};

const containerStyle = {
  maxWidth: "1250px",
  margin: "0 auto",
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
  marginTop: "14px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "1fr 1fr",
  gap: "28px",
};

const cardStyle = {
  background:
    "rgba(15,23,42,0.82)",
  borderRadius: "28px",
  padding: "30px",
  border:
    "1px solid rgba(148,163,184,0.16)",
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
};

const messageStyle = {
  marginTop: "18px",
  color: "#93c5fd",
};

const emptyStateStyle = {
  minHeight: "520px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

const emptyIconStyle = {
  fontSize: "56px",
};

const emptyTitleStyle = {
  fontSize: "24px",
  fontWeight: "900",
};

const recommendationStyle = {
  display: "inline-block",
  padding: "12px 18px",
  borderRadius: "999px",
  background:
    "rgba(34,197,94,0.18)",
  color: "#86efac",
  fontWeight: "900",
  marginBottom: "24px",
};

const scoreCircleStyle = {
  width: "180px",
  height: "180px",
  borderRadius: "999px",
  background:
    "linear-gradient(135deg, rgba(37,99,235,0.35), rgba(34,197,94,0.22))",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  margin:
    "0 auto 28px auto",
};

const scoreNumberStyle = {
  fontSize: "56px",
  fontWeight: "900",
};

const scoreTextStyle = {
  marginTop: "10px",
  color: "#cbd5e1",
  fontSize: "13px",
};

const kpiGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "1fr 1fr",
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

const sectionStyle = {
  marginTop: "28px",
};

const sectionTitleStyle = {
  fontSize: "15px",
  fontWeight: "900",
  marginBottom: "14px",
};

const predictiveGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "1fr 1fr",
  gap: "14px",
};

const predictiveCardStyle = {
  background:
    "rgba(255,255,255,0.05)",
  borderRadius: "18px",
  padding: "18px",
};

const predictiveLabelStyle = {
  color: "#cbd5e1",
  fontSize: "14px",
};

const predictiveValueStyle = {
  fontSize: "34px",
  fontWeight: "900",
  marginTop: "10px",
};

const insightCardStyle = {
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
  background:
    "rgba(255,255,255,0.05)",
  fontWeight: "700",
};

const alertCardStyle = {
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
  fontWeight: "800",
};