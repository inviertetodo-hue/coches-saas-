import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Dashboard() {

  const [cars, setCars] = useState([])

  const [form, setForm] = useState({
    brand: "",
    model: "",
    price: "",
    roi: "",
    profit: "",
    origin_country: "",
    transport_cost: "",
    registration_cost: "",
    repair_cost: "",
    spain_market_price: "",
    ai_score: ""
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

  async function deleteCar(id) {

    const { error } = await supabase
      .from("cars")
      .delete()
      .eq("id", id)

    if (error) {
      alert(error.message)
      return
    }

    loadCars()
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
        profit:
          Number(form.spain_market_price)
          - Number(form.price)
          - Number(form.transport_cost)
          - Number(form.registration_cost)
          - Number(form.repair_cost),

        origin_country: form.origin_country,
        transport_cost: Number(form.transport_cost),
        registration_cost: Number(form.registration_cost),
        repair_cost: Number(form.repair_cost),
        spain_market_price: Number(form.spain_market_price),
        ai_score:
          (
            (
              Number(form.spain_market_price)
              - Number(form.price)
              - Number(form.transport_cost)
              - Number(form.registration_cost)
              - Number(form.repair_cost)
            ) / Number(form.price)
          ) * 100
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
      profit: "",
      origin_country: "",
      transport_cost: "",
      registration_cost: "",
      repair_cost: "",
      spain_market_price: "",
      ai_score: ""
    })

    loadCars()
  }

  return (
    <div>
      <h1>📊 Dashboard IA</h1>

      <p>
        Coches analizados:
        <strong> {cars.length}</strong>
      </p>

      <form className="car-form" onSubmit={addCar}>

        <input
          placeholder="Marca"
          value={form.brand}
          onChange={(e)=>setForm({...form, brand:e.target.value})}
        />

        <input
          placeholder="Modelo"
          value={form.model}
          onChange={(e)=>setForm({...form, model:e.target.value})}
        />

        <input
          placeholder="Precio compra"
          value={form.price}
          onChange={(e)=>setForm({...form, price:e.target.value})}
        />

        <input
          placeholder="ROI"
          value={form.roi}
          onChange={(e)=>setForm({...form, roi:e.target.value})}
        />

        <input
          placeholder="Profit"
          value={form.profit}
          onChange={(e)=>setForm({...form, profit:e.target.value})}
        />

        <input
          placeholder="País origen"
          value={form.origin_country}
          onChange={(e)=>setForm({...form, origin_country:e.target.value})}
        />

        <input
          placeholder="Coste transporte"
          value={form.transport_cost}
          onChange={(e)=>setForm({...form, transport_cost:e.target.value})}
        />

        <input
          placeholder="Coste matriculación"
          value={form.registration_cost}
          onChange={(e)=>setForm({...form, registration_cost:e.target.value})}
        />

        <input
          placeholder="Coste reparación"
          value={form.repair_cost}
          onChange={(e)=>setForm({...form, repair_cost:e.target.value})}
        />

        <input
          placeholder="Precio mercado España"
          value={form.spain_market_price}
          onChange={(e)=>setForm({...form, spain_market_price:e.target.value})}
        />

        <input
          placeholder="Score IA"
          value={form.ai_score}
          onChange={(e)=>setForm({...form, ai_score:e.target.value})}
        />

        <button type="submit">
          Analizar coche
        </button>

      </form>

      <div className="grid">

        {cars.map((car) => (

          <div className="card" key={car.id}>

            <h3>
              {car.brand} {car.model}
            </h3>

            <p>🌍 {car.origin_country}</p>

            <p>💵 Compra: {car.price}€</p>

            <p>🚛 Transporte: {car.transport_cost}€</p>

            <p>📋 Matriculación: {car.registration_cost}€</p>

            <p>🔧 Reparación: {car.repair_cost}€</p>

            <p>🇪🇸 Mercado España: {car.spain_market_price}€</p>

            <p>📈 ROI: {car.roi}%</p>

            <h2>💰 {car.profit}€</h2>

            <h3>🤖 Score IA: {car.ai_score}/100</h3>

            <button
              className="delete-btn"
              onClick={() => deleteCar(car.id)}
            >
              Eliminar
            </button>

          </div>

        ))}

      </div>
    </div>
  )
}
