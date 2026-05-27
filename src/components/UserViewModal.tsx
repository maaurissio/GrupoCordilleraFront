import { Button, Chip } from '@heroui/react'
import { useEffect, useState } from 'react'
import { getUserById } from '../apis/users'
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
  const [resolvedUser, setResolvedUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !user) {
      setResolvedUser(null)
      return
    }

    const currentUser = user
    let ignore = false

    async function loadUserDetail() {
      setResolvedUser(currentUser)
      setLoading(true)
      try {
        const detail = await getUserById(currentUser.id)
        if (!ignore) setResolvedUser(detail)
      } catch {
        if (!ignore) setResolvedUser(currentUser)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    void loadUserDetail()

    return () => {
      ignore = true
    }
  }, [open, user])

  if (!open || !user) return null

  const displayUser = resolvedUser ?? user

  const edad = calcularEdad(displayUser.fechaNacimiento)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-wide glass-panel" data-lenis-prevent onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="section-kicker">Perfil detallado</p>
            <h3 className="modal-title">Detalles del usuario</h3>
          </div>
          <Button variant="secondary" className="btn-secondary-minimal modal-close-button" onPress={onClose}>
            Cerrar
          </Button>
        </div>

        <div className="user-modal-summary">
          <div>
            <strong>{displayUser.nombre} {displayUser.apellido}</strong>
            <span>{displayUser.email}</span>
          </div>
          <Chip size="sm" variant="soft" color={displayUser.estado === 'ACTIVO' ? 'success' : 'default'}>
            {displayUser.estado}
          </Chip>
        </div>

        <div className="user-detail-grid">
          <div className="detail-section detail-card">
            <h4>Informacion personal</h4>
            <div className="detail-row"><span className="detail-label">Nombre completo</span><span>{displayUser.nombre} {displayUser.apellido}</span></div>
            <div className="detail-row"><span className="detail-label">RUT</span><span>{displayUser.rut}-{displayUser.dv}</span></div>
            <div className="detail-row"><span className="detail-label">Email</span><span>{displayUser.email}</span></div>
            <div className="detail-row"><span className="detail-label">Telefono</span><span>{displayUser.telefono ?? '—'}</span></div>
            <div className="detail-row"><span className="detail-label">Fecha nacimiento</span><span>{formatFecha(displayUser.fechaNacimiento)}{edad !== null ? ` (${edad} anos)` : ''}</span></div>
          </div>

          <div className="detail-section detail-card">
            <h4>Asignaciones</h4>
            <div className="detail-row">
              <span className="detail-label">Estado</span>
              <Chip size="sm" variant="soft" color={displayUser.estado === 'ACTIVO' ? 'success' : 'default'}>
                {displayUser.estado}
              </Chip>
            </div>
            <div className="detail-row">
              <span className="detail-label">Roles</span>
              <span>{displayUser.roles?.length ? displayUser.roles.join(', ') : 'Sin roles'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Sucursales</span>
              <span>{displayUser.sucursales?.length ? displayUser.sucursales.join(', ') : 'Sin sucursales'}</span>
            </div>
          </div>
        </div>

        {loading ? <p className="modal-loading-note">Actualizando detalles del usuario...</p> : null}
      </div>
    </div>
  )
}
