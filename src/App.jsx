import Analytics from "./components/Analytics"
import "./App.css"

export default function App() {
  const cars = [
    {brand:"BMW", model:"M340i", price:32000, roi:22, profit:7000},
    {brand:"Audi", model:"RS4", price:28000, roi:18, profit:5000}
  ]

  return (
    <div className="app">
      <aside>
        <h1>🚘 Coches SaaS</h1>
        <button>📊 Dashboard</button>
        <button>🔥 Chollos IA</button>
        <button>🔗 Importador</button>
      </aside>

      <main>
        <h2>Motor IA profesional</h2>

        <div className="kpis">
          <div>Total coches <strong>{cars.length}</strong></div>
          <div>ROI medio <strong>20%</strong></div>
          <div>Profit total <strong>12.000€</strong></div>
        </div>

        <div className="grid">
          {cars.map((car, i) => (
            <div className="card" key={i}>
              <h3>{car.brand} {car.model}</h3>
              <p>Precio: {car.price}€</p>
              <p>ROI: {car.roi}%</p>
              <h2>💰 {car.profit}€</h2>
              <button>⭐ Favorito</button>
            </div>
          ))}
        </div>
      </main>
      <Analytics />

    </div>
  )
}
