import { useCallback, useState } from "react";

import { readListingFromUrl } from "../services/market/listingReader";
import ImportCostCalculator from "../components/calculator/ImportCostCalculator";

export default function Calculator() {
  const [url, setUrl] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [message, setMessage] = useState("");

  const [vehicle, setVehicle] = useState({
    title: "",
    price: "",
    estimatedMarketValue: "",
    country: "Alemania",
    id: "manual",
  });

  const updateField = useCallback((field, value) => {
    setVehicle((current) => ({ ...current, [field]: value }));
  }, []);

  const readFromUrl = useCallback(async () => {
    const cleanUrl = url.trim();

    if (!cleanUrl) {
      setMessage("Pega el enlace de un anuncio para autocompletar los datos.");
      return;
    }

    setIsReading(true);
    setMessage("");

    const listing = await readListingFromUrl(cleanUrl);
    setIsReading(false);

    if (!listing.success) {
      setMessage(
        listing.message ||
          "No se han podido leer datos automáticos. Añade el precio manualmente."
      );
      return;
    }

    const data = listing.data || {};

    setVehicle((current) => ({
      ...current,
      title: data.title || current.title,
      price: data.price || current.price,
      country: data.country || current.country,
      id: cleanUrl,
    }));

    setMessage(listing.message || "Anuncio leído correctamente.");
  }, [url]);

  const readWithEnter = useCallback(
    (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      readFromUrl();
    },
    [readFromUrl]
  );

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <p style={badgeStyle}>Coches SaaS · Calculadora</p>
          <h1 style={titleStyle}>Calcula tu importación</h1>
          <p style={subtitleStyle}>
            Pega el enlace de un anuncio o introduce los datos a mano, ajusta
            tus costes y descubre coste total, beneficio, ROI, capital
            necesario y precio máximo de compra al instante.
          </p>
        </div>

        <div style={cardStyle}>
          <input
            placeholder="Enlace del anuncio (opcional)"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={readWithEnter}
            style={inputStyle}
          />

          <button
            onClick={readFromUrl}
            disabled={isReading}
            style={{ ...buttonStyle, opacity: isReading ? 0.65 : 1 }}
          >
            {isReading ? "Leyendo anuncio..." : "Leer anuncio"}
          </button>

          <div style={fieldsGridStyle}>
            <input
              placeholder="Título del vehículo"
              value={vehicle.title}
              onChange={(event) => updateField("title", event.target.value)}
              style={{ ...inputStyle, marginTop: 0 }}
            />

            <input
              placeholder="País de origen (ej. Alemania)"
              value={vehicle.country}
              onChange={(event) => updateField("country", event.target.value)}
              style={{ ...inputStyle, marginTop: 0 }}
            />

            <input
              type="number"
              placeholder="Precio de compra (€)"
              value={vehicle.price}
              onChange={(event) => updateField("price", event.target.value)}
              style={{ ...inputStyle, marginTop: 0 }}
            />

            <input
              type="number"
              placeholder="Precio de venta estimado (€)"
              value={vehicle.estimatedMarketValue}
              onChange={(event) =>
                updateField("estimatedMarketValue", event.target.value)
              }
              style={{ ...inputStyle, marginTop: 0 }}
            />
          </div>

          {message && <p style={messageStyle}>{message}</p>}

          <ImportCostCalculator vehicle={vehicle} />
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, #1e3a8a 0, #020617 40%, #020617 100%)",
  color: "white",
  padding: "48px",
  fontFamily: "Arial, sans-serif",
};

const containerStyle = {
  maxWidth: "1250px",
  margin: "0 auto",
};

const headerStyle = {
  marginBottom: "40px",
};

const badgeStyle = {
  display: "inline-block",
  background: "rgba(59,130,246,0.18)",
  color: "#93c5fd",
  padding: "8px 14px",
  borderRadius: "999px",
  fontWeight: "700",
};

const titleStyle = {
  fontSize: "clamp(36px, 6vw, 52px)",
  margin: "16px 0 0",
};

const subtitleStyle = {
  color: "#cbd5e1",
  marginTop: "14px",
  lineHeight: "1.6",
};

const cardStyle = {
  background: "rgba(15,23,42,0.82)",
  borderRadius: "28px",
  padding: "30px",
  border: "1px solid rgba(148,163,184,0.16)",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "16px",
  marginTop: "14px",
  borderRadius: "16px",
  border: "1px solid rgba(148,163,184,0.18)",
  background: "rgba(2,6,23,0.65)",
  color: "white",
  fontWeight: "700",
  fontSize: "15px",
};

const buttonStyle = {
  marginTop: "14px",
  width: "100%",
  padding: "16px",
  borderRadius: "16px",
  border: "none",
  background: "linear-gradient(135deg,#2563eb,#16a34a)",
  color: "white",
  fontWeight: "900",
  cursor: "pointer",
};

const messageStyle = {
  marginTop: "18px",
  color: "#93c5fd",
  fontWeight: "800",
  lineHeight: "1.5",
};

const fieldsGridStyle = {
  marginTop: "14px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: "14px",
};
