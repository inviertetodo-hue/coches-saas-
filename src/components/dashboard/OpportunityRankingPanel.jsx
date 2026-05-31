import { MetricCard } from "./DashboardBlocks";

export default function OpportunityRankingPanel({ ranking }) {
  const topOpportunities = Array.isArray(ranking?.topOpportunities)
    ? ranking.topOpportunities.slice(0, 10)
    : [];

  const bestScore = topOpportunities[0]?.score || 0;
  const bestExecutiveScore = topOpportunities[0]?.executiveScore || 0;
  const bestSuccessProbability = topOpportunities[0]?.successProbability || 0;
  const bestAllocationScore = topOpportunities[0]?.allocationScore || 0;
  const bestAllocationTier = topOpportunities[0]?.allocationTier || "Sin datos";

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
      <h2 style={titleStyle}>🏆 Opportunity Ranking V5</h2>

      <p style={subtitleStyle}>
        Ranking ejecutivo con asignación de capital, score IA, aprendizaje
        histórico, probabilidad de éxito, timing, señal de compra y tiempo
        estimado de venta.
      </p>

      <div style={gridStyle}>
        <MetricCard
          label="Allocation Score"
          value={`${bestAllocationScore}/100`}
        />

        <MetricCard
          label="Allocation Tier"
          value={bestAllocationTier}
        />

        <MetricCard
          label="Ranking Score"
          value={`${ranking?.rankingScore || 0}/100`}
        />

        <MetricCard
          label="Success Probability"
          value={`${bestSuccessProbability}/100`}
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
          title="Executive Score"
          value={`${bestExecutiveScore}/100`}
          text="Fuerza ejecutiva de la mejor oportunidad."
        />

        <HighlightCard
          title="Modo decisión"
          value={getDecisionMode(topOpportunities)}
          text="Lectura rápida para priorizar capital, compra, análisis o descarte."
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

  const successProbability = Number(item.successProbability || 0);
  const buySignal = item.buySignal || "Sin señal";
  const estimatedSellDays = Number(item.estimatedSellDays || 0);
  const expectedROI = Number(item.expectedROI || 0);
  const expectedProfit = Number(item.expectedProfit || 0);
  const successRiskLabel = item.successRiskLabel || "Sin datos";

  const allocationScore = Number(item.allocationScore || 0);
  const allocationTier = item.allocationTier || "Sin datos";
  const allocationSummary = item.allocationSummary || "";

  const marketTimingScore = Number(item.marketTimingScore || 0);
  const marketTimingLabel = item.marketTimingLabel || "Sin datos";

  const capitalEfficiencyScore = Number(item.capitalEfficiencyScore || 0);
  const inventoryRiskLabel = item.inventoryRiskLabel || "Sin datos";

  const decision = getDealDecision({
    score,
    roi,
    profit,
    executiveScore,
    successProbability,
    buySignal,
    allocationScore,
    allocationTier,
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

        <div style={allocationBoxStyle}>
          <p style={allocationTitleStyle}>💼 Asignación de capital</p>

          <div style={historicalGridStyle}>
            <MiniMetric
              label="Allocation"
              value={`${allocationScore}/100`}
            />
            <MiniMetric label="Tier" value={allocationTier} />
            <MiniMetric
              label="Timing"
              value={`${marketTimingScore}/100`}
            />
            <MiniMetric label="Timing Label" value={marketTimingLabel} />
            <MiniMetric
              label="Capital Efficiency"
              value={`${capitalEfficiencyScore}/100`}
            />
            <MiniMetric label="Inventory Risk" value={inventoryRiskLabel} />
          </div>

          {allocationSummary && (
            <p style={allocationSummaryStyle}>{allocationSummary}</p>
          )}
        </div>

        <div style={miniGridStyle}>
          <MiniMetric label="Success" value={`${successProbability}/100`} />
          <MiniMetric label="Buy Signal" value={buySignal} />
          <MiniMetric label="Venta est." value={`${estimatedSellDays} días`} />
          <MiniMetric label="Executive" value={`${executiveScore}/100`} />
          <MiniMetric label="Score IA" value={`${score}/100`} />
          <MiniMetric label="Learning" value={formatBonus(learningBonus)} />
        </div>

        <div style={barTrackStyle}>
          <div
            style={{
              ...barFillStyle,
              width: `${Math.min(Math.max(allocationScore, 0), 100)}%`,
            }}
          />
        </div>

        <div style={predictionBoxStyle}>
          <p style={predictionTitleStyle}>🔮 Predicción de éxito</p>

          <div style={historicalGridStyle}>
            <MiniMetric label="ROI esperado" value={`${expectedROI}%`} />
            <MiniMetric
              label="Beneficio esperado"
              value={`${expectedProfit} €`}
            />
            <MiniMetric label="Riesgo esperado" value={successRiskLabel} />
            <MiniMetric label="Prioridad" value={priorityScore} />
          </div>

          {item.successSummary && (
            <p style={predictionSummaryStyle}>{item.successSummary}</p>
          )}
        </div>

        <div style={historicalBoxStyle}>
          <p style={historicalTitleStyle}>🧠 Memoria histórica del modelo</p>

          <div style={historicalGridStyle}>
            <MiniMetric label="Confianza" value={historicalConfidence} />

            <MiniMetric label="Análisis" value={historicalAnalyses} />

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
            successProbability,
            buySignal,
            estimatedSellDays,
            expectedROI,
            expectedProfit,
            allocationScore,
            allocationTier,
            marketTimingLabel,
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

function getDealDecision({
  score,
  roi,
  profit,
  executiveScore,
  successProbability,
  buySignal,
  allocationScore,
  allocationTier,
}) {
  if (
    allocationTier === "TIER_1" ||
    allocationScore >= 85 ||
    buySignal === "FUERTE" ||
    (successProbability >= 85 && executiveScore >= 80 && profit >= 2500)
  ) {
    return "Priorizar capital";
  }

  if (
    allocationTier === "TIER_2" ||
    allocationScore >= 70 ||
    buySignal === "INTERESANTE" ||
    (successProbability >= 72 && executiveScore >= 70)
  ) {
    return "Comprar selectivo";
  }

  if (
    allocationTier === "TIER_3" ||
    allocationScore >= 55 ||
    score >= 65 ||
    executiveScore >= 65 ||
    successProbability >= 58
  ) {
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
  successProbability,
  buySignal,
  estimatedSellDays,
  expectedROI,
  expectedProfit,
  allocationScore,
  allocationTier,
  marketTimingLabel,
}) {
  const learningText =
    learningBonus !== 0
      ? ` Aprendizaje histórico aplicado: ${formatBonus(learningBonus)}.`
      : "";

  if (allocationTier === "TIER_1" || allocationScore >= 85) {
    return `Prioridad máxima de capital: allocation score ${allocationScore}/100, tier ${allocationTier}, timing ${marketTimingLabel}, probabilidad de éxito ${successProbability}/100, venta estimada en ${estimatedSellDays} días, ROI esperado ${expectedROI}% y beneficio esperado de ${expectedProfit} €.${learningText}`;
  }

  if (allocationTier === "TIER_2" || allocationScore >= 70) {
    return `Buena asignación potencial: allocation score ${allocationScore}/100, tier ${allocationTier}, probabilidad de éxito ${successProbability}/100, ROI ${roi}% y beneficio estimado de ${profit} €.${learningText}`;
  }

  if (buySignal === "FUERTE" || successProbability >= 85) {
    return `Señal fuerte: probabilidad de éxito ${successProbability}/100, venta estimada en ${estimatedSellDays} días, ROI esperado ${expectedROI}% y beneficio esperado de ${expectedProfit} €. Executive score ${executiveScore}, score IA ${score}, confianza histórica ${historicalConfidence}.${learningText}`;
  }

  if (buySignal === "INTERESANTE" || successProbability >= 72) {
    return `Oportunidad interesante: probabilidad de éxito ${successProbability}/100, prioridad ${priorityScore}, ROI ${roi}% y beneficio estimado de ${profit} €.${learningText}`;
  }

  if (score >= 65 || executiveScore >= 65 || successProbability >= 58) {
    return `Oportunidad intermedia: conviene vigilar precio, demanda, margen, timing y señales históricas.${learningText}`;
  }

  return `Oportunidad débil dentro del ranking. No priorizar capital salvo contexto especial.${learningText}`;
}

function getDecisionMode(items = []) {
  const tierOneCount = items.filter((item) => {
    return item.allocationTier === "TIER_1" || Number(item.allocationScore || 0) >= 85;
  }).length;

  const tierTwoCount = items.filter((item) => {
    return item.allocationTier === "TIER_2" || Number(item.allocationScore || 0) >= 70;
  }).length;

  if (tierOneCount >= 2) return "Asignar capital";
  if (tierOneCount >= 1) return "Priorizar una";
  if (tierTwoCount >= 2) return "Comprar selectivo";
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

const allocationBoxStyle = {
  marginTop: "8px",
  marginBottom: "14px",
  padding: "14px",
  borderRadius: "18px",
  background: "rgba(14,165,233,0.16)",
  border: "1px solid rgba(56,189,248,0.25)",
};

const allocationTitleStyle = {
  margin: "0 0 12px 0",
  color: "#bae6fd",
  fontWeight: "900",
  fontSize: "13px",
};

const allocationSummaryStyle = {
  margin: "12px 0 0 0",
  color: "#e0f2fe",
  fontSize: "12px",
  lineHeight: "1.45",
};

const predictionBoxStyle = {
  marginTop: "14px",
  padding: "14px",
  borderRadius: "18px",
  background: "rgba(88,28,135,0.22)",
  border: "1px solid rgba(168,85,247,0.22)",
};

const predictionTitleStyle = {
  margin: "0 0 12px 0",
  color: "#e9d5ff",
  fontWeight: "900",
  fontSize: "13px",
};

const predictionSummaryStyle = {
  margin: "12px 0 0 0",
  color: "#f3e8ff",
  fontSize: "12px",
  lineHeight: "1.45",
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