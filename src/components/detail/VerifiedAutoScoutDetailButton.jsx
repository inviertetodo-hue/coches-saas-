import { useMemo, useState } from "react";
import {
  buildAutoScoutVerifiedDetailPreview,
  isAutoScoutIndividualListingUrl,
  openAutoScoutVerifiedDetailPreviewWindow,
} from "../../services/detail/autoScoutVerifiedDetailPreview.js";

export default function VerifiedAutoScoutDetailButton({
  url = "",
  label = "Ver ficha enriquecida",
  disabled = false,
  className = "",
  onPreviewReady,
  onPreviewError,
}) {
  const [state, setState] = useState({
    loading: false,
    status: "idle",
    message: "",
    qualityScore: null,
    verified: false,
  });

  const normalizedUrl = String(url || "").trim();

  const canRun = useMemo(() => {
    return !disabled && isAutoScoutIndividualListingUrl(normalizedUrl);
  }, [disabled, normalizedUrl]);

  async function handleClick() {
    if (!canRun || state.loading) {
      setState({
        loading: false,
        status: "invalid_url",
        message: "URL individual de AutoScout24 no válida.",
        qualityScore: null,
        verified: false,
      });
      return;
    }

    setState({
      loading: true,
      status: "loading",
      message: "Extrayendo ficha verificada...",
      qualityScore: null,
      verified: false,
    });

    try {
      const preview = await buildAutoScoutVerifiedDetailPreview(normalizedUrl);
      const openResult = openAutoScoutVerifiedDetailPreviewWindow(preview);

      const qualityScore = preview.detail?.qualityScore ?? null;
      const verified = Boolean(preview.isVerifiedDetail);

      setState({
        loading: false,
        status: preview.status,
        message: verified
          ? "Ficha verificada abierta."
          : "Ficha abierta, pero requiere revisión.",
        qualityScore,
        verified,
      });

      if (typeof onPreviewReady === "function") {
        onPreviewReady({
          preview,
          openResult,
        });
      }
    } catch (error) {
      const message = error?.message || "No se pudo abrir la ficha enriquecida.";

      setState({
        loading: false,
        status: "error",
        message,
        qualityScore: null,
        verified: false,
      });

      if (typeof onPreviewError === "function") {
        onPreviewError(error);
      }
    }
  }

  return (
    <div className="verified-detail-button">
      <button
        type="button"
        className={className}
        disabled={!canRun || state.loading}
        onClick={handleClick}
        title={
          canRun
            ? "Abrir ficha individual verificada con fotos"
            : "Disponible solo para URLs individuales de AutoScout24"
        }
      >
        {state.loading ? "Abriendo ficha..." : label}
      </button>

      {state.message ? (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            opacity: 0.82,
          }}
        >
          {state.message}
          {state.qualityScore !== null ? ` · Quality ${state.qualityScore}/100` : ""}
          {state.verified ? " · Verificada" : ""}
        </div>
      ) : null}
    </div>
  );
}
