import { useMemo, useState } from "react";
import { buildMarketScan } from "../services/marketScanner";
import { generateMockMarketFeed } from "../services/mockMarketFeed";
import { buildSearchRecommendations } from "../services/searchRecommendationEngine";
import { buildMarketTrendProfile } from "../services/marketTrendEngine";
import { analyzeDealRisk } from "../services/dealRiskEngine";
import { buildLiquidityProfile } from "../services/liquidityEngine";
import { buildFinalDealDecision } from "../services/finalDecisionEngine";
import { getDecisionTheme } from "../services/decisionBadgeTheme";
import BestOpportunityCard from "../components/scanner/BestOpportunityCard";
import TrendSummaryCard from "../components/scanner/TrendSummaryCard";
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

    const enrichOpportunity = (item) => {
      const liquidity = buildLiquidityProfile({
        query: item.title,
        item,
        semantic: scan.semantic,
      });

      const dealRisk = analyzeDealRisk(item);

      const finalDecision = buildFinalDealDecision({
        ...item,
        liquidity,
        dealRisk,
      });

      return {
        ...item,
        liquidity,
        dealRisk,
        finalDecision,
      };
    };

    const opportunities = rawFeed.opportunities.map(enrichOpportunity);
    const best = rawFeed.best ? enrichOpportunity(rawFeed.best) : null;

    return {
      ...rawFeed,
      opportunities,
      best,
    };
  }, [scan, searchTriggered]);

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
              onChange={(event) => updateField("maxBudget", event.target.value)}
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

            <TrendSummaryCard
  trendProfile={trendProfile}
  SmallMetric={SmallMetric}
  marketInsightStyle={marketInsightStyle}
/>

            {!searchTriggered && (
              <div style={waitingBoxStyle}>
                Pulsa <strong>Buscar oportunidades IA</strong> para generar el
                ranking de posibles chollos.
              </div>
            )}

            {marketFeed?.best && (
              <BestOpportunityCard best={marketFeed.best} />
            )}
          </div>
        </div>

        {marketFeed && (
          <>
            <div style={sectionStyle}>
              <h2 style={sectionTitleStyle}>Feed IA de oportunidades</h2>

              <div style={feedGridStyle}>
                {marketFeed.opportunities.map((item) => (
                  <div key={item.id} style={feedCardStyle}>
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

                    <div style={feedMetricsStyle}>
                      <FeedMetric
                        label="Final"
                        value={`${item.finalDecision.finalScore}/100`}
                      />

                      <FeedMetric label="ROI neto" value={`${item.netRoi}%`} />

                      <FeedMetric
                        label="Liquidez"
                        value={`${item.liquidity.liquidityScore}/100`}
                      />

                      <FeedMetric
                        label="Riesgo"
                        value={`${item.dealRisk.riskScore}/100`}
                      />
                    </div>

                    <div
                      style={{
                        ...decisionStyle,
                        ...getDecisionTheme(item.finalDecision.label),
                      }}
                    >
                      {item.finalDecision.label}
                    </div>

                    <p style={marketInsightStyle}>
                      {item.finalDecision.explanation}
                    </p>

                    <div style={liquidityBoxStyle}>
                      <h4 style={miniTitleStyle}>💧 Liquidez estimada</h4>

                      <div style={marketGridStyle}>
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

                        <SmallMetric
                          label="Riesgo"
                          value={item.liquidity.risk}
                        />
                      </div>

                      <p style={marketInsightStyle}>{item.liquidity.summary}</p>
                    </div>

                    <div style={riskBoxStyle}>
                      <h4 style={miniTitleStyle}>🛡️ Riesgo de operación</h4>

                      <div style={marketGridStyle}>
                        <SmallMetric
                          label="Nivel"
                          value={item.dealRisk.level}
                        />

                        <SmallMetric
                          label="Alertas"
                          value={item.dealRisk.alerts.length}
                        />
                      </div>

                      <p style={marketInsightStyle}>
                        {item.dealRisk.recommendation}
                      </p>

                      {item.dealRisk.alerts.length > 0 && (
                        <div style={riskAlertGridStyle}>
                          {item.dealRisk.alerts.slice(0, 3).map((alert) => (
                            <div key={alert.id} style={riskAlertStyle}>
                              <strong>{alert.label}</strong>

                              <p style={riskSeverityStyle}>
                                Severidad: {alert.severity}
                              </p>

                              <p style={marketInsightStyle}>{alert.reason}</p>
                            </div>
                          ))}
                        </div>
                      )}
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

            <div style={trendSectionStyle}>
              <div style={trendHeaderStyle}>
                <p style={trendBadgeStyle}>📈 Motor de tendencias</p>

                <h2 style={trendSectionTitleStyle}>
                  Lectura estratégica del mercado
                </h2>

                <p style={radarSummaryStyle}>{trendProfile.summary}</p>
              </div>

              <div style={trendGridStyle}>
                {[trendProfile.mainTrend, ...trendProfile.trends]
                  .filter(
                    (item, index, array) =>
                      array.findIndex((trend) => trend.label === item.label) ===
                      index
                  )
                  .map((trend) => (
                    <div key={trend.label} style={trendCardStyle}>
                      <h3 style={trendCardTitleStyle}>{trend.label}</h3>

                      <div style={trendMetricGridStyle}>
                        <SmallMetric label="Demanda" value={trend.demand} />
                        <SmallMetric label="Tendencia" value={trend.trend} />
                        <SmallMetric label="Riesgo" value={trend.risk} />
                      </div>

                      <p style={marketInsightStyle}>{trend.insight}</p>
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
  border: "1px solid rgba(148,163,184,0.16)",
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
  gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))",
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
  background: "rgba(14,165,233,0.10)",
  border: "1px solid rgba(14,165,233,0.22)",
};

const riskBoxStyle = {
  marginTop: "18px",
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(245,158,11,0.10)",
  border: "1px solid rgba(245,158,11,0.22)",
};

const riskAlertGridStyle = {
  display: "grid",
  gap: "10px",
  marginTop: "14px",
};

const riskAlertStyle = {
  background: "rgba(2,6,23,0.45)",
  borderRadius: "14px",
  padding: "14px",
};

const riskSeverityStyle = {
  color: "#fbbf24",
  fontWeight: "800",
  marginBottom: "8px",
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

const trendSectionStyle = {
  marginTop: "42px",
};

const trendHeaderStyle = {
  marginBottom: "22px",
};

const trendSectionTitleStyle = {
  fontSize: "32px",
  marginBottom: "10px",
};

const trendGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
  gap: "18px",
};

const trendCardStyle = {
  background: "rgba(15,23,42,0.82)",
  borderRadius: "24px",
  padding: "24px",
  border: "1px solid rgba(14,165,233,0.20)",
};

const trendCardTitleStyle = {
  fontSize: "22px",
  marginTop: 0,
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