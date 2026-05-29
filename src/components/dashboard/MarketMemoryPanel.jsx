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

  return (
    <div style={cardStyle}>
      <p style={labelStyle}>Memoria de mercado</p>

      <h3 style={titleStyle}>
        {memory.totalAnalyses} análisis guardados
      </h3>

      <div style={gridStyle}>
        <Metric label="Score medio" value={`${memory.averageScore}/100`} />
        <Metric label="ROI medio" value={`${memory.averageROI}%`} />
        <Metric label="Beneficio medio" value={`${memory.averageProfit} €`} />
        <Metric label="Marca dominante" value={memory.topBrand || "n/d"} />
      </div>

      <h4 style={sectionTitleStyle}>🏆 Mejores oportunidades históricas</h4>

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

      <p style={textStyle}>
        El sistema ya puede comparar nuevas oportunidades contra tu histórico
        real y detectar qué marcas, modelos y configuraciones están funcionando
        mejor en tu mercado.
      </p>
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

const textStyle = {
  marginBottom: 0,
  marginTop: "18px",
  color: "#e5e7eb",
  lineHeight: "1.55",
};