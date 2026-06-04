import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

import { analyzeMarketIntelligence } from "../services/profitAnalyzer";
import { analyzeMarketTrends } from "../services/marketTrends";
import { analyzeTemporalIntelligence } from "../services/temporalIntelligence";
import { analyzeOpportunityAlerts } from "../services/opportunityAlerts";
import { analyzePortfolioStrategy } from "../services/portfolioStrategy";
import { analyzeRiskManagement } from "../services/riskManagement";
import { analyzeAIConfidence } from "../services/aiConfidence";
import { analyzeAILearning } from "../services/aiLearning";

import { generateExecutiveSummary } from "../services/executiveSummary";
import { generateAdvancedMetrics } from "../services/advancedMetrics";
import { generateOpportunityRadar } from "../services/opportunityRadar";
import { generateOpportunityRanking } from "../services/opportunityRanking";
import { generateWatchlist } from "../services/watchlistEngine";
import { generateDealPipeline } from "../services/dealPipeline";
import { generateDealDecisions } from "../services/dealDecisionEngine";
import { simulatePortfolio } from "../services/portfolioSimulator";

import { validateAnalysesDataset } from "../services/validationRules";
import { sanitizeAnalysesDataset } from "../services/analysisSanitizer";
import { evaluateAnalysisHealth } from "../services/analysisHealthGate";
import { filterValidAnalyses } from "../services/analysisGuard";

import { buildMarketMemory } from "../services/market/marketMemory";
import { buildIntelligenceEngine } from "../services/intelligence/intelligenceEngine";
import { calculateHistoricalConfidence } from "../services/intelligence/historicalConfidence";
import { buildOpportunityChampion } from "../services/intelligence/opportunityChampionEngine";
import { buildMarketLearning } from "../services/intelligence/marketLearningEngine";
import { applyLearningDecisionBonus } from "../services/intelligence/learningDecisionBonusEngine";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import SystemHealthBanner from "../components/dashboard/SystemHealthBanner";
import InstantDecisionPanel from "../components/dashboard/InstantDecisionPanel";
import GlobalStatsPanel from "../components/dashboard/GlobalStatsPanel";
import ExecutiveSummaryPanel from "../components/dashboard/ExecutiveSummaryPanel";
import MarketMemoryPanel from "../components/dashboard/MarketMemoryPanel";
import MarketIntelligencePanel from "../components/dashboard/MarketIntelligencePanel";
import HistoryControls from "../components/dashboard/HistoryControls";
import AnalysisGrid from "../components/dashboard/AnalysisGrid";

const AdvancedIntelligencePanel = lazy(() =>
  import("../components/dashboard/AdvancedIntelligencePanel")
);

const DataQualityPanel = lazy(() =>
  import("../components/dashboard/DataQualityPanel")
);

const AdvancedMetricsPanel = lazy(() =>
  import("../components/dashboard/AdvancedMetricsPanel")
);

const OpportunityRadarPanel = lazy(() =>
  import("../components/dashboard/OpportunityRadarPanel")
);

const OpportunityRankingPanel = lazy(() =>
  import("../components/dashboard/OpportunityRankingPanel")
);

const WatchlistPanel = lazy(() =>
  import("../components/dashboard/WatchlistPanel")
);

const DealPipelinePanel = lazy(() =>
  import("../components/dashboard/DealPipelinePanel")
);

const DealDecisionPanel = lazy(() =>
  import("../components/dashboard/DealDecisionPanel")
);

const PortfolioSimulatorPanel = lazy(() =>
  import("../components/dashboard/PortfolioSimulatorPanel")
);

const AIInsightsPanel = lazy(() =>
  import("../components/dashboard/AIInsightsPanel")
);

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [filter, setFilter] = useState("TODOS");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingHistory, setIsDeletingHistory] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    loadAnalyses();
  }, []);

  async function loadAnalyses() {
    setIsLoading(true);
    setLoadError("");

    const { data, error } = await supabase
      .from("import_analyses")
      .select("*")
      .order("score", { ascending: false });

    if (error) {
      console.error("Error loading analyses:", error);

      setAnalyses([]);

      setLoadError(
        "No se han podido cargar los análisis. Revisa la conexión con Supabase o inténtalo de nuevo."
      );

      setIsLoading(false);
      return;
    }

    const sanitized = sanitizeAnalysesDataset(data || []);
    const valid = filterValidAnalyses(sanitized);

    setAnalyses(valid);
    setIsLoading(false);
  }

  async function deleteAnalysis(id) {
    const { error } = await supabase
      .from("import_analyses")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting analysis:", error);
      setLoadError("No se ha podido borrar el análisis. Inténtalo de nuevo.");
      return;
    }

    loadAnalyses();
  }

  async function deleteAllHistory() {
    if (isDeletingHistory) return;

    const confirmed = window.confirm(
      "¿Seguro que quieres eliminar TODO el historial? Esta acción no se puede deshacer."
    );

    if (!confirmed) return;

    setIsDeletingHistory(true);
    setLoadError("");

    const { error } = await supabase
      .from("import_analyses")
      .delete()
      .not("id", "is", null);

    if (error) {
      console.error("Error deleting all history:", error);
      setLoadError("No se ha podido eliminar el historial completo. Inténtalo de nuevo.");
      setIsDeletingHistory(false);
      return;
    }

    setSearch("");
    setFilter("TODOS");
    setSortBy("score");
    setAnalyses([]);

    await loadAnalyses();

    setIsDeletingHistory(false);
  }

  const cleanAnalyses = useMemo(() => {
    const sanitized = sanitizeAnalysesDataset(analyses);
    return filterValidAnalyses(sanitized);
  }, [analyses]);

  const marketMemory = useMemo(() => {
    return buildMarketMemory(cleanAnalyses);
  }, [cleanAnalyses]);

  const marketIntelligence = useMemo(() => {
    return buildIntelligenceEngine(cleanAnalyses);
  }, [cleanAnalyses]);

  const intelligence = useMemo(() => {
    const market = analyzeMarketIntelligence(cleanAnalyses);
    const trends = analyzeMarketTrends(cleanAnalyses);
    const temporal = analyzeTemporalIntelligence(cleanAnalyses);
    const opportunityAlerts = analyzeOpportunityAlerts(cleanAnalyses);
    const portfolio = analyzePortfolioStrategy(cleanAnalyses);
    const risk = analyzeRiskManagement(cleanAnalyses);
    const confidence = analyzeAIConfidence(cleanAnalyses);
    const learning = analyzeAILearning(cleanAnalyses);

    const validation = validateAnalysesDataset(cleanAnalyses);
    const systemHealth = evaluateAnalysisHealth(validation);

    const advancedMetrics = generateAdvancedMetrics(cleanAnalyses);
    const radar = generateOpportunityRadar(cleanAnalyses);
    const ranking = generateOpportunityRanking(cleanAnalyses);
    const watchlist = generateWatchlist(cleanAnalyses);
    const pipeline = generateDealPipeline(cleanAnalyses);
    const marketLearning = buildMarketLearning(cleanAnalyses);
    const baseDecisions = generateDealDecisions(cleanAnalyses);

    const decisions = {
      ...baseDecisions,
      decisions: baseDecisions.decisions.map((decision) => {
        const historicalConfidence = calculateHistoricalConfidence(
          decision,
          marketIntelligence
        );

        const decisionWithHistoricalConfidence = {
          ...decision,
          historicalConfidence,
          historicalConfidenceLevel: historicalConfidence.confidenceLevel,
          historicalConfidenceReason: historicalConfidence.confidenceReason,
          historicalConfidenceBonus: historicalConfidence.confidenceBonus,
        };

        return applyLearningDecisionBonus(
          decisionWithHistoricalConfidence,
          marketLearning
        );
      }),
    };

    const opportunityChampion = buildOpportunityChampion(decisions);

    const enhancedDecisions = {
      ...decisions,
      opportunityChampion,
    };

    const simulation = simulatePortfolio(cleanAnalyses);

    const executive = generateExecutiveSummary({
      market,
      trends,
      temporal,
      opportunityAlerts,
      portfolio,
      risk,
      confidence,
      learning,
    });

    return {
      market,
      trends,
      temporal,
      opportunityAlerts,
      portfolio,
      risk,
      confidence,
      learning,
      validation,
      systemHealth,
      advancedMetrics,
      radar,
      ranking,
      watchlist,
      pipeline,
      marketLearning,
      decisions: enhancedDecisions,
      opportunityChampion,
      simulation,
      executive,
    };
  }, [cleanAnalyses, marketIntelligence]);

  const {
    market,
    trends,
    temporal,
    opportunityAlerts,
    portfolio,
    risk,
    confidence,
    learning,
    validation,
    systemHealth,
    advancedMetrics,
    radar,
    ranking,
    watchlist,
    pipeline,
    decisions,
    opportunityChampion,
    simulation,
    executive,
  } = intelligence;

  const normalizedSearch = useMemo(() => {
    return search.trim().toLowerCase();
  }, [search]);

  const filteredAnalyses = useMemo(() => {
    let result = [...cleanAnalyses];

    if (normalizedSearch) {
      result = result.filter((item) => {
        const text = `
          ${item.title || ""}
          ${item.brand || ""}
          ${item.model || ""}
          ${item.drivetrain || ""}
          ${item.fuel_type || ""}
          ${item.performance_package || ""}
        `.toLowerCase();

        return text.includes(normalizedSearch);
      });
    }

    if (filter === "CHOLLO IA") {
      result = result.filter((item) => item.score >= 85);
    }

    if (filter === "ANALIZAR") {
      result = result.filter((item) => item.score >= 60 && item.score < 85);
    }

    if (filter === "DESCARTAR") {
      result = result.filter((item) => item.score < 60);
    }

    result.sort((a, b) => {
      if (sortBy === "score") return b.score - a.score;
      if (sortBy === "roi") return b.roi - a.roi;
      if (sortBy === "profit") return b.profit - a.profit;

      return 0;
    });

    return result;
  }, [cleanAnalyses, filter, normalizedSearch, sortBy]);

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <DashboardHeader />

        {isLoading && (
          <div style={statusBoxStyle}>Cargando análisis guardados...</div>
        )}

        {loadError && (
          <div style={errorBoxStyle}>
            <strong>Error controlado:</strong> {loadError}
            <button style={retryButtonStyle} onClick={loadAnalyses}>
              Reintentar
            </button>
          </div>
        )}

        {!isLoading && !loadError && cleanAnalyses.length === 0 && (
          <div style={statusBoxStyle}>
            Todavía no hay análisis válidos guardados. Cuando analices coches,
            aparecerán aquí.
          </div>
        )}

        {!isLoading && (
          <>
            <SystemHealthBanner health={systemHealth} />

            <InstantDecisionPanel
              decisions={decisions}
              opportunityChampion={opportunityChampion}
            />

            <OpportunityActionCenter watchlist={watchlist} />

            <GlobalStatsPanel
              market={market}
              risk={risk}
              confidence={confidence}
              learning={learning}
              portfolio={portfolio}
              trends={trends}
              opportunityAlerts={opportunityAlerts}
              temporal={temporal}
            />

            <ExecutiveSummaryPanel executive={executive} />

            <MarketMemoryPanel memory={marketMemory} />

            <MarketIntelligencePanel intelligence={marketIntelligence} />

            {systemHealth.canShowAdvanced && (
              <Suspense
                fallback={
                  <div style={loadingAdvancedStyle}>
                    Cargando Advanced Intelligence...
                  </div>
                }
              >
                <AdvancedIntelligencePanel>
                  <DataQualityPanel validation={validation} />

                  <AdvancedMetricsPanel metrics={advancedMetrics} />

                  <OpportunityRadarPanel radar={radar} />

                  <OpportunityRankingPanel ranking={ranking} />

                  <WatchlistPanel watchlist={watchlist} />

                  <DealPipelinePanel pipeline={pipeline} />

                  <DealDecisionPanel decisions={decisions} />

                  <PortfolioSimulatorPanel simulation={simulation} />

                  <AIInsightsPanel
                    learning={learning}
                    confidence={confidence}
                    risk={risk}
                    portfolio={portfolio}
                    market={market}
                    trends={trends}
                    temporal={temporal}
                  />
                </AdvancedIntelligencePanel>
              </Suspense>
            )}

            <HistoryControls
              search={search}
              setSearch={setSearch}
              sortBy={sortBy}
              setSortBy={setSortBy}
              filter={filter}
              setFilter={setFilter}
              onDeleteAllHistory={deleteAllHistory}
              isDeletingHistory={isDeletingHistory}
            />

            <AnalysisGrid
              analyses={filteredAnalyses}
              onDelete={deleteAnalysis}
            />
          </>
        )}
      </div>
    </div>
  );
}

function OpportunityActionCenter({ watchlist }) {
  const items = Array.isArray(watchlist?.items) ? watchlist.items : [];
  const actionItems = items
    .filter((item) =>
      ["Actuar ahora", "Validar hoy"].includes(item.watchStatus)
    )
    .slice(0, 3);

  if (items.length === 0) {
    return null;
  }

  return (
    <section style={actionCenterStyle}>
      <div style={actionCenterHeaderStyle}>
        <div>
          <p style={actionEyebrowStyle}>Centro de acción</p>
          <h2 style={actionTitleStyle}>Oportunidades que revisar hoy</h2>
          <p style={actionSubtitleStyle}>
            El sistema prioriza los coches que merecen atención inmediata según
            oportunidad, confianza, margen, ROI y señales de seguimiento.
          </p>
        </div>

        <div style={actionScoreBoxStyle}>
          <span style={actionScoreLabelStyle}>Radar</span>
          <strong style={actionScoreValueStyle}>
            {watchlist?.watchlistScore || 0}/100
          </strong>
          <span style={actionScoreLevelStyle}>
            {watchlist?.watchlistLevel || "Sin datos"}
          </span>
        </div>
      </div>

      {watchlist?.summary && (
        <div style={actionSummaryStyle}>{watchlist.summary}</div>
      )}

      {actionItems.length === 0 ? (
        <div style={actionEmptyStyle}>
          No hay oportunidades urgentes ahora mismo. Mantén la watchlist activa
          y revisa nuevos cambios de precio o señales BUY.
        </div>
      ) : (
        <div style={actionGridStyle}>
          {actionItems.map((item, index) => (
            <ActionOpportunityCard
              key={item.id || item.sourceId || `${item.title}-${index}`}
              item={item}
              index={index}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ActionOpportunityCard({ item, index }) {
  return (
    <article style={actionCardStyle}>
      <div style={actionCardTopStyle}>
        <span style={actionRankStyle}>#{index + 1}</span>
        <span style={actionStatusStyle}>{item.watchStatus}</span>
      </div>

      <h3 style={actionCardTitleStyle}>{item.title || "Oportunidad detectada"}</h3>

      <div style={actionMiniGridStyle}>
        <ActionMiniMetric label="Score" value={`${item.watchScore || 0}/100`} />
        <ActionMiniMetric label="Prioridad" value={item.priority || "-"} />
        <ActionMiniMetric label="ROI" value={`${formatNumber(item.roi)}%`} />
        <ActionMiniMetric label="Beneficio" value={formatEuro(item.profit)} />
      </div>

      {item.alert && <p style={actionAlertStyle}>🚨 {item.alert}</p>}

      <p style={actionReasonStyle}>{item.reason}</p>

      <p style={actionNextStyle}>
        Próxima acción: {item.nextAction || "validar datos principales."}
      </p>
    </article>
  );
}

function ActionMiniMetric({ label, value }) {
  return (
    <div style={actionMiniMetricStyle}>
      <span style={actionMiniMetricLabelStyle}>{label}</span>
      <strong style={actionMiniMetricValueStyle}>{value}</strong>
    </div>
  );
}

function formatEuro(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "-";

  return `${Math.round(number).toLocaleString("es-ES")} €`;
}

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "0";

  return number.toLocaleString("es-ES", {
    maximumFractionDigits: 1,
  });
}

const pageStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, #1e3a8a 0, #020617 40%, #020617 100%)",
  color: "white",
  padding: "48px",
  fontFamily: "Arial, sans-serif",
};

const containerStyle = {
  maxWidth: "1300px",
  margin: "0 auto",
};

const statusBoxStyle = {
  marginBottom: "24px",
  padding: "18px 20px",
  borderRadius: "18px",
  background: "rgba(15, 23, 42, 0.82)",
  border: "1px solid rgba(148, 163, 184, 0.25)",
  color: "#e5e7eb",
  fontSize: "15px",
};

const errorBoxStyle = {
  marginBottom: "24px",
  padding: "18px 20px",
  borderRadius: "18px",
  background: "rgba(127, 29, 29, 0.35)",
  border: "1px solid rgba(248, 113, 113, 0.45)",
  color: "#fee2e2",
  fontSize: "15px",
};

const retryButtonStyle = {
  marginLeft: "14px",
  padding: "8px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(255,255,255,0.12)",
  color: "white",
  cursor: "pointer",
};

const loadingAdvancedStyle = {
  marginBottom: "28px",
  padding: "26px",
  borderRadius: "24px",
  background: "rgba(15,23,42,0.72)",
  border: "1px solid rgba(148,163,184,0.16)",
  color: "#cbd5e1",
  textAlign: "center",
  fontWeight: "700",
};

const actionCenterStyle = {
  marginBottom: "32px",
  padding: "26px",
  borderRadius: "30px",
  background:
    "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(37,99,235,0.18), rgba(15,23,42,0.86))",
  border: "1px solid rgba(34,197,94,0.28)",
  boxShadow: "0 24px 80px rgba(2,6,23,0.36)",
};

const actionCenterHeaderStyle = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: "22px",
  alignItems: "flex-start",
  marginBottom: "18px",
};

const actionEyebrowStyle = {
  margin: 0,
  color: "#86efac",
  fontWeight: "950",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontSize: "12px",
};

const actionTitleStyle = {
  margin: "8px 0",
  color: "white",
  fontSize: "30px",
};

const actionSubtitleStyle = {
  margin: 0,
  color: "#dbeafe",
  lineHeight: "1.6",
  fontWeight: "750",
  maxWidth: "760px",
};

const actionScoreBoxStyle = {
  minWidth: "150px",
  padding: "16px",
  borderRadius: "22px",
  background: "rgba(2,6,23,0.58)",
  border: "1px solid rgba(148,163,184,0.18)",
  textAlign: "center",
};

const actionScoreLabelStyle = {
  display: "block",
  color: "#93c5fd",
  fontSize: "12px",
  fontWeight: "900",
};

const actionScoreValueStyle = {
  display: "block",
  color: "white",
  fontSize: "30px",
  marginTop: "6px",
};

const actionScoreLevelStyle = {
  display: "block",
  color: "#bbf7d0",
  fontSize: "12px",
  fontWeight: "900",
  marginTop: "4px",
};

const actionSummaryStyle = {
  padding: "14px 16px",
  borderRadius: "18px",
  background: "rgba(2,6,23,0.45)",
  border: "1px solid rgba(148,163,184,0.14)",
  color: "#d1fae5",
  fontWeight: "850",
  lineHeight: "1.5",
  marginBottom: "18px",
};

const actionEmptyStyle = {
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(2,6,23,0.42)",
  border: "1px solid rgba(148,163,184,0.14)",
  color: "#cbd5e1",
  lineHeight: "1.5",
  fontWeight: "800",
};

const actionGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
  gap: "16px",
};

const actionCardStyle = {
  padding: "18px",
  borderRadius: "22px",
  background: "rgba(2,6,23,0.62)",
  border: "1px solid rgba(148,163,184,0.16)",
};

const actionCardTopStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
  alignItems: "center",
  marginBottom: "12px",
};

const actionRankStyle = {
  color: "#93c5fd",
  fontWeight: "950",
};

const actionStatusStyle = {
  padding: "7px 10px",
  borderRadius: "999px",
  background: "rgba(34,197,94,0.16)",
  border: "1px solid rgba(34,197,94,0.25)",
  color: "#bbf7d0",
  fontSize: "12px",
  fontWeight: "950",
};

const actionCardTitleStyle = {
  margin: "0 0 14px",
  color: "white",
  fontSize: "20px",
  lineHeight: 1.25,
};

const actionMiniGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
  gap: "10px",
  marginBottom: "12px",
};

const actionMiniMetricStyle = {
  padding: "10px",
  borderRadius: "14px",
  background: "rgba(15,23,42,0.75)",
  border: "1px solid rgba(148,163,184,0.10)",
};

const actionMiniMetricLabelStyle = {
  display: "block",
  color: "#94a3b8",
  fontSize: "11px",
  fontWeight: "800",
  marginBottom: "4px",
};

const actionMiniMetricValueStyle = {
  color: "#f8fafc",
  fontWeight: "950",
};

const actionAlertStyle = {
  color: "#fde68a",
  background: "rgba(245,158,11,0.12)",
  border: "1px solid rgba(245,158,11,0.22)",
  borderRadius: "14px",
  padding: "10px 12px",
  fontWeight: "900",
  lineHeight: "1.45",
  margin: "0 0 10px 0",
};

const actionReasonStyle = {
  color: "#bfdbfe",
  fontWeight: "800",
  lineHeight: "1.45",
  margin: "0 0 10px 0",
};

const actionNextStyle = {
  color: "#d1fae5",
  margin: 0,
  fontSize: "13px",
  lineHeight: "1.45",
  fontWeight: "850",
};