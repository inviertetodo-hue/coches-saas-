export function renderAutoScoutDetailCardHtml(result = {}) {
  const detail = result.detail || {};
  const images = Array.isArray(detail.images) ? detail.images : [];
  const equipment = Array.isArray(detail.equipment) ? detail.equipment : [];
  const verification = detail.verification || {};

  const title = detail.title || `${detail.brand || ""} ${detail.model || ""}`.trim() || "Ficha sin título";
  const heroImage = detail.imageUrl || images[0] || "";
  const galleryImages = images.slice(0, 18);

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      --bg: #070b14;
      --panel: #0f172a;
      --panel2: #111827;
      --text: #f8fafc;
      --muted: #94a3b8;
      --line: rgba(255,255,255,.10);
      --good: #22c55e;
      --warn: #f59e0b;
      --bad: #ef4444;
      --accent: #38bdf8;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background:
        radial-gradient(circle at top left, rgba(56,189,248,.18), transparent 34rem),
        radial-gradient(circle at top right, rgba(34,197,94,.12), transparent 30rem),
        var(--bg);
      color: var(--text);
      padding: 32px;
    }

    .shell {
      max-width: 1220px;
      margin: 0 auto;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: center;
      margin-bottom: 18px;
    }

    .eyebrow {
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: .16em;
      font-size: 12px;
      font-weight: 800;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 1px solid var(--line);
      background: rgba(15,23,42,.78);
      padding: 10px 14px;
      border-radius: 999px;
      color: var(--muted);
      font-size: 13px;
      white-space: nowrap;
    }

    .badge strong {
      color: ${verification.isVerifiedDetail ? "var(--good)" : "var(--warn)"};
    }

    .card {
      border: 1px solid var(--line);
      background: linear-gradient(145deg, rgba(15,23,42,.96), rgba(17,24,39,.92));
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 0 28px 90px rgba(0,0,0,.35);
    }

    .hero {
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) minmax(360px, .65fr);
      gap: 0;
      min-height: 500px;
    }

    .heroImage {
      position: relative;
      min-height: 500px;
      background: #020617;
    }

    .heroImage img {
      width: 100%;
      height: 100%;
      min-height: 500px;
      object-fit: cover;
      display: block;
    }

    .heroImage::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(2,6,23,.85), transparent 45%);
      pointer-events: none;
    }

    .photoCount {
      position: absolute;
      left: 20px;
      bottom: 20px;
      z-index: 2;
      background: rgba(2,6,23,.78);
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 999px;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 800;
    }

    .info {
      padding: 34px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 28px;
    }

    h1 {
      margin: 0;
      font-size: clamp(28px, 4vw, 46px);
      line-height: 1.02;
      letter-spacing: -.04em;
    }

    .subtitle {
      margin-top: 12px;
      color: var(--muted);
      font-size: 15px;
      line-height: 1.5;
    }

    .price {
      margin-top: 24px;
      font-size: 44px;
      line-height: 1;
      font-weight: 950;
      letter-spacing: -.05em;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .metric {
      border: 1px solid var(--line);
      background: rgba(2,6,23,.36);
      border-radius: 18px;
      padding: 16px;
    }

    .metric span {
      display: block;
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .08em;
      margin-bottom: 8px;
    }

    .metric strong {
      display: block;
      font-size: 18px;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 46px;
      padding: 0 18px;
      border-radius: 14px;
      text-decoration: none;
      font-weight: 900;
      border: 1px solid var(--line);
      color: var(--text);
      background: rgba(255,255,255,.06);
    }

    .button.primary {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: #03120a;
      border: 0;
    }

    .sections {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      padding: 22px;
    }

    .section {
      background: rgba(2,6,23,.32);
      border: 1px solid var(--line);
      border-radius: 22px;
      padding: 22px;
    }

    .section h2 {
      margin: 0 0 16px;
      font-size: 18px;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
    }

    .chip {
      background: rgba(56,189,248,.10);
      color: #bae6fd;
      border: 1px solid rgba(56,189,248,.22);
      padding: 8px 11px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 750;
    }

    .gallery {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 10px;
      padding: 0 22px 22px;
    }

    .gallery img {
      width: 100%;
      aspect-ratio: 4 / 3;
      object-fit: cover;
      border-radius: 14px;
      border: 1px solid var(--line);
      background: #020617;
    }

    .footerNote {
      color: var(--muted);
      font-size: 13px;
      line-height: 1.5;
      padding: 0 22px 24px;
    }

    @media (max-width: 900px) {
      body { padding: 16px; }
      .hero { grid-template-columns: 1fr; }
      .heroImage, .heroImage img { min-height: 320px; }
      .sections { grid-template-columns: 1fr; }
      .gallery { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .topbar { flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <div class="topbar">
      <div>
        <div class="eyebrow">Ficha individual verificada</div>
      </div>
      <div class="badge">
        Estado:
        <strong>${verification.isVerifiedDetail ? "Verificada" : "Pendiente"}</strong>
        · Quality ${numberOrDash(detail.qualityScore)}/100
      </div>
    </div>

    <article class="card">
      <section class="hero">
        <div class="heroImage">
          ${heroImage ? `<img src="${escapeAttr(heroImage)}" alt="${escapeAttr(title)}" />` : ""}
          <div class="photoCount">📸 ${images.length} fotos detectadas</div>
        </div>

        <div class="info">
          <div>
            <h1>${escapeHtml(title)}</h1>
            <div class="subtitle">
              ${escapeHtml([detail.location, detail.sellerName].filter(Boolean).join(" · ") || "Ficha extraída desde anuncio individual")}
            </div>
            <div class="price">${formatEuro(detail.price)}</div>
          </div>

          <div class="grid">
            ${metric("Año", detail.year || "-")}
            ${metric("Kilómetros", detail.km ? `${formatNumber(detail.km)} km` : "-")}
            ${metric("Combustible", detail.fuelType || "-")}
            ${metric("Potencia", detail.powerKw ? `${detail.powerKw} kW / ${detail.hp || "-"} cv` : "-")}
            ${metric("Cambio", detail.transmission || "-")}
            ${metric("Tracción", detail.drivetrain || "-")}
          </div>

          <div class="actions">
            <a class="button primary" href="${escapeAttr(detail.originalUrl || result.originalUrl || "#")}" target="_blank" rel="noreferrer">
              Abrir anuncio original
            </a>
            <span class="button">Validar oportunidad</span>
          </div>
        </div>
      </section>

      <section class="sections">
        <div class="section">
          <h2>Equipamiento detectado</h2>
          <div class="chips">
            ${(equipment.length ? equipment : ["Pendiente de extraer más equipamiento"])
              .map((item) => `<span class="chip">${escapeHtml(item)}</span>`)
              .join("")}
          </div>
        </div>

        <div class="section">
          <h2>Verificación</h2>
          <div class="chips">
            <span class="chip">Marca: ${escapeHtml(detail.brand || "-")}</span>
            <span class="chip">Modelo: ${escapeHtml(detail.model || "-")}</span>
            <span class="chip">Precio: ${detail.price ? "OK" : "Falta"}</span>
            <span class="chip">Km: ${detail.km ? "OK" : "Falta"}</span>
            <span class="chip">Año: ${detail.year ? "OK" : "Falta"}</span>
            <span class="chip">Fotos: ${images.length ? "OK" : "Falta"}</span>
          </div>
        </div>
      </section>

      <section class="gallery">
        ${galleryImages.map((url) => `<img src="${escapeAttr(url)}" alt="Foto vehículo" />`).join("")}
      </section>

      <div class="footerNote">
        Esta tarjeta es una prueba aislada. El Radar principal no se ha modificado.
        La decisión BUY/WATCH/REJECT debe ejecutarse solo cuando la ficha individual confirme identidad, precio, km y año.
      </div>
    </article>
  </main>
</body>
</html>`;
}

function metric(label, value) {
  return `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value ?? "-"))}</strong></div>`;
}

function formatEuro(value) {
  const number = Number(value || 0);

  if (!number) return "-";

  return `${number.toLocaleString("es-ES")} €`;
}

function formatNumber(value) {
  const number = Number(value || 0);

  if (!number) return "-";

  return number.toLocaleString("es-ES");
}

function numberOrDash(value) {
  const number = Number(value || 0);

  return Number.isFinite(number) ? number : "-";
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value = "") {
  return escapeHtml(value);
}
