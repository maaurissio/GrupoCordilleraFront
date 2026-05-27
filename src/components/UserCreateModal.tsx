import { useState, type FormEvent } from 'react'
import { Button, Form, Input, Label, TextField } from '@heroui/react'
import type { RegisterPayload } from '../apis/users'
import type { Sucursal } from '../apis/sucursales'

type UserCreateModalProps = {
  open: boolean
  onClose: () => void
  onSave: (payload: RegisterPayload) => Promise<void>
  sucursales: Sucursal[]
}

const initialForm: RegisterPayload = {
  rut: '',
  dv: '',
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  fechaNacimiento: '',
  password: '',
  sucursalIds: [],
}

export function UserCreateModal({ open, onClose, onSave, sucursales }: UserCreateModalProps) {
  const [form, setForm] = useState<RegisterPayload>(initialForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  function closeAndReset() {
    setForm(initialForm)
    setError('')
    onClose()
  }

  function toggleSucursal(id: string) {
    setForm((current) => ({
      ...current,
      sucursalIds: current.sucursalIds.includes(id)
        ? current.sucursalIds.filter((item) => item !== id)
        : [...current.sucursalIds, id],
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave({
        ...form,
        telefono: form.telefono || undefined,
        fechaNacimiento: form.fechaNacimiento || undefined,
      })
      closeAndReset()
    } catch (err) {
      setError((err as { message?: string }).message ?? 'No fue posible crear el usuario.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={closeAndReset}>
      <div className="modal-content modal-wide glass-panel" data-lenis-prevent onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="section-kicker">Nuevo acceso</p>
            <h3 className="modal-title">Crear usuario</h3>
          </div>
          <Button variant="secondary" className="btn-secondary-minimal modal-close-button" onPress={closeAndReset}>
            Cerrar
          </Button>
        </div>

        <Form className="edit-user-form" onSubmit={handleSubmit}>
          <div className="edit-form-grid edit-form-grid-wide">
            <TextField>
              <Label>RUT</Label>
              <Input value={form.rut} onChange={(e) => setForm((c) => ({ ...c, rut: e.target.value }))} required />
            </TextField>
            <TextField>
              <Label>DV</Label>
              <Input value={form.dv} onChange={(e) => setForm((c) => ({ ...c, dv: e.target.value }))} required />
            </TextField>
            <TextField>
              <Label>Nombre</Label>
              <Input value={form.nombre} onChange={(e) => setForm((c) => ({ ...c, nombre: e.target.value }))} required />
            </TextField>
            <TextField>
              <Label>Apellido</Label>
              <Input value={form.apellido} onChange={(e) => setForm((c) => ({ ...c, apellido: e.target.value }))} required />
            </TextField>
            <TextField>
              <Label>Correo</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} required />
            </TextField>
            <TextField>
              <Label>Contrasena inicial</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))} required />
            </TextField>
            <TextField>
              <Label>Telefono</Label>
              <Input value={form.telefono ?? ''} onChange={(e) => setForm((c) => ({ ...c, telefono: e.target.value }))} />
            </TextField>
            <TextField>
              <Label>Fecha nacimiento</Label>
              <Input type="date" value={form.fechaNacimiento ?? ''} onChange={(e) => setForm((c) => ({ ...c, fechaNacimiento: e.target.value }))} />
            </TextField>
          </div>

          <div className="selection-panel">
            <div className="selection-panel-head">
              <p className="section-kicker">Sucursales</p>
              <span>{form.sucursalIds.length} seleccionadas</span>
            </div>
            <div className="selection-grid">
              {sucursales.map((sucursal) => {
                const selected = form.sucursalIds.includes(sucursal.id)
                return (
                  <button
                    key={sucursal.id}
                    type="button"
                    className={`selection-card ${selected ? 'selection-card-active' : ''}`}
                    onClick={() => toggleSucursal(sucursal.id)}
                  >
                    <strong>{sucursal.nombre}</strong>
                    <span>{sucursal.direccion}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {error ? <p className="form-error">{error}</p> : null}
          <div className="modal-actions">
            <Button variant="secondary" className="btn-secondary-minimal" onPress={closeAndReset} isDisabled={saving}>Cancelar</Button>
            <Button type="submit" variant="primary" className="submit-button modal-submit-button" isDisabled={saving}>
              {saving ? 'Creando usuario...' : 'Crear usuario'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}
