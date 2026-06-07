import { supabase } from "../../lib/supabase";
import { buildImportFlowDraft } from "../import/importFlowEngine";

export async function readListingFromUrl(url) {
  const cleanUrl = String(url || "").trim();

  if (!cleanUrl) {
    return {
      success: false,
      error: "URL_REQUIRED",
      message: "No hay URL para leer.",
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke("scrape-car", {
      body: {
        url: cleanUrl,
      },
    });

    if (error) {
      return buildFallbackListing({
        url: cleanUrl,
        error: "EDGE_FUNCTION_ERROR",
        message:
          "mobile.de ha bloqueado la lectura automática. Se han usado datos detectados desde la URL.",
      });
    }

    if (!data?.success) {
      return buildFallbackListing({
        url: cleanUrl,
        blocked: Boolean(data?.blocked),
        error: data?.error || "SCRAPE_FAILED",
        message:
          data?.message ||
          "mobile.de ha bloqueado la lectura automática. Se han usado datos detectados desde la URL.",
      });
    }

    const fallbackDraft = buildImportFlowDraft({
      url: cleanUrl,
    });

    return {
      success: true,
      fallback: false,
      blocked: false,
      data: {
        title:
          cleanString(data?.data?.title) ||
          fallbackDraft.title ||
          "",
        brand: fallbackDraft.brand || "",
        model: fallbackDraft.model || "",
        fuel_type: fallbackDraft.fuel_type || "",
        externalId: fallbackDraft.externalId || "",
        price: cleanNumberString(data?.data?.price),
        km: cleanNumberString(data?.data?.km),
        year: cleanNumberString(data?.data?.year),
        country: data?.data?.country || "Alemania",
        url: cleanUrl,
      },
      warning: data?.warning || null,
      message:
        data?.warning ||
        fallbackDraft.userMessage ||
        "Anuncio leído correctamente.",
    };
  } catch {
    return buildFallbackListing({
      url: cleanUrl,
      error: "UNEXPECTED_ERROR",
      message:
        "No se ha podido leer el anuncio automáticamente. Se han usado datos detectados desde la URL.",
    });
  }
}

function buildFallbackListing({
  url,
  blocked = true,
  error = "SCRAPE_BLOCKED",
  message = "",
}) {
  const draft = buildImportFlowDraft({
    url,
  });

  const hasAnyDetectedData =
    Boolean(draft.title) ||
    Boolean(draft.brand) ||
    Boolean(draft.model) ||
    Boolean(draft.fuel_type) ||
    Boolean(draft.externalId);

  return {
    success: hasAnyDetectedData,
    fallback: true,
    blocked,
    error,
    message:
      message ||
      draft.userMessage ||
      "Añade precio, kilómetros y año para completar el análisis.",
    data: {
      title: draft.title || "",
      brand: draft.brand || "",
      model: draft.model || "",
      fuel_type: draft.fuel_type || "",
      externalId: draft.externalId || "",
      price: "",
      km: "",
      year: "",
      country: "Alemania",
      url,
    },
    warning:
      "Lectura automática bloqueada. Se ha usado fallback semántico desde la URL.",
    missingFields: draft.missingFields || [],
    confidence: draft.confidence || 0,
  };
}

function cleanString(value) {
  return String(value || "").trim();
}

function cleanNumberString(value) {
  return String(value || "")
    .replace(/[^\d]/g, "")
    .trim();
}