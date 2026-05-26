import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkUser()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkUser() {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    setUser(user)
  }

  async function handleLogin(e) {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage("Login correcto ✅")
  }

  async function handleRegister() {
    const { error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage("Cuenta creada ✅")
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    setMessage("Sesión cerrada")
  }

  return (
    <div>
      <h1>🔐 Login</h1>

      {user ? (
        <div>
          <p>Usuario conectado:</p>

          <strong>{user.email}</strong>

          <br /><br />

          <button onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
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

          <button
            type="button"
            onClick={handleRegister}
          >
            Crear cuenta
          </button>

        </form>
      )}

      <p>{message}</p>
    </div>
  )
}
