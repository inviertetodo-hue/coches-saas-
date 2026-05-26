import DashboardStats from "../components/DashboardStats"
import Filters from "../components/Filters"
import Analytics from "../components/Analytics"

export default function Dashboard({ cars }) {
  return (
    <>
      <DashboardStats totalCars={cars.length} />
      <Filters />
      <Analytics />
    </>
  )
}
