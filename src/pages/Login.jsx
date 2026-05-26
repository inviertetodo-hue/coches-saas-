import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")

  async function handleLogin(e) {
    e.preventDefault()
    setMessage("Entrando...")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setMessage("Error: " + error.message)
      return
    }

    setMessage("Login correcto ✅")
  }

  async function handleRegister() {
    setMessage("Creando cuenta...")

    const { error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      setMessage("Error: " + error.message)
      return
    }

    setMessage("Cuenta creada. Revisa tu email ✅")
  }

  return (
    <div>
      <h1>🔐 Login</h1>
      <p>Acceso privado para usuarios y vendedores</p>

      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button type="submit">
          Entrar
        </button>

        <button type="button" onClick={handleRegister}>
          Crear cuenta
        </button>
      </form>

      <p>{message}</p>
    </div>
  )
}
