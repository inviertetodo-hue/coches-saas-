import { useMemo, useState } from "react";

import BulkImportApprovedCard from "../components/bulk-import/BulkImportApprovedCard";
import BulkImportMemorySimulationPanel from "../components/bulk-import/BulkImportMemorySimulationPanel";
import BulkImportPreviewCard from "../components/bulk-import/BulkImportPreviewCard";
import BulkImportProtectedSavePanel from "../components/bulk-import/BulkImportProtectedSavePanel";

import { buildApprovedBulkImport } from "../services/intelligence/approvedBulkImportEngine";
import { buildDemoCandidates } from "../services/intelligence/bulkDemoCandidates";
import { buildBulkUrlPreview } from "../services/intelligence/bulkUrlPreviewEngine";
import { buildMemorySimulation } from "../services/intelligence/memorySimulationEngine";
import { buildProtectedMemorySave } from "../services/intelligence/protectedMemorySaveEngine";
import { createMemoryRepository } from "../services/intelligence/memoryRepository";

const DEFAULT_URL =
  "https://www.autoscout24.es/lst/audi/a3?sort=standard&desc=0&ustate=N%2CU&atype=C&cy=E&damaged_listing=exclude&source=homepage_search-mask";

export default function BulkImport() {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [preview, setPreview] = useState(null);
  const [approvedImport, setApprovedImport] = useState(null);
  const [memorySimulation, setMemorySimulation] = useState(null);
  const [savePlan, setSavePlan] = useState(null);
  const [saveResult, setSaveResult] = useState(null);

  const memoryRepository = useMemo(() => createMemoryRepository(), []);
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
    setMemorySimulation(null);
    setSavePlan(null);
    setSaveResult(null);
  }

  function handlePrepareApproved() {
    if (!preview) return;

    const result = buildApprovedBulkImport({
      preview,
      maxItems: 50,
    });

    setApprovedImport(result);
    setMemorySimulation(null);
    setSavePlan(null);
    setSaveResult(null);
  }

  function handleSimulateMemory() {
    if (!approvedImport) return;

    const result = buildMemorySimulation({
      approvedImport,
      maxRecords: 50,
    });

    setMemorySimulation(result);
    setSavePlan(null);
    setSaveResult(null);
  }

  function handlePrepareProtectedSave() {
    if (!approvedImport || !memorySimulation) return;

    const result = buildProtectedMemorySave({
      approvedImport,
      simulation: memorySimulation,
      minQuality: 70,
    });

    setSavePlan(result);
    setSaveResult(null);
  }

  function handleSaveToLocalMemory() {
    if (!savePlan?.canSave) return;

    const result = memoryRepository.saveMany(savePlan.acceptedRecords);

    setSaveResult({
      ...result,
      repositoryTotal: memoryRepository.count(),
    });
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <p style={eyebrowStyle}>FASE 10.1.5 · Local Memory Insert</p>

        <h1 style={titleStyle}>🌍 Bulk Import Preview</h1>

        <p style={subtitleStyle}>
          Pega una URL grande de AutoScout24 o similar. Esta pantalla todavía no
          guarda nada en Supabase: previsualiza, aprueba, simula memoria,
          prepara un guardado protegido y guarda en memoria local de sesión.
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

          <button
            type="button"
            onClick={handleSimulateMemory}
            disabled={!approvedImport}
            style={{
              ...blueButtonStyle,
              opacity: approvedImport ? 1 : 0.5,
              cursor: approvedImport ? "pointer" : "not-allowed",
            }}
          >
            Simular memoria
          </button>

          <button
            type="button"
            onClick={handlePrepareProtectedSave}
            disabled={!memorySimulation}
            style={{
              ...protectedButtonStyle,
              opacity: memorySimulation ? 1 : 0.5,
              cursor: memorySimulation ? "pointer" : "not-allowed",
            }}
          >
            Preparar guardado protegido
          </button>

          <button
            type="button"
            onClick={handleSaveToLocalMemory}
            disabled={!savePlan?.canSave}
            style={{
              ...localSaveButtonStyle,
              opacity: savePlan?.canSave ? 1 : 0.5,
              cursor: savePlan?.canSave ? "pointer" : "not-allowed",
            }}
          >
            Guardar en memoria local
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
                <BulkImportApprovedCard key={item.id} item={item} />
              ))}
            </div>
          )}

          <BulkImportMemorySimulationPanel simulation={memorySimulation} />

          <BulkImportProtectedSavePanel savePlan={savePlan} />

          {saveResult && (
            <div style={saveResultPanelStyle}>
              <h2 style={sectionTitleStyle}>💾 Memoria local actualizada</h2>

              <div style={gridStyle}>
                <MetricCard label="Insertados" value={saveResult.inserted} />
                <MetricCard
                  label="Total memoria"
                  value={saveResult.repositoryTotal}
                />
              </div>

              <p style={saveResultTextStyle}>
                Se han guardado {saveResult.inserted} registros en memoria local
                de sesión. Todavía no se ha escrito nada en Supabase.
              </p>
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

function MetricCard({ label, value }) {
  return (
    <div style={metricCardStyle}>
      <p style={metricLabelStyle}>{label}</p>
      <strong style={metricValueStyle}>{value}</strong>
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

const blueButtonStyle = {
  border: "1px solid rgba(96,165,250,0.35)",
  borderRadius: "999px",
  padding: "12px 18px",
  background: "rgba(59,130,246,0.18)",
  color: "#bfdbfe",
  fontWeight: "900",
};

const protectedButtonStyle = {
  border: "1px solid rgba(34,197,94,0.4)",
  borderRadius: "999px",
  padding: "12px 18px",
  background: "rgba(34,197,94,0.18)",
  color: "#bbf7d0",
  fontWeight: "900",
};

const localSaveButtonStyle = {
  border: "1px solid rgba(250,204,21,0.42)",
  borderRadius: "999px",
  padding: "12px 18px",
  background: "rgba(250,204,21,0.16)",
  color: "#fef9c3",
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

const saveResultPanelStyle = {
  padding: "20px",
  borderRadius: "22px",
  background: "rgba(250,204,21,0.12)",
  border: "1px solid rgba(250,204,21,0.25)",
  marginBottom: "28px",
};

const saveResultTextStyle = {
  color: "#fef9c3",
  fontWeight: "800",
  lineHeight: "1.5",
};

const emptyTextStyle = {
  color: "#94a3b8",
};