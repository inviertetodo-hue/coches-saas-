import { useEffect, useRef, useState } from "react";

import { supabase } from "../lib/supabase";
import { analyzeCar } from "../services/profitAnalyzer";
import { buildLiquidityProfile } from "../services/liquidityEngine";
import { buildScannerOpportunityPayload } from "../services/intelligence/scannerPersistenceAdapter";
import { buildFinalDealDecision } from "../services/finalDecisionEngine";
import { buildMasterOpportunityPipeline } from "../services/intelligence/masterOpportunityPipelineEngine";
import { fetchRealMarketListings } from "../services/market/realMarketFeed";
import { analyzeEquipment } from "../services/equipmentAnalyzer";


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

      const rawFeed = {
        total: realResult.listings.length,
        opportunities: realResult.listings,
        insights: [],
        sourceMode: realResult.listings.length > 0 ? "real-feed" : "real-feed-empty",
        realFeedErrors: realResult.errors,
        realFeedDiagnostics: Array.isArray(realResult.diagnostics)
          ? realResult.diagnostics
          : [],
      };

      const modelFilteredOpportunities = rawFeed.opportunities;

      function enrichDeal(item) {
        const analysis = item.analysis || analyzeCar(item);

        const comparable =
          item.comparable ||
          {
            valuationSource: "modern_pipeline_only",
            confidence: 0,
            insights: [],
          };

        const equipment = item.equipment || analyzeEquipment(item);

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
          {
            memoryScore: 0,
            confidence: 0,
            insights: [],
          };

        const dealRisk = {
          level: "Evaluado por Decision Engine",
          riskScore: 0,
          recommendation:
            "Riesgo evaluado por el pipeline moderno de decisión.",
        };

        const liquidity = buildLiquidityProfile({
          query: item.title || form.query,
          item,
          semantic: scan.semantic,
        });

        const legacyOpportunityScore = Number(item.opportunityScore || 0);
        const legacyOpportunityLevel = item.opportunityLevel || "NONE";

        const finalDecision = buildFinalDealDecision({
          ...item,
          analysis,
          comparable,
          memory,
          equipment,
          netCosts,
          netProfit,
          netRoi,
          opportunityScore: legacyOpportunityScore,
          opportunityLevel: legacyOpportunityLevel,
          dealRisk,
          liquidity,
        });

        return {
          ...item,
          analysis,
          comparable,
          memory,
          equipment,
          netCosts,
          netProfit,
          netRoi,
          opportunityScore: legacyOpportunityScore,
          opportunityLevel: legacyOpportunityLevel,
          opportunitySignals: null,
          dealRisk,
          liquidity,
          finalDecision,
          roi: netRoi,
          profit: netProfit,
          modelSpecificValidation: null,
        };
      }

      const enrichedBaseOpportunities = modelFilteredOpportunities.map(enrichDeal);

      const modernPipeline = buildMasterOpportunityPipeline(enrichedBaseOpportunities);

      const modernById = new Map(
        (modernPipeline.topOpportunities || []).map((item) => [item.id, item])
      );

      const opportunities = enrichedBaseOpportunities
        .map((item) => {
          const modern = modernById.get(item.id) || null;

          if (!modern) {
            return item;
          }

          const opportunityScore =
            modern.opportunity?.scoreV3 ||
            modern.opportunity?.scoreV2 ||
            modern.opportunity?.opportunityScoreV2 ||
            item.opportunityScore ||
            0;

          const opportunityLevel =
            modern.opportunity?.opportunityLevelV3 ||
            modern.opportunity?.opportunityLevelV2 ||
            item.opportunityLevel ||
            "NONE";

          const decisionScore =
            modern.decision?.decisionScore ||
            opportunityScore ||
            item.finalDecision?.finalScore ||
            0;

          const modernProfit =
            modern.valuation?.profit ??
            modern.marketValuation?.profit ??
            modern.vehicleValuation?.profit ??
            modern.profit ??
            item.netProfit ??
            item.profit ??
            0;

          const modernRoi =
            modern.valuation?.roi ??
            modern.marketValuation?.roi ??
            modern.vehicleValuation?.roi ??
            modern.roi ??
            item.netRoi ??
            item.roi ??
            0;

          const modernDecision = {
            ...(modern.decision || {}),
            summary: buildModernDecisionSummaryV2({
              action: modern.decision?.label || modern.decision?.action || "Observar mercado",
              decisionScore,
              opportunityScore,
              valuationScore:
                modern.valuation?.valuationScore ??
                modern.marketValuation?.valuationScore ??
                modern.vehicleValuation?.valuationScore ??
                0,
              roi: modernRoi,
              profit: modernProfit,
              discountPercent:
                modern.valuation?.discountPercent ??
                modern.marketValuation?.discountPercent ??
                modern.vehicleValuation?.discountPercent ??
                0,
              comparableCount:
                modern.valuation?.comparableCount ??
                modern.marketValuation?.comparableCount ??
                modern.vehicleValuation?.comparableCount ??
                0,
              valuationConfidence:
                modern.valuation?.valuationConfidence ??
                modern.marketValuation?.valuationConfidence ??
                modern.vehicleValuation?.confidence ??
                0,
            }),
          };

          return {
            ...item,
            ...modern,
            decision: modernDecision,
            netProfit: modernProfit,
            profit: modernProfit,
            netRoi: modernRoi,
            roi: modernRoi,
            opportunityScore,
            opportunityLevel,
            opportunitySignals: {
              ...(item.opportunitySignals || {}),
              opportunityScoreV3: modern.opportunity?.scoreV3 || 0,
              opportunityLevelV3: modern.opportunity?.opportunityLevelV3 || "",
              opportunityScoreV2: opportunityScore,
              opportunityLevelV2: opportunityLevel,
              decisionScore,
              decisionAction: modern.decision?.action || "",
              decisionLabel: modern.decision?.label || "",
              valuationScore:
                modern.valuation?.valuationScore ??
                modern.decision?.marketValuation?.valuationScore ??
                modern.marketValuation?.valuationScore ??
                0,
              comparableCount: modern.comparables?.totalComparables || 0,
              valuationConfidence: modern.vehicleValuation?.confidence || 0,
              executiveBuySignalScore: modern.executiveBuySignalScore || 0,
              marketTimingScore: modern.marketTimingScore || 0,
              capitalEfficiencyScore: modern.capitalEfficiencyScore || 0,
              timelineMomentumScore: modern.timelineMomentumScore || 0,
              successProbability: modern.successProbability || 0,
            },
            finalDecision: buildModernFinalDecision({
              legacyFinalDecision: item.finalDecision,
              modernDecision: modern.decision,
              opportunityScore,
              opportunityLevel,
              decisionScore,
              netProfit: modernProfit,
              netRoi: modernRoi,
              liquidityScore: item.liquidity?.liquidityScore,
              riskScore: modernDecision?.inventoryRiskScore ?? item.inventoryRiskScore ?? 0,
              riskLevel: modernDecision?.action || modernDecision?.label || "modern_decision",
            }),
          };
        })
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
      const modelSpecificFilter = {
        active: false,
        phase: "universal-real-feed",
        before: rawFeed.opportunities.length,
        after: opportunities.length,
        discarded: 0,
      };

      const nextFeed = {
        ...rawFeed,
        total: opportunities.length,
        opportunities,
        best,
        insights: buildRuntimeInsights(opportunities, rawFeed.sourceMode),
        realFeedDiagnostics: rawFeed.realFeedDiagnostics,
        modelSpecificFilter,
        modernPipeline,
        opportunityEnginePreview,
        opportunityEngineSummary: {
          total: opportunityEnginePreview.length,
          bestScore: opportunityEnginePreview[0]?.opportunityScore || 0,
          bestLevel: opportunityEnginePreview[0]?.opportunityLevel || "NONE",
          mode:
            rawFeed.sourceMode === "real-feed"
              ? "real-feed-pipeline-v2-ranking"
              : "real-feed-empty-pipeline-v2-ranking",
          pipeline: "master-opportunity-pipeline-v2",
          pipelineRecords: modernPipeline.totalRecords || 0,
          averageOpportunityScoreV2:
            modernPipeline.summary?.averageOpportunityScoreV2 || 0,
        },
      };

      if (!cancelled) {
        setMarketFeed(nextFeed);
      }

      saveBestRealOpportunityToMarketMemory({
        sourceMode: rawFeed.sourceMode,
        opportunities,
        scan,
        savedScanRef,
      }).catch((error) => {
        console.error("Error saving scanner opportunity:", error);
      });
    }

    buildFeed().catch((error) => {
      console.error("Error building enriched market feed:", error);

      if (!cancelled) {
        setMarketFeed({
          total: 0,
          opportunities: [],
          best: null,
          insights: [
            "No se ha podido completar el feed real. Revisa el diagnóstico técnico.",
          ],
          sourceMode: "real-feed-error",
          realFeedErrors: [String(error?.message || error)],
          realFeedDiagnostics: [],
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [form.query, form.maxBudget, scan, searchTriggered]);

  return marketFeed;
}

function buildModernDecisionSummaryV2({
  action,
  decisionScore,
  opportunityScore,
  valuationScore,
  roi,
  profit,
  discountPercent,
  comparableCount,
  valuationConfidence,
}) {
  return [
    `Decisión: ${action}.`,
    `Decision Score V2: ${Number(decisionScore || 0)}/100.`,
    `Opportunity Score V2: ${Number(opportunityScore || 0)}/100.`,
    `Valuation Score: ${Number(valuationScore || 0)}/100.`,
    `ROI estimado: ${Number(roi || 0).toFixed(2)}%.`,
    `Margen estimado: ${Math.round(Number(profit || 0))} €.`,
    `Descuento frente a valoración: ${Number(discountPercent || 0).toFixed(2)}%.`,
    `Comparables: ${Number(comparableCount || 0)}.`,
    `Confianza: ${Number(valuationConfidence || 0)}/100.`,
  ].join(" ");
}

function buildModernFinalDecision({
  legacyFinalDecision = {},
  modernDecision = null,
  opportunityScore = 0,
  opportunityLevel = "NONE",
  decisionScore = 0,
  netProfit = 0,
  netRoi = 0,
  liquidityScore = 0,
  riskScore = 0,
  riskLevel = "",
}) {
  const action = mapModernDecisionAction(modernDecision?.action);
  const label = modernDecision?.label || legacyFinalDecision?.label || "Vigilar";
  const finalScore = Number(decisionScore || opportunityScore || 0);

  return {
    ...(legacyFinalDecision || {}),
    finalScore,
    action,
    label,
    explanation: buildModernDecisionExplanation({
      label,
      finalScore,
      opportunityScore,
      opportunityLevel,
      modernDecision,
      netProfit,
      netRoi,
      liquidityScore,
      riskScore,
      riskLevel,
    }),
    userSummary: buildModernDecisionSummary({
      label,
      finalScore,
      netProfit,
      netRoi,
      liquidityScore,
      riskScore,
    }),
    modernDecision,
    modernPipelineEnabled: true,
  };
}

function buildModernDecisionExplanation({
  label,
  finalScore,
  opportunityScore,
  opportunityLevel,
  modernDecision,
  netProfit,
  netRoi,
  liquidityScore,
  riskScore,
  riskLevel,
}) {
  const modernSummary = modernDecision?.summary;

  if (modernSummary) {
    return modernSummary;
  }

  return [
    `${label}: decisión generada por Pipeline V2.`,
    `Decision Score: ${Number(finalScore || 0)}/100.`,
    `Opportunity Score V2: ${Number(opportunityScore || 0)}/100 (${opportunityLevel}).`,
    `Margen neto estimado: ${formatRuntimeMoney(netProfit)}.`,
    `ROI neto estimado: ${Number(netRoi || 0)}%.`,
    `Liquidez: ${Number(liquidityScore || 0)}/100.`,
    `Riesgo: ${riskLevel || "sin clasificar"} (${Number(riskScore || 0)}/100).`,
  ].join(" ");
}

function buildModernDecisionSummary({
  label,
  finalScore,
  netProfit,
  netRoi,
  liquidityScore,
  riskScore,
}) {
  return `${label}: score ${Number(finalScore || 0)}/100, margen ${formatRuntimeMoney(
    netProfit
  )}, ROI ${Number(netRoi || 0)}%, liquidez ${Number(
    liquidityScore || 0
  )}/100 y riesgo ${Number(riskScore || 0)}/100.`;
}

function formatRuntimeMoney(value) {
  return `${Number(value || 0).toLocaleString("es-ES")} €`;
}

function mapModernDecisionAction(action) {
  const normalized = String(action || "").toUpperCase();

  if (normalized === "BUY") return "CONTACTAR_PRIMERO";
  if (normalized === "WATCH") return "VIGILAR";
  if (normalized === "REJECT") return "DESCARTAR";

  return "VIGILAR";
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

  if (
    text.includes("electric") ||
    text.includes("electrico") ||
    text.includes("ev")
  ) {
    return "EV";
  }

  if (
    text.includes("diesel") ||
    text.includes("tdi") ||
    text.includes("dci") ||
    text.includes("hdi")
  ) {
    return "Diesel";
  }

  if (
    text.includes("gasolina") ||
    text.includes("petrol") ||
    text.includes("tfsi") ||
    text.includes("tsi")
  ) {
    return "Gasolina";
  }

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

function inferYear(item) {
  const directYear = Number(item.year || item.registrationYear);

  if (Number.isFinite(directYear) && directYear >= 2000 && directYear <= 2030) {
    return directYear;
  }

  const text = normalizeForModelRule([item.title, item.description].join(" "));
  const yearMatch = text.match(/\b(200[0-9]|201[0-9]|202[0-9])\b/);

  return yearMatch ? Number(yearMatch[1]) : NaN;
}

function inferMileage(item) {
  const directMileage = Number(
    item.km || item.mileage || item.mileageKm || item.mileage_km
  );

  if (
    Number.isFinite(directMileage) &&
    directMileage >= 0 &&
    directMileage <= 800000
  ) {
    return directMileage;
  }

  const text = normalizeForModelRule(
    [item.title, item.description, item.mileage].join(" ")
  );

  const kmMatch = text.match(/\b(\d{1,3}(?:\s?\d{3})|\d{4,6})\s?km\b/);
  if (!kmMatch) return NaN;

  return Number(String(kmMatch[1]).replace(/\s/g, ""));
}

function inferPrice(item) {
  const directPrice = Number(item.price || item.currentPrice || item.amount);

  if (
    Number.isFinite(directPrice) &&
    directPrice >= 1000 &&
    directPrice <= 500000
  ) {
    return directPrice;
  }

  const text = normalizeForModelRule([item.title, item.description].join(" "));
  const priceMatch = text.match(/\b(\d{4,6})\s?(eur|€|euro|euros)\b/);

  return priceMatch ? Number(priceMatch[1]) : NaN;
}

function isConfirmedMarketFeedIdentity(item = {}) {
  const identitySource = String(item.identitySource || "").toLowerCase();
  const sourceExtractor = String(item.sourceExtractor || "").toLowerCase();

  if (identitySource === "query-fallback") return false;
  if (identitySource === "search-fallback") return false;
  if (identitySource === "inherited") return false;

  const hasConfirmedIdentity =
    identitySource === "block" ||
    identitySource === "deepseek-extractor" ||
    sourceExtractor === "deepseek_edge_extractor";

  return Boolean(
    hasConfirmedIdentity &&
      item.isRealData === true &&
      item.brand &&
      item.model &&
      item.title &&
      item.price &&
      (item.km || item.mileage) &&
      item.year
  );
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
      isConfirmedMarketFeedIdentity(item) &&
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const payload = buildScannerOpportunityPayload({
    candidate: bestCandidate,
    scan,
  });

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
    if (sourceMode === "real-feed-empty") {
      return [
        "No hay oportunidades reales compatibles ahora mismo.",
        "El feed real respondió, pero ningún anuncio sobrevivió al parser y filtros actuales.",
        "Revisa el diagnóstico por fuente para saber si falló fetch, parser o compatibilidad.",
      ];
    }

    return ["No hay oportunidades suficientes para comparar."];
  }

  const best = opportunities[0];

  const sourceLabel =
    sourceMode === "real-feed"
      ? "Feed real experimental"
      : "Feed real sin oportunidades compatibles";

  return [
    `📡 Modo de datos: ${sourceLabel}.`,
    `💰 Margen neto estimado: ${best.netProfit.toLocaleString("es-ES")} €.`,
    `📊 ROI neto estimado: ${best.netRoi}%.`,
    `🧠 Valoración moderna: ${Number(best.valuation?.valuationScore ?? best.opportunitySignals?.valuationScore ?? 0)}/100.`,
    `⚡ Timing de mercado: ${Number(best.decision?.marketTimingScore ?? best.marketTimingScore ?? best.opportunitySignals?.marketTimingScore ?? 0)}/100.`,
    `🎯 Decisión moderna: ${best.decision?.label || best.decision?.action || best.opportunityLevel || "Pendiente"}.`,
    best.decision?.summary || "Pendiente de señal moderna suficiente.",
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