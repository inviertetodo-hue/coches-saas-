import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Dashboard() {
  const [cars, setCars] = useState([])
  const [form, setForm] = useState({
    brand: "",
    model: "",
    price: "",
    roi: "",
    profit: ""
  })

  useEffect(() => {
    loadCars()
  }, [])

  async function loadCars() {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .order("id", { ascending: false })

    if (error) {
      console.log(error)
      return
    }

    setCars(data)
  }

  async function addCar(e) {
    e.preventDefault()

    const { error } = await supabase
      .from("cars")
      .insert({
        brand: form.brand,
        model: form.model,
        price: Number(form.price),
        roi: Number(form.roi),
        profit: Number(form.profit)
      })

    if (error) {
      alert(error.message)
      return
    }

    setForm({
      brand: "",
      model: "",
      price: "",
      roi: "",
      profit: ""
    })

    loadCars()
  }

  return (
    <div>
      <h1>📊 Dashboard</h1>

      <p>
        Coches en base de datos:
        <strong> {cars.length}</strong>
      </p>

      <form className="car-form" onSubmit={addCar}>
        <input placeholder="Marca" value={form.brand} onChange={(e)=>setForm({...form, brand:e.target.value})} />
        <input placeholder="Modelo" value={form.model} onChange={(e)=>setForm({...form, model:e.target.value})} />
        <input placeholder="Precio" value={form.price} onChange={(e)=>setForm({...form, price:e.target.value})} />
        <input placeholder="ROI" value={form.roi} onChange={(e)=>setForm({...form, roi:e.target.value})} />
        <input placeholder="Profit" value={form.profit} onChange={(e)=>setForm({...form, profit:e.target.value})} />

        <button type="submit">
          Añadir coche
        </button>
      </form>

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
