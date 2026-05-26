import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { AuthPage } from '../pages/AuthPage'
import { DashboardPage } from '../pages/DashboardPage'
import { UsersPage } from '../pages/UsersPage'
import { RolesPage } from '../pages/RolesPage'
import { SucursalesPage } from '../pages/SucursalesPage'
import { ReportesPage } from '../pages/ReportesPage'
import type { UserProfile, RegisterPayload } from '../apis/users'
import type { ReactElement } from 'react'

function DashboardLayout({
  user,
  children,
  onLogout,
}: {
  user: UserProfile
  children: ReactElement
  onLogout: () => void
}) {
  const roleLabel = user.roles[0] ?? user.roles[0] ?? 'ADMIN'

  return (
    <main className="dashboard-shell">
      <section className="workspace-frame">
        <Sidebar nombre={user.nombre} roleLabel={roleLabel} onLogout={onLogout} />
        <section className="workspace-main">
          <Topbar nombre={user.nombre} roleLabel={roleLabel} />
          {children}
        </section>
      </section>
    </main>
  )
}

export function AppRoutes({
  profile,
  login,
  logout,
  onCreateUser,
}: {
  profile: UserProfile | null
  login: (email: string, password: string) => Promise<UserProfile>
  logout: () => Promise<void>
  onCreateUser: (payload: RegisterPayload) => Promise<void>
}) {
  return (
    <Routes>
      <Route
        path="/auth"
        element={<AuthPage login={login} />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isAuthenticated={Boolean(profile)}>
            <DashboardLayout user={profile as UserProfile} onLogout={logout}>
              <DashboardPage
                user={profile as UserProfile}
                onCreateUser={onCreateUser}
              />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/usuarios"
        element={
          <ProtectedRoute isAuthenticated={Boolean(profile)}>
            <DashboardLayout user={profile as UserProfile} onLogout={logout}>
              <UsersPage currentUserId={profile?.id} />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/roles"
        element={
          <ProtectedRoute isAuthenticated={Boolean(profile)}>
            <DashboardLayout user={profile as UserProfile} onLogout={logout}>
              <RolesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/sucursales"
        element={
          <ProtectedRoute isAuthenticated={Boolean(profile)}>
            <DashboardLayout user={profile as UserProfile} onLogout={logout}>
              <SucursalesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/reportes"
        element={
          <ProtectedRoute isAuthenticated={Boolean(profile)}>
            <DashboardLayout user={profile as UserProfile} onLogout={logout}>
              <ReportesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={<Navigate to={profile ? '/dashboard' : '/auth'} replace />}
      />
    </Routes>
  )
}
