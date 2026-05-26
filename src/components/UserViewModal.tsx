import { Button, Chip } from '@heroui/react'
import type { UserProfile } from '../apis/users'

function formatFecha(fecha?: string) {
  if (!fecha) return '—'
  const d = new Date(fecha)
  return d.toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })
}

function calcularEdad(fecha?: string) {
  if (!fecha) return null
  const hoy = new Date()
  const nac = new Date(fecha)
  let edad = hoy.getFullYear() - nac.getFullYear()
  const mes = hoy.getMonth() - nac.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--
  return edad
}

export function UserViewModal({
  user,
  open,
  onClose,
}: {
  user: UserProfile | null
  open: boolean
  onClose: () => void
}) {
  if (!open || !user) return null

  const edad = calcularEdad(user.fechaNacimiento)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-wide glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Detalles del usuario</h3>
          <Button variant="secondary" className="modal-close-button" onPress={onClose}>
            Cerrar
          </Button>
        </div>

        <div className="user-detail-grid">
          <div className="detail-section">
            <h4>Informacion personal</h4>
            <div className="detail-row"><span className="detail-label">Nombre completo</span><span>{user.nombre} {user.apellido}</span></div>
            <div className="detail-row"><span className="detail-label">RUT</span><span>{user.rut}-{user.dv}</span></div>
            <div className="detail-row"><span className="detail-label">Email</span><span>{user.email}</span></div>
            <div className="detail-row"><span className="detail-label">Telefono</span><span>{user.telefono ?? '—'}</span></div>
            <div className="detail-row"><span className="detail-label">Fecha nacimiento</span><span>{formatFecha(user.fechaNacimiento)}{edad !== null ? ` (${edad} anos)` : ''}</span></div>
          </div>

          <div className="detail-section">
            <h4>Asignaciones</h4>
            <div className="detail-row">
              <span className="detail-label">Estado</span>
              <Chip size="sm" variant="soft" color={user.estado === 'ACTIVO' ? 'success' : 'default'}>
                {user.estado}
              </Chip>
            </div>
            <div className="detail-row">
              <span className="detail-label">Roles</span>
              <span>{user.roles?.length ? user.roles.join(', ') : 'Sin roles'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Sucursales</span>
              <span>{user.sucursales?.length ? user.sucursales.join(', ') : 'Sin sucursales'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
