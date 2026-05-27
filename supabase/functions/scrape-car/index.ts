const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function cleanText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html: string) {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
  if (!titleMatch) return "";

  return cleanText(titleMatch[1])
    .replace(" | mobile.de", "")
    .replace(" | AutoScout24", "")
    .trim();
}

function extractPrice(html: string) {
  const priceMatch = html.match(/(\d{1,3}(?:[.\s]\d{3})*)\s?€/);

  if (!priceMatch) return "";

  return priceMatch[1].replace(/[.\s]/g, "");
}

function extractKm(html: string) {
  const kmMatch = html.match(/(\d{1,3}(?:[.\s]\d{3})*)\s?km/i);

  if (!kmMatch) return "";

  return kmMatch[1].replace(/[.\s]/g, "");
}

function extractYear(html: string) {
  const yearMatch = html.match(/\b(20[0-2][0-9]|19[8-9][0-9])\b/);

  if (!yearMatch) return "";

  return yearMatch[1];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const url = body?.url;

    if (!url) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "URL_REQUIRED",
          message: "Falta la URL del anuncio",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8,de;q=0.7",
      },
    });

    const html = await response.text();

    const title = extractTitle(html);
    const price = extractPrice(html);
    const km = extractKm(html);
    const year = extractYear(html);

    return new Response(
      JSON.stringify({
        success: true,
        source: "scrape-car-light-v1",
        data: {
          title,
          price,
          km,
          year,
          country: "Alemania",
          url,
        },
        warning:
          !price || !km || !year
            ? "Extracción parcial. Revisa los campos antes de analizar."
            : null,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "SCRAPE_ERROR",
        message: String(error),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});