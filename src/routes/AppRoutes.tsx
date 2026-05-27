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
import type { UserProfile } from '../apis/users'
import type { ReactElement } from 'react'

const roleRouteAccess: Record<string, string[]> = {
  ADMIN: ['/dashboard', '/dashboard/usuarios', '/dashboard/roles', '/dashboard/sucursales', '/dashboard/reportes'],
  SOPORTE: ['/dashboard', '/dashboard/usuarios', '/dashboard/sucursales'],
  GERENTE: ['/dashboard', '/dashboard/sucursales', '/dashboard/reportes'],
}

function getPrimaryRole(profile: UserProfile | null) {
  return profile?.roles[0] ?? 'ADMIN'
}

function canAccessRoute(role: string, path: string) {
  return (roleRouteAccess[role] ?? roleRouteAccess.ADMIN).includes(path)
}

function RoleProtectedRoute({
  profile,
  path,
  children,
}: {
  profile: UserProfile | null
  path: string
  children: ReactElement
}) {
  const role = getPrimaryRole(profile)

  return (
    <ProtectedRoute isAuthenticated={Boolean(profile)}>
      {canAccessRoute(role, path) ? children : <Navigate to="/dashboard" replace />}
    </ProtectedRoute>
  )
}

function DashboardLayout({
  user,
  children,
  onLogout,
}: {
  user: UserProfile
  children: ReactElement
  onLogout: () => void
}) {
  const roleLabel = getPrimaryRole(user)

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
}: {
  profile: UserProfile | null
  login: (email: string, password: string) => Promise<UserProfile>
  logout: () => Promise<void>
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
          <RoleProtectedRoute profile={profile} path="/dashboard">
            <DashboardLayout user={profile as UserProfile} onLogout={logout}>
              <DashboardPage user={profile as UserProfile} />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/dashboard/usuarios"
        element={
          <RoleProtectedRoute profile={profile} path="/dashboard/usuarios">
            <DashboardLayout user={profile as UserProfile} onLogout={logout}>
              <UsersPage currentUserId={profile?.id} userRole={getPrimaryRole(profile)} />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/dashboard/roles"
        element={
          <RoleProtectedRoute profile={profile} path="/dashboard/roles">
            <DashboardLayout user={profile as UserProfile} onLogout={logout}>
              <RolesPage />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/dashboard/sucursales"
        element={
          <RoleProtectedRoute profile={profile} path="/dashboard/sucursales">
            <DashboardLayout user={profile as UserProfile} onLogout={logout}>
              <SucursalesPage userRole={getPrimaryRole(profile)} />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/dashboard/reportes"
        element={
          <RoleProtectedRoute profile={profile} path="/dashboard/reportes">
            <DashboardLayout user={profile as UserProfile} onLogout={logout}>
              <ReportesPage />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="*"
        element={<Navigate to={profile ? '/dashboard' : '/auth'} replace />}
      />
    </Routes>
  )
}
