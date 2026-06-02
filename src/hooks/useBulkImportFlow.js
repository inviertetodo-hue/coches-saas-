import { useEffect, useMemo, useState } from "react";

import { buildApprovedBulkImport } from "../services/intelligence/approvedBulkImportEngine";
import { buildBulkUrlPreview } from "../services/intelligence/bulkUrlPreviewEngine";
import { buildMasterOpportunityPipeline } from "../services/intelligence/masterOpportunityPipelineEngine";
import { buildMemorySimulation } from "../services/intelligence/memorySimulationEngine";
import { buildProtectedMemorySave } from "../services/intelligence/protectedMemorySaveEngine";
import { createMemoryRepository } from "../services/intelligence/memoryRepository";
import { fetchRealMarketListings } from "../services/market/realMarketFeed";

const DEFAULT_URL =
  "https://www.autoscout24.es/lst/audi/a3?sort=standard&desc=0&ustate=N%2CU&atype=C&cy=E&damaged_listing=exclude&source=homepage_search-mask";

export function useBulkImportFlow() {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [preview, setPreview] = useState(null);
  const [approvedImport, setApprovedImport] = useState(null);
  const [memorySimulation, setMemorySimulation] = useState(null);
  const [savePlan, setSavePlan] = useState(null);
  const [saveResult, setSaveResult] = useState(null);
  const [memoryRecords, setMemoryRecords] = useState([]);
  const [isLoadingRealFeed, setIsLoadingRealFeed] = useState(false);
  const [realFeedResult, setRealFeedResult] = useState(null);

  const memoryRepository = useMemo(() => createMemoryRepository(), []);

  const currentOpportunityRecords = useMemo(() => {
    if (savePlan?.acceptedRecords?.length) {
      return savePlan.acceptedRecords;
    }

    if (memorySimulation?.records?.length) {
      return memorySimulation.records;
    }

    if (approvedImport?.approvedItems?.length) {
      return approvedImport.approvedItems;
    }

    return [];
  }, [approvedImport, memorySimulation, savePlan]);

  const opportunityPipeline = useMemo(
    () => buildMasterOpportunityPipeline(currentOpportunityRecords),
    [currentOpportunityRecords]
  );

  useEffect(() => {
    setMemoryRecords(memoryRepository.getAll());
  }, [memoryRepository]);

  function resetFlow() {
    setPreview(null);
    setApprovedImport(null);
    setMemorySimulation(null);
    setSavePlan(null);
    setSaveResult(null);
    setRealFeedResult(null);
  }

  async function handlePreview() {
    setIsLoadingRealFeed(true);
    resetFlow();

    try {
      const scan = buildScanFromUrl(url);
      const realResult = await fetchRealMarketListings(scan, {
        maxListings: 20,
      });

      const previewResult = buildBulkUrlPreview({
        url,
        source: detectSource(url),
        candidates: realResult.listings,
        limit: 20,
      });

      setRealFeedResult(realResult);
      setPreview({
        ...previewResult,
        insights: [...buildRealFeedInsights(realResult), ...previewResult.insights],
      });
    } catch (error) {
      const message = error?.message || "Error desconocido al recuperar el feed real.";

      setRealFeedResult({
        mode: "real-feed-error",
        listings: [],
        errors: [message],
        diagnostics: [],
      });

      setPreview(
        buildBulkUrlPreview({
          url,
          source: detectSource(url),
          candidates: [],
          limit: 20,
        })
      );
    } finally {
      setIsLoadingRealFeed(false);
    }
  }

  function handlePrepareApproved() {
    if (!preview) {
      return;
    }

    setApprovedImport(
      buildApprovedBulkImport({
        preview,
        maxItems: 50,
      })
    );
    setMemorySimulation(null);
    setSavePlan(null);
    setSaveResult(null);
  }

  function handleSimulateMemory() {
    if (!approvedImport) {
      return;
    }

    setMemorySimulation(
      buildMemorySimulation({
        approvedImport,
        maxRecords: 50,
      })
    );
    setSavePlan(null);
    setSaveResult(null);
  }

  function handlePrepareProtectedSave() {
    if (!approvedImport || !memorySimulation) {
      return;
    }

    setSavePlan(
      buildProtectedMemorySave({
        approvedImport,
        simulation: memorySimulation,
        minQuality: 70,
      })
    );
    setSaveResult(null);
  }

  function handleSaveToLocalMemory() {
    if (!savePlan?.canSave) {
      return;
    }

    const result = memoryRepository.saveMany(savePlan.acceptedRecords);

    setSaveResult({
      ...result,
      repositoryTotal: memoryRepository.count(),
    });

    setMemoryRecords(memoryRepository.getAll());
  }

  return {
    url,
    setUrl,
    preview,
    approvedImport,
    memorySimulation,
    savePlan,
    saveResult,
    memoryRecords,
    isLoadingRealFeed,
    realFeedResult,
    opportunityPipeline,
    handlePreview,
    handlePrepareApproved,
    handleSimulateMemory,
    handlePrepareProtectedSave,
    handleSaveToLocalMemory,
    canPrepareApproved: Boolean(preview),
    canSimulateMemory: Boolean(approvedImport),
    canPrepareProtectedSave: Boolean(memorySimulation),
    canSaveToLocalMemory: Boolean(savePlan?.canSave),
  };
}

function buildScanFromUrl(url) {
  const source = detectSource(url);
  const query = inferQueryFromUrl(url);

  return {
    query,
    maxBudget: 0,
    country: "España",
    semantic: {},
    searchLinks: [
      {
        source: source === "autoscout24" ? "AutoScout24" : source,
        country: "España",
        url,
      },
    ],
  };
}

function inferQueryFromUrl(url) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname
      .split("/")
      .map((part) => decodeURIComponent(part))
      .filter(Boolean);

    const blocked = new Set([
      "lst",
      "coches",
      "car",
      "cars",
      "vehiculo",
      "vehiculos",
      "anuncio",
      "offer",
    ]);

    const useful = parts
      .filter((part) => !blocked.has(part.toLowerCase()))
      .map((part) => part.replace(/-/g, " "))
      .filter(Boolean);

    if (useful.length >= 2) {
      return useful.slice(-2).join(" ");
    }

    if (useful.length === 1) {
      return useful[0];
    }

    return parsed.searchParams.get("q") || "búsqueda mercado";
  } catch {
    return "búsqueda mercado";
  }
}

function buildRealFeedInsights(realResult) {
  const listingsCount = realResult?.listings?.length || 0;
  const errorsCount = realResult?.errors?.length || 0;

  const insights = [
    `Feed real: ${listingsCount} anuncios detectados antes del filtro de calidad.`,
  ];

  if (errorsCount > 0) {
    insights.push(
      `Feed real con ${errorsCount} avisos técnicos. Se mantiene protección contra datos incompletos.`
    );
  }

  if (listingsCount === 0) {
    insights.push(
      "No se han extraído anuncios reales suficientes desde la fuente. No se usará fallback demo para proteger la memoria."
    );
  }

  return insights;
}

function detectSource(url) {
  const normalized = String(url || "").toLowerCase();

  if (normalized.includes("autoscout24")) return "autoscout24";
  if (normalized.includes("mobile.de")) return "mobile";

  return "unknown";
}
