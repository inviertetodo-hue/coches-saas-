const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

const DEFAULT_MODEL = "gpt-4.1-mini";

export async function runOpenAiScout(searchInput = {}, options = {}) {
  const apiKey =
    options.apiKey ||
    process.env.OPENAI_API_KEY ||
    "";

  if (!apiKey) {
    return {
      status: "missing_api_key",
      source: "openai_scout",
      candidates: [],
      normalizedListings: [],
      diagnostics: [
        "OPENAI_API_KEY no está configurada. Ejecuta: export OPENAI_API_KEY='tu_clave'",
      ],
      generatedAt: new Date().toISOString(),
    };
  }

  const model = options.model || process.env.OPENAI_SCOUT_MODEL || DEFAULT_MODEL;
  const maxCandidates = Number(options.maxCandidates || searchInput.maxCandidates || 12);

  const prompt = buildScoutPrompt(searchInput, maxCandidates);

  const startedAt = Date.now();

  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        tools: [
          {
            type: "web_search_preview",
          },
        ],
        input: prompt,
      }),
    });

    const raw = await response.text();

    if (!response.ok) {
      return {
        status: "error",
        source: "openai_scout",
        candidates: [],
        normalizedListings: [],
        diagnostics: [
          `OpenAI Scout error ${response.status}`,
          raw.slice(0, 1200),
        ],
        generatedAt: new Date().toISOString(),
      };
    }

    const json = JSON.parse(raw);
    const text = extractResponseText(json);
    const parsed = parseScoutJson(text);
    const candidates = Array.isArray(parsed?.candidates) ? parsed.candidates : [];

    const normalizedBeforeQualityGate = candidates.map((candidate, index) =>
      normalizeScoutCandidate(candidate, {
        index,
        searchInput,
      })
    );

    const rejectedByQualityGate = normalizedBeforeQualityGate.filter(
      (item) => !item.isValidScoutCandidate
    ).length;

    const normalizedListings = deduplicateScoutListings(
      normalizedBeforeQualityGate.filter((item) => item.isValidScoutCandidate)
    );

    return {
      status: normalizedListings.length > 0 ? "ready" : "empty",
      source: "openai_scout",
      mode: "openai-scout-v1",
      search: normalizeSearch(searchInput),
      totalCandidates: candidates.length,
      totalNormalized: normalizedListings.length,
      candidates,
      normalizedListings,
      diagnostics: [
        `Modelo: ${model}`,
        `Candidatos devueltos: ${candidates.length}`,
        `Candidatos rechazados por calidad: ${rejectedByQualityGate}`,
        `Candidatos normalizados únicos: ${normalizedListings.length}`,
        `Duración: ${Date.now() - startedAt} ms`,
      ],
      rawText: options.includeRawText ? text : "",
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "error",
      source: "openai_scout",
      candidates: [],
      normalizedListings: [],
      diagnostics: [
        error?.message || "Error desconocido en OpenAI Scout",
      ],
      generatedAt: new Date().toISOString(),
    };
  }
}

export function normalizeScoutCandidate(candidate = {}, context = {}) {
  const searchInput = context.searchInput || {};
  const index = Number(context.index || 0);

  const brand = cleanText(candidate.brand || searchInput.brand || "");
  const model = cleanText(candidate.model || searchInput.model || "");
  const title = cleanText(candidate.title || `${brand} ${model}`.trim());

  const price = toNumber(candidate.price);
  const year = toNumber(candidate.year);
  const km = toNumber(candidate.km ?? candidate.mileage);
  const hp = toNumber(candidate.hp ?? candidate.power);
  const estimatedSpainPrice = toNumber(candidate.estimatedSpainPrice);
  const grossMarginEstimate = toNumber(candidate.grossMarginEstimate);
  const scoutConfidence = clampScore(candidate.scoutConfidence ?? candidate.confidence);

  const sourceUrl = cleanText(candidate.sourceUrl || candidate.url || "");
  const sourceUrlQuality = assessSourceUrlQuality(sourceUrl);
  const country = cleanText(candidate.country || searchInput.country || "Germany");
  const fuelType = cleanText(candidate.fuelType || candidate.fuel || "");
  const sellerType = cleanText(candidate.sellerType || candidate.seller || "");

  const equipment = Array.isArray(candidate.equipment)
    ? candidate.equipment.map(cleanText).filter(Boolean).slice(0, 20)
    : [];

  const id = buildScoutId({
    sourceUrl,
    title,
    price,
    year,
    km,
    index,
  });

  const scoutFingerprint = buildScoutFingerprint({
    brand,
    model,
    title,
    price,
    year,
    km,
  });

  const isValidScoutCandidate = Boolean(
    brand &&
      model &&
      title &&
      price > 0 &&
      year > 0 &&
      km > 0 &&
      sourceUrl &&
      sourceUrlQuality === "reliable"
  );

  return {
    id,
    source: "openai_scout",
    sourceProvider: cleanText(candidate.source || "openai_web_search"),
    sourceUrl,
    url: sourceUrl,
    title,
    brand,
    model,
    price,
    year,
    km,
    mileage: km,
    fuelType,
    hp,
    country,
    location: cleanText(candidate.location || country),
    sellerType,
    equipment,
    estimatedSpainPrice,
    grossMarginEstimate,
    scoutConfidence,
    confidence: scoutConfidence,
    whyInteresting: cleanText(candidate.whyInteresting || ""),
    validationNotes: cleanText(candidate.validationNotes || ""),
    dataTruthStatus: "CANDIDATE_UNVERIFIED",
    verificationLevel: "OPENAI_SCOUT_REQUIRES_URL_CHECK",
    sourceUrlQuality,
    scoutFingerprint,
    memoryEligible: false,
    isValidScoutCandidate,
    createdAt: new Date().toISOString(),
  };
}

function buildScoutPrompt(searchInput = {}, maxCandidates = 12) {
  const search = normalizeSearch(searchInput);

  return `
Actúa como recolector de oportunidades de coches para un SaaS especializado en compra para reventa en España.

Busca candidatos reales actuales en la web.

OBJETIVO:
- Marca: ${search.brand}
- Modelo: ${search.model}
- País preferente: ${search.country}
- Año mínimo: ${search.minYear}
- Precio máximo: ${search.maxPrice} EUR
- Km máximo preferente: ${search.maxKm}
- Objetivo: reventa en España
- Máximo candidatos: ${maxCandidates}

REGLAS CRÍTICAS:
- Devuelve SOLO JSON válido.
- Prohibido inventar, construir o aproximar URLs.
- Cada candidato debe tener una URL real encontrada durante la búsqueda.
- No uses URLs con IDs ficticios, search_id inventado, ejemplos, placeholders o patrones secuenciales.
- Si no tienes URL real verificable, no incluyas el candidato.
- Si un dato no está claro, usa null.
- Prioriza anuncios con precio, año, km, motor, país y fuente verificable.
- No decidas BUY/WATCH/REJECT. Solo recolecta candidatos.
- No metas explicaciones fuera del JSON.

FORMATO EXACTO:
{
  "candidates": [
    {
      "brand": "BMW",
      "model": "X5",
      "title": "BMW X5 xDrive30d M Sport",
      "price": 44665,
      "year": 2021,
      "km": 99998,
      "fuelType": "Diesel",
      "hp": 286,
      "country": "Germany",
      "location": "Germany",
      "sellerType": "dealer",
      "source": "AutoScout24",
      "sourceUrl": "https://...",
      "equipment": ["M Sport", "HUD", "ACC"],
      "estimatedSpainPrice": 49000,
      "grossMarginEstimate": 4335,
      "scoutConfidence": 80,
      "whyInteresting": "Precio competitivo para reventa en España.",
      "validationNotes": "Verificar historial, IVA, daños y equipamiento real."
    }
  ]
}
`.trim();
}

function normalizeSearch(searchInput = {}) {
  return {
    brand: cleanText(searchInput.brand || "BMW"),
    model: cleanText(searchInput.model || "X5"),
    country: cleanText(searchInput.country || "Germany"),
    minYear: toNumber(searchInput.minYear || searchInput.yearFrom || 2020),
    maxPrice: toNumber(searchInput.maxPrice || searchInput.maxBudget || 60000),
    maxKm: toNumber(searchInput.maxKm || searchInput.maxMileage || 130000),
  };
}

function extractResponseText(response = {}) {
  if (typeof response.output_text === "string") {
    return response.output_text;
  }

  const chunks = [];

  for (const item of response.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") {
        chunks.push(content.text);
      }
    }
  }

  return chunks.join("\\n").trim();
}

function parseScoutJson(text = "") {
  const trimmed = String(text || "").trim();

  try {
    return JSON.parse(trimmed);
  } catch {}

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return { candidates: [] };
  }

  try {
    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
  } catch {
    return { candidates: [] };
  }
}

function buildScoutId({ sourceUrl, title, price, year, km, index }) {
  const raw = [
    sourceUrl,
    title,
    price,
    year,
    km,
    index,
  ]
    .join("|")
    .toLowerCase();

  let hash = 0;

  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }

  return `openai-scout-${Math.abs(hash)}`;
}

function deduplicateScoutListings(listings = []) {
  const seen = new Set();
  const uniqueListings = [];

  for (const item of listings) {
    const key = item.scoutFingerprint || item.sourceUrl || item.id;

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    uniqueListings.push(item);
  }

  return uniqueListings;
}

function buildScoutFingerprint({ brand, model, title, price, year, km }) {
  return [
    cleanText(brand).toLowerCase(),
    cleanText(model).toLowerCase(),
    cleanText(title).toLowerCase().replace(/\s+/g, " "),
    Number(price || 0),
    Number(year || 0),
    Number(km || 0),
  ].join("|");
}

function assessSourceUrlQuality(sourceUrl = "") {
  const url = cleanText(sourceUrl);
  const lowerUrl = url.toLowerCase();

  if (!url) return "missing";
  if (!lowerUrl.startsWith("http")) return "suspicious";

  const fakePatterns = [
    "1234567890",
    "2345678901",
    "3456789012",
    "4567890123",
    "5678901234",
    "example.com",
    "placeholder",
    "fake",
    "dummy",
  ];

  if (fakePatterns.some((pattern) => lowerUrl.includes(pattern))) {
    return "suspicious";
  }

  if (lowerUrl.includes("search_id=")) {
    return "suspicious";
  }

  return "reliable";
}

function cleanText(value) {
  return String(value ?? "").trim();
}

function toNumber(value) {
  const numericValue = Number(
    String(value ?? "")
      .replace(/[€,.\\s]/g, (match) => (match === "," ? "." : ""))
      .replace(/[^0-9.-]/g, "")
  );

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return numericValue;
}

function clampScore(value) {
  const numericValue = toNumber(value);
  return Math.max(0, Math.min(100, Math.round(numericValue)));
}
