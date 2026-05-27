import { useEffect, useMemo, useState } from "react";
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

import ExecutiveSummaryPanel from "../components/dashboard/ExecutiveSummaryPanel";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import GlobalStatsPanel from "../components/dashboard/GlobalStatsPanel";
import AdvancedMetricsPanel from "../components/dashboard/AdvancedMetricsPanel";
import OpportunityRadarPanel from "../components/dashboard/OpportunityRadarPanel";
import OpportunityRankingPanel from "../components/dashboard/OpportunityRankingPanel";
import WatchlistPanel from "../components/dashboard/WatchlistPanel";
import DealPipelinePanel from "../components/dashboard/DealPipelinePanel";
import DealDecisionPanel from "../components/dashboard/DealDecisionPanel";
import HistoryControls from "../components/dashboard/HistoryControls";
import AnalysisGrid from "../components/dashboard/AnalysisGrid";
import AIInsightsPanel from "../components/dashboard/AIInsightsPanel";

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [filter, setFilter] = useState("TODOS");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("score");

  useEffect(() => {
    loadAnalyses();
  }, []);

  async function loadAnalyses() {
    const { data, error } = await supabase
      .from("import_analyses")
      .select("*")
      .order("score", { ascending: false });

    if (!error) {
      setAnalyses(data || []);
    }
  }

  async function deleteAnalysis(id) {
    const { error } = await supabase
      .from("import_analyses")
      .delete()
      .eq("id", id);

    if (!error) {
      loadAnalyses();
    }
  }

  const market = analyzeMarketIntelligence(analyses);
  const trends = analyzeMarketTrends(analyses);
  const temporal = analyzeTemporalIntelligence(analyses);
  const opportunityAlerts = analyzeOpportunityAlerts(analyses);
  const portfolio = analyzePortfolioStrategy(analyses);
  const risk = analyzeRiskManagement(analyses);
  const confidence = analyzeAIConfidence(analyses);
  const learning = analyzeAILearning(analyses);

  const advancedMetrics =
    generateAdvancedMetrics(analyses);

  const radar =
    generateOpportunityRadar(analyses);

  const ranking =
    generateOpportunityRanking(analyses);

  const watchlist =
    generateWatchlist(analyses);

  const pipeline =
    generateDealPipeline(analyses);

  const decisions =
    generateDealDecisions(analyses);

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

  const filteredAnalyses = useMemo(() => {
    let result = [...analyses];

    if (search.trim()) {
      result = result.filter((item) => {
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
      });
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
  }, [analyses, filter, search, sortBy]);

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <DashboardHeader />

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

        <ExecutiveSummaryPanel
          executive={executive}
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

        <HistoryControls
          search={search}
          setSearch={setSearch}
          sortBy={sortBy}
          setSortBy={setSortBy}
          filter={filter}
          setFilter={setFilter}
        />

        <AnalysisGrid
          analyses={filteredAnalyses}
          onDelete={deleteAnalysis}
        />
      </div>
    </div>
  );
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