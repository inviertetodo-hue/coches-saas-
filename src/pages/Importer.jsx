import { useState } from "react"

export default function Importer() {
  const [form, setForm] = useState({
    url: "",
    country: "Alemania",
    buyPrice: "",
    transport: "",
    registration: "",
    repair: "",
    spainPrice: ""
  })

  const totalCost =
    Number(form.buyPrice) +
    Number(form.transport) +
    Number(form.registration) +
    Number(form.repair)

  const profit =
    Number(form.spainPrice) - totalCost

  const roi =
    form.buyPrice
      ? ((profit / Number(form.buyPrice)) * 100).toFixed(1)
      : 0

  const score =
    profit > 6000 && roi > 18
      ? 92
      : profit > 3500 && roi > 12
        ? 78
        : profit > 1500
          ? 58
          : 30

  const verdict =
    score >= 85
      ? "🔥 CHOLLO IA"
      : score >= 70
        ? "🟢 MUY INTERESANTE"
        : score >= 50
          ? "🟡 ANALIZAR CON CALMA"
          : "🔴 DESCARTAR"

  return (
    <div>
      <h1>🔗 Importador IA Europa → España</h1>

      <p>
        Pega una URL de un coche europeo y calcula si merece la pena importarlo.
      </p>

      <div className="importer-box">
        <input
          placeholder="URL del anuncio europeo"
          value={form.url}
          onChange={(e)=>setForm({...form, url:e.target.value})}
        />

        <select
          value={form.country}
          onChange={(e)=>setForm({...form, country:e.target.value})}
        >
          <option>Alemania</option>
          <option>Francia</option>
          <option>Bélgica</option>
          <option>Holanda</option>
          <option>Italia</option>
        </select>

        <input
          placeholder="Precio compra Europa"
          value={form.buyPrice}
          onChange={(e)=>setForm({...form, buyPrice:e.target.value})}
        />

        <input
          placeholder="Transporte"
          value={form.transport}
          onChange={(e)=>setForm({...form, transport:e.target.value})}
        />

        <input
          placeholder="Matriculación / impuestos"
          value={form.registration}
          onChange={(e)=>setForm({...form, registration:e.target.value})}
        />

        <input
          placeholder="Reparación / preparación"
          value={form.repair}
          onChange={(e)=>setForm({...form, repair:e.target.value})}
        />

        <input
          placeholder="Precio mercado España"
          value={form.spainPrice}
          onChange={(e)=>setForm({...form, spainPrice:e.target.value})}
        />
      </div>

      <div className="result-box">
        <h2>{verdict}</h2>

        <p>🌍 País origen: {form.country}</p>
        <p>💵 Coste total importación: {totalCost}€</p>
        <p>💰 Beneficio estimado: {profit}€</p>
        <p>📈 ROI estimado: {roi}%</p>
        <p>🤖 Score IA: {score}/100</p>

        <p>
          La IA recomienda esta operación según margen,
          coste total, ROI y potencial de reventa en España.
        </p>
      </div>
    </div>
  )
}
