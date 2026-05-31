import { useMemo, useState } from "react";

import BulkImportPreviewCard from "../components/bulk-import/BulkImportPreviewCard";

import { buildApprovedBulkImport } from "../services/intelligence/approvedBulkImportEngine";
import { buildDemoCandidates } from "../services/intelligence/bulkDemoCandidates";
import { buildBulkUrlPreview } from "../services/intelligence/bulkUrlPreviewEngine";

const DEFAULT_URL =
  "https://www.autoscout24.es/lst/audi/a3?sort=standard&desc=0&ustate=N%2CU&atype=C&cy=E&damaged_listing=exclude&source=homepage_search-mask";

export default function BulkImport() {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [preview, setPreview] = useState(null);
  const [approvedImport, setApprovedImport] = useState(null);

  const demoCandidates = useMemo(() => buildDemoCandidates(url), [url]);

  function handlePreview() {
    const result = buildBulkUrlPreview({
      url,
      source: detectSource(url),
      candidates: demoCandidates,
      limit: 20,
    });

    setPreview(result);
    setApprovedImport(null);
  }

  function handlePrepareApproved() {
    if (!preview) return;

    const result = buildApprovedBulkImport({
      preview,
      maxItems: 50,
    });

    setApprovedImport(result);
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <p style={eyebrowStyle}>FASE 9.7.3 · Preview Card Connected</p>

        <h1 style={titleStyle}>🌍 Bulk Import Preview</h1>

        <p style={subtitleStyle}>
          Pega una URL grande de AutoScout24 o similar. Esta pantalla todavía no
          guarda nada: primero previsualiza candidatos, después prepara solo los
          aprobados para memoria histórica.
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

        <div style={buttonRowStyle}>
          <button type="button" onClick={handlePreview} style={buttonStyle}>
            Generar preview seguro
          </button>

          <button
            type="button"
            onClick={handlePrepareApproved}
            disabled={!preview}
            style={{
              ...secondaryButtonStyle,
              opacity: preview ? 1 : 0.5,
              cursor: preview ? "pointer" : "not-allowed",
            }}
          >
            Preparar aprobados
          </button>
        </div>
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

          {approvedImport && (
            <div style={approvedPanelStyle}>
              <h2 style={sectionTitleStyle}>✅ Importación aprobada</h2>

              <div style={gridStyle}>
                <MetricCard
                  label="Total Previewed"
                  value={approvedImport.totalPreviewed}
                />
                <MetricCard
                  label="Approved"
                  value={approvedImport.totalApproved}
                />
                <MetricCard
                  label="Rejected"
                  value={approvedImport.totalRejected}
                />
                <MetricCard
                  label="Can Save"
                  value={approvedImport.canSave ? "Sí" : "No"}
                />
              </div>

              <p style={approvedSummaryStyle}>{approvedImport.summary}</p>

              {approvedImport.insights.map((item, index) => (
                <div key={`${item}-${index}`} style={approvedInsightStyle}>
                  {item}
                </div>
              ))}

              <h3 style={subsectionTitleStyle}>Aprobados para memoria</h3>

              {approvedImport.approvedItems.length === 0 && (
                <p style={emptyTextStyle}>
                  No hay candidatos aprobados para memoria histórica.
                </p>
              )}

              {approvedImport.approvedItems.map((item) => (
                <ApprovedCard key={item.id} item={item} />
              ))}
            </div>
          )}

          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>🚗 Candidatos previsualizados</h2>

            {preview.items.map((item) => (
              <BulkImportPreviewCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ApprovedCard({ item }) {
  return (
    <div style={approvedCardStyle}>
      <div style={cardHeaderStyle}>
        <div>
          <h3 style={cardTitleStyle}>{item.title}</h3>

          <p style={cardMetaStyle}>
            {item.brand || "Marca desconocida"} ·{" "}
            {item.model || "Modelo desconocido"} · {item.year || "Año sin dato"}
          </p>
        </div>

        <span style={approvedPillStyle}>
          {item.dataQualityLabel} · {item.dataQualityScore}/100
        </span>
      </div>

      <div style={miniGridStyle}>
        <MiniMetric label="Precio" value={`${item.price || 0} €`} />
        <MiniMetric label="Km" value={item.mileage || "-"} />
        <MiniMetric label="ROI" value={`${item.roi || 0}%`} />
        <MiniMetric label="Margen" value={`${item.profit || 0} €`} />
        <MiniMetric label="Estado" value={item.importStatus} />
        <MiniMetric label="Memoria" value="Aprobado" />
      </div>

      <p style={approvedTextStyle}>
        Este candidato puede pasar a memoria histórica porque supera el filtro
        de calidad. Si tiene ROI negativo, se guarda como dato fiable de mercado,
        no como oportunidad de compra.
      </p>
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

const buttonRowStyle = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
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

const secondaryButtonStyle = {
  border: "1px solid rgba(56,189,248,0.35)",
  borderRadius: "999px",
  padding: "12px 18px",
  background: "rgba(14,165,233,0.14)",
  color: "#bae6fd",
  fontWeight: "900",
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

const subsectionTitleStyle = {
  fontSize: "15px",
  fontWeight: "900",
  margin: "18px 0 12px 0",
  color: "#dcfce7",
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

const approvedPanelStyle = {
  padding: "20px",
  borderRadius: "22px",
  background: "rgba(22,101,52,0.18)",
  border: "1px solid rgba(34,197,94,0.25)",
  marginBottom: "28px",
};

const approvedSummaryStyle = {
  color: "#dcfce7",
  fontWeight: "800",
  lineHeight: "1.5",
};

const approvedInsightStyle = {
  padding: "12px 14px",
  borderRadius: "14px",
  background: "rgba(34,197,94,0.12)",
  border: "1px solid rgba(34,197,94,0.22)",
  marginBottom: "10px",
  color: "#bbf7d0",
};

const approvedCardStyle = {
  padding: "18px",
  borderRadius: "20px",
  background:
    "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(14,165,233,0.10))",
  border: "1px solid rgba(34,197,94,0.28)",
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

const approvedPillStyle = {
  padding: "7px 11px",
  borderRadius: "999px",
  background: "rgba(34,197,94,0.22)",
  border: "1px solid rgba(34,197,94,0.32)",
  color: "#dcfce7",
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

const approvedTextStyle = {
  color: "#dcfce7",
  margin: "12px 0 0 0",
  lineHeight: "1.45",
  fontSize: "13px",
};

const emptyTextStyle = {
  color: "#94a3b8",
};