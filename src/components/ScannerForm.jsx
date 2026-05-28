export default function ScannerForm({
  form,
  updateField,
  handleSearch,
}) {
  return (
    <div style={cardStyle}>
      <label style={labelStyle}>Vehículo objetivo</label>

      <input
        value={form.query}
        onChange={(event) => updateField("query", event.target.value)}
        placeholder="BMW X5 45e, Audi Q7..."
        style={inputStyle}
      />

      <label style={labelStyle}>Presupuesto máximo</label>

      <input
        value={form.maxBudget}
        onChange={(event) =>
          updateField("maxBudget", event.target.value)
        }
        placeholder="60000"
        style={inputStyle}
      />

      <label style={labelStyle}>Mercado</label>

      <select
        value={form.country}
        onChange={(event) => updateField("country", event.target.value)}
        style={inputStyle}
      >
        <option>Europa</option>
        <option>Alemania</option>
        <option>Holanda</option>
        <option>Bélgica</option>
        <option>Francia</option>
        <option>España</option>
      </select>

      <label style={labelStyle}>Objetivo</label>

      <select
        value={form.useCase}
        onChange={(event) => updateField("useCase", event.target.value)}
        style={inputStyle}
      >
        <option value="reventa">Reventa</option>
        <option value="quedarmelo">Quedármelo</option>
      </select>

      <button onClick={handleSearch} style={searchButtonStyle}>
        🔎 Buscar oportunidades IA
      </button>
    </div>
  );
}

const cardStyle = {
  background: "rgba(15,23,42,0.82)",
  borderRadius: "28px",
  padding: "28px",
  border: "1px solid rgba(148,163,184,0.16)",
};

const labelStyle = {
  display: "block",
  marginTop: "16px",
  marginBottom: "8px",
  color: "#cbd5e1",
  fontWeight: "800",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "16px",
  borderRadius: "16px",
  border: "1px solid rgba(148,163,184,0.20)",
  background: "rgba(2,6,23,0.86)",
  color: "white",
  outline: "none",
  fontWeight: "700",
};

const searchButtonStyle = {
  width: "100%",
  marginTop: "24px",
  padding: "18px",
  borderRadius: "18px",
  border: "none",
  background: "linear-gradient(135deg,#2563eb,#16a34a)",
  color: "white",
  fontWeight: "900",
  fontSize: "16px",
  cursor: "pointer",
  boxShadow: "0 10px 30px rgba(37,99,235,0.35)",
};