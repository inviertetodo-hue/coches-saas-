import { useMemo, useState } from "react";

import ScannerHeader from "../components/scanner/ScannerHeader";
import SemanticBadge from "../components/scanner/SemanticBadge";
import BestDealCard from "../components/scanner/BestDealCard";
import MarketFeedSection from "../components/scanner/MarketFeedSection";
import AIInsightsSection from "../components/scanner/AIInsightsSection";
import TrendSummaryCard from "../components/scanner/TrendSummaryCard";
import SearchRadarSection from "../components/scanner/SearchRadarSection";
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
      .sort((a, b) => b.finalDecision.finalScore - a.finalDecision.finalScore);

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

            <TrendSummaryCard trendProfile={trendProfile} />

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
            <MarketFeedSection marketFeed={marketFeed} />

            <AIInsightsSection insights={marketFeed.insights} />

            <SearchRadarSection searchRadar={searchRadar} />
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