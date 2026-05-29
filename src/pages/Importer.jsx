import { useCallback, useState } from "react";
import { supabase } from "../lib/supabase";
import { analyzeCar } from "../services/profitAnalyzer";
import { parseCarFromUrl } from "../services/urlParser";
import { parseMobileDeUrl } from "../services/market/adapters/mobileDeAdapter";
import { readListingFromUrl } from "../services/market/listingReader";

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
  const [isReadingListing, setIsReadingListing] = useState(false);

  const updateField = useCallback((field, value) => {
    setSaved(false);
    setAnalysis(null);
    setMessage("");

    setCar((current) => ({
      ...current,
      [field]: value,
    }));
  }, []);

  const validateCarInput = useCallback((workingCar, resolvedTitle = "") => {
    const price = Number(workingCar.price);
    const km = Number(workingCar.km);
    const year = Number(workingCar.year);
    const currentYear = new Date().getFullYear();

    if (!resolvedTitle.trim()) {
      return "Pega una URL o escribe el título del vehículo.";
    }

    if (!workingCar.price || !Number.isFinite(price) || price <= 0) {
      return "URL recibida. Añade el precio para calcular ROI y beneficio real.";
    }

    if (!workingCar.km || !Number.isFinite(km) || km < 0) {
      return "URL recibida. Añade los kilómetros para completar el análisis.";
    }

    if (
      !workingCar.year ||
      !Number.isFinite(year) ||
      year < 1990 ||
      year > currentYear + 1
    ) {
      return "URL recibida. Añade el año para completar el análisis.";
    }

    return "";
  }, []);

  const validateAnalysisBeforeSave = useCallback(() => {
    if (!analysis) return "No hay análisis para guardar.";

    if (!semanticData?.brand) {
      return "Añade un título válido para identificar la marca antes de guardar.";
    }

    if (!semanticData?.model) {
      return "Añade un título válido para identificar el modelo antes de guardar.";
    }

    if (!Number.isFinite(Number(analysis.score))) {
      return "El score IA no es válido.";
    }

    if (!Number.isFinite(Number(analysis.roi))) {
      return "El ROI no es válido.";
    }

    if (!Number.isFinite(Number(analysis.estimatedProfit))) {
      return "El beneficio estimado no es válido.";
    }

    return "";
  }, [analysis, semanticData]);

  const hydrateCarFromListing = useCallback(async (currentCar) => {
    const urlSource = currentCar.url.trim();

    if (!urlSource) {
      return {
        car: currentCar,
        message: "",
      };
    }

    const needsAutomaticRead =
      !currentCar.title.trim() ||
      !currentCar.price ||
      !currentCar.km ||
      !currentCar.year;

    if (!needsAutomaticRead) {
      return {
        car: currentCar,
        message: "",
      };
    }

    setIsReadingListing(true);

    const listing = await readListingFromUrl(urlSource);

    setIsReadingListing(false);

    if (!listing.success) {
      return {
        car: currentCar,
        message: listing.blocked
          ? "mobile.de ha bloqueado la lectura automática. Añade precio, kilómetros y año manualmente."
          : "No se han podido leer datos automáticos. Añade precio, kilómetros y año manualmente.",
      };
    }

    const listingData = listing.data || {};

    const nextCar = {
      ...currentCar,
      title: currentCar.title || listingData.title || "",
      price: currentCar.price || listingData.price || "",
      km: currentCar.km || listingData.km || "",
      year: currentCar.year || listingData.year || "",
      country: currentCar.country || listingData.country || "Alemania",
      url: currentCar.url || listingData.url || "",
    };

    setCar(nextCar);

    return {
      car: nextCar,
      message: listing.warning || "Datos del anuncio leídos automáticamente.",
    };
  }, []);

  const analyzeManualCar = useCallback(async () => {
    setSaved(false);
    setAnalysis(null);

    const hydrated = await hydrateCarFromListing(car);
    const workingCar = hydrated.car;

    const urlSource = workingCar.url.trim();
    const titleSource = workingCar.title.trim();

    const parsedUrlData = urlSource
      ? parseMobileDeUrl(urlSource)
      : {};

    const parsedSemanticData = parseCarFromUrl(titleSource || urlSource);
    const parsedTitleData = parseBasicVehicleText(titleSource);

    const parsed = mergeParsedVehicleData({
      parsedSemanticData,
      parsedUrlData,
      parsedTitleData,
    });

    const resolvedTitle =
      titleSource ||
      parsed?.title?.trim() ||
      buildTitleFromUrlFallback(urlSource);

    const validationError = validateCarInput(workingCar, resolvedTitle);

    if (validationError) {
      setAnalysis(null);
      setSemanticData({
        ...parsed,
        title: resolvedTitle,
      });
      setMessage(hydrated.message || validationError);
      return;
    }

    const enrichedSemanticData = {
      ...parsed,
      title: resolvedTitle,
    };

    setSemanticData(enrichedSemanticData);

    const price = Number(workingCar.price);
    const km = Number(workingCar.km);
    const year = Number(workingCar.year);
    const estimatedMarketPrice = Math.round(price * 1.28);

    const result = analyzeCar({
      ...workingCar,
      ...enrichedSemanticData,
      title: resolvedTitle,
      price,
      km,
      year,
      estimatedMarketPrice,
    });

    if (
      !result ||
      !Number.isFinite(Number(result.score)) ||
      !Number.isFinite(Number(result.roi)) ||
      !Number.isFinite(Number(result.estimatedProfit))
    ) {
      setAnalysis(null);
      setMessage("El análisis ha generado datos inválidos. Revisa los datos del coche.");
      return;
    }

    setAnalysis(result);

    if (parsedUrlData?.needsManualTitle && !titleSource && !parsed.brand && !parsed.model) {
      setMessage("Esta URL no contiene marca/modelo. Añade el título del vehículo para mejorar el análisis.");
    } else {
      setMessage(hydrated.message || "");
    }
  }, [car, hydrateCarFromListing, validateCarInput]);

  const analyzeWithEnter = useCallback(
    (event) => {
      if (event.key !== "Enter") return;

      event.preventDefault();
      analyzeManualCar();
    },
    [analyzeManualCar]
  );

  const saveAnalysis = useCallback(async () => {
    if (saved || saving) return;

    const validationError = validateAnalysisBeforeSave();

    if (validationError) {
      setMessage(validationError);
      return;
    }

    setSaving(true);
    setMessage("");

    const finalTitle =
      semanticData?.title?.trim() ||
      car.title.trim() ||
      buildTitleFromUrlFallback(car.url);

    const { error } = await supabase.from("import_analyses").insert({
      title: finalTitle,
      brand: semanticData?.brand || null,
      model: semanticData?.model || null,
      fuel_type: semanticData?.fuelType || null,
      drivetrain: semanticData?.drivetrain || null,
      performance_package: semanticData?.performancePackage || null,
      country: car.country,
      profit: Math.round(analysis.estimatedProfit),
      roi: Number(analysis.roi),
      score: Number(analysis.score),
      url: car.url.trim() || null,
    });

    if (error) {
      console.error("Error saving analysis:", error);
      setMessage("Error al guardar el análisis. Inténtalo de nuevo.");
    } else {
      setSaved(true);
      setMessage("Análisis guardado en historial.");
    }

    setSaving(false);
  }, [
    analysis,
    car,
    saved,
    saving,
    semanticData,
    validateAnalysisBeforeSave,
  ]);

  function getAlertStyle(type) {
    if (type === "success") {
      return {
        background: "rgba(34,197,94,0.12)",
        border: "1px solid rgba(34,197,94,0.25)",
      };
    }

    if (type === "warning") {
      return {
        background: "rgba(250,204,21,0.12)",
        border: "1px solid rgba(250,204,21,0.25)",
      };
    }

    return {
      background: "rgba(239,68,68,0.12)",
      border: "1px solid rgba(239,68,68,0.25)",
    };
  }

  function PredictiveCard({ label, value, emoji }) {
    return (
      <div style={predictiveCardStyle}>
        <p style={predictiveLabelStyle}>{emoji} {label}</p>
        <h2 style={predictiveValueStyle}>{value}/100</h2>
      </div>
    );
  }

  const saveBlockedByIdentity = Boolean(
    analysis &&
    (!semanticData?.brand || !semanticData?.model)
  );

  const saveDisabled =
    saving ||
    saved ||
    saveBlockedByIdentity;

  const saveButtonText = saving
    ? "Guardando..."
    : saved
    ? "✅ Guardado"
    : saveBlockedByIdentity
    ? "⚠️ Añade marca y modelo"
    : "Guardar análisis";

  return (
    <div style={pageStyle}>
      <style>{responsiveCss}</style>

      <div style={containerStyle}>
        <div style={headerStyle}>
          <p style={badgeStyle}>Coches SaaS · IA Premium</p>
          <h1 style={titleStyle}>Analiza oportunidades</h1>
          <p style={subtitleStyle}>
            Score IA, semantic intelligence, predictive AI y smart alerts.
          </p>
        </div>

        <div style={gridStyle} className="importer-grid">
          <div style={cardStyle}>
            <input
              placeholder="URL del anuncio · pega URL y pulsa Enter"
              value={car.url}
              onChange={(e) => updateField("url", e.target.value)}
              onKeyDown={analyzeWithEnter}
              style={inputStyle}
            />

            <input
              placeholder="Título del vehículo (opcional si pegas URL)"
              value={car.title}
              onChange={(e) => updateField("title", e.target.value)}
              onKeyDown={analyzeWithEnter}
              style={inputStyle}
            />

            <input
              placeholder="Precio"
              value={car.price}
              onChange={(e) => updateField("price", e.target.value)}
              onKeyDown={analyzeWithEnter}
              style={inputStyle}
            />

            <input
              placeholder="Kilómetros"
              value={car.km}
              onChange={(e) => updateField("km", e.target.value)}
              onKeyDown={analyzeWithEnter}
              style={inputStyle}
            />

            <input
              placeholder="Año"
              value={car.year}
              onChange={(e) => updateField("year", e.target.value)}
              onKeyDown={analyzeWithEnter}
              style={inputStyle}
            />

            <button
              onClick={analyzeManualCar}
              disabled={isReadingListing}
              style={{
                ...buttonStyle,
                opacity: isReadingListing ? 0.65 : 1,
              }}
            >
              {isReadingListing ? "Leyendo anuncio..." : "Analizar vehículo"}
            </button>

            {message && <p style={messageStyle}>{message}</p>}
          </div>

          <div style={cardStyle}>
            {!analysis && (
              <div style={emptyStateStyle}>
                <p style={emptyIconStyle}>🚘</p>
                <p style={emptyTitleStyle}>Esperando análisis IA</p>
              </div>
            )}

            {analysis && (
              <>
                <div style={recommendationStyle}>{analysis.recommendation}</div>

                <div style={scoreCircleStyle} className="score-circle">
                  <span style={scoreNumberStyle}>{analysis.score}</span>
                  <span style={scoreTextStyle}>SCORE IA</span>
                </div>

                <div style={kpiGridStyle} className="kpi-grid">
                  <div style={kpiCardStyle}>
                    <p style={kpiLabelStyle}>ROI</p>
                    <p style={kpiValueStyle}>{analysis.roi}%</p>
                  </div>

                  <div style={kpiCardStyle}>
                    <p style={kpiLabelStyle}>Beneficio</p>
                    <p style={kpiValueStyle}>
                      {Math.round(analysis.estimatedProfit)} €
                    </p>
                  </div>
                </div>

                <div style={sectionStyle}>
                  <p style={sectionTitleStyle}>🔮 Predictive AI Engine</p>

                  <div style={predictiveGridStyle} className="predictive-grid">
                    <PredictiveCard label="Demand" value={analysis.demandScore} emoji="📈" />
                    <PredictiveCard label="Resale" value={analysis.resaleScore} emoji="💰" />
                    <PredictiveCard label="Liquidity" value={analysis.liquidityScore} emoji="⚡" />
                    <PredictiveCard label="Future" value={analysis.futurePotential} emoji="🚀" />
                  </div>
                </div>

                <div style={sectionStyle}>
                  <p style={sectionTitleStyle}>🧠 IA Insights</p>

                  {analysis.insights?.map((insight, index) => (
                    <div key={index} style={insightCardStyle}>
                      {insight.text}
                    </div>
                  ))}
                </div>

                <div style={sectionStyle}>
                  <p style={sectionTitleStyle}>🚨 Smart Alerts</p>

                  {analysis.alerts?.map((alert, index) => (
                    <div
                      key={index}
                      style={{
                        ...alertCardStyle,
                        ...getAlertStyle(alert.type),
                      }}
                    >
                      {alert.text}
                    </div>
                  ))}
                </div>

                <button
                  onClick={saveAnalysis}
                  disabled={saveDisabled}
                  style={{
                    ...buttonStyle,
                    background: saveDisabled
                      ? "linear-gradient(135deg,#475569,#334155)"
                      : buttonStyle.background,
                    opacity: saveDisabled ? 0.75 : 1,
                    cursor: saveDisabled ? "not-allowed" : "pointer",
                  }}
                >
                  {saveButtonText}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function mergeParsedVehicleData({
  parsedSemanticData = {},
  parsedUrlData = {},
  parsedTitleData = {},
}) {
  const brand = pickVehicleValue(
    parsedSemanticData?.brand,
    parsedTitleData?.brand,
    parsedUrlData?.brand
  );

  const model = pickVehicleValue(
    parsedSemanticData?.model,
    parsedTitleData?.model,
    parsedUrlData?.model
  );

  const title = pickVehicleValue(
    parsedSemanticData?.title,
    parsedTitleData?.title,
    parsedUrlData?.title
  );

  return {
    ...parsedUrlData,
    ...parsedSemanticData,
    ...parsedTitleData,
    brand,
    model,
    title,
    year: pickVehicleValue(
      parsedSemanticData?.year,
      parsedUrlData?.year,
      parsedTitleData?.year
    ),
    engine: pickVehicleValue(
      parsedSemanticData?.engine,
      parsedUrlData?.engine,
      parsedTitleData?.engine
    ),
    transmission: pickVehicleValue(
      parsedSemanticData?.transmission,
      parsedUrlData?.transmission,
      parsedTitleData?.transmission
    ),
    drivetrain: pickVehicleValue(
      parsedSemanticData?.drivetrain,
      parsedUrlData?.drivetrain,
      parsedTitleData?.drivetrain
    ),
    performancePackage: pickVehicleValue(
      parsedSemanticData?.performancePackage,
      parsedTitleData?.performancePackage,
      parsedUrlData?.performancePackage
    ),
    fuelType: pickVehicleValue(
      parsedSemanticData?.fuelType,
      parsedTitleData?.fuelType,
      parsedUrlData?.fuelType
    ),
    bodyType: pickVehicleValue(
      parsedSemanticData?.bodyType,
      parsedTitleData?.bodyType,
      parsedUrlData?.bodyType
    ),
    electrified: Boolean(
      parsedSemanticData?.electrified ||
      parsedTitleData?.electrified ||
      parsedUrlData?.electrified
    ),
    premiumConfig: pickVehicleValue(
      parsedSemanticData?.premiumConfig,
      parsedTitleData?.premiumConfig,
      parsedUrlData?.premiumConfig
    ),
    semantic: {
      ...(parsedUrlData?.semantic || {}),
      ...(parsedSemanticData?.semantic || {}),
      ...(parsedTitleData?.semantic || {}),
    },
  };
}

function pickVehicleValue(...values) {
  for (const value of values) {
    if (isUsefulVehicleValue(value)) {
      return value;
    }
  }

  return "";
}

function isUsefulVehicleValue(value) {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  return ![
    "unknown",
    "vehicle",
    "null",
    "undefined",
  ].includes(normalized);
}

function parseBasicVehicleText(text = "") {
  const normalized = normalizeText(text);
  const tokens = normalized.split(/\s+/).filter(Boolean);

  const brand = detectBasicBrand(tokens);
  const model = detectBasicModel(tokens);

  if (!brand && !model) {
    return {};
  }

  return {
    source: "manual-title",
    brand: brand || "",
    model,
    title: text,
    fuelType: detectBasicFuel(tokens),
    bodyType: detectBasicBody(tokens, model),
    performancePackage: detectBasicPerformance(tokens),
    semantic: {
      isHybrid: tokens.some((item) => ["hybrid", "phev", "plugin", "plug-in", "e-hybrid"].includes(item)),
      isElectric: tokens.some((item) => ["electric", "ev", "tesla", "electricidad"].includes(item)),
      isPerformance: tokens.some((item) => ["amg", "rs", "m3", "m4", "m5", "competition", "performance"].includes(item)),
      isSuv: tokens.some((item) => ["x5", "x7", "gle", "glc", "q7", "q8", "kodiaq", "rav4", "xc90"].includes(item)),
      isPremium: tokens.some((item) => ["amg", "rs", "m", "premium", "performance"].includes(item)),
    },
  };
}

function detectBasicBrand(tokens = []) {
  const brands = {
    skoda: "Skoda",
    škoda: "Skoda",
    bmw: "BMW",
    audi: "Audi",
    mercedes: "Mercedes-Benz",
    "mercedes-benz": "Mercedes-Benz",
    volkswagen: "Volkswagen",
    vw: "Volkswagen",
    toyota: "Toyota",
    seat: "Seat",
    cupra: "Cupra",
    tesla: "Tesla",
    porsche: "Porsche",
    volvo: "Volvo",
    kia: "Kia",
    hyundai: "Hyundai",
    renault: "Renault",
    peugeot: "Peugeot",
    ford: "Ford",
  };

  for (const token of tokens) {
    if (brands[token]) return brands[token];
  }

  return null;
}

function detectBasicModel(tokens = []) {
  const models = [
    "fabia",
    "octavia",
    "superb",
    "kodiaq",
    "karoq",
    "kamiq",
    "golf",
    "passat",
    "tiguan",
    "touareg",
    "formentor",
    "leon",
    "corolla",
    "yaris",
    "rav4",
    "x1",
    "x3",
    "x5",
    "x7",
    "m3",
    "m4",
    "m5",
    "a3",
    "a4",
    "a6",
    "q3",
    "q5",
    "q7",
    "q8",
    "rs4",
    "rs6",
    "glc",
    "gle",
    "gls",
    "g63",
    "taycan",
    "cayenne",
    "macan",
    "model",
  ];

  for (const model of models) {
    if (tokens.includes(model)) return capitalizeModel(model);
  }

  return null;
}

function detectBasicFuel(tokens = []) {
  if (tokens.some((item) => ["electric", "ev", "electricidad"].includes(item))) {
    return "Electric";
  }

  if (tokens.some((item) => ["hybrid", "phev", "plugin", "plug-in", "e-hybrid"].includes(item))) {
    return "Hybrid";
  }

  if (tokens.some((item) => ["diesel", "tdi", "cdi", "d"].includes(item))) {
    return "Diesel";
  }

  return "";
}

function detectBasicBody(tokens = [], model = "") {
  const text = `${tokens.join(" ")} ${normalizeText(model)}`;

  if (
    ["x1", "x3", "x5", "x7", "gle", "glc", "gls", "q5", "q7", "q8", "kodiaq", "karoq", "kamiq", "rav4", "xc90"].some((item) =>
      text.includes(item)
    )
  ) {
    return "SUV";
  }

  if (text.includes("avant") || text.includes("touring")) {
    return "wagon";
  }

  return null;
}

function detectBasicPerformance(tokens = []) {
  const performance = ["amg", "rs", "rs4", "rs6", "m3", "m4", "m5", "competition", "performance"];

  for (const item of performance) {
    if (tokens.includes(item)) return item.toUpperCase();
  }

  return null;
}

function normalizeText(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function capitalizeModel(value = "") {
  return String(value)
    .split(" ")
    .map((word) => {
      if (/^[a-z]\d$/i.test(word)) return word.toUpperCase();
      if (/^rs\d$/i.test(word)) return word.toUpperCase();
      if (/^m\d$/i.test(word)) return word.toUpperCase();

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function buildTitleFromUrlFallback(url) {
  if (!url || typeof url !== "string") return "";

  try {
    const decoded = decodeURIComponent(url)
      .replace(/^https?:\/\//i, "")
      .replace(/www\./i, "")
      .split("?")[0]
      .split("/")
      .filter(Boolean)
      .pop();

    if (!decoded) return "";

    return decoded
      .replace(/\.html$/i, "")
      .replace(/[-_+]+/g, " ")
      .replace(/\b\d{6,}\b/g, "")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return "";
  }
}

const responsiveCss = `
  @media (max-width: 900px) {
    .importer-grid {
      grid-template-columns: 1fr !important;
    }

    .score-circle {
      width: 150px !important;
      height: 150px !important;
    }
  }

  @media (max-width: 560px) {
    .kpi-grid,
    .predictive-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;

const pageStyle = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top left, #1e3a8a 0, #020617 40%, #020617 100%)",
  color: "white",
  padding: "48px",
  fontFamily: "Arial, sans-serif",
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
  background: "rgba(59,130,246,0.18)",
  color: "#93c5fd",
  padding: "8px 14px",
  borderRadius: "999px",
  fontWeight: "700",
  marginBottom: "18px",
};

const titleStyle = {
  fontSize: "clamp(36px, 6vw, 52px)",
  margin: 0,
};

const subtitleStyle = {
  color: "#cbd5e1",
  marginTop: "14px",
  lineHeight: "1.6",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "28px",
};

const cardStyle = {
  background: "rgba(15,23,42,0.82)",
  borderRadius: "28px",
  padding: "30px",
  border: "1px solid rgba(148,163,184,0.16)",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "16px",
  marginTop: "14px",
  borderRadius: "16px",
  border: "1px solid rgba(148,163,184,0.18)",
  background: "rgba(2,6,23,0.8)",
  color: "white",
  outline: "none",
};

const buttonStyle = {
  marginTop: "22px",
  width: "100%",
  padding: "16px",
  borderRadius: "16px",
  border: "none",
  background: "linear-gradient(135deg,#2563eb,#16a34a)",
  color: "white",
  fontWeight: "900",
  cursor: "pointer",
};

const messageStyle = {
  marginTop: "18px",
  color: "#93c5fd",
  fontWeight: "800",
  lineHeight: "1.5",
};

const emptyStateStyle = {
  minHeight: "520px",
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
  fontSize: "24px",
  fontWeight: "900",
};

const recommendationStyle = {
  display: "inline-block",
  padding: "12px 18px",
  borderRadius: "999px",
  background: "rgba(34,197,94,0.18)",
  color: "#86efac",
  fontWeight: "900",
  marginBottom: "24px",
};

const scoreCircleStyle = {
  width: "180px",
  height: "180px",
  borderRadius: "999px",
  background: "linear-gradient(135deg, rgba(37,99,235,0.35), rgba(34,197,94,0.22))",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 28px auto",
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
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
};

const kpiCardStyle = {
  background: "rgba(2,6,23,0.75)",
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
  gridTemplateColumns: "1fr 1fr",
  gap: "14px",
};

const predictiveCardStyle = {
  background: "rgba(2,6,23,0.75)",
  borderRadius: "18px",
  padding: "18px",
};

const predictiveLabelStyle = {
  color: "#94a3b8",
  margin: 0,
  fontWeight: "800",
};

const predictiveValueStyle = {
  margin: "10px 0 0 0",
  fontSize: "26px",
};

const insightCardStyle = {
  background: "rgba(2,6,23,0.65)",
  borderRadius: "16px",
  padding: "14px",
  marginTop: "10px",
  color: "#dbeafe",
  lineHeight: "1.5",
};

const alertCardStyle = {
  borderRadius: "16px",
  padding: "14px",
  marginTop: "10px",
  color: "#f8fafc",
  lineHeight: "1.5",
  fontWeight: "800",
};