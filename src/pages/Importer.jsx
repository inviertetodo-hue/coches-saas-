import { useState } from "react";

export default function Importer() {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState("");

  const analizarVehiculo = async () => {
    try {
      setLoading(true);
      setResultado("");

      const response = await fetch(
        "https://ohtxirarsonewffizser.supabase.co/functions/v1/scrape-car",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: "https://suchen.mobile.de/fahrzeuge/details.html?id=397445030",
          }),
        }
      );

      const data = await response.json();

      console.log(data);

      if (data.ok) {
        setResultado(`
HTML OK

Tamaño HTML: ${data.htmlLength}

Vista previa:
${data.preview}
        `);
      } else {
        setResultado("ERROR SCRAPING");
      }
    } catch (error) {
      console.log(error);
      setResultado("ERROR GENERAL");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1>Importador IA</h1>

      <button
        onClick={analizarVehiculo}
        style={{
          padding: "15px 25px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
          marginTop: "20px",
        }}
      >
        {loading ? "Cargando..." : "Analizar Vehículo"}
      </button>

      <pre
        style={{
          marginTop: "30px",
          background: "#111827",
          padding: "20px",
          borderRadius: "10px",
          whiteSpace: "pre-wrap",
          fontSize: "14px",
          overflow: "auto",
        }}
      >
        {resultado}
      </pre>
    </div>
  );
}
