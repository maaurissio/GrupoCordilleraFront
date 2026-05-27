import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@heroui/react'

const navItems = [
  { label: 'Panel general', icon: 'grid', path: '/dashboard' },
  { label: 'Usuarios', icon: 'users', path: '/dashboard/usuarios' },
  { label: 'Roles', icon: 'shield', path: '/dashboard/roles' },
  { label: 'Sucursales', icon: 'branch', path: '/dashboard/sucursales' },
  { label: 'Reportes', icon: 'report', path: '/dashboard/reportes' },
]

const roleNavVisibility: Record<string, string[]> = {
  ADMIN: navItems.map((item) => item.path),
  SOPORTE: ['/dashboard', '/dashboard/usuarios', '/dashboard/sucursales'],
  GERENTE: ['/dashboard', '/dashboard/sucursales', '/dashboard/reportes'],
}

function icon(name: string) {
  const props = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.85' }
  if (name === 'grid') return <svg {...props}><path d="M4 4h7v7H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 13h7v7H4z" /></svg>
  if (name === 'users') return <svg {...props}><path d="M16 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" /><circle cx="9.5" cy="7" r="3" /><path d="M22 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
  if (name === 'shield') return <svg {...props}><path d="M12 3l7 3v5c0 5-3.5 8.4-7 10-3.5-1.6-7-5-7-10V6z" /></svg>
  if (name === 'branch') return <svg {...props}><path d="M12 3v18" /><path d="M12 7c0 3-2 5-5 6" /><path d="M12 11c0 2 2 4 5 5" /></svg>
  if (name === 'report') return <svg {...props}><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5" /><path d="M10 13h6M10 17h4" /></svg>
  return null
}

export function Sidebar({
  nombre,
  roleLabel,
  onLogout,
}: {
  nombre: string
  roleLabel: string
  onLogout: () => void
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const visiblePaths = roleNavVisibility[roleLabel] ?? roleNavVisibility.ADMIN
  const visibleItems = navItems.filter((item) => visiblePaths.includes(item.path))

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname.startsWith(path)
  }

  return (
    <aside className="workspace-sidebar glass-panel">
      <div className="sidebar-brand">
        <div className="brand-badge">GC</div>
        <div>
          <strong>Grupo Cordillera</strong>
          <span>Administracion central</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {visibleItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`sidebar-link ${isActive(item.path) ? 'sidebar-link-active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="sidebar-icon">{icon(item.icon)}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p className="section-kicker">Sesion activa</p>
        <div className="identity-mini-card">
          <strong>{nombre}</strong>
          <span>{roleLabel}</span>
        </div>
        <Button variant="secondary" onPress={onLogout} className="btn-secondary-minimal sidebar-exit-button">
          Cerrar sesion
        </Button>
      </div>
    </aside>
  )
}
