import { useEffect, useRef, useState } from "react";

import { supabase } from "../lib/supabase";
import { generateMockMarketFeed } from "../services/mockMarketFeed";
import { analyzeCar } from "../services/profitAnalyzer";
import { analyzeComparableMarket } from "../services/comparableIntelligence";
import { analyzeVehicleMemory } from "../services/vehicleMemoryEngine";
import { analyzeDealRisk } from "../services/dealRiskEngine";
import { buildLiquidityProfile } from "../services/liquidityEngine";
import { buildFinalDealDecision } from "../services/finalDecisionEngine";
import { findOpportunities } from "../services/search/opportunityFinder";
import { fetchRealMarketListings } from "../services/market/realMarketFeed";

const MODEL_RULES = {
  "bmw x5 45e": {
    fuel: "PHEV",
    minKw: 250,
    maxKw: 330,
  },
  "audi q7 tfsie": {
    fuel: "PHEV",
    minKw: 250,
    maxKw: 350,
  },
  "mercedes glc 300de": {
    fuel: "PHEV",
    minKw: 180,
    maxKw: 260,
  },
};

export function useEnrichedMarketFeed({ searchTriggered, scan, form }) {
  const [marketFeed, setMarketFeed] = useState(null);
  const savedScanRef = useRef("");

  useEffect(() => {
    let cancelled = false;

    async function buildFeed() {
      if (!searchTriggered) {
        setMarketFeed(null);
        return;
      }

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
            realFeedDiagnostics: realResult.diagnostics,
          }
        : {
            ...generateMockMarketFeed(scan),
            sourceMode: "mock-fallback",
            realFeedErrors: realResult.errors,
            realFeedDiagnostics: realResult.diagnostics,
          };

      const modelRule = findModelRule(form.query || scan.query);
      const modelFilteredOpportunities = modelRule
        ? rawFeed.opportunities.filter((item) =>
            validateSpecificModelRule(item, modelRule)
          )
        : rawFeed.opportunities;

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
            : Math.round(Number(analysis.estimatedProfit || 0) - netCosts.total);

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
            item.title && item.price && (item.km || item.mileage) && item.year
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
          modelSpecificValidation: modelRule
            ? {
                rule: modelRule.key,
                status: "passed",
              }
            : null,
        };
      }

      const opportunities = modelFilteredOpportunities
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
        realFeedDiagnostics: {
          ...(rawFeed.realFeedDiagnostics || {}),
          modelSpecificFilter: modelRule
            ? {
                active: true,
                rule: modelRule.key,
                before: rawFeed.opportunities.length,
                after: opportunities.length,
                discarded: rawFeed.opportunities.length - opportunities.length,
              }
            : {
                active: false,
              },
        },
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

      await saveBestRealOpportunityToMarketMemory({
        sourceMode: rawFeed.sourceMode,
        opportunities,
        scan,
        savedScanRef,
      });
    }

    buildFeed();

    return () => {
      cancelled = true;
    };
  }, [form.query, form.maxBudget, scan, searchTriggered]);

  return marketFeed;
}

function findModelRule(query) {
  const normalizedQuery = normalizeForModelRule(query);

  const match = Object.entries(MODEL_RULES).find(([key]) =>
    normalizedQuery.includes(normalizeForModelRule(key))
  );

  if (!match) return null;

  return {
    key: match[0],
    ...match[1],
  };
}

function validateSpecificModelRule(item, rule) {
  const fuel = inferFuelType(item);
  const kw = inferKw(item);

  if (rule.fuel && fuel !== rule.fuel) return false;
  if (!Number.isFinite(kw)) return false;
  if (typeof rule.minKw === "number" && kw < rule.minKw) return false;
  if (typeof rule.maxKw === "number" && kw > rule.maxKw) return false;

  return true;
}

function inferFuelType(item) {
  const text = normalizeForModelRule(
    [
      item.title,
      item.fuelType,
      item.fuel,
      item.engine,
      item.description,
      item.power,
    ].join(" ")
  );

  if (
    text.includes("phev") ||
    text.includes("plug in hybrid") ||
    text.includes("plugin hybrid") ||
    text.includes("plug in") ||
    text.includes("tfsie") ||
    text.includes("tfsi e") ||
    text.includes("45e") ||
    text.includes("50e") ||
    text.includes("300de") ||
    text.includes("300e") ||
    text.includes("350de") ||
    text.includes("350e")
  ) {
    return "PHEV";
  }

  if (text.includes("hybrid") || text.includes("hibrido")) return "Hybrid";
  if (text.includes("electric") || text.includes("electrico") || text.includes("ev")) return "EV";
  if (text.includes("diesel") || text.includes("tdi") || text.includes("dci") || text.includes("hdi")) return "Diesel";
  if (text.includes("gasolina") || text.includes("petrol") || text.includes("tfsi") || text.includes("tsi")) return "Gasolina";

  return "";
}

function inferKw(item) {
  const directKw = Number(
    item.kw ||
      item.powerKw ||
      item.power_kw ||
      item.engineKw ||
      item.engine_kw ||
      item.power
  );

  if (Number.isFinite(directKw) && directKw > 40 && directKw < 600) {
    return directKw;
  }

  const text = normalizeForModelRule(
    [item.title, item.engine, item.description, item.power].join(" ")
  );

  const kwMatch = text.match(/\b(\d{2,3})\s?kw\b/);
  if (kwMatch) return Number(kwMatch[1]);

  const cvMatch = text.match(/\b(\d{2,3})\s?(cv|ps|hp)\b/);
  if (cvMatch) return Math.round(Number(cvMatch[1]) * 0.7355);

  return NaN;
}

async function saveBestRealOpportunityToMarketMemory({
  sourceMode,
  opportunities,
  scan,
  savedScanRef,
}) {
  if (sourceMode !== "real-feed") return;
  if (!Array.isArray(opportunities) || opportunities.length === 0) return;

  const bestCandidate = opportunities.find((item) => {
    const semanticScore = Number(item.semanticScore || 0);
    const finalScore = Number(item.finalDecision?.finalScore || 0);
    const profit = Number(item.netProfit || 0);
    const roi = Number(item.netRoi || 0);

    return (
      semanticScore >= 80 &&
      finalScore >= 70 &&
      Number.isFinite(profit) &&
      Number.isFinite(roi)
    );
  });

  if (!bestCandidate) return;

  const saveKey = [
    normalizeForKey(scan?.query),
    normalizeForKey(bestCandidate.title),
    bestCandidate.price,
    bestCandidate.km || bestCandidate.mileage,
    bestCandidate.year,
    bestCandidate.country,
  ].join("|");

  if (!saveKey || savedScanRef.current === saveKey) return;

  const sessionKey = `scanner-memory:${saveKey}`;

  if (window.sessionStorage.getItem(sessionKey)) return;

  savedScanRef.current = saveKey;
  window.sessionStorage.setItem(sessionKey, "saved");

  const payload = {
    title: bestCandidate.title || scan?.query || "Scanner opportunity",
    brand: bestCandidate.brand || null,
    model: bestCandidate.model || null,
    fuel_type: bestCandidate.fuelType || null,
    drivetrain: bestCandidate.drivetrain || null,
    performance_package: bestCandidate.performancePackage || null,
    country: bestCandidate.country || scan?.country || null,
    profit: Math.round(Number(bestCandidate.netProfit || 0)),
    roi: Number(bestCandidate.netRoi || 0),
    score: Number(bestCandidate.finalDecision?.finalScore || 0),
    url: bestCandidate.url || null,
  };

  const { error } = await supabase.from("import_analyses").insert(payload);

  if (error) {
    console.error("Error saving scanner opportunity:", error);
    window.sessionStorage.removeItem(sessionKey);
    savedScanRef.current = "";
  }
}

function estimateImportCosts(car) {
  const transport = car.country === "Alemania" ? 900 : 1200;
  const registration = 750;
  const gestor = 450;
  const inspection = 350;
  const detailing = 400;
  const riskBuffer = car.price >= 70000 ? 1800 : 900;

  const total =
    transport + registration + gestor + inspection + detailing + riskBuffer;

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

function normalizeForKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function normalizeForModelRule(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_/+.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}