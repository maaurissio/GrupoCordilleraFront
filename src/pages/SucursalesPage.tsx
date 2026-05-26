import { useEffect, useState, type FormEvent } from 'react'
import { Button, Form, Input, Label, TextField } from '@heroui/react'
import { useSucursales } from '../hooks/useSucursales'
import { ConfirmDialog } from '../components/ConfirmDialog'
import type { Sucursal } from '../apis/sucursales'

export function SucursalesPage() {
  const { sucursales, loading, error, fetchSucursales, addSucursal, editSucursal, toggleSucursalStatus } = useSucursales()
  const [editTarget, setEditTarget] = useState<Sucursal | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [formNombre, setFormNombre] = useState('')
  const [formDireccion, setFormDireccion] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [toggleTarget, setToggleTarget] = useState<Sucursal | null>(null)

  useEffect(() => {
    void fetchSucursales()
  }, [fetchSucursales])

  function openEdit(s: Sucursal) {
    setEditTarget(s)
    setFormNombre(s.nombre)
    setFormDireccion(s.direccion)
    setFormError('')
  }

  function openCreate() {
    setShowCreate(true)
    setEditTarget(null)
    setFormNombre('')
    setFormDireccion('')
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
        await editSucursal(editTarget.id, { nombre: formNombre, direccion: formDireccion })
      } else {
        await addSucursal({ nombre: formNombre, direccion: formDireccion })
      }
      closeForm()
    } catch (err) {
      setFormError((err as { message?: string }).message ?? 'Error al guardar sucursal.')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle() {
    if (!toggleTarget) return
    setSaving(true)
    try {
      await toggleSucursalStatus(toggleTarget.id, true)
    } catch {
      // Error handled by hook
    } finally {
      setSaving(false)
      setToggleTarget(null)
    }
  }

  if (loading) return <div className="page-loading">Cargando sucursales...</div>

  return (
    <section className="page-section">
      <div className="page-header">
        <h2>Sucursales</h2>
        <Button variant="primary" onPress={openCreate} className="create-button">Crear sucursal</Button>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {(showCreate || editTarget) && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{editTarget ? 'Editar sucursal' : 'Crear sucursal'}</h3>
            <Form className="sucursal-form" onSubmit={handleSubmit}>
              <TextField>
                <Label>Nombre</Label>
                <Input value={formNombre} onChange={(e) => setFormNombre(e.target.value)} required />
              </TextField>
              <TextField>
                <Label>Direccion</Label>
                <Input value={formDireccion} onChange={(e) => setFormDireccion(e.target.value)} required />
              </TextField>
              {formError ? <p className="form-error">{formError}</p> : null}
              <div className="modal-actions">
                <Button variant="secondary" onPress={closeForm} isDisabled={saving}>Cancelar</Button>
                <Button type="submit" variant="primary" isDisabled={saving}>
                  {saving ? 'Guardando...' : editTarget ? 'Guardar cambios' : 'Crear sucursal'}
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
              <th>Direccion</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sucursales.length === 0 ? (
              <tr><td colSpan={4} className="table-empty">No hay sucursales registradas</td></tr>
            ) : (
              sucursales.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.nombre}</strong></td>
                  <td>{s.direccion}</td>
                  <td><span className="status-active">Activo</span></td>
                  <td>
                    <div className="action-buttons">
                      <Button size="sm" variant="secondary" onPress={() => openEdit(s)}>Editar</Button>
                      <Button size="sm" variant="secondary" onPress={() => setToggleTarget(s)}>Desactivar</Button>
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
        title="Desactivar sucursal"
        message={`¿Desactivar la sucursal ${toggleTarget?.nombre}?`}
        confirmLabel="Desactivar"
        onConfirm={handleToggle}
        onCancel={() => setToggleTarget(null)}
        loading={saving}
      />
    </section>
  )
}
