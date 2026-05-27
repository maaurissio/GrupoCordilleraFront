import { useState, useEffect, type FormEvent } from 'react'
import { Button, Form, Input, Label, TextField } from '@heroui/react'
import { getAssignmentsByUsuario } from '../apis/usuarioSucursales'
import type { Sucursal } from '../apis/sucursales'
import type { UserProfile, UpdateUserPayload } from '../apis/users'

export function UserEditModal({
  user,
  open,
  onClose,
  onSave,
  sucursales,
}: {
  user: UserProfile | null
  open: boolean
  onClose: () => void
  onSave: (id: string, payload: UpdateUserPayload) => Promise<void>
  sucursales: Sucursal[]
}) {
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [selectedSucursalIds, setSelectedSucursalIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setNombre(user.nombre)
      setApellido(user.apellido)
      setEmail(user.email)
      setTelefono(user.telefono ?? '')
      setFechaNacimiento(user.fechaNacimiento ?? '')
      setSelectedSucursalIds([])
      setError('')
    }
  }, [user])

  useEffect(() => {
    if (!open || !user) return

    const currentUser = user
    let ignore = false

    async function loadAssignments() {
      try {
        const assignments = await getAssignmentsByUsuario(currentUser.id)
        if (!ignore) setSelectedSucursalIds(assignments.map((assignment) => assignment.sucursalId))
      } catch {
        if (!ignore) setSelectedSucursalIds([])
      }
    }

    void loadAssignments()
    return () => {
      ignore = true
    }
  }, [open, user])

  if (!open || !user) return null

  function toggleSucursal(id: string) {
    setSelectedSucursalIds((current) => (
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    ))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return
    setSaving(true)
    setError('')
    try {
      await onSave(user.id, {
        nombre,
        apellido,
        email,
        telefono,
        fechaNacimiento: fechaNacimiento || undefined,
        sucursalIds: selectedSucursalIds,
      })
      onClose()
    } catch (err) {
      setError((err as { message?: string }).message ?? 'Error al actualizar usuario.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-wide glass-panel" data-lenis-prevent onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="section-kicker">Perfil editable</p>
            <h3 className="modal-title">Editar usuario</h3>
          </div>
          <Button variant="secondary" className="btn-secondary-minimal modal-close-button" onPress={onClose} isDisabled={saving}>Cerrar</Button>
        </div>
        <Form className="edit-user-form" onSubmit={handleSubmit}>
          <div className="edit-form-grid">
            <TextField>
              <Label>Nombre</Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </TextField>
            <TextField>
              <Label>Apellido</Label>
              <Input value={apellido} onChange={(e) => setApellido(e.target.value)} required />
            </TextField>
            <TextField>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </TextField>
            <TextField>
              <Label>Telefono</Label>
              <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            </TextField>
            <TextField>
              <Label>Fecha nacimiento</Label>
              <Input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
            </TextField>
          </div>
          <div className="selection-panel">
            <div className="selection-panel-head">
              <p className="section-kicker">Sucursales asignadas</p>
              <span>{selectedSucursalIds.length} seleccionadas</span>
            </div>
            <div className="selection-grid">
              {sucursales.map((sucursal) => {
                const selected = selectedSucursalIds.includes(sucursal.id)
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
            <Button variant="secondary" className="btn-secondary-minimal" onPress={onClose} isDisabled={saving}>Cancelar</Button>
            <Button type="submit" variant="primary" className="submit-button modal-submit-button" isDisabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}
