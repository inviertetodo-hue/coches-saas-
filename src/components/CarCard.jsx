export default function CarCard({ car }) {
  return (
    <div className="car-card">
      <h2>
        {car.brand} {car.model}
      </h2>

      <p>Precio: {car.price} €</p>
      <p>Score: {car.score}/100</p>
      <p>{car.recommendation}</p>
    </div>
  )
}
