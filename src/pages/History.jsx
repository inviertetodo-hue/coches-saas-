import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [filter, setFilter] = useState("TODOS");

  useEffect(() => {
    loadAnalyses();
  }, []);

  async function loadAnalyses() {
    const { data, error } = await supabase
      .from("import_analyses")
      .select("*")
      .order("score", { ascending: false });

    if (!error) setAnalyses(data);
  }

  async function deleteAnalysis(id) {
    const { error } = await supabase
      .from("import_analyses")
      .delete()
      .eq("id", id);

    if (!error) loadAnalyses();
  }

  function exportCSV() {
    const rows = [
      ["Pais", "Beneficio", "ROI", "Score", "URL"],
      ...filteredAnalyses.map((item) => [
        item.country,
        item.profit,
        item.roi,
        item.score,
        item.url || "",
      ]),
    ];

    const csv = rows.map((row) => row.join(";")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "historial-coches-ia.csv";
    a.click();
  }

  const filteredAnalyses = analyses.filter((item) => {
    if (filter === "TODOS") return true;
    if (filter === "CHOLLO IA") return item.score >= 85;
    if (filter === "ANALIZAR") return item.score >= 60 && item.score < 85;
    if (filter === "DESCARTAR") return item.score < 60;
    return true;
  });

  const totalCars = analyses.length;

  const totalProfit = analyses.reduce(
    (acc, item) => acc + Number(item.profit || 0),
    0
  );

  const averageROI =
    analyses.length > 0
      ? Math.round(
          analyses.reduce(
            (acc, item) => acc + Number(item.roi || 0),
            0
          ) / analyses.length
        )
      : 0;

  const totalChollos = analyses.filter(
    (item) => item.score >= 85
  ).length;

  function getLabel(score) {
    if (score >= 85) return "🔥 CHOLLO IA";
    if (score >= 60) return "🟡 ANALIZAR";
    return "🔴 DESCARTAR";
  }

  function getCardStyle(score) {
    if (score >= 85) {
      return {
        border: "1px solid rgba(34,197,94,0.35)",
        boxShadow: "0 0 40px rgba(34,197,94,0.18)",
      };
    }

    if (score >= 60) {
      return {
        border: "1px solid rgba(250,204,21,0.35)",
        boxShadow: "0 0 40px rgba(250,204,21,0.15)",
      };
    }

    return {
      border: "1px solid rgba(239,68,68,0.35)",
      boxShadow: "0 0 40px rgba(239,68,68,0.15)",
    };
  }

  return (
    <div style={pageStyle}>
      <div style={backgroundGlowOne}></div>
      <div style={backgroundGlowTwo}></div>

      <div style={containerStyle}>
        <div style={headerStyle}>
          <p style={badgeStyle}>Coches SaaS · Historial Inteligente</p>

          <h1 style={titleStyle}>Historial IA Premium</h1>

          <p style={subtitleStyle}>
            Analiza tus mejores oportunidades de importación y clasifícalas por
            potencial de beneficio.
          </p>
        </div>

        <div style={dashboardGridStyle}>
          <div style={dashboardCardStyle}>
            <p style={dashboardLabelStyle}>🚘 Total vehículos</p>
            <h2 style={dashboardValueStyle}>{totalCars}</h2>
          </div>

          <div style={dashboardCardStyle}>
            <p style={dashboardLabelStyle}>💰 Beneficio total</p>
            <h2 style={dashboardValueStyle}>
              {totalProfit.toLocaleString()} €
            </h2>
          </div>

          <div style={dashboardCardStyle}>
            <p style={dashboardLabelStyle}>📈 ROI medio</p>
            <h2 style={dashboardValueStyle}>{averageROI}%</h2>
          </div>

          <div style={dashboardCardStyle}>
            <p style={dashboardLabelStyle}>🔥 Chollos IA</p>
            <h2 style={dashboardValueStyle}>{totalChollos}</h2>
          </div>
        </div>

        <div style={filterBarStyle}>
          <button
            onClick={() => setFilter("TODOS")}
            style={filterButtonStyle}
          >
            Todos
          </button>

          <button
            onClick={() => setFilter("CHOLLO IA")}
            style={filterButtonStyle}
          >
            🔥 Chollos
          </button>

          <button
            onClick={() => setFilter("ANALIZAR")}
            style={filterButtonStyle}
          >
            🟡 Analizar
          </button>

          <button
            onClick={() => setFilter("DESCARTAR")}
            style={filterButtonStyle}
          >
            🔴 Descartar
          </button>

          <button onClick={exportCSV} style={exportButtonStyle}>
            📤 Exportar CSV
          </button>
        </div>

        <div style={gridStyle}>
          {filteredAnalyses.map((item) => (
            <div
              key={item.id}
              style={{
                ...cardStyle,
                ...getCardStyle(item.score),
              }}
            >
              <div style={topRowStyle}>
                <div style={recommendationStyle}>
                  {getLabel(item.score)}
                </div>

                <div style={scoreStyle}>{item.score}</div>
              </div>

              <div style={infoGridStyle}>
                <div style={infoCardStyle}>
                  <p style={labelStyle}>🌍 País</p>
                  <p style={valueStyle}>{item.country}</p>
                </div>

                <div style={infoCardStyle}>
                  <p style={labelStyle}>💰 Beneficio</p>
                  <p style={valueStyle}>{item.profit} €</p>
                </div>

                <div style={infoCardStyle}>
                  <p style={labelStyle}>📈 ROI</p>
                  <p style={valueStyle}>{item.roi}%</p>
                </div>

                <div style={infoCardStyle}>
                  <p style={labelStyle}>🤖 Score IA</p>
                  <p style={valueStyle}>{item.score}/100</p>
                </div>
              </div>

              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  style={linkStyle}
                >
                  Ver anuncio →
                </a>
              )}

              <button
                onClick={() => deleteAnalysis(item.id)}
                style={deleteButtonStyle}
              >
                Eliminar análisis
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, #1e3a8a 0, #020617 40%, #020617 100%)",
  color: "white",
  padding: "48px",
  fontFamily: "Arial, sans-serif",
  position: "relative",
  overflow: "hidden",
};

const backgroundGlowOne = {
  position: "absolute",
  width: "400px",
  height: "400px",
  background: "#2563eb",
  filter: "blur(140px)",
  opacity: 0.18,
  top: "-100px",
  left: "-100px",
};

const backgroundGlowTwo = {
  position: "absolute",
  width: "300px",
  height: "300px",
  background: "#16a34a",
  filter: "blur(120px)",
  opacity: 0.12,
  bottom: "-80px",
  right: "-60px",
};

const containerStyle = {
  maxWidth: "1300px",
  margin: "0 auto",
  position: "relative",
  zIndex: 10,
};

const headerStyle = {
  marginBottom: "40px",
};

const badgeStyle = {
  display: "inline-block",
  background: "rgba(59,130,246,0.18)",
  color: "#93c5fd",
  padding: "8px 14px",
  borderRadius: "999px",
  fontSize: "14px",
  fontWeight: "700",
  marginBottom: "18px",
};

const titleStyle = {
  fontSize: "52px",
  margin: 0,
};

const subtitleStyle = {
  color: "#cbd5e1",
  fontSize: "18px",
  maxWidth: "720px",
  marginTop: "16px",
  lineHeight: "1.6",
};

const dashboardGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  marginBottom: "34px",
};

const dashboardCardStyle = {
  background: "rgba(15,23,42,0.82)",
  border: "1px solid rgba(148,163,184,0.16)",
  borderRadius: "24px",
  padding: "24px",
  backdropFilter: "blur(16px)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
};

const dashboardLabelStyle = {
  color: "#94a3b8",
  margin: 0,
  fontSize: "14px",
};

const dashboardValueStyle = {
  marginTop: "14px",
  marginBottom: 0,
  fontSize: "36px",
  fontWeight: "900",
};

const filterBarStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "14px",
  marginBottom: "34px",
};

const filterButtonStyle = {
  padding: "14px 18px",
  borderRadius: "14px",
  border: "1px solid rgba(148,163,184,0.18)",
  background: "rgba(15,23,42,0.75)",
  color: "white",
  fontWeight: "700",
  cursor: "pointer",
};

const exportButtonStyle = {
  padding: "14px 18px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(135deg,#2563eb,#16a34a)",
  color: "white",
  fontWeight: "900",
  cursor: "pointer",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "24px",
};

const cardStyle = {
  background: "rgba(15,23,42,0.82)",
  borderRadius: "28px",
  padding: "24px",
  backdropFilter: "blur(16px)",
  transition: "0.3s",
};

const topRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px",
};

const recommendationStyle = {
  padding: "10px 14px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.08)",
  fontWeight: "900",
};

const scoreStyle = {
  width: "72px",
  height: "72px",
  borderRadius: "999px",
  background:
    "linear-gradient(135deg, rgba(37,99,235,0.35), rgba(34,197,94,0.22))",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "28px",
  fontWeight: "900",
};

const infoGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "14px",
};

const infoCardStyle = {
  background: "rgba(2,6,23,0.75)",
  borderRadius: "18px",
  padding: "18px",
  border: "1px solid rgba(148,163,184,0.12)",
};

const labelStyle = {
  color: "#94a3b8",
  fontSize: "14px",
  margin: 0,
};

const valueStyle = {
  fontSize: "24px",
  fontWeight: "900",
  marginTop: "8px",
  marginBottom: 0,
};

const linkStyle = {
  display: "inline-block",
  marginTop: "22px",
  color: "#93c5fd",
  textDecoration: "none",
  fontWeight: "700",
};

const deleteButtonStyle = {
  marginTop: "20px",
  width: "100%",
  padding: "14px",
  borderRadius: "14px",
  border: "none",
  background: "rgba(239,68,68,0.15)",
  color: "#fca5a5",
  fontWeight: "900",
  cursor: "pointer",
};