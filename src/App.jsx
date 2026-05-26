import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import Home from "./pages/Home"
import Dashboard from "./pages/Dashboard"
import Deals from "./pages/Deals"
import Importer from "./pages/Importer"
import Login from "./pages/Login"
import "./App.css"

export default function App() {
  const cars = [
    {brand:"BMW", model:"M340i", price:32000, roi:22, profit:7000},
    {brand:"Audi", model:"RS4", price:28000, roi:18, profit:5000}
  ]

  return (
    <BrowserRouter>
      <div className="app">
        <aside>
          <h1>🚘 Coches SaaS</h1>
          <Link to="/">🏠 Home</Link>
          <Link to="/dashboard">📊 Dashboard</Link>
          <Link to="/deals">🔥 Chollos IA</Link>
          <Link to="/importer">🔗 Importador</Link>
          <Link to="/login">🔐 Login</Link>
        </aside>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard cars={cars} />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/importer" element={<Importer />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
