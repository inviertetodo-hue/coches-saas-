import { useEffect, useMemo, useState } from "react";
import {
  buildAutoScoutVerifiedDetailPreview,
  isAutoScoutIndividualListingUrl,
  openAutoScoutVerifiedDetailPreviewWindow,
} from "../../services/detail/autoScoutVerifiedDetailPreview.js";

const previewCache = new Map();

export default function VerifiedAutoScoutInlineCard({
  url = "",
  opportunity = {},
  enabled = false,
}) {
  const normalizedUrl = String(url || "").trim();

  const canLoad = useMemo(() => {
    return enabled && isAutoScoutIndividualListingUrl(normalizedUrl);
  }, [enabled, normalizedUrl]);

  const [state, setState] = useState({
    loading: false,
    loaded: false,
    error: "",
    preview: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadPreview() {
      if (!canLoad) return;

      if (previewCache.has(normalizedUrl)) {
        setState({
          loading: false,
          loaded: true,
          error: "",
          preview: previewCache.get(normalizedUrl),
        });
        return;
      }

      setState({
        loading: true,
        loaded: false,
        error: "",
        preview: null,
      });

      try {
        const preview = await buildAutoScoutVerifiedDetailPreview(normalizedUrl);

        previewCache.set(normalizedUrl, preview);

        if (!cancelled) {
          setState({
            loading: false,
            loaded: true,
            error: "",
            preview,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            loading: false,
            loaded: false,
            error: error?.message || "No se pudo enriquecer la ficha.",
            preview: null,
          });
        }
      }
    }

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [canLoad, normalizedUrl]);

  if (!enabled || !normalizedUrl) return null;

  if (!canLoad) {
    return (
      <div style={pendingStyle}>
        Candidato pendiente de ficha individual verificada.
      </div>
    );
  }

  if (state.loading) {
    return (
      <section style={cardStyle}>
        <div style={loadingHeroStyle}>📸 Cargando ficha visual verificada...</div>

        <div style={loadingInfoStyle}>
          <strong>Verificando TOP 1</strong>
          <span>Extrayendo fotos, año, km, precio y datos reales del anuncio individual.</span>
        </div>
      </section>
    );
  }

  if (state.error) {
    return (
      <div style={errorStyle}>
        No se pudo enriquecer la ficha automáticamente. Puedes abrir el anuncio original.
      </div>
    );
  }

  const preview = state.preview;
  const detail = preview?.detail;

  if (!detail) return null;

  const images = Array.isArray(detail.images) ? detail.images : [];
  const heroImage = detail.imageUrl || images[0] || "";
  const displayTitle =
    opportunity.title ||
    [detail.brand, detail.model].filter(Boolean).join(" ") ||
    detail.title ||
    "Ficha verificada";
  const price = Number(detail.price || opportunity.price || 0);
  const km = Number(detail.km || detail.mileage || opportunity.km || opportunity.mileage || 0);
  const year = Number(detail.year || opportunity.year || 0);
  const verified = Boolean(detail.verification?.isVerifiedDetail);

  function openFullCard() {
    openAutoScoutVerifiedDetailPreviewWindow(preview);
  }

  return (
    <section style={cardStyle}>
      <div style={heroStyle}>
        {heroImage ? (
          <img src={heroImage} alt={displayTitle} style={heroImageStyle} />
        ) : (
          <div style={loadingHeroStyle}>Sin foto</div>
        )}

        <div style={photoBadgeStyle}>📸 {images.length} fotos</div>

        <div style={verifiedBadgeStyle}>
          {verified ? "✅ Verificada" : "⚠️ Revisar"} · Quality {detail.qualityScore || 0}/100
        </div>
      </div>

      <div style={infoStyle}>
        <p style={eyebrowStyle}>TOP 1 · ficha enriquecida</p>

        <h3 style={titleStyle}>{displayTitle}</h3>

        <div style={priceStyle}>{price ? `${price.toLocaleString("es-ES")} €` : "-"}</div>

        <div style={gridStyle}>
          <Mini label="Año" value={year || "-"} />
          <Mini label="Kilómetros" value={km ? `${km.toLocaleString("es-ES")} km` : "-"} />
          <Mini label="Combustible" value={detail.fuelType || "-"} />
          <Mini
            label="Potencia"
            value={detail.powerKw ? `${detail.powerKw} kW / ${detail.hp || "-"} cv` : "-"}
          />
          <Mini label="Cambio" value={detail.transmission || "-"} />
          <Mini label="Tracción" value={detail.drivetrain || "-"} />
        </div>

        <div style={chipsStyle}>
          {(detail.equipment || []).slice(0, 8).map((item) => (
            <span key={item} style={chipStyle}>{item}</span>
          ))}
        </div>

        <div style={actionsStyle}>
          {normalizedUrl ? (
            <a
              href={normalizedUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={primaryButtonStyle}
            >
              Abrir anuncio original
            </a>
          ) : null}

          <button type="button" onClick={openFullCard} style={secondaryButtonStyle}>
            Ver ficha completa
          </button>
        </div>
      </div>
    </section>
  );
}

function Mini({ label, value }) {
  return (
    <div style={miniStyle}>
      <span style={miniLabelStyle}>{label}</span>
      <strong style={miniValueStyle}>{value}</strong>
    </div>
  );
}

const cardStyle = {
  marginTop: "16px",
  marginBottom: "18px",
  borderRadius: "24px",
  overflow: "hidden",
  border: "1px solid rgba(56,189,248,0.28)",
  background: "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(8,47,73,0.72))",
  boxShadow: "0 24px 70px rgba(2,6,23,0.34)",
};

const heroStyle = {
  position: "relative",
  minHeight: "280px",
  background: "rgba(2,6,23,0.8)",
};

const heroImageStyle = {
  width: "100%",
  height: "320px",
  objectFit: "cover",
  display: "block",
};

const photoBadgeStyle = {
  position: "absolute",
  left: "14px",
  bottom: "14px",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(2,6,23,0.78)",
  border: "1px solid rgba(255,255,255,0.18)",
  color: "white",
  fontSize: "12px",
  fontWeight: "900",
};

const verifiedBadgeStyle = {
  position: "absolute",
  right: "14px",
  top: "14px",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(22,101,52,0.82)",
  border: "1px solid rgba(134,239,172,0.35)",
  color: "#dcfce7",
  fontSize: "12px",
  fontWeight: "900",
};

const infoStyle = {
  padding: "20px",
};

const eyebrowStyle = {
  margin: "0 0 8px",
  color: "#67e8f9",
  textTransform: "uppercase",
  letterSpacing: "0.11em",
  fontSize: "11px",
  fontWeight: "950",
};

const titleStyle = {
  margin: 0,
  color: "white",
  fontSize: "23px",
  lineHeight: "1.15",
};

const priceStyle = {
  marginTop: "14px",
  marginBottom: "16px",
  color: "white",
  fontSize: "34px",
  lineHeight: 1,
  fontWeight: "950",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "10px",
};

const miniStyle = {
  padding: "12px",
  borderRadius: "16px",
  background: "rgba(2,6,23,0.44)",
  border: "1px solid rgba(148,163,184,0.12)",
};

const miniLabelStyle = {
  display: "block",
  color: "#bae6fd",
  fontSize: "11px",
  fontWeight: "850",
  marginBottom: "6px",
};

const miniValueStyle = {
  display: "block",
  color: "white",
  fontSize: "15px",
  fontWeight: "950",
};

const chipsStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  marginTop: "14px",
};

const chipStyle = {
  padding: "7px 10px",
  borderRadius: "999px",
  background: "rgba(56,189,248,0.12)",
  border: "1px solid rgba(56,189,248,0.22)",
  color: "#bae6fd",
  fontSize: "12px",
  fontWeight: "800",
};

const actionsStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
  marginTop: "16px",
};

const primaryButtonStyle = {
  textAlign: "center",
  textDecoration: "none",
  padding: "12px 10px",
  borderRadius: "15px",
  background: "linear-gradient(135deg, #22c55e, #16a34a)",
  color: "#03120a",
  fontWeight: "950",
};

const secondaryButtonStyle = {
  border: "1px solid rgba(148,163,184,0.25)",
  borderRadius: "15px",
  padding: "12px 10px",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  fontWeight: "950",
  cursor: "pointer",
};

const loadingHeroStyle = {
  minHeight: "240px",
  display: "grid",
  placeItems: "center",
  color: "#bae6fd",
  fontWeight: "900",
};

const loadingInfoStyle = {
  padding: "18px",
  display: "grid",
  gap: "6px",
  color: "#cbd5e1",
};

const pendingStyle = {
  marginTop: "12px",
  padding: "12px",
  borderRadius: "16px",
  background: "rgba(245,158,11,0.10)",
  border: "1px solid rgba(245,158,11,0.24)",
  color: "#fde68a",
  fontSize: "12px",
  fontWeight: "800",
};

const errorStyle = {
  marginTop: "12px",
  padding: "12px",
  borderRadius: "16px",
  background: "rgba(239,68,68,0.10)",
  border: "1px solid rgba(239,68,68,0.22)",
  color: "#fecaca",
  fontSize: "12px",
  fontWeight: "800",
};
