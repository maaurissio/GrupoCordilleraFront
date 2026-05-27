import { Card } from '@heroui/react'
import type { UserProfile } from '../apis/users'

const summaryCards = [
  { value: '43', label: 'Gestiones cerradas' },
  { value: '14', label: 'Solicitudes en curso' },
  { value: '11', label: 'Usuarios habilitados' },
]

const weeklyLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const progressCurve = [24, 46, 39, 58, 49, 67, 61]

const adminChecklist = [
  'Revisar altas administrativas pendientes',
  'Validar estados de sucursales criticas',
  'Consolidar accesos para cierre operativo',
]

function buildLinePath(points: number[]) {
  const width = 460
  const height = 210
  const paddingX = 14
  const max = Math.max(...points)
  const min = Math.min(...points)
  const step = (width - paddingX * 2) / (points.length - 1)
  return points
    .map((point, index) => {
      const x = paddingX + step * index
      const y = height - 30 - ((point - min) / (max - min || 1)) * (height - 76)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

export function DashboardPage({
  user,
}: {
  user: UserProfile
}) {
  const roleLabel = user.roles[0] ?? 'ADMIN'
  const linePath = buildLinePath(progressCurve)

  return (
    <section className="dashboard-content">
      <Card className="hero-card dark-surface-card">
        <Card.Header className="card-padding">
          <div className="hero-card-head">
            <div>
              <p className="section-kicker section-kicker-invert">Resumen general</p>
              <h3>Actividad consolidada</h3>
            </div>
          </div>
        </Card.Header>
        <Card.Content className="card-padding hero-card-body">
          <div className="hero-metric-band">
            {summaryCards.map((item) => (
              <article key={item.label} className="metric-tile">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </Card.Content>
      </Card>

      <Card className="chart-card glass-panel">
        <Card.Header className="card-padding compact-card-header">
          <div>
            <p className="section-kicker">Progreso semanal</p>
            <h3>Seguimiento operativo</h3>
          </div>
        </Card.Header>
        <Card.Content className="card-padding chart-body">
          <svg viewBox="0 0 460 210" className="chart-visual" aria-label="Curva semanal de seguimiento">
            <path d="M16 178H444" className="chart-axis" />
            <path d={linePath} className="chart-line" />
          </svg>
          <div className="chart-label-row">
            {weeklyLabels.map((label, index) => (
              <span key={`${label}-${index}`}>{label}</span>
            ))}
          </div>
        </Card.Content>
      </Card>

      <Card className="identity-card glass-panel">
        <Card.Header className="card-padding compact-card-header">
          <div>
            <p className="section-kicker">Identidad autenticada</p>
            <h3>Sesion actual</h3>
          </div>
        </Card.Header>
        <Card.Content className="card-padding identity-card-body">
          <div className="identity-detail-block">
            <span className="identity-label">Nombre</span>
            <strong>{user.nombre}</strong>
          </div>
          <div className="identity-detail-block">
            <span className="identity-label">Rol</span>
            <strong>{roleLabel}</strong>
          </div>
        </Card.Content>
      </Card>

      <Card className="tasks-card glass-panel">
        <Card.Header className="card-padding compact-card-header">
          <div>
            <p className="section-kicker">Agenda del mes</p>
            <h3>Prioridades administrativas</h3>
          </div>
        </Card.Header>
        <Card.Content className="card-padding">
          <div className="checklist-block">
            {adminChecklist.map((item) => (
              <label key={item} className="checklist-item">
                <input type="checkbox" defaultChecked={item === adminChecklist[0]} />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </Card.Content>
      </Card>

      <Card className="stats-card glass-panel">
        <Card.Header className="card-padding compact-card-header">
          <div>
            <p className="section-kicker">Indicadores rapidos</p>
            <h3>Estado operativo</h3>
          </div>
        </Card.Header>
        <Card.Content className="card-padding stats-grid">
          <article className="stat-box"><strong>18</strong><span>Sucursales activas</span></article>
          <article className="stat-box"><strong>03</strong><span>Alertas criticas</span></article>
          <article className="stat-box"><strong>246</strong><span>Despachos del dia</span></article>
        </Card.Content>
      </Card>

    </section>
  )
}
