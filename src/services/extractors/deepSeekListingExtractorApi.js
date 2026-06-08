import { supabase } from "../../lib/supabase";

export async function extractListingsWithDeepSeekApi(rawText = "", options = {}) {
  const text = String(rawText || "").trim();

  if (!text) {
    return {
      status: "empty",
      source: "deepseek_edge_extractor",
      listings: [],
      diagnostics: ["No hay texto bruto para extraer."],
      generatedAt: new Date().toISOString(),
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke(
      "deepseek-extract-listings",
      {
        body: {
          rawText: text,
          brand: options.brand || "",
          model: options.model || "",
          aiModel: options.aiModel || "deepseek-v4-flash",
          maxTokens: options.maxTokens || 2200,
          includeRawText: Boolean(options.includeRawText),
        },
      }
    );

    if (error) {
      return {
        status: "error",
        source: "deepseek_edge_extractor",
        listings: [],
        diagnostics: [error.message || "Error invocando DeepSeek Edge Function."],
        generatedAt: new Date().toISOString(),
      };
    }

    return {
      status: data?.status || "empty",
      source: data?.source || "deepseek_edge_extractor",
      totalListings: Number(data?.totalListings || 0),
      listings: Array.isArray(data?.listings) ? data.listings : [],
      diagnostics: Array.isArray(data?.diagnostics) ? data.diagnostics : [],
      usage: data?.usage || null,
      rawText: data?.rawText || "",
      generatedAt: data?.generatedAt || new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "error",
      source: "deepseek_edge_extractor",
      listings: [],
      diagnostics: [
        error?.message || "Error desconocido invocando DeepSeek Edge Function.",
      ],
      generatedAt: new Date().toISOString(),
    };
  }
}
