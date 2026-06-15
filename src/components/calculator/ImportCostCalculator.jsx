import { useEffect, useState } from "react";

import {
  calculateImportResult,
  getDefaultImportCosts,
} from "../../services/importCostCalculator";

export default function ImportCostCalculator({ vehicle = {} }) {
  const defaults = getDefaultImportCosts(vehicle.country, vehicle.price);

  const [purchasePrice, setPurchasePrice] = useState(
    numberOrEmpty(vehicle.price)
  );
  const [expectedSalePrice, setExpectedSalePrice] = useState(
    numberOrEmpty(vehicle.estimatedMarketValue)
  );
  const [transport, setTransport] = useState(defaults.transport);
  const [registration, setRegistration] = useState(defaults.registration);
  const [gestor, setGestor] = useState(defaults.gestor);
  const [itv, setItv] = useState(defaults.itv);
  const [detailing, setDetailing] = useState(defaults.detailing);
  const [riskBuffer, setRiskBuffer] = useState(defaults.riskBuffer);
  const [otros, setOtros] = useState(defaults.otros);
  const [margenDeseado, setMargenDeseado] = useState(defaults.margenDeseado);

  // Si cambia el vehículo (otra ficha), re-sembramos los campos prellenados.
  useEffect(() => {
    setPurchasePrice(numberOrEmpty(vehicle.price));
    setExpectedSalePrice(numberOrEmpty(vehicle.estimatedMarketValue));

    const nextDefaults = getDefaultImportCosts(vehicle.country, vehicle.price);
    setTransport(nextDefaults.transport);
    setRegistration(nextDefaults.registration);
    setGestor(nextDefaults.gestor);
    setItv(nextDefaults.itv);
    setDetailing(nextDefaults.detailing);
    setRiskBuffer(nextDefaults.riskBuffer);
    setOtros(nextDefaults.otros);
    setMargenDeseado(nextDefaults.margenDeseado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle.price, vehicle.estimatedMarketValue, vehicle.country, vehicle.id]);

  const result = calculateImportResult({
    purchasePrice,
    transport,
    registration,
    gestor,
    itv,
    detailing,
    riskBuffer,
    otros,
    margenDeseado,
    expectedSalePrice,
  });

  return (
    <div style={containerStyle}>
      <p style={eyebrowStyle}>Calculadora de importación</p>

      <div style={gridStyle}>
        <NumberField
          label="Precio compra (€)"
          value={purchasePrice}
          onChange={setPurchasePrice}
        />
        <NumberField
          label="Precio venta estimado (€)"
          value={expectedSalePrice}
          onChange={setExpectedSalePrice}
        />
        <NumberField
          label="Transporte (€)"
          value={transport}
          onChange={setTransport}
        />
        <NumberField
          label="Matriculación (€)"
          value={registration}
          onChange={setRegistration}
        />
        <NumberField
          label="Gestoría (€)"
          value={gestor}
          onChange={setGestor}
        />
        <NumberField label="ITV (€)" value={itv} onChange={setItv} />
        <NumberField
          label="Detailing (€)"
          value={detailing}
          onChange={setDetailing}
        />
        <NumberField
          label="Buffer riesgo (€)"
          value={riskBuffer}
          onChange={setRiskBuffer}
        />
        <NumberField
          label="Otros costes (€)"
          value={otros}
          onChange={setOtros}
        />
        <NumberField
          label="Margen deseado (€)"
          value={margenDeseado}
          onChange={setMargenDeseado}
        />
      </div>

      <div style={resultsGridStyle}>
        <Result label="Coste total" value={formatEuro(result.costeTotal)} />
        <Result
          label="Capital necesario"
          value={formatEuro(result.capitalNecesario)}
        />
        <Result
          label="Beneficio"
          value={`${result.beneficio > 0 ? "+" : ""}${formatEuro(result.beneficio)}`}
          highlight={result.beneficio > 0}
        />
        <Result label="ROI" value={formatPercent(result.roi)} highlight={result.roi > 0} />
        <Result
          label="Precio máximo de compra"
          value={formatEuro(result.precioMaximoCompra)}
        />
      </div>

      {(!purchasePrice || !expectedSalePrice) && (
        <p style={hintStyle}>
          {!purchasePrice && !expectedSalePrice
            ? "Añade el precio de compra y el precio de venta estimado para calcular capital necesario, beneficio, ROI y precio máximo de compra."
            : !purchasePrice
            ? "Añade el precio de compra para calcular el capital necesario, el beneficio y el ROI."
            : "Añade un precio de venta estimado para calcular beneficio, ROI y precio máximo de compra."}
        </p>
      )}
    </div>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <label style={fieldStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      <input
        type="number"
        value={value}
        onChange={(event) => {
          const raw = event.target.value;
          onChange(raw === "" ? "" : Number(raw));
        }}
        style={inputStyle}
      />
    </label>
  );
}

function Result({ label, value, highlight = false }) {
  return (
    <div style={resultStyle}>
      <span style={resultLabelStyle}>{label}</span>
      <strong
        style={{
          ...resultValueStyle,
          color: highlight ? "#86efac" : "white",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function numberOrEmpty(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : "";
}

function formatEuro(value) {
  if (value === null || value === undefined) return "—";
  const number = Number(value);
  return `${Math.round(Number.isFinite(number) ? number : 0).toLocaleString("es-ES")} €`;
}

function formatPercent(value) {
  if (value === null || value === undefined) return "—";
  return `${value}%`;
}

const containerStyle = {
  marginTop: "18px",
  padding: "20px",
  borderRadius: "20px",
  background: "rgba(2,6,23,0.55)",
  border: "1px solid rgba(148,163,184,0.18)",
};

const eyebrowStyle = {
  margin: "0 0 14px",
  color: "#93c5fd",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontSize: "12px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
  gap: "12px",
  marginBottom: "16px",
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const fieldLabelStyle = {
  color: "#94a3b8",
  fontSize: "12px",
  fontWeight: "800",
};

const inputStyle = {
  padding: "10px 12px",
  borderRadius: "12px",
  border: "1px solid rgba(148,163,184,0.24)",
  background: "rgba(15,23,42,0.78)",
  color: "white",
  fontWeight: "800",
  fontSize: "14px",
};

const resultsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
  gap: "12px",
};

const resultStyle = {
  padding: "14px",
  borderRadius: "16px",
  background: "rgba(15,23,42,0.78)",
  border: "1px solid rgba(148,163,184,0.12)",
};

const resultLabelStyle = {
  display: "block",
  color: "#94a3b8",
  fontSize: "12px",
  fontWeight: "800",
  marginBottom: "6px",
};

const resultValueStyle = {
  display: "block",
  fontSize: "18px",
  fontWeight: "950",
};

const hintStyle = {
  marginTop: "14px",
  marginBottom: 0,
  color: "#fde68a",
  fontSize: "13px",
  fontWeight: "700",
  lineHeight: 1.5,
};
