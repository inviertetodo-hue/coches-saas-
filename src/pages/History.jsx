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

import { InsightSection, AlertSection } from "../components/dashboard/DashboardBlocks";
import ExecutiveSummaryPanel from "../components/dashboard/ExecutiveSummaryPanel";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import GlobalStatsPanel from "../components/dashboard/GlobalStatsPanel";
import AdvancedMetricsPanel from "../components/dashboard/AdvancedMetricsPanel";
import HistoryControls from "../components/dashboard/HistoryControls";
import AnalysisGrid from "../components/dashboard/AnalysisGrid";

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
  const advancedMetrics = generateAdvancedMetrics(analyses);

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

        return text.includes(search.toLowerCase());
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
          opportunityAlerts={opportunityAlerts}
          temporal={temporal}
        />

        <AdvancedMetricsPanel metrics={advancedMetrics} />

        <ExecutiveSummaryPanel executive={executive} />

        <InsightSection
          title="🧠 AI Learning Insights"
          items={learning.learningInsights}
          empty="Sin aprendizaje IA todavía."
          cardStyle={learningCardStyle}
        />

        <InsightSection
          title="📚 Learned Patterns"
          items={learning.learnedPatterns}
          empty="Sin patrones aprendidos todavía."
          cardStyle={learningCardStyle}
        />

        <InsightSection
          title="🎯 AI Confidence"
          items={confidence.confidenceInsights}
          empty="Sin insights de confianza IA."
          cardStyle={confidenceCardStyle}
        />

        <AlertSection
          title="⚠️ Weak AI Signals"
          items={confidence.unstableSignals}
          empty="Sin señales débiles IA."
          styleType="warning"
        />

        <AlertSection
          title="🛡️ Risk Alerts"
          items={risk.riskAlerts}
          empty="Sin alertas de riesgo."
          styleType="risk"
        />

        <InsightSection
          title="🧯 Risk Insights"
          items={risk.riskInsights}
          empty="Sin insights de riesgo."
          cardStyle={riskCardStyle}
        />

        <InsightSection
          title="📈 Portfolio Strategy"
          items={portfolio.strategyInsights}
          empty="Sin estrategia suficiente todavía."
          cardStyle={portfolioCardStyle}
        />

        <InsightSection
          title="🧠 Market Insights"
          items={market.marketInsights}
          empty="Sin insights de mercado todavía."
          cardStyle={insightCardStyle}
        />

        <InsightSection
          title="📊 Trend Insights"
          items={trends.trendInsights}
          empty="Sin tendencias suficientes todavía."
          cardStyle={trendCardStyle}
        />

        <InsightSection
          title="🕒 Temporal Insights"
          items={temporal.temporalInsights}
          empty="Todavía no hay suficiente información temporal."
          cardStyle={temporalCardStyle}
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

const insightCardStyle = {
  background: "rgba(255,255,255,0.05)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
};

const learningCardStyle = {
  background: "rgba(34,197,94,0.10)",
  border: "1px solid rgba(34,197,94,0.20)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
  fontWeight: "800",
};

const confidenceCardStyle = {
  background: "rgba(59,130,246,0.10)",
  border: "1px solid rgba(59,130,246,0.20)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
  fontWeight: "800",
};

const riskCardStyle = {
  background: "rgba(239,68,68,0.10)",
  border: "1px solid rgba(239,68,68,0.22)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
};

const portfolioCardStyle = {
  background: "rgba(168,85,247,0.12)",
  border: "1px solid rgba(168,85,247,0.25)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
};

const trendCardStyle = {
  background: "rgba(37,99,235,0.12)",
  border: "1px solid rgba(59,130,246,0.2)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
};

const temporalCardStyle = {
  background: "rgba(34,197,94,0.10)",
  border: "1px solid rgba(34,197,94,0.2)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
};