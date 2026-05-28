import { useMemo, useState } from "react";

import ScannerHeader from "../components/scanner/ScannerHeader";
import SemanticBadge from "../components/scanner/SemanticBadge";
import SmallMetric from "../components/scanner/SmallMetric";
import FeedMetric from "../components/scanner/FeedMetric";
import BestDealCard from "../components/scanner/BestDealCard";
import DealDecisionPill, {
  getDecisionColor,
} from "../components/scanner/DealDecisionPill";
import ScannerForm from "../components/ScannerForm";

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

    const opportunities = rawFeed.opportunities
      .map(enrichDeal)
      .sort(
        (a, b) => b.finalDecision.finalScore - a.finalDecision.finalScore
      );

    const best = opportunities[0] || null;

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
        <ScannerHeader />

        <div style={gridStyle}>
          <ScannerForm
            form={form}
            updateField={updateField}
            handleSearch={handleSearch}
          />

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

            <BestDealCard best={marketFeed?.best} />
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

                    <DealDecisionPill
                      action={item.finalDecision.action}
                      label={item.finalDecision.label}
                    />

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
  transition: "0.25s ease",
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