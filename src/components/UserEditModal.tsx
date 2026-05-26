import { useState, useEffect, type FormEvent } from 'react'
import { Button, Form, Input, Label, TextField } from '@heroui/react'
import type { UserProfile, UpdateUserPayload } from '../apis/users'

export function UserEditModal({
  user,
  open,
  onClose,
  onSave,
}: {
  user: UserProfile | null
  open: boolean
  onClose: () => void
  onSave: (id: string, payload: UpdateUserPayload) => Promise<void>
}) {
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setNombre(user.nombre)
      setApellido(user.apellido)
      setEmail(user.email)
      setTelefono(user.telefono ?? '')
      setFechaNacimiento(user.fechaNacimiento ?? '')
      setError('')
    }
  }, [user])

  if (!open || !user) return null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave(user.id, { nombre, apellido, email, telefono, fechaNacimiento: fechaNacimiento || undefined })
      onClose()
    } catch (err) {
      setError((err as { message?: string }).message ?? 'Error al actualizar usuario.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Editar usuario</h3>
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
          {error ? <p className="form-error">{error}</p> : null}
          <div className="modal-actions">
            <Button variant="secondary" onPress={onClose} isDisabled={saving}>Cancelar</Button>
            <Button type="submit" variant="primary" isDisabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}
