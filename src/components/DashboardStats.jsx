export default function DashboardStats({ totalCars }) {
  return (
    <div className="admin-grid">

      <div className="admin-card">
        <span>Total coches</span>
        <strong>{totalCars}</strong>
      </div>

      <div className="admin-card">
        <span>Hot Deals</span>
        <strong>🔥</strong>
      </div>

      <div className="admin-card">
        <span>Premium</span>
        <strong>⭐</strong>
      </div>

    </div>
  )
}
