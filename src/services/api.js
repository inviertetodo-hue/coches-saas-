const API_URL = "http://127.0.0.1:8000"

export async function getCars() {
  const res = await fetch(`${API_URL}/cars`)
  return await res.json()
}

export async function deleteCar(id) {
  await fetch(`${API_URL}/cars/${id}`, {
    method: "DELETE"
  })
}
