import { useEffect, useState } from "react";

import { generateMockMarketFeed } from "../services/mockMarketFeed";
import { analyzeCar } from "../services/profitAnalyzer";
import { analyzeComparableMarket } from "../services/comparableIntelligence";
import { analyzeVehicleMemory } from "../services/vehicleMemoryEngine";
import { analyzeDealRisk } from "../services/dealRiskEngine";
import { buildLiquidityProfile } from "../services/liquidityEngine";
import { buildFinalDealDecision } from "../services/finalDecisionEngine";
import { findOpportunities } from "../services/search/opportunityFinder";
import { fetchRealMarketListings } from "../services/market/realMarketFeed";

export function useEnrichedMarketFeed({ searchTriggered, scan, form }) {
  const [marketFeed, setMarketFeed] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function buildFeed() {
      if (!searchTriggered) {
        setMarketFeed(null);
        return;
      }

      // IMPORTANTE:
      // Limpia el feed anterior para que aparezca
      // la pantalla de carga mientras busca.
      setMarketFeed(null);

      const maxBudget = Number(form.maxBudget || scan.maxBudget || 0);

      const realResult = await fetchRealMarketListings(scan, {
        maxListings: 20,
      });

      const hasRealListings = realResult.listings.length > 0;

      const rawFeed = hasRealListings
        ? {
            total: realResult.listings.length,
            opportunities: realResult.listings,
            insights: [],
            sourceMode: "real-feed",
            realFeedErrors: realResult.errors,
          }
        : {
            ...generateMockMarketFeed(scan),
            sourceMode: "mock-fallback",
            realFeedErrors: realResult.errors,
          };

      function enrichDeal(item) {
        const estimatedMarketPrice =
          item.estimatedMarketPrice ||
          Math.round(
            Number(item.price || 0) * Number(item.marketMultiplier || 1.12)
          );

        const analysis =
          item.analysis ||
          analyzeCar({
            ...item,
            estimatedMarketPrice,
          });

        const comparable =
          item.comparable ||
          analyzeComparableMarket({
            ...item,
            estimatedMarketPrice,
          });

        const netCosts = item.netCosts || estimateImportCosts(item);

        const netProfit =
          typeof item.netProfit === "number"
            ? item.netProfit
            : Math.round(
                Number(analysis.estimatedProfit || 0) - netCosts.total
              );

        const netRoi =
          typeof item.netRoi === "number"
            ? item.netRoi
            : item.price > 0
              ? Math.round((netProfit / item.price) * 100)
              : 0;

        const memory =
          item.memory ||
          analyzeVehicleMemory({
            ...item,
            comparable,
            netProfit,
            netRoi,
          });

        const dealRisk = analyzeDealRisk({
          ...item,
          analysis,
          comparable,
          memory,
          netProfit,
          netRoi,
        });

        const liquidity = buildLiquidityProfile({
          query: item.title || form.query,
          item,
          semantic: scan.semantic,
        });

        const normalizedListing = {
          title: item.title,
          url: item.url || "",
          price: item.price,
          mileage: item.km || item.mileage,
          year: item.year,
          location: item.location,
          source: item.source || "market-feed",
          isValid: Boolean(
            item.title &&
              item.price &&
              (item.km || item.mileage) &&
              item.year
          ),
        };

        const opportunityPreview =
          findOpportunities([normalizedListing], { maxBudget })[0] || null;

        const opportunityScore =
          opportunityPreview?.opportunityScore || item.opportunityScore || 0;

        const opportunityLevel =
          opportunityPreview?.opportunityLevel || "NONE";

        const finalDecision = buildFinalDealDecision({
          ...item,
          analysis,
          comparable,
          memory,
          netCosts,
          netProfit,
          netRoi,
          opportunityScore,
          opportunityLevel,
          dealRisk,
          liquidity,
        });

        return {
          ...item,
          estimatedMarketPrice,
          analysis,
          comparable,
          memory,
          netCosts,
          netProfit,
          netRoi,
          opportunityScore,
          opportunityLevel,
          opportunitySignals: opportunityPreview?.opportunitySignals || null,
          dealRisk,
          liquidity,
          finalDecision,
        };
      }

      const opportunities = rawFeed.opportunities
        .map(enrichDeal)
        .sort((a, b) => b.finalDecision.finalScore - a.finalDecision.finalScore);

      const opportunityEnginePreview = opportunities.map((item) => ({
        title: item.title,
        url: item.url || "",
        price: item.price,
        mileage: item.km || item.mileage,
        year: item.year,
        location: item.location,
        source: item.source || "market-feed",
        isValid: Boolean(
          item.title && item.price && (item.km || item.mileage) && item.year
        ),
        opportunityScore: item.opportunityScore,
        opportunityLevel: item.opportunityLevel,
        opportunitySignals: item.opportunitySignals,
      }));

      const best = opportunities[0] || null;

      const nextFeed = {
        ...rawFeed,
        total: opportunities.length,
        opportunities,
        best,
        insights: buildRuntimeInsights(opportunities, rawFeed.sourceMode),
        opportunityEnginePreview,
        opportunityEngineSummary: {
          total: opportunityEnginePreview.length,
          bestScore: opportunityEnginePreview[0]?.opportunityScore || 0,
          bestLevel: opportunityEnginePreview[0]?.opportunityLevel || "NONE",
          mode: hasRealListings
            ? "real-feed-ranking"
            : "mock-fallback-ranking",
        },
      };

      if (!cancelled) {
        setMarketFeed(nextFeed);
      }
    }

    buildFeed();

    return () => {
      cancelled = true;
    };
  }, [form.query, form.maxBudget, scan, searchTriggered]);

  return marketFeed;
}

function estimateImportCosts(car) {
  const transport = car.country === "Alemania" ? 900 : 1200;
  const registration = 750;
  const gestor = 450;
  const inspection = 350;
  const detailing = 400;
  const riskBuffer = car.price >= 70000 ? 1800 : 900;

  const total =
    transport +
    registration +
    gestor +
    inspection +
    detailing +
    riskBuffer;

  return {
    transport,
    registration,
    gestor,
    inspection,
    detailing,
    riskBuffer,
    total,
  };
}

function buildRuntimeInsights(opportunities, sourceMode) {
  if (!opportunities.length) {
    return ["No hay oportunidades suficientes para comparar."];
  }

  const best = opportunities[0];

  const sourceLabel =
    sourceMode === "real-feed"
      ? "Feed real experimental"
      : "Feed demo hasta conectar datos reales";

  return [
    `📡 Modo de datos: ${sourceLabel}.`,
    `💰 Margen neto estimado: ${best.netProfit.toLocaleString("es-ES")} €.`,
    `📊 ROI neto estimado: ${best.netRoi}%.`,
    `🧠 Desviación de mercado: ${best.comparable.deviationPercent}%.`,
    `⚡ Probabilidad de venta rápida: ${best.memory.resaleSpeed.label}.`,
    `🎯 Riesgo estimado: ${best.memory.riskLevel}.`,
    best.memory.strategy.reason,
  ];
}