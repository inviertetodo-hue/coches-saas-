import { extractAutoScoutDetailFromUrl } from "./autoScoutDetailExtractor.js";
import { renderAutoScoutDetailCardHtml } from "./autoScoutDetailCardHtml.js";

export function isAutoScoutIndividualListingUrl(url = "") {
  try {
    const parsed = new URL(String(url || "").trim());
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();

    return (
      host.includes("autoscout24.") &&
      (
        path.includes("/angebote/") ||
        path.includes("/aanbod/") ||
        path.includes("/offerta/") ||
        path.includes("/anuncio/") ||
        path.includes("/annunci/")
      )
    );
  } catch {
    return false;
  }
}

export async function buildAutoScoutVerifiedDetailPreview(url = "", options = {}) {
  const originalUrl = String(url || "").trim();

  if (!isAutoScoutIndividualListingUrl(originalUrl)) {
    return {
      status: "invalid_url",
      originalUrl,
      html: "",
      result: null,
      detail: null,
      diagnostics: [
        "La URL no parece una ficha individual de AutoScout24.",
        "Debe ser una URL tipo /angebote/, /aanbod/, /offerta/ o similar.",
      ],
      extractedAt: new Date().toISOString(),
      isVerifiedDetail: false,
      canShowAsDetailCard: false,
      canScoreAsOpportunity: false,
    };
  }

  const result = await extractAutoScoutDetailFromUrl(originalUrl, {
    includeRawText: Boolean(options.includeRawText),
    timeoutMs: options.timeoutMs,
  });

  const detail = result.detail || null;
  const html = renderAutoScoutDetailCardHtml(result);

  return {
    status: result.status,
    originalUrl,
    html,
    result,
    detail,
    diagnostics: result.diagnostics || [],
    extractedAt: new Date().toISOString(),
    isVerifiedDetail: Boolean(detail?.verification?.isVerifiedDetail),
    canShowAsDetailCard: Boolean(detail?.verification?.canShowAsDetailCard),
    canScoreAsOpportunity: Boolean(detail?.verification?.canScoreAsOpportunity),
  };
}

export function openAutoScoutVerifiedDetailPreviewWindow(preview = {}) {
  if (typeof window === "undefined") {
    return {
      opened: false,
      reason: "window_unavailable",
      fallbackUrl: "",
    };
  }

  const html = String(preview?.html || "");

  if (!html) {
    return {
      opened: false,
      reason: "empty_html",
      fallbackUrl: "",
    };
  }

  const blob = new Blob([html], {
    type: "text/html;charset=utf-8",
  });

  const blobUrl = URL.createObjectURL(blob);

  const openedWindow = window.open(blobUrl, "_blank");

  if (openedWindow) {
    try {
      openedWindow.opener = null;
    } catch {
      // Algunos navegadores no permiten modificar opener. No afecta a la ficha.
    }

    window.setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 60000);

    return {
      opened: true,
      reason: "blob_url",
      fallbackUrl: blobUrl,
    };
  }

  return {
    opened: false,
    reason: "popup_blocked",
    fallbackUrl: blobUrl,
  };
}
