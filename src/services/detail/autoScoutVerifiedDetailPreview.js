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

export function openAutoScoutVerifiedDetailPreviewWindow(preview = {}, options = {}) {
  if (typeof window === "undefined") {
    return {
      opened: false,
      reason: "window_unavailable",
      fallbackUrl: "",
    };
  }

  const html = String(preview?.html || "");
  const title = options.title || preview?.detail?.title || "Ficha enriquecida";

  if (!html) {
    return {
      opened: false,
      reason: "empty_html",
      fallbackUrl: "",
    };
  }

  const popup = window.open("", "_blank", "noopener,noreferrer,width=1280,height=900");

  if (popup) {
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    popup.document.title = title;

    return {
      opened: true,
      reason: "popup",
      fallbackUrl: "",
    };
  }

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const fallbackUrl = URL.createObjectURL(blob);

  window.open(fallbackUrl, "_blank", "noopener,noreferrer");

  return {
    opened: false,
    reason: "popup_blocked_blob_created",
    fallbackUrl,
  };
}
