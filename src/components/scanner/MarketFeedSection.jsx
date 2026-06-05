import SmallMetric from "./SmallMetric";
import FeedMetric from "./FeedMetric";
import DealDecisionPill, { getDecisionColor } from "./DealDecisionPill";

export default function MarketFeedSection({ marketFeed }) {
  if (!marketFeed) return null;

  const diagnostics = getDiagnosticsList(marketFeed.realFeedDiagnostics);
  const opportunities = Array.isArray(marketFeed.opportunities)
    ? marketFeed.opportunities
    : [];

  return (
    <div style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Feed IA de oportunidades</h2>

      <SourceDiagnosticsPanel diagnostics={diagnostics} />

      {opportunities.length === 0 && (
        <div style={emptyFeedStyle}>
          No hay oportunidades reales compatibles ahora mismo. Revisa el diagnóstico
          por fuente para ver si el problema está en el fetch, el parser o los filtros.
        </div>
      )}

      <div style={feedGridStyle}>
        {opportunities.map((item, index) => (
          <div
            key={item.id}
            style={{
              ...feedCardStyle,
              border: `1px solid ${getDecisionColor(
                item.finalDecision?.action
              )}`,
            }}
          >
            {index === 0 && (
              <div style={topOpportunityStyle}>🏆 TOP OPPORTUNITY</div>
            )}

            <div>
              <p style={feedSourceStyle}>{item.source}</p>

              <h3 style={feedTitleStyle}>{item.title}</h3>

              <p style={feedPriceStyle}>
                {Number(item.price || 0).toLocaleString("es-ES")} €
              </p>

              <p style={feedMetaStyle}>
                {item.year} · {Number(item.km || item.mileage || 0).toLocaleString(
                  "es-ES"
                )}{" "}
                km
              </p>
            </div>

            <DealDecisionPill
              action={item.finalDecision?.action}
              label={item.finalDecision?.label}
            />

            <div style={opportunityBoxStyle}>
              <div style={opportunityHeaderStyle}>🎯 Opportunity Engine</div>

              <div style={marketGridStyle}>
                <SmallMetric
                  label="Opportunity Score"
                  value={`${item.opportunityScore || 0}/100`}
                />

                <SmallMetric
                  label="Opportunity Level"
                  value={item.opportunityLevel || "NONE"}
                />
              </div>
            </div>

            <div style={feedMetricsStyle}>
              <FeedMetric
                label="Score final"
                value={`${item.finalDecision?.finalScore || 0}/100`}
              />

              <FeedMetric label="ROI neto" value={`${item.netRoi || 0}%`} />

              <FeedMetric
                label="Margen"
                value={`${Number(item.netProfit || 0).toLocaleString("es-ES")} €`}
              />
            </div>

            <div style={decisionStyle}>{item.finalDecision?.explanation}</div>

            <div style={liquidityBoxStyle}>
              <h4 style={miniTitleStyle}>💧 Liquidez</h4>

              <div style={marketGridStyle}>
                <SmallMetric
                  label="Liquidez"
                  value={`${item.liquidity?.liquidityScore || 0}/100`}
                />

                <SmallMetric
                  label="Venta estimada"
                  value={`${item.liquidity?.expectedDaysToSell || 0} días`}
                />

                <SmallMetric label="Demanda" value={item.liquidity?.demand || "-"} />

                <SmallMetric
                  label="Compradores"
                  value={item.liquidity?.buyerPool || "-"}
                />
              </div>

              <p style={marketInsightStyle}>{item.liquidity?.summary}</p>
            </div>

            <div style={riskBoxStyle}>
              <h4 style={miniTitleStyle}>🛡️ Riesgo de operación</h4>

              <div style={marketGridStyle}>
                <SmallMetric label="Nivel" value={item.dealRisk?.level || "-"} />

                <SmallMetric
                  label="Risk score"
                  value={`${item.dealRisk?.riskScore || 0}/100`}
                />
              </div>

              <p style={marketInsightStyle}>{item.dealRisk?.recommendation}</p>
            </div>

            <div style={marketBoxStyle}>
              <h4 style={miniTitleStyle}>📊 Comparables de mercado</h4>

              <div style={marketGridStyle}>
                <SmallMetric
                  label="Precio actual"
                  value={`${Number(item.price || 0).toLocaleString("es-ES")} €`}
                />

                <SmallMetric
                  label="Precio justo IA"
                  value={`${Number(item.comparable?.fairPrice || 0).toLocaleString(
                    "es-ES"
                  )} €`}
                />

                <SmallMetric
                  label="Desviación"
                  value={`${item.comparable?.deviationPercent || 0}%`}
                />

                <SmallMetric
                  label="Confianza"
                  value={`${item.comparable?.confidence || 0}/100`}
                />
              </div>

              <p style={marketInsightStyle}>{item.comparable?.insight}</p>
            </div>

            <div style={memoryBoxStyle}>
              <h4 style={miniTitleStyle}>🧠 Memoria de mercado</h4>

              <div style={marketGridStyle}>
                <SmallMetric
                  label="Venta estimada"
                  value={`${item.memory?.resaleSpeed?.days || 0} días`}
                />

                <SmallMetric
                  label="Demanda"
                  value={item.memory?.demandLevel || "-"}
                />

                <SmallMetric label="Riesgo" value={item.memory?.riskLevel || "-"} />

                <SmallMetric
                  label="Precio máx."
                  value={`${Number(
                    item.memory?.recommendedMaxBid || 0
                  ).toLocaleString("es-ES")} €`}
                />
              </div>

              <p style={marketInsightStyle}>{item.memory?.strategy?.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SourceDiagnosticsPanel({ diagnostics }) {
  if (!diagnostics.length) return null;

  return (
    <div style={diagnosticsPanelStyle}>
      <h3 style={diagnosticsTitleStyle}>🧪 Diagnóstico del feed real</h3>

      <div style={diagnosticsGridStyle}>
        {diagnostics.map((item, index) => {
          const rejectionLog = item.rejectionLog || {};
          const statusLabel = getStatusLabel(item.status);

          return (
            <div key={`${item.source}-${item.country}-${index}`} style={diagnosticCardStyle}>
              <div style={diagnosticHeaderStyle}>
                <strong>{item.source || "Fuente"}</strong>
                <span style={diagnosticStatusStyle}>{statusLabel}</span>
              </div>

              <p style={diagnosticCountryStyle}>{item.country || "-"}</p>

              <div style={diagnosticMetricGridStyle}>
                <DiagnosticMetric label="Chars" value={item.textLength || 0} />
                <DiagnosticMetric label="Parsed" value={item.parsedCount || 0} />
                <DiagnosticMetric label="Bloques" value={rejectionLog.totalBlocks || 0} />
                <DiagnosticMetric label="Aceptados" value={rejectionLog.accepted || 0} />
                <DiagnosticMetric label="Sin datos" value={rejectionLog.noData || 0} />
                <DiagnosticMetric
                  label="Incompatibles"
                  value={rejectionLog.incompatible || 0}
                />
              </div>

              <p style={diagnosticMessageStyle}>{item.message || "Sin mensaje."}</p>

              {buildRadarHealthRecommendation(item.rejectionSummary) && (
                <div style={healthRecommendationStyle}>
                  <strong style={{ color: "#bbf7d0" }}>
                    💡 Recomendación IA
                  </strong>

                  <p style={healthRecommendationTextStyle}>
                    {buildRadarHealthRecommendation(item.rejectionSummary)}
                  </p>
                </div>
              )}

              {item.rejectionSummary &&
                Object.keys(item.rejectionSummary).length > 0 && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "10px",
                      borderRadius: "12px",
                      background: "rgba(59,130,246,0.10)",
                      border: "1px solid rgba(59,130,246,0.20)",
                    }}
                  >
                    <strong style={{ color: "#93c5fd" }}>
                      📊 Radar Health
                    </strong>

                    {Object.entries(item.rejectionSummary)
                      .sort((a, b) => b[1] - a[1])
                      .map(([reason, count]) => (
                        <div
                          key={reason}
                          style={{
                            marginTop: "6px",
                            color: "#bfdbfe",
                            fontFamily: "monospace",
                            fontSize: "12px",
                          }}
                        >
                          {reason}: {count}
                        </div>
                      ))}
                  </div>
                )}

              {Array.isArray(rejectionLog.incompatibleReasons) &&
                rejectionLog.incompatibleReasons.length > 0 && (
                  <details style={rejectionDetailsStyle}>
                    <summary style={rejectionSummaryStyle}>
                      Ver motivos individuales ({rejectionLog.incompatibleReasons.length})
                    </summary>

                    {rejectionLog.incompatibleReasons.map((reason, idx) => (
                      <div
                        key={`${reason}-${idx}`}
                        style={{
                          marginTop: "6px",
                          color: "#fecaca",
                          fontFamily: "monospace",
                          fontSize: "12px",
                        }}
                      >
                        ↳ {reason}
                      </div>
                    ))}
                  </details>
                )}

              {item.textSample && (
                <details style={sampleDetailsStyle}>
                  <summary style={sampleSummaryStyle}>Ver muestra Jina</summary>
                  <pre style={sampleTextStyle}>{item.textSample}</pre>
                </details>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DiagnosticMetric({ label, value }) {
  return (
    <div style={diagnosticMetricStyle}>
      <span style={diagnosticMetricLabelStyle}>{label}</span>
      <strong style={diagnosticMetricValueStyle}>{value}</strong>
    </div>
  );
}

function buildRadarHealthRecommendation(rejectionSummary) {
  if (!rejectionSummary || typeof rejectionSummary !== "object") {
    return "";
  }

  const [mainReason, count] =
    Object.entries(rejectionSummary).sort((a, b) => b[1] - a[1])[0] || [];

  if (!mainReason || !count) return "";

  if (mainReason === "modelo_incompatible") {
    return `El filtro de modelo está bloqueando ${count} anuncios. Revisa compatibilidad y catálogo antes de tocar ranking.`;
  }

  if (mainReason === "modelo_no_confirmado") {
    return `Hay ${count} anuncios donde el modelo no queda confirmado. El feed puede estar trayendo resultados útiles con títulos incompletos.`;
  }

  if (mainReason === "precio_sobre_presupuesto") {
    return `El presupuesto está bloqueando ${count} anuncios. Puede convenir mostrar descartados caros o relajar el rango.`;
  }

  if (mainReason === "km_alto") {
    return `El kilometraje está bloqueando ${count} anuncios. Revisa si el límite de km es demasiado estricto para este mercado.`;
  }

  if (mainReason === "fuel_no_phev") {
    return `El filtro PHEV está bloqueando ${count} anuncios. Revisa detección de combustible antes de descartar oportunidades.`;
  }

  if (mainReason === "score_bajo") {
    return `El Radar encuentra mercado, pero ${count} anuncios no alcanzan score suficiente. Revisa scoring y filtros de compatibilidad.`;
  }

  return `Motivo dominante: ${mainReason} (${count}). Prioriza revisar ese filtro antes de añadir más motores.`;
}

function getDiagnosticsList(realFeedDiagnostics) {
  if (Array.isArray(realFeedDiagnostics)) {
    return realFeedDiagnostics;
  }

  if (!realFeedDiagnostics || typeof realFeedDiagnostics !== "object") {
    return [];
  }

  return Object.values(realFeedDiagnostics).filter(
    (item) =>
      item &&
      typeof item === "object" &&
      ("source" in item || "status" in item || "parsedCount" in item)
  );
}

function getStatusLabel(status) {
  if (status === "success") return "OK";
  if (status === "error") return "Error";
  if (status === "no-results") return "Sin anuncios";
  return status || "Sin dato";
}

const sectionStyle = {
  marginTop: "34px",
};

const sectionTitleStyle = {
  fontSize: "28px",
};

const diagnosticsPanelStyle = {
  marginBottom: "24px",
  padding: "20px",
  borderRadius: "24px",
  background: "rgba(15,23,42,0.82)",
  border: "1px solid rgba(56,189,248,0.22)",
};

const diagnosticsTitleStyle = {
  marginTop: 0,
  marginBottom: "16px",
  fontSize: "20px",
};

const diagnosticsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
  gap: "14px",
};

const diagnosticCardStyle = {
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(2,6,23,0.52)",
  border: "1px solid rgba(148,163,184,0.18)",
};

const diagnosticHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "center",
};

const diagnosticStatusStyle = {
  padding: "6px 10px",
  borderRadius: "999px",
  background: "rgba(14,165,233,0.16)",
  color: "#7dd3fc",
  fontSize: "12px",
  fontWeight: "900",
};

const diagnosticCountryStyle = {
  color: "#cbd5e1",
  fontWeight: "800",
  margin: "8px 0 12px",
};

const diagnosticMetricGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
  gap: "8px",
};

const diagnosticMetricStyle = {
  padding: "10px",
  borderRadius: "12px",
  background: "rgba(15,23,42,0.78)",
};

const diagnosticMetricLabelStyle = {
  display: "block",
  color: "#94a3b8",
  fontSize: "11px",
  fontWeight: "800",
};

const healthRecommendationStyle = {
  marginTop: "12px",
  padding: "10px",
  borderRadius: "12px",
  background: "rgba(34,197,94,0.10)",
  border: "1px solid rgba(34,197,94,0.20)",
};

const healthRecommendationTextStyle = {
  margin: "8px 0 0",
  color: "#dcfce7",
  fontSize: "13px",
  lineHeight: 1.5,
};

const rejectionDetailsStyle = {
  marginTop: "12px",
  padding: "10px",
  borderRadius: "12px",
  background: "rgba(239,68,68,0.10)",
  border: "1px solid rgba(239,68,68,0.20)",
};

const rejectionSummaryStyle = {
  color: "#fecaca",
  cursor: "pointer",
  fontWeight: "900",
};

const diagnosticMetricValueStyle = {
  display: "block",
  marginTop: "4px",
  color: "white",
};

const diagnosticMessageStyle = {
  color: "#e0f2fe",
  fontSize: "13px",
  lineHeight: "1.45",
  marginBottom: 0,
};

const sampleDetailsStyle = {
  marginTop: "12px",
};

const sampleSummaryStyle = {
  cursor: "pointer",
  color: "#93c5fd",
  fontWeight: "900",
  fontSize: "13px",
};

const sampleTextStyle = {
  marginTop: "10px",
  maxHeight: "220px",
  overflow: "auto",
  whiteSpace: "pre-wrap",
  fontSize: "11px",
  lineHeight: "1.45",
  color: "#cbd5e1",
  background: "rgba(0,0,0,0.28)",
  padding: "12px",
  borderRadius: "12px",
};

const emptyFeedStyle = {
  marginBottom: "20px",
  padding: "16px 18px",
  borderRadius: "18px",
  background: "rgba(245,158,11,0.12)",
  border: "1px solid rgba(245,158,11,0.24)",
  color: "#fde68a",
  fontWeight: "850",
  lineHeight: "1.5",
};

const feedGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
  gap: "18px",
};

const feedCardStyle = {
  background: "rgba(15,23,42,0.82)",
  borderRadius: "24px",
  padding: "24px",
  transition: "0.25s ease",
};

const topOpportunityStyle = {
  marginBottom: "14px",
  padding: "10px",
  borderRadius: "12px",
  textAlign: "center",
  fontWeight: "900",
  background: "rgba(250,204,21,0.20)",
  color: "#fde68a",
};

const opportunityBoxStyle = {
  marginTop: "16px",
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(168,85,247,0.10)",
  border: "1px solid rgba(168,85,247,0.22)",
};

const opportunityHeaderStyle = {
  marginBottom: "12px",
  fontWeight: "900",
};

const feedSourceStyle = {
  color: "#86efac",
  fontWeight: "900",
};

const feedTitleStyle = {
  fontSize: "22px",
};

const feedPriceStyle = {
  fontSize: "34px",
  fontWeight: "900",
};

const feedMetaStyle = {
  color: "#cbd5e1",
};

const feedMetricsStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "12px",
  marginTop: "20px",
};

const decisionStyle = {
  marginTop: "20px",
  padding: "14px",
  borderRadius: "16px",
  background: "rgba(34,197,94,0.12)",
  color: "#86efac",
  fontWeight: "900",
  textAlign: "center",
};

const marketBoxStyle = {
  marginTop: "20px",
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(59,130,246,0.10)",
  border: "1px solid rgba(59,130,246,0.20)",
};

const memoryBoxStyle = {
  marginTop: "16px",
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(34,197,94,0.09)",
  border: "1px solid rgba(34,197,94,0.18)",
};

const liquidityBoxStyle = {
  marginTop: "18px",
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(20,184,166,0.10)",
  border: "1px solid rgba(20,184,166,0.22)",
};

const riskBoxStyle = {
  marginTop: "18px",
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(245,158,11,0.10)",
  border: "1px solid rgba(245,158,11,0.22)",
};

const miniTitleStyle = {
  marginTop: 0,
  marginBottom: "14px",
  fontSize: "15px",
};

const marketGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
};

const marketInsightStyle = {
  marginBottom: 0,
  color: "#e5e7eb",
  lineHeight: "1.55",
  fontSize: "14px",
};