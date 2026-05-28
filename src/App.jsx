import { Suspense, lazy } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import "./App.css";

const Scanner = lazy(() => import("./pages/Scanner"));
const Importer = lazy(() => import("./pages/Importer"));
const History = lazy(() => import("./pages/History"));

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <aside>
          <h1>🚘 Coches SaaS</h1>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "13px",
              lineHeight: "1.5",
              marginTop: "12px",
            }}
          >
            AI Automotive Opportunity Platform
          </p>

          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              marginTop: "30px",
            }}
          >
            <Link to="/scanner">🔎 Scanner IA</Link>

            <Link to="/importer">🔗 Importador IA</Link>

            <Link to="/history">📊 Inteligencia Mercado</Link>
          </nav>

          <div
            style={{
              marginTop: "40px",
              padding: "16px",
              borderRadius: "18px",
              background: "rgba(59,130,246,0.10)",
              border: "1px solid rgba(59,130,246,0.18)",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#93c5fd",
                fontWeight: "900",
                fontSize: "13px",
              }}
            >
              Objetivo
            </p>

            <p
              style={{
                marginTop: "10px",
                color: "#cbd5e1",
                lineHeight: "1.5",
                fontSize: "13px",
              }}
            >
              Detectar los mejores coches disponibles en Europa para comprar
              mejor que el mercado.
            </p>
          </div>
        </aside>

        <main>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<Scanner />} />

              <Route path="/scanner" element={<Scanner />} />

              <Route path="/importer" element={<Importer />} />

              <Route path="/history" element={<History />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
}

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        color: "#cbd5e1",
        fontWeight: "900",
      }}
    >
      Cargando inteligencia IA...
    </div>
  );
}