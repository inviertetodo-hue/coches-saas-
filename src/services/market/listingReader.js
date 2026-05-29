import { supabase } from "../../lib/supabase";

export async function readListingFromUrl(url) {
  console.log("LISTING READER START", url);

  const cleanUrl = String(url || "").trim();

  if (!cleanUrl) {
    console.log("LISTING READER ERROR", "URL_REQUIRED");

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

    console.log("LISTING READER RESPONSE", data);
    console.log("LISTING READER SUPABASE ERROR", error);

    if (error) {
      return {
        success: false,
        error: "EDGE_FUNCTION_ERROR",
        message: "No se ha podido leer el anuncio automáticamente.",
      };
    }

    if (!data?.success) {
      return {
        success: false,
        blocked: Boolean(data?.blocked),
        error: data?.error || "SCRAPE_FAILED",
        message:
          data?.message ||
          "No se han podido extraer datos automáticos del anuncio.",
      };
    }

    return {
      success: true,
      data: {
        title: cleanString(data?.data?.title),
        price: cleanNumberString(data?.data?.price),
        km: cleanNumberString(data?.data?.km),
        year: cleanNumberString(data?.data?.year),
        country: data?.data?.country || "Alemania",
        url: cleanUrl,
      },
      warning: data?.warning || null,
    };
  } catch (error) {
    console.log("LISTING READER UNEXPECTED ERROR", error);

    return {
      success: false,
      error: "UNEXPECTED_ERROR",
      message: "Error inesperado leyendo el anuncio.",
    };
  }
}

function cleanString(value) {
  return String(value || "").trim();
}

function cleanNumberString(value) {
  return String(value || "")
    .replace(/[^\d]/g, "")
    .trim();
}