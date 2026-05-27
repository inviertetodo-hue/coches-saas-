import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Deals() {
  const [deals, setDeals] = useState([])

  useEffect(() => {
    loadDeals()
  }, [])

  async function loadDeals() {
    const { data, error } = await supabase
      .from("import_analyses")
      .select("*")
      .gte("score", 60)
      .order("score", { ascending: false })

    if (!error) {
      setDeals(data)
    }
  }

  return (
    <div className="history-page">

      <h1>🔥 Chollos IA</h1>

      <p>
        Ranking automático de oportunidades con score alto.
      </p>

      <div className="history-grid">

        {deals.map((item, index) => (
          <div key={item.id} className="history-card">

            <h2>
              #{index + 1}{" "}
              {item.score >= 85 ? "🔥 CHOLLO IA" : "🟡 ANALIZAR"}
            </h2>

            <p>🌍 País: {item.country}</p>
            <p>💰 Beneficio: {item.profit}€</p>
            <p>📈 ROI: {item.roi}%</p>
            <p>🤖 Score: {item.score}/100</p>

            {item.url && (
              <a href={item.url} target="_blank">
                Ver anuncio original
              </a>
            )}

          </div>
        ))}

      </div>

    </div>
  )
}