import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Dashboard() {

  const [cars, setCars] = useState([])

  useEffect(() => {
    loadCars()
  }, [])

  async function loadCars() {

    const { data, error } = await supabase
      .from("cars")
      .select("*")

    if (error) {
      console.log(error)
      return
    }

    setCars(data)
  }

  return (
    <div>
      <h1>📊 Dashboard</h1>

      <p>
        Coches en base de datos:
        <strong> {cars.length}</strong>
      </p>

      <div className="grid">
        {cars.map((car) => (
          <div className="card" key={car.id}>
            <h3>{car.brand} {car.model}</h3>

            <p>Precio: {car.price}€</p>

            <p>ROI: {car.roi}%</p>

            <h2>💰 {car.profit}€</h2>
          </div>
        ))}
      </div>
    </div>
  )
}
