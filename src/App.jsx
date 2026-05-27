import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Importer from "./pages/Importer";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <aside>
          <h1>🚘 Coches SaaS</h1>
          <Link to="/importer">🔗 Importador</Link>
        </aside>

        <main>
          <Routes>
            <Route path="/" element={<Importer />} />
            <Route path="/importer" element={<Importer />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}