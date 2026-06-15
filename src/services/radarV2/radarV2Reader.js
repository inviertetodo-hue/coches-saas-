const DEFAULT_TIMEOUT_MS = 18000;

export function buildReaderUrl(url = "") {
  const cleanUrl = String(url || "").trim();

  if (!cleanUrl) {
    throw new Error("URL vacía.");
  }

  if (cleanUrl.startsWith("https://") || cleanUrl.startsWith("http://")) {
    return `https://r.jina.ai/${cleanUrl}`;
  }

  return `https://r.jina.ai/https://${cleanUrl}`;
}

export async function fetchReaderText(url = "", options = {}) {
  const timeoutMs = Number(options.timeoutMs || DEFAULT_TIMEOUT_MS);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const readerUrl = buildReaderUrl(url);
    const response = await fetch(readerUrl, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "text/plain",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();

    if (!text || text.length < 80) {
      throw new Error("Respuesta vacía o demasiado corta.");
    }

    return {
      ok: true,
      text,
      readerUrl,
      error: "",
    };
  } catch (error) {
    return {
      ok: false,
      text: "",
      readerUrl: safeBuildReaderUrl(url),
      error: error?.message || String(error),
    };
  } finally {
    clearTimeout(timer);
  }
}

function safeBuildReaderUrl(url = "") {
  try {
    return buildReaderUrl(url);
  } catch {
    return "";
  }
}

export async function fetchAutoscoutDirectUrlMap(url = "") {
  const directFetchUrl = buildAutoscoutDirectFetchUrl(url);
  if (!directFetchUrl) return new Map();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(directFetchUrl, {
      signal: controller.signal,
      headers: {
        "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
      },
    });

    if (!response.ok) return new Map();

    const html = await response.text();
    return extractAutoscoutDirectUrlMapFromHtml(html);
  } catch {
    return new Map();
  } finally {
    clearTimeout(timer);
  }
}

function buildAutoscoutDirectFetchUrl(url = "") {
  if (typeof window === "undefined") return "";

  try {
    const parsed = new URL(url);
    return `/autoscout-direct${parsed.pathname}${parsed.search}`;
  } catch {
    return "";
  }
}

function extractAutoscoutDirectUrlMapFromHtml(html = "") {
  const decoded = decodeHtml(String(html || ""));
  const map = new Map();

  const matches = [
    ...decoded.matchAll(/\/angebote\/[^"'\\\s<>{}]+?([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/gi),
  ];

  matches.forEach((match) => {
    const relativeUrl = String(match[0] || "").trim();
    const guid = String(match[1] || "").trim();

    if (guid && relativeUrl.startsWith("/angebote/")) {
      map.set(guid, `https://www.autoscout24.de${relativeUrl}`);
    }
  });

  return map;
}

function decodeHtml(value = "") {
  return String(value || "")
    .replace(/\\u002F/g, "/")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
