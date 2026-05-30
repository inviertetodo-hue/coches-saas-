import { MetricCard } from "./DashboardBlocks";

export default function OpportunityRankingPanel({ ranking }) {
  const topOpportunities = Array.isArray(ranking?.topOpportunities)
    ? ranking.topOpportunities.slice(0, 10)
    : [];

  const bestScore = topOpportunities[0]?.score || 0;
  const bestExecutiveScore = topOpportunities[0]?.executiveScore || 0;
  const bestROI = Math.max(
    ...topOpportunities.map((item) => Number(item.roi || 0)),
    0
  );
  const bestProfit = Math.max(
    ...topOpportunities.map((item) => Number(item.profit || 0)),
    0
  );

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>🏆 Opportunity Ranking V3</h2>

      <p style={subtitleStyle}>
        Ranking ejecutivo con score IA, ROI, beneficio, aprendizaje histórico y
        prioridad predictiva.
      </p>

      <div style={gridStyle}>
        <MetricCard
          label="Executive Score"
          value={`${bestExecutiveScore}/100`}
        />

        <MetricCard
          label="Ranking Score"
          value={`${ranking?.rankingScore || 0}/100`}
        />

        <MetricCard
          label="Top Deals"
          value={topOpportunities.length}
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
          title="Mejor Score IA"
          value={`${bestScore}/100`}
          text="Score base antes del ajuste ejecutivo."
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
          <p style={emptyStyle}>
            Aún no hay insights suficientes para este ranking.
          </p>
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
          <RankingCard
            key={item.id || `${item.title}-${index}`}
            item={item}
            index={index}
          />
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
  const executiveScore = Number(item.executiveScore || priorityScore || score);
  const learningBonus = Number(item.learningBonus || 0);
  const historicalConfidence = item.historicalConfidence || "Sin datos";
  const historicalAverageROI = Number(item.historicalAverageROI || 0);
  const historicalAverageProfit = Number(item.historicalAverageProfit || 0);
  const historicalAnalyses = Number(item.historicalAnalyses || 0);

  const decision = getDealDecision({
    score,
    roi,
    profit,
    executiveScore,
  });

  return (
    <div style={rankingCardStyle}>
      <div style={rankBadgeStyle}>#{index + 1}</div>

      <div style={dealContentStyle}>
        <div style={dealHeaderStyle}>
          <h3 style={dealTitleStyle}>
            {item.title || "Oportunidad sin título"}
          </h3>
          <span style={decisionPillStyle}>{decision}</span>
        </div>

        <div style={miniGridStyle}>
          <MiniMetric label="Executive" value={`${executiveScore}/100`} />
          <MiniMetric label="Score IA" value={`${score}/100`} />
          <MiniMetric label="ROI" value={`${roi}%`} />
          <MiniMetric label="Beneficio" value={`${profit} €`} />
          <MiniMetric label="Prioridad" value={priorityScore} />
          <MiniMetric label="Learning" value={formatBonus(learningBonus)} />
        </div>

        <div style={barTrackStyle}>
          <div
            style={{
              ...barFillStyle,
              width: `${Math.min(Math.max(executiveScore, 0), 100)}%`,
            }}
          />
        </div>

        <div style={historicalBoxStyle}>
          <p style={historicalTitleStyle}>🧠 Memoria histórica del modelo</p>

          <div style={historicalGridStyle}>
            <MiniMetric
              label="Confianza"
              value={historicalConfidence}
            />

            <MiniMetric
              label="Análisis"
              value={historicalAnalyses}
            />

            <MiniMetric
              label="ROI histórico"
              value={`${historicalAverageROI}%`}
            />

            <MiniMetric
              label="Beneficio histórico"
              value={`${historicalAverageProfit} €`}
            />
          </div>

          {Array.isArray(item.learningSignals) &&
            item.learningSignals.length > 0 && (
              <div style={learningSignalsStyle}>
                {item.learningSignals.slice(0, 2).map((signal, signalIndex) => (
                  <p
                    key={`${signal}-${signalIndex}`}
                    style={learningSignalStyle}
                  >
                    {signal}
                  </p>
                ))}
              </div>
            )}
        </div>

        <p style={priorityStyle}>
          {buildDecisionText({
            score,
            roi,
            profit,
            priorityScore,
            executiveScore,
            learningBonus,
            historicalConfidence,
          })}
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

function getDealDecision({ score, roi, profit, executiveScore }) {
  if (executiveScore >= 85 && roi >= 15 && profit >= 2500) {
    return "Comprar";
  }

  if (executiveScore >= 75 && roi >= 10) {
    return "Analizar";
  }

  if (score >= 65 || executiveScore >= 65) {
    return "Vigilar";
  }

  return "Descartar";
}

function buildDecisionText({
  score,
  roi,
  profit,
  priorityScore,
  executiveScore,
  learningBonus,
  historicalConfidence,
}) {
  const learningText =
    learningBonus !== 0
      ? ` Aprendizaje histórico aplicado: ${formatBonus(learningBonus)}.`
      : "";

  if (executiveScore >= 85 && roi >= 15 && profit >= 2500) {
    return `Alta prioridad ejecutiva: executive score ${executiveScore}, score IA ${score}, ROI ${roi}% y beneficio estimado de ${profit} €. Confianza histórica: ${historicalConfidence}.${learningText}`;
  }

  if (executiveScore >= 75 && roi >= 10) {
    return `Buena oportunidad para revisar con calma. Executive score ${executiveScore}, prioridad ${priorityScore} y confianza histórica ${historicalConfidence}.${learningText}`;
  }

  if (score >= 65 || executiveScore >= 65) {
    return `Oportunidad intermedia: conviene vigilar precio, demanda, margen y señales históricas.${learningText}`;
  }

  return `Oportunidad débil dentro del ranking. No priorizar salvo contexto especial.${learningText}`;
}

function getDecisionMode(items = []) {
  const buyCount = items.filter((item) => {
    return (
      getDealDecision({
        score: Number(item.score || 0),
        roi: Number(item.roi || 0),
        profit: Number(item.profit || 0),
        executiveScore: Number(item.executiveScore || 0),
      }) === "Comprar"
    );
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

function formatBonus(value) {
  const number = Number(value || 0);

  if (number > 0) return `+${number}`;
  return String(number);
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
  marginTop: "4px",
};

const barFillStyle = {
  height: "100%",
  borderRadius: "999px",
  background: "linear-gradient(135deg,#a855f7,#22c55e)",
};

const historicalBoxStyle = {
  marginTop: "14px",
  padding: "14px",
  borderRadius: "18px",
  background: "rgba(15,23,42,0.58)",
  border: "1px solid rgba(34,197,94,0.16)",
};

const historicalTitleStyle = {
  margin: "0 0 12px 0",
  color: "#bbf7d0",
  fontWeight: "900",
  fontSize: "13px",
};

const historicalGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
  gap: "10px",
};

const learningSignalsStyle = {
  marginTop: "12px",
};

const learningSignalStyle = {
  margin: "8px 0 0 0",
  color: "#dcfce7",
  fontSize: "12px",
  lineHeight: "1.45",
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