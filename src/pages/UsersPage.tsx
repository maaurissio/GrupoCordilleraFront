import { useEffect, useState } from 'react'
import { Button, Chip } from '@heroui/react'
import { useUsers } from '../hooks/useUsers'
import { UserViewModal } from '../components/UserViewModal'
import { UserEditModal } from '../components/UserEditModal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import type { UserProfile, UpdateUserPayload } from '../apis/users'

export function UsersPage({ currentUserId }: { currentUserId?: string }) {
  const { users, loading, error, fetchUsers, editUser, toggleUserStatus } = useUsers()
  const [viewUser, setViewUser] = useState<UserProfile | null>(null)
  const [editUserState, setEditUserState] = useState<UserProfile | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<UserProfile | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  async function handleEditSave(id: string, payload: UpdateUserPayload) {
    await editUser(id, payload)
  }

  async function handleDeactivate() {
    if (!deactivateTarget) return
    setActionLoading(true)
    try {
      await toggleUserStatus(deactivateTarget.id, deactivateTarget.estado)
    } catch {
      // Error handled by hook
    } finally {
      setActionLoading(false)
      setDeactivateTarget(null)
    }
  }

  const isSelf = (user: UserProfile) => user.id === currentUserId

  if (loading) return <div className="page-loading">Cargando usuarios...</div>
  if (error) return <div className="page-error">{error}</div>

  return (
    <section className="page-section">
      <div className="page-header">
        <h2>Usuarios</h2>
        <span className="page-count">{users.length} registros</span>
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
                    <Chip size="sm" variant="soft" color={u.estado === 'ACTIVO' ? 'success' : 'default'}>
                      {u.estado}
                    </Chip>
                  </td>
                  <td className="cell-truncate">{u.sucursales?.join(', ') || '—'}</td>
                  <td>
                    <div className="action-buttons">
                      <Button size="sm" variant="secondary" onPress={() => setViewUser(u)}>Ver</Button>
                      <Button size="sm" variant="secondary" onPress={() => setEditUserState(u)}>Editar</Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        isDisabled={isSelf(u)}
                        onPress={() => setDeactivateTarget(u)}
                        title={isSelf(u) ? 'No puedes desactivarte a ti mismo' : undefined}
                      >
                        {u.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UserViewModal user={viewUser} open={!!viewUser} onClose={() => setViewUser(null)} />
      <UserEditModal user={editUserState} open={!!editUserState} onClose={() => setEditUserState(null)} onSave={handleEditSave} />
      <ConfirmDialog
        open={!!deactivateTarget}
        title={deactivateTarget?.estado === 'ACTIVO' ? 'Desactivar usuario' : 'Activar usuario'}
        message={`¿Estas seguro de ${deactivateTarget?.estado === 'ACTIVO' ? 'desactivar' : 'activar'} a ${deactivateTarget?.nombre} ${deactivateTarget?.apellido}?`}
        confirmLabel={deactivateTarget?.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateTarget(null)}
        loading={actionLoading}
      />
    </section>
  )
}
