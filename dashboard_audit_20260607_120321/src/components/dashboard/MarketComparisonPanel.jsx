export default function MarketComparisonPanel({ comparison }) {
  if (!comparison || !comparison.recommendation) {
    return null;
  }

  return (
    <div style={cardStyle}>
      <p style={labelStyle}>Comparativa contra histórico</p>

      <h3 style={titleStyle}>{comparison.recommendation}</h3>

      <div style={gridStyle}>
        <List title="Fortalezas" items={comparison.summary?.positives || []} />
        <List title="Debilidades" items={comparison.summary?.negatives || []} />
      </div>
    </div>
  );
}

function List({ title, items }) {
  return (
    <div style={boxStyle}>
      <p style={boxTitleStyle}>{title}</p>

      {items.length === 0 ? (
        <p style={emptyStyle}>Sin señales relevantes.</p>
      ) : (
        items.map((item, index) => (
          <p key={index} style={itemStyle}>
            • {item}
          </p>
        ))
      )}
    </div>
  );
}

const cardStyle = {
  marginBottom: "28px",
  padding: "26px",
  borderRadius: "24px",
  background: "rgba(15,23,42,0.82)",
  border: "1px solid rgba(59,130,246,0.22)",
};

const labelStyle = {
  margin: 0,
  color: "#93c5fd",
  fontWeight: "900",
};

const titleStyle = {
  marginTop: "10px",
  marginBottom: "18px",
  fontSize: "24px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
  gap: "14px",
};

const boxStyle = {
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(2,6,23,0.55)",
};

const boxTitleStyle = {
  marginTop: 0,
  color: "#e5e7eb",
  fontWeight: "900",
};

const itemStyle = {
  margin: "8px 0",
  color: "#cbd5e1",
};

const emptyStyle = {
  marginBottom: 0,
  color: "#94a3b8",
};