import { MetricCard } from "./DashboardBlocks";

export default function OpportunityRankingPanel({ ranking }) {
  const topOpportunities = Array.isArray(ranking?.topOpportunities)
    ? ranking.topOpportunities.slice(0, 10)
    : [];

  const bestScore = topOpportunities[0]?.score || 0;
  const bestROI = Math.max(...topOpportunities.map((item) => Number(item.roi || 0)), 0);
  const bestProfit = Math.max(...topOpportunities.map((item) => Number(item.profit || 0)), 0);

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>🏆 Opportunity Ranking V2</h2>

      <p style={subtitleStyle}>
        Ranking ejecutivo de las mejores oportunidades históricas según score,
        ROI, beneficio estimado y prioridad operativa.
      </p>

      <div style={gridStyle}>
        <MetricCard
          label="Ranking Score"
          value={`${ranking?.rankingScore || 0}/100`}
        />

        <MetricCard
          label="Top Deals"
          value={topOpportunities.length}
        />

        <MetricCard
          label="Mejor Score"
          value={`${bestScore}/100`}
        />

        <MetricCard
          label="Mejor ROI"
          value={`${bestROI}%`}
        />
      </div>

      <div style={highlightGridStyle}>
        <HighlightCard
          title="Beneficio máximo"
          value={`${bestProfit} €`}
          text="Mayor beneficio estimado entre las mejores oportunidades."
        />

        <HighlightCard
          title="Modo decisión"
          value={getDecisionMode(topOpportunities)}
          text="Lectura rápida para priorizar compra, análisis o descarte."
        />

        <HighlightCard
          title="Calidad del ranking"
          value={getRankingQuality(ranking?.rankingScore)}
          text="Confianza interna del ranking según datos disponibles."
        />
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>🧠 Ranking Insights</p>

        {!ranking?.rankingInsights?.length && (
          <p style={emptyStyle}>Aún no hay insights suficientes para este ranking.</p>
        )}

        {ranking?.rankingInsights?.map((item, index) => (
          <div key={index} style={insightCardStyle}>
            {item}
          </div>
        ))}
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>🏁 Top 10 oportunidades históricas</p>

        {topOpportunities.length === 0 && (
          <p style={emptyStyle}>
            Todavía no hay oportunidades suficientes para ranking.
          </p>
        )}

        {topOpportunities.map((item, index) => (
          <RankingCard key={item.id || `${item.title}-${index}`} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}

function RankingCard({ item, index }) {
  const score = Number(item.score || 0);
  const roi = Number(item.roi || 0);
  const profit = Number(item.profit || 0);
  const priorityScore = Number(item.priorityScore || 0);
  const decision = getDealDecision({ score, roi, profit });

  return (
    <div style={rankingCardStyle}>
      <div style={rankBadgeStyle}>#{index + 1}</div>

      <div style={dealContentStyle}>
        <div style={dealHeaderStyle}>
          <h3 style={dealTitleStyle}>{item.title || "Oportunidad sin título"}</h3>
          <span style={decisionPillStyle}>{decision}</span>
        </div>

        <div style={miniGridStyle}>
          <MiniMetric label="Score" value={`${score}/100`} />
          <MiniMetric label="ROI" value={`${roi}%`} />
          <MiniMetric label="Beneficio" value={`${profit} €`} />
          <MiniMetric label="Prioridad" value={priorityScore} />
        </div>

        <div style={barTrackStyle}>
          <div
            style={{
              ...barFillStyle,
              width: `${Math.min(Math.max(priorityScore, 0), 100)}%`,
            }}
          />
        </div>

        <p style={priorityStyle}>
          {buildDecisionText({ score, roi, profit, priorityScore })}
        </p>
      </div>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div style={miniMetricStyle}>
      <span style={miniMetricLabelStyle}>{label}</span>
      <strong style={miniMetricValueStyle}>{value}</strong>
    </div>
  );
}

function HighlightCard({ title, value, text }) {
  return (
    <div style={highlightCardStyle}>
      <p style={highlightTitleStyle}>{title}</p>
      <strong style={highlightValueStyle}>{value}</strong>
      <p style={highlightTextStyle}>{text}</p>
    </div>
  );
}

function getDealDecision({ score, roi, profit }) {
  if (score >= 85 && roi >= 25 && profit >= 2500) {
    return "Comprar";
  }

  if (score >= 75 && roi >= 15) {
    return "Analizar";
  }

  if (score >= 65) {
    return "Vigilar";
  }

  return "Descartar";
}

function buildDecisionText({ score, roi, profit, priorityScore }) {
  if (score >= 85 && roi >= 25 && profit >= 2500) {
    return `Alta prioridad: score ${score}, ROI ${roi}% y beneficio estimado de ${profit} €.`;
  }

  if (score >= 75 && roi >= 15) {
    return `Buena oportunidad para revisar con calma antes de comprar. Prioridad ${priorityScore}.`;
  }

  if (score >= 65) {
    return `Oportunidad intermedia: conviene vigilar precio, demanda y margen.`;
  }

  return `Oportunidad débil dentro del ranking. No priorizar salvo contexto especial.`;
}

function getDecisionMode(items = []) {
  const buyCount = items.filter((item) => {
    return getDealDecision({
      score: Number(item.score || 0),
      roi: Number(item.roi || 0),
      profit: Number(item.profit || 0),
    }) === "Comprar";
  }).length;

  if (buyCount >= 3) return "Mercado caliente";
  if (buyCount >= 1) return "Comprar selectivo";
  if (items.length >= 5) return "Analizar";
  return "Esperar datos";
}

function getRankingQuality(score = 0) {
  const value = Number(score || 0);

  if (value >= 85) return "Alta";
  if (value >= 65) return "Media";
  if (value > 0) return "Inicial";
  return "Sin datos";
}

const containerStyle = {
  marginBottom: "40px",
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "900",
  marginBottom: "10px",
};

const subtitleStyle = {
  color: "#cbd5e1",
  lineHeight: "1.55",
  marginTop: 0,
  marginBottom: "24px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: "18px",
  marginBottom: "24px",
};

const highlightGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: "16px",
  marginBottom: "26px",
};

const highlightCardStyle = {
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(88,28,135,0.2)",
  border: "1px solid rgba(168,85,247,0.22)",
};

const highlightTitleStyle = {
  margin: 0,
  color: "#d8b4fe",
  fontSize: "13px",
  fontWeight: "900",
};

const highlightValueStyle = {
  display: "block",
  marginTop: "8px",
  color: "#ffffff",
  fontSize: "24px",
};

const highlightTextStyle = {
  margin: "8px 0 0 0",
  color: "#cbd5e1",
  fontSize: "12px",
  lineHeight: "1.45",
};

const sectionStyle = {
  marginBottom: "24px",
};

const sectionTitleStyle = {
  fontSize: "16px",
  fontWeight: "900",
  marginBottom: "14px",
};

const insightCardStyle = {
  background: "rgba(168,85,247,0.12)",
  border: "1px solid rgba(168,85,247,0.25)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
  fontWeight: "800",
};

const rankingCardStyle = {
  display: "flex",
  gap: "16px",
  alignItems: "flex-start",
  background:
    "linear-gradient(135deg, rgba(168,85,247,0.16), rgba(37,99,235,0.12))",
  border: "1px solid rgba(168,85,247,0.25)",
  padding: "18px",
  borderRadius: "20px",
  marginBottom: "14px",
};

const rankBadgeStyle = {
  minWidth: "52px",
  height: "52px",
  borderRadius: "999px",
  background: "rgba(168,85,247,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "900",
  fontSize: "18px",
};

const dealContentStyle = {
  flex: 1,
};

const dealHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "14px",
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const dealTitleStyle = {
  fontSize: "20px",
  margin: "0 0 12px 0",
};

const decisionPillStyle = {
  padding: "7px 11px",
  borderRadius: "999px",
  background: "rgba(34,197,94,0.16)",
  border: "1px solid rgba(34,197,94,0.25)",
  color: "#bbf7d0",
  fontSize: "12px",
  fontWeight: "900",
};

const miniGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))",
  gap: "10px",
  marginBottom: "12px",
};

const miniMetricStyle = {
  padding: "10px",
  borderRadius: "14px",
  background: "rgba(2,6,23,0.48)",
};

const miniMetricLabelStyle = {
  display: "block",
  color: "#94a3b8",
  fontSize: "11px",
  marginBottom: "5px",
};

const miniMetricValueStyle = {
  color: "#f8fafc",
  fontSize: "14px",
};

const barTrackStyle = {
  height: "8px",
  borderRadius: "999px",
  background: "rgba(15,23,42,0.8)",
  overflow: "hidden",
};

const barFillStyle = {
  height: "100%",
  borderRadius: "999px",
  background: "linear-gradient(135deg,#a855f7,#22c55e)",
};

const priorityStyle = {
  color: "#d8b4fe",
  fontWeight: "800",
  margin: "10px 0 0 0",
  lineHeight: "1.45",
};

const emptyStyle = {
  color: "#94a3b8",
};