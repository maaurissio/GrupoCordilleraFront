import { Spinner } from '@heroui/react'
import { useAuth } from './hooks/useAuth'
import { registerUser, type RegisterPayload } from './apis/users'
import { AppRoutes } from './routes/AppRoutes'
import './App.css'

export default function App() {
  const { profile, loading, login, logout } = useAuth()

  async function handleCreateUser(payload: RegisterPayload) {
    await registerUser(payload)
  }

  if (loading) {
    return (
      <div className="loading-shell">
        <div className="loading-content">
          <Spinner />
          <p>Preparando entorno administrativo...</p>
        </div>
      </div>
    )
  }

  return (
    <AppRoutes
      profile={profile}
      login={login}
      logout={logout}
      onCreateUser={handleCreateUser}
    />
  )
}
