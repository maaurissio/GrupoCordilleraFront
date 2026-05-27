import { useEffect, useState } from 'react'
import { Button, Chip } from '@heroui/react'
import { useUsers } from '../hooks/useUsers'
import { getAllSucursales, type Sucursal } from '../apis/sucursales'
import { UserCreateModal } from '../components/UserCreateModal'
import { UserViewModal } from '../components/UserViewModal'
import { UserEditModal } from '../components/UserEditModal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import type { RegisterPayload, UserProfile, UpdateUserPayload } from '../apis/users'

function normalizeStatus(status?: string) {
  return (status ?? '').trim().toUpperCase()
}

export function UsersPage({ currentUserId, userRole }: { currentUserId?: string; userRole: string }) {
  const { users, loading, error, fetchUsers, createUser, editUser, toggleUserStatus } = useUsers()
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewUser, setViewUser] = useState<UserProfile | null>(null)
  const [editUserState, setEditUserState] = useState<UserProfile | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<UserProfile | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    let ignore = false

    async function loadSucursales() {
      try {
        const data = await getAllSucursales()
        if (!ignore) setSucursales(data)
      } catch {
        if (!ignore) setSucursales([])
      }
    }

    void loadSucursales()
    return () => {
      ignore = true
    }
  }, [])

  async function handleCreateUser(payload: RegisterPayload) {
    await createUser(payload)
  }

  async function handleEditSave(id: string, payload: UpdateUserPayload) {
    await editUser(id, payload)
  }

  async function handleDeactivate() {
    if (!deactivateTarget) return
    setActionLoading(true)
    try {
      await toggleUserStatus(deactivateTarget.id, 'ACTIVO')
      await fetchUsers()
    } catch {
      // Error handled by hook
    } finally {
      setActionLoading(false)
      setDeactivateTarget(null)
    }
  }

  const isSelf = (user: UserProfile) => user.id === currentUserId
  const canManageStatus = userRole === 'ADMIN'
  const canCreateUser = userRole === 'ADMIN' || userRole === 'SOPORTE'

  if (loading) return <div className="page-loading">Cargando usuarios...</div>
  if (error) return <div className="page-error">{error}</div>

  return (
    <section className="page-section">
      <div className="page-header">
        <h2>Usuarios</h2>
        <div className="page-header-actions">
          <span className="page-count">{users.length} registros</span>
          {canCreateUser ? (
            <Button variant="primary" className="create-button" onPress={() => setShowCreateModal(true)}>
              Crear usuario
            </Button>
          ) : null}
        </div>
      </div>

      <div className="table-wrapper glass-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Roles</th>
              <th>Estado</th>
              <th>Sucursales</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={6} className="table-empty">No hay usuarios registrados</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.nombre} {u.apellido}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.roles?.join(', ') || '—'}</td>
                   <td>
                     <Chip size="sm" variant="soft" color={normalizeStatus(u.estado) === 'ACTIVO' ? 'success' : 'default'}>
                       {normalizeStatus(u.estado) || 'DESCONOCIDO'}
                     </Chip>
                   </td>
                  <td className="cell-truncate">{u.sucursales?.join(', ') || '—'}</td>
                   <td>
                     <div className="action-buttons">
                       <Button size="sm" variant="secondary" className="btn-action-view" onPress={() => setViewUser(u)}>Ver</Button>
                       <Button size="sm" variant="secondary" className="btn-action-edit" onPress={() => setEditUserState(u)}>Editar</Button>
                        {canManageStatus ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="btn-action-deactivate"
                            isDisabled={isSelf(u)}
                            onPress={() => setDeactivateTarget(u)}
                          >
                            Desactivar
                          </Button>
                        ) : null}
                     </div>
                   </td>
                 </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UserCreateModal open={showCreateModal} onClose={() => setShowCreateModal(false)} onSave={handleCreateUser} sucursales={sucursales} />
      <UserViewModal user={viewUser} open={!!viewUser} onClose={() => setViewUser(null)} />
      <UserEditModal user={editUserState} open={!!editUserState} onClose={() => setEditUserState(null)} onSave={handleEditSave} sucursales={sucursales} />
      <ConfirmDialog
        open={!!deactivateTarget}
        title="Desactivar usuario"
        message={`¿Estas seguro de desactivar a ${deactivateTarget?.nombre} ${deactivateTarget?.apellido}?`}
        confirmLabel="Desactivar"
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateTarget(null)}
        loading={actionLoading}
      />
    </section>
  )
}
