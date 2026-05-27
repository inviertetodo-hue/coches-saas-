import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Importer from "./pages/Importer";
import History from "./pages/History";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <aside>
          <h1>🚘 Coches SaaS</h1>

          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              marginTop: "30px",
            }}
          >
            <Link to="/importer">🔗 Importador</Link>

            <Link to="/history">📊 Historial</Link>
          </nav>
        </aside>

        <main>
          <Routes>
            <Route path="/" element={<Importer />} />

            <Route path="/importer" element={<Importer />} />

            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}