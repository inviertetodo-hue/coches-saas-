import { analyzeCar } from "../services/profitAnalyzer";

export default function Importer() {
  const car = {
    title: "BMW 320d Touring",
    price: 18900,
    km: 95000,
    year: 2020,
  };

  const analysis = analyzeCar(car);

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

      <div
        style={{
          background: "#111827",
          padding: "30px",
          borderRadius: "12px",
          marginTop: "30px",
        }}
      >
        <h2>{car.title}</h2>

        <p>Precio Alemania: {car.price} €</p>

        <p>Kilómetros: {car.km}</p>

        <p>Año: {car.year}</p>

        <hr />

        <h2>ANÁLISIS IA</h2>

        <p>Score IA: {analysis.score}/100</p>

        <p>Recomendación: {analysis.recommendation}</p>

        <p>
          Precio estimado venta España:
          {" "}
          {Math.round(analysis.estimatedSalePrice)} €
        </p>

        <p>
          Beneficio estimado:
          {" "}
          {Math.round(analysis.estimatedProfit)} €
        </p>
      </div>
    </div>
  );
}