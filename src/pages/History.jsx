import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function History() {
  const [analyses, setAnalyses] = useState([])
  const [filter, setFilter] = useState("TODOS")

  useEffect(() => {
    loadAnalyses()
  }, [])

  async function loadAnalyses() {
    const { data, error } = await supabase
      .from("import_analyses")
      .select("*")
      .order("score", { ascending: false })

    if (!error) setAnalyses(data)
  }

  async function deleteAnalysis(id) {
    const { error } = await supabase
      .from("import_analyses")
      .delete()
      .eq("id", id)

    if (!error) loadAnalyses()
  }

  function exportCSV() {
    const rows = [
      ["Pais", "Beneficio", "ROI", "Score", "URL"],
      ...filteredAnalyses.map((item) => [
        item.country,
        item.profit,
        item.roi,
        item.score,
        item.url || ""
      ])
    ]

    const csv = rows.map((row) => row.join(";")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "historial-coches-ia.csv"
    a.click()
  }

  const filteredAnalyses = analyses.filter((item) => {
    if (filter === "TODOS") return true
    if (filter === "CHOLLO IA") return item.score >= 85
    if (filter === "ANALIZAR") return item.score >= 60 && item.score < 85
    if (filter === "DESCARTAR") return item.score < 60
    return true
  })

  return (
    <div className="history-page">

      <h1>🔥 Historial IA Pro</h1>

      <div className="filter-bar">
        <button onClick={() => setFilter("TODOS")}>Todos</button>
        <button onClick={() => setFilter("CHOLLO IA")}>🔥 Chollos</button>
        <button onClick={() => setFilter("ANALIZAR")}>🟡 Analizar</button>
        <button onClick={() => setFilter("DESCARTAR")}>🔴 Descartar</button>
        <button onClick={exportCSV}>📤 Exportar Excel</button>
      </div>

      <div className="history-grid">

        {filteredAnalyses.map((item) => {
          const label =
            item.score >= 85
              ? "🔥 CHOLLO IA"
              : item.score >= 60
                ? "🟡 ANALIZAR"
                : "🔴 DESCARTAR"

          return (
            <div key={item.id} className="history-card">

              <h2>{label}</h2>

              <p>🌍 País: {item.country}</p>
              <p>💰 Beneficio: {item.profit}€</p>
              <p>📈 ROI: {item.roi}%</p>
              <p>🤖 Score: {item.score}/100</p>

              {item.url && (
                <a href={item.url} target="_blank">
                  Ver anuncio
                </a>
              )}

              <button onClick={() => deleteAnalysis(item.id)}>
                Eliminar
              </button>

            </div>
          )
        })}

      </div>

    </div>
  )
}