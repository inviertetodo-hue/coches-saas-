const DEEPSEEK_CHAT_COMPLETIONS_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_DEEPSEEK_MODEL = "deepseek-v4-flash";

const ALLOWED_DEEPSEEK_MODELS = new Set([
  "deepseek-v4-flash",
  "deepseek-v4-pro",
]);

export async function callDeepSeekJson({
  systemPrompt = "",
  userPrompt = "",
  apiKey = "",
  model = DEFAULT_DEEPSEEK_MODEL,
  temperature = 0,
  maxTokens = 1800,
} = {}) {
  const resolvedApiKey = apiKey || getEnvValue("DEEPSEEK_API_KEY");

  if (!resolvedApiKey) {
    return {
      status: "missing_api_key",
      data: null,
      rawText: "",
      usage: null,
      diagnostics: [
        "DEEPSEEK_API_KEY no está configurada. Ejecuta: export DEEPSEEK_API_KEY='tu_clave'",
      ],
      generatedAt: new Date().toISOString(),
    };
  }

  const safeModel = ALLOWED_DEEPSEEK_MODELS.has(model)
    ? model
    : DEFAULT_DEEPSEEK_MODEL;

  try {
    const response = await fetch(DEEPSEEK_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resolvedApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: safeModel,
        temperature,
        max_tokens: maxTokens,
        response_format: {
          type: "json_object",
        },
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
    });

    const raw = await response.text();

    if (!response.ok) {
      return {
        status: "error",
        data: null,
        rawText: raw,
        usage: null,
        diagnostics: [
          `DeepSeek error ${response.status}`,
          raw.slice(0, 1200),
        ],
        generatedAt: new Date().toISOString(),
      };
    }

    const json = JSON.parse(raw);
    const rawText = json?.choices?.[0]?.message?.content || "";
    const data = parseJsonObject(rawText);

    return {
      status: data ? "ready" : "empty",
      data,
      rawText,
      usage: json?.usage || null,
      diagnostics: [
        `Modelo: ${safeModel}`,
        `Tokens input: ${json?.usage?.prompt_tokens ?? "n/d"}`,
        `Tokens output: ${json?.usage?.completion_tokens ?? "n/d"}`,
      ],
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      rawText: "",
      usage: null,
      diagnostics: [
        error?.message || "Error desconocido en DeepSeek",
      ],
      generatedAt: new Date().toISOString(),
    };
  }
}

function parseJsonObject(text = "") {
  const value = String(text || "").trim();

  try {
    return JSON.parse(value);
  } catch {}

  const first = value.indexOf("{");
  const last = value.lastIndexOf("}");

  if (first === -1 || last === -1 || last <= first) {
    return null;
  }

  try {
    return JSON.parse(value.slice(first, last + 1));
  } catch {
    return null;
  }
}

function getEnvValue(key) {
  if (typeof process !== "undefined" && process?.env?.[key]) {
    return process.env[key];
  }

  return "";
}
