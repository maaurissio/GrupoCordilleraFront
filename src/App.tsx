import { useEffect } from 'react'
import { Spinner } from '@heroui/react'
import Lenis from 'lenis'
import { useAuth } from './hooks/useAuth'
import { AppRoutes } from './routes/AppRoutes'
import './App.css'

export default function App() {
  const { profile, loading, login, logout } = useAuth()

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      allowNestedScroll: true,
      duration: 1.05,
      smoothWheel: true,
    })

    return () => {
      lenis.destroy()
    }
  }, [])

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
    />
  )
}
