import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Dashboard() {

  const [stats, setStats] = useState({
    total: 0,
    chollos: 0,
    analizar: 0,
    descartar: 0,
    beneficioTotal: 0,
    roiMedio: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {

    const { data, error } = await supabase
      .from("import_analyses")
      .select("*")

    if (error) return

    const total = data.length

    const chollos =
      data.filter(item => item.score >= 85).length

    const analizar =
      data.filter(item =>
        item.score >= 60 && item.score < 85
      ).length

    const descartar =
      data.filter(item => item.score < 60).length

    const beneficioTotal =
      data.reduce((acc, item) =>
        acc + Number(item.profit || 0), 0)

    const roiMedio =
      total > 0
        ? (
            data.reduce((acc, item) =>
              acc + Number(item.roi || 0), 0
            ) / total
          ).toFixed(1)
        : 0

    setStats({
      total,
      chollos,
      analizar,
      descartar,
      beneficioTotal,
      roiMedio
    })
  }

  return (

    <div className="dashboard-page">

      <h1>📊 Dashboard IA</h1>

      <div className="stats-grid">

        <div className="stat-card">
          <h2>🚗 Analizados</h2>
          <p>{stats.total}</p>
        </div>

        <div className="stat-card">
          <h2>🔥 Chollos</h2>
          <p>{stats.chollos}</p>
        </div>

        <div className="stat-card">
          <h2>🟡 Analizar</h2>
          <p>{stats.analizar}</p>
        </div>

        <div className="stat-card">
          <h2>🔴 Descartar</h2>
          <p>{stats.descartar}</p>
        </div>

        <div className="stat-card">
          <h2>💰 Beneficio total</h2>
          <p>{stats.beneficioTotal}€</p>
        </div>

        <div className="stat-card">
          <h2>📈 ROI medio</h2>
          <p>{stats.roiMedio}%</p>
        </div>

      </div>

    </div>
  )
}