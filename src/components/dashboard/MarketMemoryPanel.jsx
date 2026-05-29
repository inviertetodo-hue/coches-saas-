export default function MarketMemoryPanel({ memory }) {
  if (!memory || memory.totalAnalyses === 0) {
    return (
      <div style={cardStyle}>
        <p style={labelStyle}>Memoria de mercado</p>
        <h3 style={titleStyle}>Aún no hay datos suficientes</h3>
        <p style={textStyle}>
          Cuando guardes más análisis, el sistema comparará nuevas oportunidades
          contra tu histórico real.
        </p>
      </div>
    );
  }

  const topBrands = memory.brandRanking?.slice(0, 5) || [];
  const topModels = memory.modelRanking?.slice(0, 5) || [];
  const topConfigurations = memory.configurationRanking?.slice(0, 5) || [];

  return (
    <div style={cardStyle}>
      <p style={labelStyle}>Memoria de mercado · Intelligence V1</p>

      <h3 style={titleStyle}>
        {memory.totalAnalyses} análisis válidos aprendidos
      </h3>

      <div style={gridStyle}>
        <Metric label="Score medio" value={`${memory.averageScore}/100`} />
        <Metric label="ROI medio" value={`${memory.averageROI}%`} />
        <Metric label="Beneficio medio" value={`${memory.averageProfit} €`} />
        <Metric label="Marca dominante" value={memory.topBrand || "n/d"} />
      </div>

      <h4 style={sectionTitleStyle}>🏆 Mejores patrones detectados</h4>

      <div style={gridStyle}>
        <Metric
          label="Mejor marca por ROI"
          value={formatWinner(memory.bestROIBrand, "roi")}
        />

        <Metric
          label="Mejor marca por Score"
          value={formatWinner(memory.bestScoreBrand, "score")}
        />

        <Metric
          label="Mejor modelo por ROI"
          value={formatWinner(memory.bestROIModel, "roi")}
        />

        <Metric
          label="Mejor modelo por Score"
          value={formatWinner(memory.bestScoreModel, "score")}
        />
      </div>

      <div style={gridStyle}>
        <Metric
          label="Mejor configuración ROI"
          value={formatWinner(memory.bestROIConfiguration, "roi")}
        />

        <Metric
          label="Mejor configuración Score"
          value={formatWinner(memory.bestScoreConfiguration, "score")}
        />

        <Metric
          label="Modelo dominante"
          value={memory.topModel || "n/d"}
        />

        <Metric
          label="Configuración dominante"
          value={memory.topConfiguration || "n/d"}
        />
      </div>

      <div style={twoColumnStyle}>
        <RankingBlock
          title="🚗 Ranking por marca"
          items={topBrands}
          emptyText="Aún no hay suficientes marcas repetidas."
        />

        <RankingBlock
          title="🎯 Ranking por modelo"
          items={topModels}
          emptyText="Aún no hay suficientes modelos repetidos."
        />
      </div>

      <RankingBlock
        title="⚙️ Configuraciones con mejor memoria"
        items={topConfigurations}
        emptyText="Aún no hay configuraciones suficientes para comparar."
        wide
      />

      <div style={signalGridStyle}>
        <SignalCard
          title="Liquidez alta"
          value={memory.liquidityMap?.high || 0}
          text="Coches con score igual o superior a 85."
        />

        <SignalCard
          title="Liquidez media"
          value={memory.liquidityMap?.medium || 0}
          text="Coches con score entre 65 y 84."
        />

        <SignalCard
          title="Oportunidades fuertes"
          value={memory.riskMap?.opportunity || 0}
          text="Score alto y ROI fuerte."
        />

        <SignalCard
          title="Casos de riesgo"
          value={memory.riskMap?.risk || 0}
          text="Casos con menor atractivo relativo."
        />
      </div>

      <div style={decisionBoxStyle}>
        <p style={decisionTitleStyle}>🧠 Lectura IA de mercado</p>
        <p style={textStyle}>
          El sistema ya puede usar tu histórico real para detectar qué marcas,
          modelos y configuraciones están funcionando mejor. Cuantos más
          análisis válidos guardes, más fiable será esta memoria para decidir
          qué coches comprar, repetir o descartar.
        </p>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={metricStyle}>
      <p style={metricLabelStyle}>{label}</p>
      <strong style={metricValueStyle}>{value}</strong>
    </div>
  );
}

function RankingBlock({ title, items = [], emptyText, wide = false }) {
  return (
    <div style={wide ? rankingBlockWideStyle : rankingBlockStyle}>
      <h4 style={rankingTitleStyle}>{title}</h4>

      {!items.length && <p style={textStyle}>{emptyText}</p>}

      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} style={rankingRowStyle}>
          <div>
            <strong style={rankingLabelStyle}>
              #{index + 1} · {item.label}
            </strong>
            <p style={rankingSubTextStyle}>
              {item.count} análisis · Score medio {item.averageScore}/100 · ROI medio {item.averageROI}%
            </p>
          </div>

          <div style={rankingValueStyle}>
            {item.averageProfit} €
          </div>
        </div>
      ))}
    </div>
  );
}

function SignalCard({ title, value, text }) {
  return (
    <div style={signalCardStyle}>
      <p style={signalTitleStyle}>{title}</p>
      <strong style={signalValueStyle}>{value}</strong>
      <p style={signalTextStyle}>{text}</p>
    </div>
  );
}

function formatWinner(winner, type) {
  if (!winner?.label) {
    return "n/d";
  }

  if (type === "roi") {
    return `${winner.label} · ${winner.averageROI}%`;
  }

  return `${winner.label} · ${winner.averageScore}/100`;
}

const cardStyle = {
  marginBottom: "28px",
  padding: "26px",
  borderRadius: "24px",
  background: "rgba(15,23,42,0.82)",
  border: "1px solid rgba(34,197,94,0.18)",
};

const labelStyle = {
  margin: 0,
  color: "#86efac",
  fontWeight: "900",
};

const titleStyle = {
  marginTop: "10px",
  marginBottom: "18px",
  fontSize: "24px",
};

const sectionTitleStyle = {
  marginTop: "26px",
  marginBottom: "16px",
  color: "#e5e7eb",
  fontSize: "18px",
  fontWeight: "900",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
  gap: "14px",
  marginBottom: "14px",
};

const metricStyle = {
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(2,6,23,0.55)",
};

const metricLabelStyle = {
  margin: 0,
  color: "#cbd5e1",
  fontSize: "13px",
};

const metricValueStyle = {
  display: "block",
  marginTop: "8px",
  fontSize: "20px",
  lineHeight: "1.25",
};

const twoColumnStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
  gap: "16px",
  marginTop: "22px",
};

const rankingBlockStyle = {
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(2,6,23,0.42)",
  border: "1px solid rgba(148,163,184,0.14)",
};

const rankingBlockWideStyle = {
  ...rankingBlockStyle,
  marginTop: "16px",
};

const rankingTitleStyle = {
  margin: "0 0 14px 0",
  color: "#f8fafc",
  fontSize: "16px",
};

const rankingRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "14px",
  padding: "12px 0",
  borderTop: "1px solid rgba(148,163,184,0.12)",
};

const rankingLabelStyle = {
  color: "#e5e7eb",
  fontSize: "14px",
};

const rankingSubTextStyle = {
  margin: "6px 0 0 0",
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: "1.45",
};

const rankingValueStyle = {
  minWidth: "86px",
  textAlign: "right",
  color: "#86efac",
  fontWeight: "900",
  fontSize: "14px",
};

const signalGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: "14px",
  marginTop: "18px",
};

const signalCardStyle = {
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(22,101,52,0.16)",
  border: "1px solid rgba(34,197,94,0.14)",
};

const signalTitleStyle = {
  margin: 0,
  color: "#bbf7d0",
  fontWeight: "900",
  fontSize: "13px",
};

const signalValueStyle = {
  display: "block",
  marginTop: "8px",
  color: "#ffffff",
  fontSize: "28px",
};

const signalTextStyle = {
  margin: "8px 0 0 0",
  color: "#d1fae5",
  fontSize: "12px",
  lineHeight: "1.45",
};

const decisionBoxStyle = {
  marginTop: "20px",
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(37,99,235,0.14)",
  border: "1px solid rgba(96,165,250,0.18)",
};

const decisionTitleStyle = {
  margin: "0 0 8px 0",
  color: "#bfdbfe",
  fontWeight: "900",
};

const textStyle = {
  marginBottom: 0,
  marginTop: "18px",
  color: "#e5e7eb",
  lineHeight: "1.55",
};