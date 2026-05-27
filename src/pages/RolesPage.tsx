import { useEffect, useState, type FormEvent } from 'react'
import { Button, Chip, Form, Input, Label, TextField } from '@heroui/react'
import { useRoles } from '../hooks/useRoles'
import { ConfirmDialog } from '../components/ConfirmDialog'
import type { Role } from '../apis/roles'

const ROLE_NAMES = [
  'ADMIN',
  'SOPORTE',
  'GERENTE',
]

export function RolesPage() {
  const { roles, loading, error, fetchRoles, addRole, editRole, toggleRoleStatus } = useRoles()
  const [editTarget, setEditTarget] = useState<Role | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [formNombre, setFormNombre] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [toggleTarget, setToggleTarget] = useState<Role | null>(null)

  useEffect(() => {
    void fetchRoles()
  }, [fetchRoles])

  function openEdit(role: Role) {
    setEditTarget(role)
    setFormNombre(role.nombre)
    setFormDesc(role.descripcion)
    setFormError('')
  }

  function openCreate() {
    setShowCreate(true)
    setEditTarget(null)
    setFormNombre('')
    setFormDesc('')
    setFormError('')
  }

  function closeForm() {
    setShowCreate(false)
    setEditTarget(null)
    setFormError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      if (editTarget) {
        await editRole(editTarget.id, { nombre: formNombre, descripcion: formDesc })
      } else {
        await addRole({ nombre: formNombre, descripcion: formDesc })
      }
      closeForm()
    } catch (err) {
      setFormError((err as { message?: string }).message ?? 'Error al guardar rol.')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle() {
    if (!toggleTarget) return
    setSaving(true)
    try {
      await toggleRoleStatus(toggleTarget.id, true)
    } catch {
      // Error handled by hook
    } finally {
      setSaving(false)
      setToggleTarget(null)
    }
  }

  if (loading) return <div className="page-loading">Cargando roles...</div>

  return (
    <section className="page-section">
      <div className="page-header">
        <h2>Roles</h2>
        <Button variant="primary" onPress={openCreate} className="create-button">Crear rol</Button>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {(showCreate || editTarget) && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-content glass-panel" data-lenis-prevent onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{editTarget ? 'Editar rol' : 'Crear rol'}</h3>
            <Form className="role-form" onSubmit={handleSubmit}>
              <TextField>
                <Label>Nombre</Label>
                <select
                  className="role-select"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  required
                  disabled={!!editTarget}
                >
                  <option value="">Seleccionar rol</option>
                  {ROLE_NAMES.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </TextField>
              <TextField>
                <Label>Descripcion</Label>
                <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
              </TextField>
              {formError ? <p className="form-error">{formError}</p> : null}
              <div className="modal-actions">
                <Button variant="secondary" className="btn-secondary-minimal" onPress={closeForm} isDisabled={saving}>Cancelar</Button>
                <Button type="submit" variant="primary" isDisabled={saving}>
                  {saving ? 'Guardando...' : editTarget ? 'Guardar cambios' : 'Crear rol'}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}

      <div className="table-wrapper glass-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripcion</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 ? (
              <tr><td colSpan={4} className="table-empty">No hay roles registrados</td></tr>
            ) : (
              roles.map((r) => (
                <tr key={r.id}>
                  <td><Chip size="sm" variant="soft" color="default">{r.nombre}</Chip></td>
                  <td>{r.descripcion || '—'}</td>
                  <td><Chip size="sm" variant="soft" color="success">Activo</Chip></td>
                  <td>
                    <div className="action-buttons">
                      <Button size="sm" variant="secondary" onPress={() => openEdit(r)}>Editar</Button>
                      <Button size="sm" variant="secondary" onPress={() => setToggleTarget(r)}>Desactivar</Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!toggleTarget}
        title="Desactivar rol"
        message={`¿Desactivar el rol ${toggleTarget?.nombre}?`}
        confirmLabel="Desactivar"
        onConfirm={handleToggle}
        onCancel={() => setToggleTarget(null)}
        loading={saving}
      />
    </section>
  )
}
