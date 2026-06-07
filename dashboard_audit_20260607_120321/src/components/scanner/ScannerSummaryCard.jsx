import SemanticBadge from "./SemanticBadge";
import BestDealCard from "./BestDealCard";
import TrendSummaryCard from "./TrendSummaryCard";

export default function ScannerSummaryCard({
  scan,
  trendProfile,
  searchTriggered,
  marketFeed,
}) {
  return (
    <div style={cardStyle}>
      <p style={sectionLabelStyle}>Resumen IA</p>

      <h2 style={summaryStyle}>{scan.summary}</h2>

      <div style={semanticGridStyle}>
        <SemanticBadge active={scan.semantic?.isPremium} label="Premium" />

        <SemanticBadge active={scan.semantic?.isPhev} label="PHEV" />

        <SemanticBadge active={scan.semantic?.isSuv} label="SUV" />

        <SemanticBadge
          active={scan.semantic?.isPerformance}
          label="Performance"
        />
      </div>

      <TrendSummaryCard trendProfile={trendProfile} />

      {!searchTriggered && (
        <div style={waitingBoxStyle}>
          Pulsa <strong>Buscar oportunidades IA</strong> para generar el
          ranking de posibles chollos.
        </div>
      )}

      <BestDealCard best={marketFeed?.best} />
    </div>
  );
}

const cardStyle = {
  background: "rgba(15,23,42,0.82)",
  borderRadius: "28px",
  padding: "28px",
  border: "1px solid rgba(148,163,184,0.16)",
};

const sectionLabelStyle = {
  color: "#93c5fd",
  fontWeight: "900",
};

const summaryStyle = {
  fontSize: "30px",
  lineHeight: "1.3",
};

const semanticGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  marginTop: "24px",
};

const waitingBoxStyle = {
  marginTop: "28px",
  padding: "18px",
  borderRadius: "18px",
  background: "rgba(59,130,246,0.10)",
  border: "1px solid rgba(59,130,246,0.22)",
  color: "#dbeafe",
  lineHeight: "1.55",
};