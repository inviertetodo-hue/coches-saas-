import { extractListingsFromText } from "./radarV2Extractor";
import { applyRadarV2Gate } from "./radarV2Gate";
import { buildReaderUrl, fetchAutoscoutDirectUrlMap, fetchReaderText } from "./radarV2Reader";
import { normalizeText } from "./radarV2Utils";

const MAX_LINKS_TO_TRY = 6;

export async function fetchRadarV2MarketListings(scan = {}, options = {}) {
  const maxListings = Number(options.maxListings || 30);
  const searchLinks = Array.isArray(scan.searchLinks) ? scan.searchLinks : [];

  if (searchLinks.length === 0) {
    return {
      mode: "real-feed-empty",
      engine: "radar-v2",
      listings: [],
      candidates: [],
      rejected: [],
      diagnostics: [],
      errors: ["No hay enlaces de búsqueda disponibles."],
    };
  }

  const diagnostics = [];
  const errors = [];
  const allCandidates = [];
  const allRejected = [];

  for (const link of searchLinks.slice(0, MAX_LINKS_TO_TRY)) {
    const startedAt = Date.now();
    const source = link.source || "Fuente";
    const country = link.country || scan.country || "Europa";
    const originalUrl = link.url || "";
    const readerUrl = safeBuildReaderUrl(originalUrl);

    try {
      const reader = await fetchReaderText(originalUrl);
      const directMap = normalizeText(source).includes("autoscout")
        ? await fetchAutoscoutDirectUrlMap(originalUrl)
        : new Map();

      if (!reader.ok) {
        errors.push(`${source} ${country}: ${reader.error}`);
        diagnostics.push(buildDiagnostic({
          source,
          country,
          status: "error",
          originalUrl,
          readerUrl: reader.readerUrl || readerUrl,
          textLength: 0,
          elapsedMs: Date.now() - startedAt,
          candidates: [],
          verified: [],
          pending: [],
          rejected: [],
          error: reader.error,
          directMap,
        }));
        continue;
      }

      const extracted = extractListingsFromText({
        text: reader.text,
        source,
        country,
        query: scan.query,
        sourceSearchUrl: originalUrl,
        autoscoutDirectUrlMap: directMap,
      });

      const classified = extracted.map((candidate) => applyRadarV2Gate(candidate, scan));
      const verified = classified.filter((item) => item.verificationStatus === "VERIFIED");
      const pending = classified.filter((item) => item.verificationStatus === "CANDIDATE");
      const rejected = classified.filter((item) => item.verificationStatus === "REJECTED");

      allCandidates.push(...pending, ...verified);
      allRejected.push(...rejected);

      diagnostics.push(buildDiagnostic({
        source,
        country,
        status: verified.length > 0 ? "success" : "no-results",
        originalUrl,
        readerUrl: reader.readerUrl || readerUrl,
        textLength: reader.text.length,
        elapsedMs: Date.now() - startedAt,
        candidates: classified,
        verified,
        pending,
        rejected,
        error: "",
        directMap,
      }));
    } catch (error) {
      const message = error?.message || String(error);
      errors.push(`${source} ${country}: ${message}`);
      diagnostics.push(buildDiagnostic({
        source,
        country,
        status: "error",
        originalUrl,
        readerUrl,
        textLength: 0,
        elapsedMs: Date.now() - startedAt,
        candidates: [],
        verified: [],
        pending: [],
        rejected: [],
        error: message,
        directMap: new Map(),
      }));
    }
  }

  const verifiedListings = allCandidates
    .filter((item) => item.verificationStatus === "VERIFIED" && item.canScore)
    .slice(0, maxListings)
    .map(toLegacyListing);

  return {
    mode: verifiedListings.length > 0 ? "real-feed" : "real-feed-empty",
    engine: "radar-v2",
    listings: verifiedListings,
    candidates: allCandidates,
    rejected: allRejected,
    diagnostics,
    errors,
    summary: buildSummary({ listings: verifiedListings, candidates: allCandidates, rejected: allRejected }),
  };
}

function toLegacyListing(item = {}) {
  return {
    ...item,
    url: item.originalUrl || item.url || "",
    sourceUrl: item.originalUrl || item.url || "",
    isRealData: true,
    dataQuality: {
      hasPrice: Boolean(item.price),
      hasMileage: Boolean(item.mileage || item.km),
      hasYear: Boolean(item.year),
      hasPower: Boolean(item.powerKw),
      hasImage: Boolean(item.imageUrl),
      hasOriginalUrl: Boolean(item.originalUrl || item.url),
      identityConfirmed: item.identitySource === "block",
      sourceFormat: item.sourceFormat || "radar-v2",
      verificationStatus: item.verificationStatus,
    },
    semanticScore: 100,
    semanticWarnings: item.verificationWarnings || [],
  };
}

function buildDiagnostic({
  source,
  country,
  status,
  originalUrl,
  readerUrl,
  textLength,
  elapsedMs,
  candidates,
  verified,
  pending,
  rejected,
  error,
  directMap,
}) {
  const rejectionReasons = [...pending, ...rejected]
    .flatMap((item) => [
      ...(item.verificationReasons || []),
      ...(item.verificationWarnings || []),
    ])
    .filter(Boolean);

  const reasonCounts = countValues(rejectionReasons);
  const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

  const directUrlsTotal = candidates.filter((item) => normalizeText(source).includes("autoscout")).length;
  const directUrlsFound = candidates.filter((item) => item.originalUrl || item.url).length;
  const directUrlCoveragePercent = directUrlsTotal > 0
    ? Math.round((directUrlsFound / directUrlsTotal) * 100)
    : 0;

  const sourceSummary = buildSourceSummary({
    candidates,
    verified,
    pending,
    rejected,
    topReason,
    reasonCounts,
    error,
  });

  return {
    source,
    country,
    status,
    originalUrl,
    readerUrl,
    chars: textLength,
    textLength,
    parsed: verified.length,
    realResults: verified.length,
    totalCandidates: candidates.length,
    candidates: candidates.length,
    verified: verified.length,
    pending: pending.length,
    rejected: pending.length + rejected.length,
    blocks: candidates.length,
    accepted: verified.length,
    noData: rejected.filter((item) => (item.verificationReasons || []).some((reason) => reason.startsWith("missing_"))).length,
    incompatible: pending.length + rejected.length,
    directUrlsFound,
    directUrlsTotal,
    directUrlCoveragePercent,
    directUrlMapSize: directMap?.size || 0,
    topRejectionReason: topReason,
    sourceSummary,
    error,
    rejectionLog: {
      totalBlocks: candidates.length,
      accepted: verified.length,
      noData: rejected.filter((item) => (item.verificationReasons || []).some((reason) => reason.startsWith("missing_"))).length,
      incompatible: pending.length + rejected.length,
      incompatibleReasons: rejectionReasons,
      reasonCounts,
      genericTitle: 0,
    },
  };
}

function buildSourceSummary({ candidates, verified, pending, rejected, topReason, reasonCounts, error }) {
  if (error) return error;

  if (verified.length > 0) {
    return `${verified.length} anuncios verificados listos para valorar. ${pending.length} candidatos pendientes y ${rejected.length} rechazados por filtros/calidad.`;
  }

  if (candidates.length === 0) {
    return "No se detectaron anuncios estructurados en el texto recibido.";
  }

  const reasons = Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([reason, count]) => `${reason} (${count})`)
    .join(", ");

  return `${candidates.length} candidatos detectados, pero ninguno verificado para scoring. Motivo dominante: ${topReason || "sin_dato"}. ${reasons ? `Motivos: ${reasons}` : ""}`;
}

function buildSummary({ listings, candidates, rejected }) {
  if (listings.length > 0) {
    return `Radar V2 detectó ${listings.length} anuncios verificados y ${candidates.length} candidatos totales.`;
  }

  return `Radar V2 detectó ${candidates.length} candidatos, pero ninguno cumple verificación completa para BUY/scoring. Rechazados o pendientes: ${rejected.length}.`;
}

function countValues(values = []) {
  return values.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function safeBuildReaderUrl(url) {
  try {
    return buildReaderUrl(url);
  } catch {
    return "";
  }
}
