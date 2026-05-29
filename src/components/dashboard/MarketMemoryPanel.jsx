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

      <p style={textStyle}>
        El sistema ya puede empezar a comparar nuevas oportunidades contra tu
        histórico real de coches analizados.
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

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
  gap: "14px",
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
};

const textStyle = {
  marginBottom: 0,
  marginTop: "18px",
  color: "#e5e7eb",
  lineHeight: "1.55",
};