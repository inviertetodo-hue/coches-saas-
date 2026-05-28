import { useMemo, useState } from "react";
import { buildMarketScan } from "../services/marketScanner";
import { generateMockMarketFeed } from "../services/mockMarketFeed";
import { buildSearchRecommendations } from "../services/searchRecommendationEngine";
import { buildMarketTrendProfile } from "../services/marketTrendEngine";
import { analyzeDealRisk } from "../services/dealRiskEngine";
import { buildLiquidityProfile } from "../services/liquidityEngine";
import { buildFinalDealDecision } from "../services/finalDecisionEngine";

export default function Scanner() {
  const [form, setForm] = useState({
    query: "BMW X5 45e",
    maxBudget: "60000",
    country: "Europa",
    useCase: "reventa",
  });

  const [searchTriggered, setSearchTriggered] = useState(false);

  const scan = useMemo(() => buildMarketScan(form), [form]);

  const trendProfile = useMemo(() => {
    return buildMarketTrendProfile({
      query: form.query,
      maxBudget: form.maxBudget,
      semantic: scan.semantic,
    });
  }, [form.query, form.maxBudget, scan.semantic]);

  const marketFeed = useMemo(() => {
    if (!searchTriggered) return null;

    const rawFeed = generateMockMarketFeed(scan);

    function enrichDeal(item) {
      const dealRisk = analyzeDealRisk(item);

      const liquidity = buildLiquidityProfile({
        query: item.title || form.query,
        item,
        semantic: scan.semantic,
      });

      const finalDecision = buildFinalDealDecision({
        ...item,
        dealRisk,
        liquidity,
      });

      return {
        ...item,
        dealRisk,
        liquidity,
        finalDecision,
      };
    }

    const opportunities = rawFeed.opportunities.map(enrichDeal);
    const best = rawFeed.best ? enrichDeal(rawFeed.best) : null;

    return {
      ...rawFeed,
      opportunities,
      best,
    };
  }, [form.query, scan, searchTriggered]);

  const searchRadar = useMemo(() => {
    if (!searchTriggered) return null;

    return buildSearchRecommendations({
      form,
      scan,
      marketFeed,
    });
  }, [form, scan, marketFeed, searchTriggered]);

  function updateField(field, value) {
    setSearchTriggered(false);

    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSearch() {
    setSearchTriggered(true);
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <p style={badgeStyle}>AI Automotive Opportunity Scanner</p>

          <h1 style={titleStyle}>Encuentra chollos reales en Europa</h1>

          <p style={subtitleStyle}>
            Escribe el vehículo que quieres comprar y pulsa buscar. El sistema
            prioriza oportunidades por margen neto, precio bajo mercado,
            liquidez, riesgo y probabilidad de venta rápida.
          </p>
        </div>

        <div style={gridStyle}>
          <div style={cardStyle}>
            <label style={labelStyle}>Vehículo objetivo</label>

            <input
              value={form.query}
              onChange={(event) => updateField("query", event.target.value)}
              placeholder="BMW X5 45e, Audi Q7..."
              style={inputStyle}
            />

            <label style={labelStyle}>Presupuesto máximo</label>

            <input
              value={form.maxBudget}
              onChange={(event) =>
                updateField("maxBudget", event.target.value)
              }
              placeholder="60000"
              style={inputStyle}
            />

            <label style={labelStyle}>Mercado</label>

            <select
              value={form.country}
              onChange={(event) => updateField("country", event.target.value)}
              style={inputStyle}
            >
              <option>Europa</option>
              <option>Alemania</option>
              <option>Holanda</option>
              <option>Bélgica</option>
              <option>Francia</option>
              <option>España</option>
            </select>

            <label style={labelStyle}>Objetivo</label>

            <select
              value={form.useCase}
              onChange={(event) => updateField("useCase", event.target.value)}
              style={inputStyle}
            >
              <option value="reventa">Reventa</option>
              <option value="quedarmelo">Quedármelo</option>
            </select>

            <button onClick={handleSearch} style={searchButtonStyle}>
              🔎 Buscar oportunidades IA
            </button>
          </div>

          <div style={cardStyle}>
            <p style={sectionLabelStyle}>Resumen IA</p>

            <h2 style={summaryStyle}>{scan.summary}</h2>

            <div style={semanticGridStyle}>
              <SemanticBadge active={scan.semantic?.isPremium} label="Premium" />
              <SemanticBadge active={scan.semantic?.isPhev} label="PHEV" />
              <SemanticBadge active={scan.semantic?.isSuv} label="SUV" />
              <SemanticBadge
                active={scan.semantic?.isPerformance}
                label="Performance"
              />
            </div>

            <div style={trendBoxStyle}>
              <p style={trendBadgeStyle}>📈 Tendencia de mercado</p>

              <h3 style={trendTitleStyle}>{trendProfile.mainTrend.label}</h3>

              <div style={trendMetricGridStyle}>
                <SmallMetric
                  label="Demanda"
                  value={trendProfile.mainTrend.demand}
                />

                <SmallMetric
                  label="Tendencia"
                  value={trendProfile.mainTrend.trend}
                />

                <SmallMetric
                  label="Riesgo"
                  value={trendProfile.mainTrend.risk}
                />
              </div>

              <p style={marketInsightStyle}>{trendProfile.summary}</p>
            </div>

            {!searchTriggered && (
              <div style={waitingBoxStyle}>
                Pulsa <strong>Buscar oportunidades IA</strong> para generar el
                ranking de posibles chollos.
              </div>
            )}

            {marketFeed?.best && (
              <div style={bestDealStyle}>
                <p style={bestDealLabelStyle}>
                  🏆 Mejor oportunidad detectada
                </p>

                <h3 style={bestDealTitleStyle}>{marketFeed.best.title}</h3>

                <div style={finalDecisionHeroStyle}>
                  {marketFeed.best.finalDecision.label}
                </div>

                <p style={bestDealDecisionStyle}>
                  {marketFeed.best.finalDecision.explanation}
                </p>

                <div style={bestDealGridStyle}>
                  <MetricCard
                    label="Score final"
                    value={`${marketFeed.best.finalDecision.finalScore}/100`}
                  />

                  <MetricCard
                    label="Margen neto"
                    value={`${marketFeed.best.netProfit.toLocaleString(
                      "es-ES"
                    )} €`}
                  />

                  <MetricCard
                    label="Liquidez"
                    value={`${marketFeed.best.liquidity.liquidityScore}/100`}
                  />

                  <MetricCard
                    label="Riesgo"
                    value={`${marketFeed.best.dealRisk.riskScore}/100`}
                  />
                </div>

                <div style={riskBoxStyle}>
                  <h4 style={miniTitleStyle}>🧭 Decisión consolidada</h4>

                  <p style={marketInsightStyle}>
                    {marketFeed.best.finalDecision.explanation}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {marketFeed && (
          <>
            <div style={sectionStyle}>
              <h2 style={sectionTitleStyle}>Feed IA de oportunidades</h2>

              <div style={feedGridStyle}>
                {marketFeed.opportunities.map((item) => (
              <div
  key={item.id}
  style={{
    ...feedCardStyle,
    border: `1px solid ${getDecisionColor(
      item.finalDecision.action
    )}`,
  }}
>
                    <div>
                      <p style={feedSourceStyle}>{item.source}</p>

                      <h3 style={feedTitleStyle}>{item.title}</h3>

                      <p style={feedPriceStyle}>
                        {item.price.toLocaleString("es-ES")} €
                      </p>

                      <p style={feedMetaStyle}>
                        {item.year} · {item.km.toLocaleString("es-ES")} km
                      </p>
                    </div>

                    <div style={finalDecisionStyle}>
                      {item.finalDecision.label}
                    </div>

                    <div style={feedMetricsStyle}>
                      <FeedMetric
                        label="Score final"
                        value={`${item.finalDecision.finalScore}/100`}
                      />

                      <FeedMetric label="ROI neto" value={`${item.netRoi}%`} />

                      <FeedMetric
                        label="Margen"
                        value={`${item.netProfit.toLocaleString("es-ES")} €`}
                      />
                    </div>

                    <div style={decisionStyle}>
                      {item.finalDecision.explanation}
                    </div>

                    <div style={liquidityBoxStyle}>
                      <h4 style={miniTitleStyle}>💧 Liquidez</h4>

                      <div style={marketGridStyle}>
                        <SmallMetric
                          label="Liquidez"
                          value={`${item.liquidity.liquidityScore}/100`}
                        />

                        <SmallMetric
                          label="Venta estimada"
                          value={`${item.liquidity.expectedDaysToSell} días`}
                        />

                        <SmallMetric
                          label="Demanda"
                          value={item.liquidity.demand}
                        />

                        <SmallMetric
                          label="Compradores"
                          value={item.liquidity.buyerPool}
                        />
                      </div>

                      <p style={marketInsightStyle}>
                        {item.liquidity.summary}
                      </p>
                    </div>

                    <div style={riskBoxStyle}>
                      <h4 style={miniTitleStyle}>🛡️ Riesgo de operación</h4>

                      <div style={marketGridStyle}>
                        <SmallMetric
                          label="Nivel"
                          value={item.dealRisk.level}
                        />

                        <SmallMetric
                          label="Risk score"
                          value={`${item.dealRisk.riskScore}/100`}
                        />
                      </div>

                      <p style={marketInsightStyle}>
                        {item.dealRisk.recommendation}
                      </p>
                    </div>

                    <div style={marketBoxStyle}>
                      <h4 style={miniTitleStyle}>📊 Comparables de mercado</h4>

                      <div style={marketGridStyle}>
                        <SmallMetric
                          label="Precio actual"
                          value={`${item.price.toLocaleString("es-ES")} €`}
                        />

                        <SmallMetric
                          label="Precio justo IA"
                          value={`${item.comparable.fairPrice.toLocaleString(
                            "es-ES"
                          )} €`}
                        />

                        <SmallMetric
                          label="Desviación"
                          value={`${item.comparable.deviationPercent}%`}
                        />

                        <SmallMetric
                          label="Confianza"
                          value={`${item.comparable.confidence}/100`}
                        />
                      </div>

                      <p style={marketInsightStyle}>
                        {item.comparable.insight}
                      </p>
                    </div>

                    <div style={memoryBoxStyle}>
                      <h4 style={miniTitleStyle}>🧠 Memoria de mercado</h4>

                      <div style={marketGridStyle}>
                        <SmallMetric
                          label="Venta estimada"
                          value={`${item.memory.resaleSpeed.days} días`}
                        />

                        <SmallMetric
                          label="Demanda"
                          value={item.memory.demandLevel}
                        />

                        <SmallMetric
                          label="Riesgo"
                          value={item.memory.riskLevel}
                        />

                        <SmallMetric
                          label="Precio máx."
                          value={`${item.memory.recommendedMaxBid.toLocaleString(
                            "es-ES"
                          )} €`}
                        />
                      </div>

                      <p style={marketInsightStyle}>
                        {item.memory.strategy.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={sectionStyle}>
              <h2 style={sectionTitleStyle}>Inteligencia IA</h2>

              <div style={insightGridStyle}>
                {marketFeed.insights.map((insight, index) => (
                  <div key={index} style={insightCardStyle}>
                    {insight}
                  </div>
                ))}
              </div>
            </div>

            {searchRadar && (
              <div style={radarSectionStyle}>
                <div style={radarHeaderStyle}>
                  <p style={radarBadgeStyle}>🧠 Radar IA de búsqueda</p>

                  <h2 style={radarTitleStyle}>
                    Qué líneas conviene atacar ahora
                  </h2>

                  <p style={radarSummaryStyle}>{searchRadar.summary}</p>
                </div>

                <div style={radarGridStyle}>
                  {searchRadar.recommendedSearches.map((item) => (
                    <div key={item.id} style={radarCardStyle}>
                      <div style={radarPriorityStyle}>{item.priority}/100</div>

                      <h3 style={radarVehicleStyle}>{item.label}</h3>

                      <div style={radarMetaGridStyle}>
                        <SmallMetric label="Liquidez" value={item.liquidity} />
                        <SmallMetric label="Riesgo" value={item.risk} />
                        <SmallMetric
                          label="Margen"
                          value={item.marginPotential}
                        />
                        <SmallMetric
                          label="Presupuesto"
                          value={item.budgetTarget}
                        />
                      </div>

                      <p style={radarCountriesStyle}>
                        🌍 {item.countriesTarget.join(" · ")}
                      </p>

                      <p style={marketInsightStyle}>{item.reason}</p>
                    </div>
                  ))}
                </div>

                <div style={avoidBoxStyle}>
                  <h3 style={avoidTitleStyle}>
                    ⚠️ Modelos y situaciones a evitar
                  </h3>

                  <div style={avoidGridStyle}>
                    {searchRadar.avoidSearches.map((item) => (
                      <div key={item.id} style={avoidCardStyle}>
                        <strong>{item.label}</strong>

                        <p style={avoidRiskStyle}>Riesgo: {item.risk}</p>

                        <p style={marketInsightStyle}>{item.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SemanticBadge({ active, label }) {
  return (
    <div
      style={{
        ...semanticBadgeStyle,
        opacity: active ? 1 : 0.45,
      }}
    >
      {active ? "✅" : "○"} {label}
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div style={metricCardStyle}>
      <p style={metricLabelStyle}>{label}</p>
      <h3 style={metricValueStyle}>{value}</h3>
    </div>
  );
}

function FeedMetric({ label, value }) {
  return (
    <div style={feedMetricStyle}>
      <p style={feedMetricLabelStyle}>{label}</p>
      <h4 style={feedMetricValueStyle}>{value}</h4>
    </div>
  );
}

function SmallMetric({ label, value }) {
  return (
    <div style={smallMetricStyle}>
      <p style={smallMetricLabelStyle}>{label}</p>
      <strong style={smallMetricValueStyle}>{value}</strong>
    </div>
  );
}function getDecisionColor(action) {
  switch (action) {
    case "CONTACTAR_PRIMERO":
      return "rgba(34,197,94,0.45)";

    case "VIGILAR":
      return "rgba(59,130,246,0.40)";

    case "EVITAR":
      return "rgba(245,158,11,0.40)";

    case "DESCARTAR":
      return "rgba(239,68,68,0.45)";

    default:
      return "rgba(148,163,184,0.18)";
  }
}

const pageStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, #1e3a8a 0, #020617 42%, #020617 100%)",
  color: "white",
  padding: "48px",
  fontFamily: "Arial, sans-serif",
};

const containerStyle = {
  maxWidth: "1400px",
  margin: "0 auto",
};

const headerStyle = {
  marginBottom: "36px",
};

const badgeStyle = {
  display: "inline-block",
  background: "rgba(34,197,94,0.12)",
  color: "#86efac",
  padding: "8px 14px",
  borderRadius: "999px",
  fontWeight: "900",
  marginBottom: "18px",
};

const titleStyle = {
  fontSize: "clamp(38px, 6vw, 62px)",
  margin: 0,
};

const subtitleStyle = {
  color: "#cbd5e1",
  marginTop: "16px",
  lineHeight: "1.7",
  maxWidth: "780px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "24px",
};

const cardStyle = {
  background: "rgba(15,23,42,0.82)",
  borderRadius: "28px",
  padding: "28px",
  border: "1px solid rgba(148,163,184,0.16)",
};

const labelStyle = {
  display: "block",
  marginTop: "16px",
  marginBottom: "8px",
  color: "#cbd5e1",
  fontWeight: "800",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "16px",
  borderRadius: "16px",
  border: "1px solid rgba(148,163,184,0.20)",
  background: "rgba(2,6,23,0.86)",
  color: "white",
  outline: "none",
  fontWeight: "700",
};

const searchButtonStyle = {
  width: "100%",
  marginTop: "24px",
  padding: "18px",
  borderRadius: "18px",
  border: "none",
  background: "linear-gradient(135deg,#2563eb,#16a34a)",
  color: "white",
  fontWeight: "900",
  fontSize: "16px",
  cursor: "pointer",
  boxShadow: "0 10px 30px rgba(37,99,235,0.35)",
};

const sectionLabelStyle = {
  color: "#93c5fd",
  fontWeight: "900",
};

const summaryStyle = {
  fontSize: "30px",
  lineHeight: "1.3",
};

const semanticGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  marginTop: "24px",
};

const semanticBadgeStyle = {
  padding: "14px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.05)",
  fontWeight: "900",
};

const waitingBoxStyle = {
  marginTop: "28px",
  padding: "18px",
  borderRadius: "18px",
  background: "rgba(59,130,246,0.10)",
  border: "1px solid rgba(59,130,246,0.22)",
  color: "#dbeafe",
  lineHeight: "1.55",
};

const bestDealStyle = {
  marginTop: "30px",
  padding: "24px",
  borderRadius: "24px",
  background:
    "linear-gradient(135deg, rgba(34,197,94,0.16), rgba(59,130,246,0.14))",
};

const bestDealLabelStyle = {
  color: "#86efac",
  fontWeight: "900",
};

const bestDealTitleStyle = {
  fontSize: "28px",
};

const bestDealDecisionStyle = {
  color: "#facc15",
  fontWeight: "900",
  lineHeight: "1.6",
};

const finalDecisionHeroStyle = {
  display: "inline-block",
  padding: "12px 18px",
  borderRadius: "999px",
  background: "rgba(250,204,21,0.14)",
  color: "#fde68a",
  fontWeight: "900",
  marginBottom: "14px",
};

const finalDecisionStyle = {
  marginTop: "18px",
  padding: "14px",
  borderRadius: "16px",
  background: "rgba(250,204,21,0.12)",
  color: "#fde68a",
  fontWeight: "900",
  textAlign: "center",
};

const bestDealGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
  gap: "14px",
  marginTop: "22px",
};

const metricCardStyle = {
  background: "rgba(2,6,23,0.55)",
  borderRadius: "18px",
  padding: "18px",
};

const metricLabelStyle = {
  color: "#cbd5e1",
};

const metricValueStyle = {
  fontSize: "26px",
};

const sectionStyle = {
  marginTop: "34px",
};

const sectionTitleStyle = {
  fontSize: "28px",
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
}

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

const feedMetricStyle = {
  background: "rgba(255,255,255,0.05)",
  borderRadius: "16px",
  padding: "14px",
};

const feedMetricLabelStyle = {
  color: "#cbd5e1",
  fontSize: "12px",
};

const feedMetricValueStyle = {
  fontSize: "20px",
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

const smallMetricStyle = {
  background: "rgba(2,6,23,0.45)",
  borderRadius: "14px",
  padding: "12px",
};

const smallMetricLabelStyle = {
  color: "#cbd5e1",
  fontSize: "12px",
  margin: 0,
};

const smallMetricValueStyle = {
  display: "block",
  marginTop: "8px",
  fontSize: "16px",
};

const marketInsightStyle = {
  marginBottom: 0,
  color: "#e5e7eb",
  lineHeight: "1.55",
  fontSize: "14px",
};

const insightGridStyle = {
  display: "grid",
  gap: "14px",
};

const insightCardStyle = {
  background: "rgba(255,255,255,0.05)",
  borderRadius: "18px",
  padding: "18px",
  fontWeight: "700",
};

const trendBoxStyle = {
  marginTop: "24px",
  padding: "20px",
  borderRadius: "22px",
  background: "rgba(14,165,233,0.10)",
  border: "1px solid rgba(14,165,233,0.20)",
};

const trendBadgeStyle = {
  color: "#7dd3fc",
  fontWeight: "900",
  marginTop: 0,
};

const trendTitleStyle = {
  fontSize: "22px",
  marginTop: 0,
};

const trendMetricGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
  gap: "10px",
  marginBottom: "16px",
};

const radarSectionStyle = {
  marginTop: "42px",
};

const radarHeaderStyle = {
  marginBottom: "22px",
};

const radarBadgeStyle = {
  color: "#86efac",
  fontWeight: "900",
};

const radarTitleStyle = {
  fontSize: "32px",
  marginBottom: "10px",
};

const radarSummaryStyle = {
  color: "#cbd5e1",
  lineHeight: "1.6",
  maxWidth: "920px",
};

const radarGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
  gap: "18px",
};

const radarCardStyle = {
  background: "rgba(15,23,42,0.82)",
  borderRadius: "24px",
  padding: "24px",
  border: "1px solid rgba(34,197,94,0.18)",
};

const radarPriorityStyle = {
  display: "inline-block",
  padding: "10px 16px",
  borderRadius: "999px",
  background: "rgba(34,197,94,0.14)",
  color: "#86efac",
  fontWeight: "900",
  marginBottom: "18px",
};

const radarVehicleStyle = {
  fontSize: "24px",
  marginTop: 0,
};

const radarMetaGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  marginTop: "18px",
  marginBottom: "18px",
};

const radarCountriesStyle = {
  color: "#93c5fd",
  fontWeight: "700",
};

const avoidBoxStyle = {
  marginTop: "28px",
  padding: "24px",
  borderRadius: "24px",
  background: "rgba(239,68,68,0.08)",
  border: "1px solid rgba(239,68,68,0.18)",
};

const avoidTitleStyle = {
  marginTop: 0,
  marginBottom: "18px",
};

const avoidGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
  gap: "16px",
};

const avoidCardStyle = {
  background: "rgba(2,6,23,0.45)",
  borderRadius: "18px",
  padding: "18px",
};

const avoidRiskStyle = {
  color: "#fca5a5",
  fontWeight: "800",
};