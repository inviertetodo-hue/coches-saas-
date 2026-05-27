import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

import {
  analyzeMarketIntelligence,
} from "../services/profitAnalyzer";

export default function History() {
  const [analyses, setAnalyses] =
    useState([]);

  const [filter, setFilter] =
    useState("TODOS");

  const [search, setSearch] =
    useState("");

  const [sortBy, setSortBy] =
    useState("score");

  useEffect(() => {
    loadAnalyses();
  }, []);

  async function loadAnalyses() {
    const { data, error } =
      await supabase
        .from("import_analyses")
        .select("*")
        .order("score", {
          ascending: false,
        });

    if (!error) {
      setAnalyses(data);
    }
  }

  async function deleteAnalysis(id) {
    const { error } =
      await supabase
        .from("import_analyses")
        .delete()
        .eq("id", id);

    if (!error) {
      loadAnalyses();
    }
  }

  const market =
    analyzeMarketIntelligence(
      analyses
    );

  const filteredAnalyses =
    useMemo(() => {
      let result = [...analyses];

      if (search.trim()) {
        result = result.filter(
          (item) => {
            const text = `
              ${item.title || ""}
              ${item.brand || ""}
              ${item.model || ""}
              ${item.drivetrain || ""}
              ${item.fuel_type || ""}
            `.toLowerCase();

            return text.includes(
              search.toLowerCase()
            );
          }
        );
      }

      if (filter === "CHOLLO IA") {
        result = result.filter(
          (item) =>
            item.score >= 85
        );
      }

      if (filter === "ANALIZAR") {
        result = result.filter(
          (item) =>
            item.score >= 60 &&
            item.score < 85
        );
      }

      if (filter === "DESCARTAR") {
        result = result.filter(
          (item) =>
            item.score < 60
        );
      }

      result.sort((a, b) => {
        if (sortBy === "score") {
          return (
            b.score - a.score
          );
        }

        if (sortBy === "roi") {
          return b.roi - a.roi;
        }

        if (sortBy === "profit") {
          return (
            b.profit -
            a.profit
          );
        }

        return 0;
      });

      return result;
    }, [
      analyses,
      filter,
      search,
      sortBy,
    ]);

  function getLabel(score) {
    if (score >= 85)
      return "🔥 CHOLLO IA";

    if (score >= 60)
      return "🟡 ANALIZAR";

    return "🔴 DESCARTAR";
  }

  function Badge({
    children,
  }) {
    return (
      <div
        style={{
          background:
            "rgba(255,255,255,0.06)",

          border:
            "1px solid rgba(148,163,184,0.12)",

          padding:
            "8px 12px",

          borderRadius:
            "999px",

          fontSize: "13px",

          fontWeight: "700",
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <p style={badgeStyle}>
            Coches SaaS · Market
            Intelligence
          </p>

          <h1 style={titleStyle}>
            AI Market Dashboard
          </h1>

          <p style={subtitleStyle}>
            Inteligencia global de
            mercado basada en tu
            dataset IA.
          </p>
        </div>

        <div
          style={marketGridStyle}
        >
          <div
            style={marketCardStyle}
          >
            <p style={marketLabel}>
              ROI Medio
            </p>

            <h2 style={marketValue}>
              {market.averageROI || 0}
              %
            </h2>
          </div>

          <div
            style={marketCardStyle}
          >
            <p style={marketLabel}>
              Score Medio
            </p>

            <h2 style={marketValue}>
              {
                market.averageScore
              }
            </h2>
          </div>

          <div
            style={marketCardStyle}
          >
            <p style={marketLabel}>
              Marca Dominante
            </p>

            <h2 style={marketValue}>
              {market.bestBrand ||
                "-"}
            </h2>
          </div>

          <div
            style={marketCardStyle}
          >
            <p style={marketLabel}>
              Configuración Top
            </p>

            <h2
              style={
                marketConfigStyle
              }
            >
              {market.bestConfiguration ||
                "-"}
            </h2>
          </div>
        </div>

        <div
          style={insightsContainerStyle}
        >
          <p style={sectionTitle}>
            🧠 Market Insights
          </p>

          {market.marketInsights?.map(
            (
              insight,
              index
            ) => (
              <div
                key={index}
                style={
                  insightCardStyle
                }
              >
                {insight}
              </div>
            )
          )}
        </div>

        <div
          style={
            controlsContainerStyle
          }
        >
          <input
            placeholder="Buscar BMW, xDrive..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            style={searchInputStyle}
          />

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value
              )
            }
            style={selectStyle}
          >
            <option value="score">
              Score IA
            </option>

            <option value="roi">
              ROI
            </option>

            <option value="profit">
              Beneficio
            </option>
          </select>
        </div>

        <div style={filterBarStyle}>
          <button
            onClick={() =>
              setFilter("TODOS")
            }
            style={filterButtonStyle}
          >
            Todos
          </button>

          <button
            onClick={() =>
              setFilter(
                "CHOLLO IA"
              )
            }
            style={filterButtonStyle}
          >
            🔥 Chollos
          </button>

          <button
            onClick={() =>
              setFilter(
                "ANALIZAR"
              )
            }
            style={filterButtonStyle}
          >
            🟡 Analizar
          </button>

          <button
            onClick={() =>
              setFilter(
                "DESCARTAR"
              )
            }
            style={filterButtonStyle}
          >
            🔴 Descartar
          </button>
        </div>

        <div style={gridStyle}>
          {filteredAnalyses.map(
            (item) => (
              <div
                key={item.id}
                style={cardStyle}
              >
                <div
                  style={
                    topRowStyle
                  }
                >
                  <div
                    style={
                      recommendationStyle
                    }
                  >
                    {getLabel(
                      item.score
                    )}
                  </div>

                  <div
                    style={
                      scoreStyle
                    }
                  >
                    {item.score}
                  </div>
                </div>

                <h2
                  style={
                    titleCardStyle
                  }
                >
                  {item.title ||
                    "Vehículo IA"}
                </h2>

                <div
                  style={
                    badgesGridStyle
                  }
                >
                  {item.brand && (
                    <Badge>
                      🚘{" "}
                      {
                        item.brand
                      }
                    </Badge>
                  )}

                  {item.drivetrain && (
                    <Badge>
                      🛞{" "}
                      {
                        item.drivetrain
                      }
                    </Badge>
                  )}

                  {item.fuel_type && (
                    <Badge>
                      ⚡{" "}
                      {
                        item.fuel_type
                      }
                    </Badge>
                  )}

                  {item.performance_package && (
                    <Badge>
                      🏁{" "}
                      {
                        item.performance_package
                      }
                    </Badge>
                  )}
                </div>

                <div
                  style={
                    infoGridStyle
                  }
                >
                  <div
                    style={
                      infoCardStyle
                    }
                  >
                    <p
                      style={
                        labelStyle
                      }
                    >
                      ROI
                    </p>

                    <p
                      style={
                        valueStyle
                      }
                    >
                      {item.roi}%
                    </p>
                  </div>

                  <div
                    style={
                      infoCardStyle
                    }
                  >
                    <p
                      style={
                        labelStyle
                      }
                    >
                      Beneficio
                    </p>

                    <p
                      style={
                        valueStyle
                      }
                    >
                      {
                        item.profit
                      }{" "}
                      €
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    deleteAnalysis(
                      item.id
                    )
                  }
                  style={
                    deleteButtonStyle
                  }
                >
                  Eliminar análisis
                </button>
              </div>
            )
          )}
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
  fontFamily:
    "Arial, sans-serif",
};

const containerStyle = {
  maxWidth: "1300px",
  margin: "0 auto",
};

const headerStyle = {
  marginBottom: "40px",
};

const badgeStyle = {
  display: "inline-block",
  background:
    "rgba(59,130,246,0.18)",
  color: "#93c5fd",
  padding: "8px 14px",
  borderRadius: "999px",
  fontWeight: "700",
  marginBottom: "18px",
};

const titleStyle = {
  fontSize: "52px",
  margin: 0,
};

const subtitleStyle = {
  color: "#cbd5e1",
  marginTop: "14px",
};

const marketGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: "18px",
  marginBottom: "34px",
};

const marketCardStyle = {
  background:
    "rgba(15,23,42,0.82)",
  borderRadius: "22px",
  padding: "22px",
  border:
    "1px solid rgba(148,163,184,0.12)",
};

const marketLabel = {
  color: "#94a3b8",
};

const marketValue = {
  fontSize: "32px",
  fontWeight: "900",
};

const marketConfigStyle = {
  fontSize: "18px",
  lineHeight: 1.4,
};

const insightsContainerStyle = {
  marginBottom: "34px",
};

const sectionTitle = {
  fontSize: "16px",
  fontWeight: "900",
  marginBottom: "14px",
};

const insightCardStyle = {
  background:
    "rgba(255,255,255,0.05)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
};

const controlsContainerStyle = {
  display: "flex",
  gap: "16px",
  marginBottom: "24px",
};

const searchInputStyle = {
  flex: 1,
  padding: "16px",
  borderRadius: "16px",
  border:
    "1px solid rgba(148,163,184,0.18)",
  background:
    "rgba(15,23,42,0.75)",
  color: "white",
};

const selectStyle = {
  padding: "16px",
  borderRadius: "16px",
  background:
    "rgba(15,23,42,0.75)",
  color: "white",
};

const filterBarStyle = {
  display: "flex",
  gap: "14px",
  marginBottom: "34px",
  flexWrap: "wrap",
};

const filterButtonStyle = {
  padding: "14px 18px",
  borderRadius: "14px",
  border:
    "1px solid rgba(148,163,184,0.18)",
  background:
    "rgba(15,23,42,0.75)",
  color: "white",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(360px, 1fr))",
  gap: "24px",
};

const cardStyle = {
  background:
    "rgba(15,23,42,0.82)",
  borderRadius: "28px",
  padding: "24px",
};

const topRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "24px",
};

const recommendationStyle = {
  padding: "10px 14px",
  borderRadius: "999px",
  background:
    "rgba(255,255,255,0.08)",
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

const titleCardStyle = {
  fontSize: "24px",
  marginBottom: "18px",
};

const badgesGridStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginBottom: "24px",
};

const infoGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "14px",
};

const infoCardStyle = {
  background:
    "rgba(2,6,23,0.75)",
  borderRadius: "18px",
  padding: "18px",
};

const labelStyle = {
  color: "#94a3b8",
};

const valueStyle = {
  fontSize: "24px",
  fontWeight: "900",
};

const deleteButtonStyle = {
  marginTop: "20px",
  width: "100%",
  padding: "14px",
  borderRadius: "14px",
  border: "none",
  background:
    "rgba(239,68,68,0.15)",
  color: "#fca5a5",
  fontWeight: "900",
};