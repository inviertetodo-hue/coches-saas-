import { useMemo, useState } from "react";

import { buildBulkUrlPreview } from "../services/intelligence/bulkUrlPreviewEngine";

const DEFAULT_URL =
  "https://www.autoscout24.es/lst/audi/a3?sort=standard&desc=0&ustate=N%2CU&atype=C&cy=E&damaged_listing=exclude&source=homepage_search-mask";

export default function BulkImport() {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [preview, setPreview] = useState(null);

  const demoCandidates = useMemo(() => buildDemoCandidates(url), [url]);

  function handlePreview() {
    const result = buildBulkUrlPreview({
      url,
      source: detectSource(url),
      candidates: demoCandidates,
      limit: 20,
    });

    setPreview(result);
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <p style={eyebrowStyle}>FASE 9.5 · Bulk URL Preview</p>

        <h1 style={titleStyle}>🌍 Bulk Import Preview</h1>

        <p style={subtitleStyle}>
          Pega una URL grande de AutoScout24 o similar. Esta pantalla todavía no
          guarda nada: solo previsualiza candidatos, calcula calidad de datos y
          decide si podrían alimentar memoria histórica sin contaminar la base.
        </p>
      </div>

      <div style={panelStyle}>
        <label style={labelStyle}>URL de búsqueda</label>

        <textarea
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          rows={4}
          style={textareaStyle}
          placeholder="Pega aquí una URL de AutoScout24, mobile.de u otra fuente..."
        />

        <button type="button" onClick={handlePreview} style={buttonStyle}>
          Generar preview seguro
        </button>
      </div>

      {!preview && (
        <div style={emptyBoxStyle}>
          <strong>Sin preview todavía.</strong>
          <p>
            Esta fase sirve para validar la calidad antes de guardar nada en la
            memoria histórica.
          </p>
        </div>
      )}

      {preview && (
        <>
          <div style={gridStyle}>
            <MetricCard label="Previewed" value={preview.previewed} />
            <MetricCard
              label="Memory Eligible"
              value={preview.memoryEligibleCount}
            />
            <MetricCard label="Rejected" value={preview.rejectedCount} />
            <MetricCard
              label="Can Bulk Save"
              value={preview.canBulkSave ? "Sí" : "No"}
            />
          </div>

          <div style={gridStyle}>
            <MetricCard
              label="Trusted"
              value={preview.qualitySummary.trusted}
            />
            <MetricCard label="Good" value={preview.qualitySummary.good} />
            <MetricCard label="Review" value={preview.qualitySummary.review} />
            <MetricCard
              label="Reject"
              value={preview.qualitySummary.rejected}
            />
          </div>

          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>🧠 Insights de calidad</h2>

            {preview.insights.map((item, index) => (
              <div key={`${item}-${index}`} style={insightStyle}>
                {item}
              </div>
            ))}
          </div>

          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>🚗 Candidatos previsualizados</h2>

            {preview.items.map((item) => (
              <PreviewCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PreviewCard({ item }) {
  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>
        <div>
          <h3 style={cardTitleStyle}>{item.title}</h3>

          <p style={cardMetaStyle}>
            {item.brand || "Marca desconocida"} ·{" "}
            {item.model || "Modelo desconocido"} · {item.year || "Año sin dato"}
          </p>
        </div>

        <span style={qualityPillStyle}>
          {item.dataQualityLabel} · {item.dataQualityScore}/100
        </span>
      </div>

      <div style={miniGridStyle}>
        <MiniMetric label="Precio" value={`${item.price || 0} €`} />
        <MiniMetric label="Km" value={item.mileage || "-"} />
        <MiniMetric label="ROI" value={`${item.roi || 0}%`} />
        <MiniMetric label="Margen" value={`${item.profit || 0} €`} />
        <MiniMetric
          label="Memory"
          value={item.memoryEligible ? "Eligible" : "No"}
        />
        <MiniMetric
          label="Can Save"
          value={item.canSaveAnalysis ? "Sí" : "No"}
        />
      </div>

      <p style={summaryStyle}>{item.dataQualitySummary}</p>

      {item.dataQualityReasons?.length > 0 && (
        <div style={reasonsStyle}>
          {item.dataQualityReasons.slice(0, 3).map((reason, index) => (
            <p key={`${reason}-${index}`} style={reasonStyle}>
              ⚠️ {reason}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div style={metricCardStyle}>
      <p style={metricLabelStyle}>{label}</p>
      <strong style={metricValueStyle}>{value}</strong>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div style={miniMetricStyle}>
      <span style={miniMetricLabelStyle}>{label}</span>
      <strong style={miniMetricValueStyle}>{value}</strong>
    </div>
  );
}

function detectSource(url) {
  const normalized = String(url || "").toLowerCase();

  if (normalized.includes("autoscout24")) return "autoscout24";
  if (normalized.includes("mobile.de")) return "mobile";
  return "unknown";
}

function buildDemoCandidates(url) {
  const normalized = String(url || "").toLowerCase();

  if (normalized.includes("audi") && normalized.includes("a3")) {
    return [
      {
        id: "preview-audi-a3-1",
        sourceMode: "real-feed",
        sourceStatus: "ok",
        title: "Audi A3 Sportback 35 TFSI S tronic",
        brand: "Audi",
        model: "A3",
        year: 2023,
        price: 24890,
        mileage: 31500,
        roi: 8,
        profit: 2200,
        matchScore: 88,
        comparableConfidence: 91,
      },
      {
        id: "preview-audi-a3-2",
        sourceMode: "real-feed",
        sourceStatus: "ok",
        title: "Audi A3 40 TFSIe Advanced",
        brand: "Audi",
        model: "A3",
        year: 2022,
        price: 26900,
        mileage: 27821,
        roi: 6,
        profit: 1630,
        matchScore: 82,
        comparableConfidence: 88,
      },
      {
        id: "preview-audi-a3-3",
        sourceMode: "real-feed",
        sourceStatus: "ok",
        title: "Audi A3 30 TDI S tronic",
        brand: "Audi",
        model: "A3",
        year: 2021,
        price: 16950,
        mileage: 37212,
        roi: -7,
        profit: -1207,
        matchScore: 78,
        comparableConfidence: 84,
      },
      {
        id: "preview-audi-a3-4",
        sourceMode: "mock-fallback",
        sourceStatus: "ok",
        title: "Audi A3 Demo Candidate",
        brand: "Audi",
        model: "A3",
        year: 2025,
        price: 16995,
        mileage: 15000,
        roi: -2,
        profit: -351,
        matchScore: 70,
        comparableConfidence: 60,
      },
    ];
  }

  return [
    {
      id: "preview-generic-1",
      sourceMode: "real-feed",
      sourceStatus: "ok",
      title: "Candidato real de ejemplo",
      brand: "Audi",
      model: "A3",
      year: 2023,
      price: 24500,
      mileage: 42000,
      roi: 7,
      profit: 1800,
      matchScore: 82,
      comparableConfidence: 86,
    },
    {
      id: "preview-generic-2",
      sourceMode: "mock-fallback",
      sourceStatus: "ok",
      title: "Candidato fallback de ejemplo",
      brand: "",
      model: "",
      year: 0,
      price: 0,
      mileage: null,
      roi: 0,
      profit: 0,
      matchScore: 40,
      comparableConfidence: 30,
    },
  ];
}

const containerStyle = {
  padding: "32px",
  maxWidth: "1180px",
};

const headerStyle = {
  marginBottom: "24px",
};

const eyebrowStyle = {
  margin: "0 0 8px 0",
  color: "#38bdf8",
  fontWeight: "900",
  fontSize: "12px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const titleStyle = {
  margin: "0 0 10px 0",
  fontSize: "34px",
  fontWeight: "900",
};

const subtitleStyle = {
  color: "#cbd5e1",
  lineHeight: "1.6",
  maxWidth: "820px",
  margin: 0,
};

const panelStyle = {
  padding: "20px",
  borderRadius: "22px",
  background: "rgba(15,23,42,0.72)",
  border: "1px solid rgba(56,189,248,0.22)",
  marginBottom: "24px",
};

const labelStyle = {
  display: "block",
  fontWeight: "900",
  marginBottom: "10px",
};

const textareaStyle = {
  width: "100%",
  boxSizing: "border-box",
  borderRadius: "16px",
  border: "1px solid rgba(148,163,184,0.28)",
  background: "rgba(2,6,23,0.72)",
  color: "#f8fafc",
  padding: "14px",
  fontSize: "14px",
  resize: "vertical",
  outline: "none",
  marginBottom: "14px",
};

const buttonStyle = {
  border: 0,
  borderRadius: "999px",
  padding: "12px 18px",
  background: "linear-gradient(135deg,#0ea5e9,#22c55e)",
  color: "#ffffff",
  fontWeight: "900",
  cursor: "pointer",
};

const emptyBoxStyle = {
  padding: "18px",
  borderRadius: "18px",
  background: "rgba(15,23,42,0.56)",
  border: "1px solid rgba(148,163,184,0.18)",
  color: "#cbd5e1",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
  gap: "16px",
  marginBottom: "22px",
};

const metricCardStyle = {
  padding: "18px",
  borderRadius: "18px",
  background: "rgba(14,165,233,0.14)",
  border: "1px solid rgba(56,189,248,0.24)",
};

const metricLabelStyle = {
  margin: 0,
  color: "#bae6fd",
  fontSize: "12px",
  fontWeight: "900",
};

const metricValueStyle = {
  display: "block",
  marginTop: "8px",
  fontSize: "24px",
  color: "#ffffff",
};

const sectionStyle = {
  marginBottom: "26px",
};

const sectionTitleStyle = {
  fontSize: "18px",
  fontWeight: "900",
  marginBottom: "14px",
};

const insightStyle = {
  padding: "14px 16px",
  borderRadius: "16px",
  background: "rgba(34,197,94,0.12)",
  border: "1px solid rgba(34,197,94,0.22)",
  marginBottom: "10px",
  color: "#dcfce7",
  fontWeight: "800",
};

const cardStyle = {
  padding: "18px",
  borderRadius: "20px",
  background:
    "linear-gradient(135deg, rgba(14,165,233,0.14), rgba(34,197,94,0.10))",
  border: "1px solid rgba(56,189,248,0.22)",
  marginBottom: "14px",
};

const cardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "14px",
  flexWrap: "wrap",
  marginBottom: "14px",
};

const cardTitleStyle = {
  margin: 0,
  fontSize: "19px",
};

const cardMetaStyle = {
  margin: "6px 0 0 0",
  color: "#94a3b8",
};

const qualityPillStyle = {
  padding: "7px 11px",
  borderRadius: "999px",
  background: "rgba(34,197,94,0.16)",
  border: "1px solid rgba(34,197,94,0.25)",
  color: "#bbf7d0",
  fontSize: "12px",
  fontWeight: "900",
};

const miniGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
  gap: "10px",
};

const miniMetricStyle = {
  padding: "10px",
  borderRadius: "14px",
  background: "rgba(2,6,23,0.48)",
};

const miniMetricLabelStyle = {
  display: "block",
  color: "#94a3b8",
  fontSize: "11px",
  marginBottom: "5px",
};

const miniMetricValueStyle = {
  color: "#f8fafc",
  fontSize: "14px",
};

const summaryStyle = {
  color: "#e0f2fe",
  margin: "12px 0 0 0",
  lineHeight: "1.45",
  fontSize: "13px",
};

const reasonsStyle = {
  marginTop: "10px",
};

const reasonStyle = {
  color: "#fde68a",
  margin: "6px 0 0 0",
  fontSize: "12px",
};