import { VEHICLE_CATALOG } from "../services/vehicleCatalog";

export default function ScannerForm({
  form,
  updateField,
  handleSearch,
}) {
  const markets = [
    "Europa",
    "Alemania",
    "Holanda",
    "Bélgica",
    "Francia",
    "Italia",
    "Austria",
    "Luxemburgo",
    "Suecia",
    "Dinamarca",
    "España",
  ];

  const brandLabels = Object.keys(VEHICLE_CATALOG);
  const selectedBrandLabel =
    brandLabels.find((brand) => normalizeKey(brand) === normalizeKey(form.brand)) ||
    brandLabels[0];

  const selectedBrandKey = normalizeKey(selectedBrandLabel);
  const availableModels = VEHICLE_CATALOG[selectedBrandLabel] || [];

  const selectedModel =
    availableModels.find((model) => normalizeKey(model) === normalizeKey(form.model)) ||
    availableModels[0] ||
    "";

  function handleBrandChange(event) {
    const nextBrandKey = event.target.value;
    const nextBrandLabel =
      brandLabels.find((brand) => normalizeKey(brand) === nextBrandKey) ||
      brandLabels[0];

    const nextModel = VEHICLE_CATALOG[nextBrandLabel]?.[0] || "";

    updateField("brand", nextBrandKey);
    updateField("model", nextModel);
    updateField("query", buildVehicleQuery(nextBrandLabel, nextModel));
  }

  function handleModelChange(event) {
    const nextModel = event.target.value;

    updateField("model", nextModel);
    updateField("query", buildVehicleQuery(selectedBrandLabel, nextModel));
  }

  return (
    <div style={cardStyle}>
      <div style={formGridStyle}>
        <div>
          <label style={labelStyle}>Marca</label>

          <select
            value={selectedBrandKey}
            onChange={handleBrandChange}
            style={inputStyle}
          >
            {brandLabels.map((brand) => (
              <option key={brand} value={normalizeKey(brand)}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Modelo</label>

          <select
            value={selectedModel}
            onChange={handleModelChange}
            style={inputStyle}
          >
            {availableModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div style={fullWidthStyle}>
          <label style={labelStyle}>Vehículo objetivo generado</label>

          <input
            value={form.query}
            readOnly
            placeholder="Audi A3, BMW X5..."
            style={readOnlyInputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Presupuesto máximo</label>

          <input
            value={form.maxBudget}
            onChange={(event) => updateField("maxBudget", event.target.value)}
            placeholder="25000"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Combustible</label>

          <select
            value={form.fuel || ""}
            onChange={(event) => updateField("fuel", event.target.value)}
            style={inputStyle}
          >
            <option value="">Cualquiera</option>
            <option value="gasolina">Gasolina</option>
            <option value="diesel">Diésel</option>
            <option value="hibrido">Híbrido</option>
            <option value="phev">PHEV</option>
            <option value="electrico">Eléctrico</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Año desde</label>

          <input
            value={form.minYear || ""}
            onChange={(event) => updateField("minYear", event.target.value)}
            placeholder="2020"
            inputMode="numeric"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Km máximo</label>

          <input
            value={form.maxMileage || ""}
            onChange={(event) => updateField("maxMileage", event.target.value)}
            placeholder="90000"
            inputMode="numeric"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Mercado</label>

          <select
            value={form.country}
            onChange={(event) => updateField("country", event.target.value)}
            style={inputStyle}
          >
            {markets.map((market) => (
              <option key={market} value={market}>
                {market}
              </option>
            ))}
          </select>
        </div>

        <div style={fullWidthStyle}>
          <label style={labelStyle}>Objetivo</label>

          <select
            value={form.useCase}
            onChange={(event) => updateField("useCase", event.target.value)}
            style={inputStyle}
          >
            <option value="reventa">Reventa</option>
            <option value="quedarmelo">Quedármelo</option>
          </select>
        </div>
      </div>

      <button onClick={handleSearch} style={searchButtonStyle}>
        🔎 Buscar oportunidades IA
      </button>
    </div>
  );
}

function buildVehicleQuery(brand, model) {
  return [brand, model].filter(Boolean).join(" ").trim();
}

function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const cardStyle = {
  background: "rgba(15,23,42,0.82)",
  borderRadius: "28px",
  padding: "28px",
  border: "1px solid rgba(148,163,184,0.16)",
};

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: "16px",
};

const fullWidthStyle = {
  gridColumn: "1 / -1",
};

const labelStyle = {
  display: "block",
  marginTop: "0",
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

const readOnlyInputStyle = {
  ...inputStyle,
  opacity: 0.82,
  cursor: "not-allowed",
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
