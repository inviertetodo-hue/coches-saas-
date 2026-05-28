export default function HistoryControls({
  search,
  setSearch,
  sortBy,
  setSortBy,
  filter,
  setFilter,
}) {
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>Control Center</p>

          <h2 style={titleStyle}>
            🔎 Buscar y filtrar análisis
          </h2>
        </div>

        <button
          type="button"
          onClick={() => {
            setSearch("");
            setSortBy("score");
            setFilter("TODOS");
          }}
          style={resetButtonStyle}
        >
          Reset filtros
        </button>
      </div>

      <div style={controlsContainerStyle}>
        <input
          placeholder="Buscar BMW, xDrive, PHEV, Audi, Mercedes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInputStyle}
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={selectStyle}
        >
          <option value="score">Ordenar por Score IA</option>
          <option value="roi">Ordenar por ROI</option>
          <option value="profit">Ordenar por beneficio</option>
        </select>
      </div>

      <div style={filterBarStyle}>
        <FilterButton
          active={filter === "TODOS"}
          onClick={() => setFilter("TODOS")}
        >
          Todos
        </FilterButton>

        <FilterButton
          active={filter === "CHOLLO IA"}
          onClick={() => setFilter("CHOLLO IA")}
        >
          🔥 Chollos IA
        </FilterButton>

        <FilterButton
          active={filter === "ANALIZAR"}
          onClick={() => setFilter("ANALIZAR")}
        >
          🟡 Analizar
        </FilterButton>

        <FilterButton
          active={filter === "DESCARTAR"}
          onClick={() => setFilter("DESCARTAR")}
        >
          🔴 Descartar
        </FilterButton>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...filterButtonStyle,
        ...(active ? activeButtonStyle : {}),
      }}
    >
      {children}
    </button>
  );
}

const containerStyle = {
  marginBottom: "34px",
  padding: "26px",
  borderRadius: "28px",
  background: "rgba(15,23,42,0.72)",
  border: "1px solid rgba(148,163,184,0.16)",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  marginBottom: "22px",
};

const eyebrowStyle = {
  color: "#93c5fd",
  fontSize: "12px",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "1px",
  marginBottom: "8px",
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "900",
  margin: 0,
};

const resetButtonStyle = {
  padding: "10px 14px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.06)",
  color: "#cbd5e1",
  border: "1px solid rgba(148,163,184,0.18)",
  fontWeight: "900",
  cursor: "pointer",
};

const controlsContainerStyle = {
  display: "flex",
  gap: "16px",
  marginBottom: "18px",
};

const searchInputStyle = {
  flex: 1,
  padding: "16px",
  borderRadius: "16px",
  background: "rgba(2,6,23,0.72)",
  color: "white",
  border: "1px solid rgba(148,163,184,0.18)",
  outline: "none",
};

const selectStyle = {
  minWidth: "220px",
  padding: "16px",
  borderRadius: "16px",
  background: "rgba(2,6,23,0.72)",
  color: "white",
  border: "1px solid rgba(148,163,184,0.18)",
  outline: "none",
};

const filterBarStyle = {
  display: "flex",
  gap: "14px",
  flexWrap: "wrap",
};

const filterButtonStyle = {
  padding: "14px 18px",
  borderRadius: "14px",
  background: "rgba(2,6,23,0.65)",
  color: "white",
  border: "1px solid rgba(148,163,184,0.18)",
  fontWeight: "900",
  cursor: "pointer",
};

const activeButtonStyle = {
  background: "rgba(37,99,235,0.35)",
  border: "1px solid rgba(59,130,246,0.55)",
  color: "#bfdbfe",
};