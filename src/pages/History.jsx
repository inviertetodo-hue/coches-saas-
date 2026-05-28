import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";

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

import { validateAnalysesDataset } from "../services/validationRules";
import { sanitizeAnalysesDataset } from "../services/analysisSanitizer";
import { evaluateAnalysisHealth } from "../services/analysisHealthGate";
import { filterValidAnalyses } from "../services/analysisGuard";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import SystemHealthBanner from "../components/dashboard/SystemHealthBanner";
import InstantDecisionPanel from "../components/dashboard/InstantDecisionPanel";
import GlobalStatsPanel from "../components/dashboard/GlobalStatsPanel";
import ExecutiveSummaryPanel from "../components/dashboard/ExecutiveSummaryPanel";
import HistoryControls from "../components/dashboard/HistoryControls";
import AnalysisGrid from "../components/dashboard/AnalysisGrid";

const AdvancedIntelligencePanel = lazy(() =>
  import(
    "../components/dashboard/AdvancedIntelligencePanel"
  )
);

const DataQualityPanel = lazy(() =>
  import(
    "../components/dashboard/DataQualityPanel"
  )
);

const AdvancedMetricsPanel = lazy(() =>
  import(
    "../components/dashboard/AdvancedMetricsPanel"
  )
);

const OpportunityRadarPanel = lazy(() =>
  import(
    "../components/dashboard/OpportunityRadarPanel"
  )
);

const OpportunityRankingPanel = lazy(() =>
  import(
    "../components/dashboard/OpportunityRankingPanel"
  )
);

const WatchlistPanel = lazy(() =>
  import(
    "../components/dashboard/WatchlistPanel"
  )
);

const DealPipelinePanel = lazy(() =>
  import(
    "../components/dashboard/DealPipelinePanel"
  )
);

const DealDecisionPanel = lazy(() =>
  import(
    "../components/dashboard/DealDecisionPanel"
  )
);

const PortfolioSimulatorPanel = lazy(() =>
  import(
    "../components/dashboard/PortfolioSimulatorPanel"
  )
);

const AIInsightsPanel = lazy(() =>
  import(
    "../components/dashboard/AIInsightsPanel"
  )
);

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [filter, setFilter] = useState("TODOS");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [isLoading, setIsLoading] =
    useState(true);
  const [loadError, setLoadError] =
    useState("");

  useEffect(() => {
    loadAnalyses();
  }, []);

  async function loadAnalyses() {
    setIsLoading(true);
    setLoadError("");

    const { data, error } = await supabase
      .from("import_analyses")
      .select("*")
      .order("score", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Error loading analyses:",
        error
      );

      setAnalyses([]);

      setLoadError(
        "No se han podido cargar los análisis. Revisa la conexión con Supabase o inténtalo de nuevo."
      );

      setIsLoading(false);

      return;
    }

    const sanitized =
      sanitizeAnalysesDataset(data || []);

    const valid =
      filterValidAnalyses(sanitized);

    setAnalyses(valid);

    setIsLoading(false);
  }

  async function deleteAnalysis(id) {
    const { error } = await supabase
      .from("import_analyses")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "Error deleting analysis:",
        error
      );

      setLoadError(
        "No se ha podido borrar el análisis. Inténtalo de nuevo."
      );

      return;
    }

    loadAnalyses();
  }

  const cleanAnalyses = useMemo(() => {
    const sanitized =
      sanitizeAnalysesDataset(analyses);

    return filterValidAnalyses(
      sanitized
    );
  }, [analyses]);

  const market =
    analyzeMarketIntelligence(
      cleanAnalyses
    );

  const trends =
    analyzeMarketTrends(cleanAnalyses);

  const temporal =
    analyzeTemporalIntelligence(
      cleanAnalyses
    );

  const opportunityAlerts =
    analyzeOpportunityAlerts(
      cleanAnalyses
    );

  const portfolio =
    analyzePortfolioStrategy(
      cleanAnalyses
    );

  const risk =
    analyzeRiskManagement(
      cleanAnalyses
    );

  const confidence =
    analyzeAIConfidence(
      cleanAnalyses
    );

  const learning =
    analyzeAILearning(
      cleanAnalyses
    );

  const validation =
    validateAnalysesDataset(
      cleanAnalyses
    );

  const systemHealth =
    evaluateAnalysisHealth(
      validation
    );

  const executive =
    generateExecutiveSummary({
      market,
      trends,
      temporal,
      opportunityAlerts,
      portfolio,
      risk,
      confidence,
      learning,
    });

  const filteredAnalyses = useMemo(() => {
    let result = [...cleanAnalyses];

    if (search.trim()) {
      result = result.filter(
        (item) => {
          const text = `
            ${item.title || ""}
            ${item.brand || ""}
            ${item.model || ""}
            ${item.drivetrain || ""}
            ${item.fuel_type || ""}
            ${item.performance_package || ""}
          `.toLowerCase();

          return text.includes(
            search.toLowerCase()
          );
        }
      );
    }

    if (filter === "CHOLLO IA") {
      result = result.filter(
        (item) => item.score >= 85
      );
    }

    if (filter === "ANALIZAR") {
      result = result.filter(
        (item) =>
          item.score >= 60 &&
          item.score < 85
      );
    }

    if (filter === "DESCARTAR") {
      result = result.filter(
        (item) => item.score < 60
      );
    }

    result.sort((a, b) => {
      if (sortBy === "score")
        return b.score - a.score;

      if (sortBy === "roi")
        return b.roi - a.roi;

      if (sortBy === "profit")
        return b.profit - a.profit;

      return 0;
    });

    return result;
  }, [
    cleanAnalyses,
    filter,
    search,
    sortBy,
  ]);

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <DashboardHeader />

        {isLoading && (
          <div style={statusBoxStyle}>
            Cargando análisis guardados...
          </div>
        )}

        {loadError && (
          <div style={errorBoxStyle}>
            <strong>
              Error controlado:
            </strong>{" "}
            {loadError}

            <button
              style={retryButtonStyle}
              onClick={loadAnalyses}
            >
              Reintentar
            </button>
          </div>
        )}

        {!isLoading &&
          !loadError &&
          cleanAnalyses.length === 0 && (
            <div style={statusBoxStyle}>
              Todavía no hay análisis
              válidos guardados.
              Cuando analices coches,
              aparecerán aquí.
            </div>
          )}

        {!isLoading && (
          <>
            <SystemHealthBanner
              health={systemHealth}
            />

            <InstantDecisionPanel
              decisions={
                opportunityAlerts
              }
            />

            <GlobalStatsPanel
              market={market}
              risk={risk}
              confidence={confidence}
              learning={learning}
              portfolio={portfolio}
              trends={trends}
              opportunityAlerts={
                opportunityAlerts
              }
              temporal={temporal}
            />

            <ExecutiveSummaryPanel
              executive={executive}
            />

            {systemHealth.canShowAdvanced && (
              <Suspense
                fallback={
                  <div
                    style={
                      loadingAdvancedStyle
                    }
                  >
                    Cargando Advanced
                    Intelligence...
                  </div>
                }
              >
                <AdvancedSection
                  cleanAnalyses={
                    cleanAnalyses
                  }
                  validation={
                    validation
                  }
                  learning={learning}
                  confidence={
                    confidence
                  }
                  risk={risk}
                  portfolio={
                    portfolio
                  }
                  market={market}
                  trends={trends}
                  temporal={temporal}
                />
              </Suspense>
            )}

            <HistoryControls
              search={search}
              setSearch={setSearch}
              sortBy={sortBy}
              setSortBy={setSortBy}
              filter={filter}
              setFilter={setFilter}
            />

            <AnalysisGrid
              analyses={
                filteredAnalyses
              }
              onDelete={
                deleteAnalysis
              }
            />
          </>
        )}
      </div>
    </div>
  );
}

function AdvancedSection({
  cleanAnalyses,
  validation,
  learning,
  confidence,
  risk,
  portfolio,
  market,
  trends,
  temporal,
}) {
  const advancedMetrics =
    require(
      "../services/advancedMetrics"
    ).generateAdvancedMetrics(
      cleanAnalyses
    );

  const radar =
    require(
      "../services/opportunityRadar"
    ).generateOpportunityRadar(
      cleanAnalyses
    );

  const ranking =
    require(
      "../services/opportunityRanking"
    ).generateOpportunityRanking(
      cleanAnalyses
    );

  const watchlist =
    require(
      "../services/watchlistEngine"
    ).generateWatchlist(
      cleanAnalyses
    );

  const pipeline =
    require(
      "../services/dealPipeline"
    ).generateDealPipeline(
      cleanAnalyses
    );

  const decisions =
    require(
      "../services/dealDecisionEngine"
    ).generateDealDecisions(
      cleanAnalyses
    );

  const simulation =
    require(
      "../services/portfolioSimulator"
    ).simulatePortfolio(
      cleanAnalyses
    );

  return (
    <AdvancedIntelligencePanel>
      <DataQualityPanel
        validation={validation}
      />

      <AdvancedMetricsPanel
        metrics={advancedMetrics}
      />

      <OpportunityRadarPanel
        radar={radar}
      />

      <OpportunityRankingPanel
        ranking={ranking}
      />

      <WatchlistPanel
        watchlist={watchlist}
      />

      <DealPipelinePanel
        pipeline={pipeline}
      />

      <DealDecisionPanel
        decisions={decisions}
      />

      <PortfolioSimulatorPanel
        simulation={simulation}
      />

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
  maxWidth: "1300px",

  margin: "0 auto",
};

const statusBoxStyle = {
  marginBottom: "24px",

  padding: "18px 20px",

  borderRadius: "18px",

  background:
    "rgba(15, 23, 42, 0.82)",

  border:
    "1px solid rgba(148, 163, 184, 0.25)",

  color: "#e5e7eb",

  fontSize: "15px",
};

const errorBoxStyle = {
  marginBottom: "24px",

  padding: "18px 20px",

  borderRadius: "18px",

  background:
    "rgba(127, 29, 29, 0.35)",

  border:
    "1px solid rgba(248, 113, 113, 0.45)",

  color: "#fee2e2",

  fontSize: "15px",
};

const retryButtonStyle = {
  marginLeft: "14px",

  padding: "8px 12px",

  borderRadius: "10px",

  border:
    "1px solid rgba(255,255,255,0.25)",

  background:
    "rgba(255,255,255,0.12)",

  color: "white",

  cursor: "pointer",
};

const loadingAdvancedStyle = {
  marginBottom: "28px",

  padding: "26px",

  borderRadius: "24px",

  background:
    "rgba(15,23,42,0.72)",

  border:
    "1px solid rgba(148,163,184,0.16)",

  color: "#cbd5e1",

  textAlign: "center",

  fontWeight: "700",
};