import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "URL NO ENVIADA",
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          status: 400,
        }
      );
    }

    console.log("SCRAPING URL:", url);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
      },
    });

    const html = await response.text();

    console.log("HTML LENGTH:", html.length);

    return new Response(
      JSON.stringify({
        ok: true,
        htmlLength: html.length,
        preview: html.substring(0, 500),
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.log(error);

    return new Response(
      JSON.stringify({
        ok: false,
        error: error.message,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});