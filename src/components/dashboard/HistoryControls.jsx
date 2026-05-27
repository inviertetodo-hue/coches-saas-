export default function HistoryControls({
  search,
  setSearch,
  sortBy,
  setSortBy,
  filter,
  setFilter,
}) {
  return (
    <>
      <div style={controlsContainerStyle}>
        <input
          placeholder="Buscar BMW, xDrive, PHEV..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInputStyle}
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={selectStyle}
        >
          <option value="score">Score IA</option>
          <option value="roi">ROI</option>
          <option value="profit">Beneficio</option>
        </select>
      </div>

      <div style={filterBarStyle}>
        <button
          onClick={() => setFilter("TODOS")}
          style={{
            ...filterButtonStyle,
            ...(filter === "TODOS" ? activeButtonStyle : {}),
          }}
        >
          Todos
        </button>

        <button
          onClick={() => setFilter("CHOLLO IA")}
          style={{
            ...filterButtonStyle,
            ...(filter === "CHOLLO IA" ? activeButtonStyle : {}),
          }}
        >
          🔥 Chollos
        </button>

        <button
          onClick={() => setFilter("ANALIZAR")}
          style={{
            ...filterButtonStyle,
            ...(filter === "ANALIZAR" ? activeButtonStyle : {}),
          }}
        >
          🟡 Analizar
        </button>

        <button
          onClick={() => setFilter("DESCARTAR")}
          style={{
            ...filterButtonStyle,
            ...(filter === "DESCARTAR" ? activeButtonStyle : {}),
          }}
        >
          🔴 Descartar
        </button>
      </div>
    </>
  );
}

const controlsContainerStyle = {
  display: "flex",
  gap: "16px",
  marginBottom: "24px",
};

const searchInputStyle = {
  flex: 1,
  padding: "16px",
  borderRadius: "16px",
  background: "rgba(15,23,42,0.75)",
  color: "white",
  border: "1px solid rgba(148,163,184,0.18)",
};

const selectStyle = {
  padding: "16px",
  borderRadius: "16px",
  background: "rgba(15,23,42,0.75)",
  color: "white",
  border: "1px solid rgba(148,163,184,0.18)",
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
  background: "rgba(15,23,42,0.75)",
  color: "white",
  border: "1px solid rgba(148,163,184,0.18)",
  fontWeight: "800",
};

const activeButtonStyle = {
  background: "rgba(37,99,235,0.35)",
  border: "1px solid rgba(59,130,246,0.5)",
};