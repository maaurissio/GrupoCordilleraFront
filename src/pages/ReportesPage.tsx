import { useEffect, useState } from 'react'
import { Card } from '@heroui/react'
import { getAllUsers, type UserProfile } from '../apis/users'
import { getAllRoles, type Role } from '../apis/roles'
import { getAllSucursales, type Sucursal } from '../apis/sucursales'

export function ReportesPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [u, r, s] = await Promise.all([
          getAllUsers(),
          getAllRoles(),
          getAllSucursales(),
        ])
        setUsers(u)
        setRoles(r)
        setSucursales(s)
      } catch {
        // Silently fail
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const activeUsers = users.filter((u) => u.estado === 'ACTIVO').length
  const inactiveUsers = users.filter((u) => u.estado !== 'ACTIVO').length

  const roleCounts = roles.map((r) => ({
    nombre: r.nombre,
    count: users.filter((u) => u.roles.includes(r.nombre)).length,
  }))

  if (loading) return <div className="page-loading">Cargando reportes...</div>

  return (
    <section className="page-section">
      <div className="page-header">
        <h2>Reportes</h2>
        <span className="page-count">Resumen operativo</span>
      </div>

      <div className="report-grid">
        <Card className="report-card glass-panel">
          <Card.Content>
            <p className="section-kicker">Usuarios</p>
            <div className="report-metric">
              <span className="report-value">{activeUsers}</span>
              <span className="report-label">Activos</span>
            </div>
            <div className="report-metric">
              <span className="report-value">{inactiveUsers}</span>
              <span className="report-label">Inactivos</span>
            </div>
            <div className="report-metric">
              <span className="report-value">{users.length}</span>
              <span className="report-label">Total</span>
            </div>
          </Card.Content>
        </Card>

        <Card className="report-card glass-panel">
          <Card.Content>
            <p className="section-kicker">Roles</p>
            <div className="report-metric">
              <span className="report-value">{roles.length}</span>
              <span className="report-label">Roles registrados</span>
            </div>
            <div className="report-role-list">
              {roleCounts.slice(0, 5).map((rc) => (
                <div key={rc.nombre} className="report-role-row">
                  <span>{rc.nombre}</span>
                  <span className="report-role-count">{rc.count} usuarios</span>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        <Card className="report-card glass-panel">
          <Card.Content>
            <p className="section-kicker">Sucursales</p>
            <div className="report-metric">
              <span className="report-value">{sucursales.length}</span>
              <span className="report-label">Sucursales registradas</span>
            </div>
          </Card.Content>
        </Card>
      </div>
    </section>
  )
}
