import { useEffect, useState, type FormEvent } from 'react'
import { Button, Form, Input, Label, TextField } from '@heroui/react'
import { getCiudadesByRegion, type Ciudad } from '../apis/ciudades'
import { getAllRegiones, type Region } from '../apis/regiones'
import { getAssignmentsBySucursal } from '../apis/usuarioSucursales'
import { getAllUsers, type UserProfile } from '../apis/users'
import { useSucursales } from '../hooks/useSucursales'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { SucursalViewModal } from '../components/SucursalViewModal'
import type { Sucursal } from '../apis/sucursales'

export function SucursalesPage({ userRole }: { userRole: string }) {
  const { sucursales, loading, error, fetchSucursales, addSucursal, editSucursal, toggleSucursalStatus } = useSucursales()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [regiones, setRegiones] = useState<Region[]>([])
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [viewTarget, setViewTarget] = useState<Sucursal | null>(null)
  const [editTarget, setEditTarget] = useState<Sucursal | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [formNombre, setFormNombre] = useState('')
  const [formDireccion, setFormDireccion] = useState('')
  const [selectedRegionId, setSelectedRegionId] = useState('')
  const [selectedCityId, setSelectedCityId] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [toggleTarget, setToggleTarget] = useState<Sucursal | null>(null)

  const canManageSucursales = userRole !== 'GERENTE'

  useEffect(() => {
    void fetchSucursales()
  }, [fetchSucursales])

  useEffect(() => {
    let ignore = false

    async function loadCatalogs() {
      try {
        const [userData, regionData] = await Promise.all([getAllUsers(), getAllRegiones()])
        if (!ignore) {
          setUsers(userData)
          setRegiones(regionData)
        }
      } catch {
        if (!ignore) {
          setUsers([])
          setRegiones([])
        }
      }
    }

    void loadCatalogs()
    return () => {
      ignore = true
    }
  }, [])

  async function loadCiudades(regionId: string, cityId?: string) {
    if (!regionId) {
      setCiudades([])
      setSelectedCityId('')
      return
    }

    const data = await getCiudadesByRegion(regionId)
    setCiudades(data)
    setSelectedCityId(cityId ?? '')
  }

  async function openEdit(sucursal: Sucursal) {
    setEditTarget(sucursal)
    setFormNombre(sucursal.nombre)
    setFormDireccion(sucursal.direccion)
    setSelectedRegionId(sucursal.regionId ?? '')
    setSelectedCityId(sucursal.ciudadId ?? '')
    setSelectedUserIds([])
    setFormError('')

    try {
      const [assignmentData] = await Promise.all([
        getAssignmentsBySucursal(sucursal.id),
        loadCiudades(sucursal.regionId ?? '', sucursal.ciudadId ?? ''),
      ])
      setSelectedUserIds(assignmentData.map((assignment) => assignment.usuarioId))
    } catch {
      setFormError('No fue posible cargar los datos completos de la sucursal.')
    }
  }

  function openCreate() {
    setShowCreate(true)
    setEditTarget(null)
    setFormNombre('')
    setFormDireccion('')
    setSelectedRegionId('')
    setSelectedCityId('')
    setSelectedUserIds([])
    setCiudades([])
    setFormError('')
  }

  function closeForm() {
    setShowCreate(false)
    setEditTarget(null)
    setSelectedUserIds([])
    setSelectedRegionId('')
    setSelectedCityId('')
    setCiudades([])
    setFormError('')
  }

  function toggleUser(id: string) {
    setSelectedUserIds((current) => (
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    ))
  }

  async function handleRegionChange(regionId: string) {
    setSelectedRegionId(regionId)
    setSelectedCityId('')
    try {
      await loadCiudades(regionId)
    } catch {
      setCiudades([])
      setFormError('No fue posible cargar las ciudades para la region seleccionada.')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setFormError('')

    try {
      if (!selectedCityId) {
        throw new Error('Selecciona una ciudad para guardar la sucursal.')
      }

      const payload = {
        nombre: formNombre,
        direccion: formDireccion,
        ciudadId: selectedCityId,
        usuarioIds: selectedUserIds,
      }

      if (editTarget) {
        await editSucursal(editTarget.id, payload)
      } else {
        await addSucursal(payload)
      }

      closeForm()
      await fetchSucursales()
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
      await fetchSucursales()
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
        <div className="page-header-actions">
          <span className="page-count">{sucursales.length} registros</span>
          {canManageSucursales ? <Button variant="primary" onPress={openCreate} className="create-button">Crear sucursal</Button> : null}
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {(showCreate || editTarget) && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-content modal-wide glass-panel" data-lenis-prevent onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="section-kicker">Red operativa</p>
                <h3 className="modal-title">{editTarget ? 'Editar sucursal' : 'Crear sucursal'}</h3>
              </div>
              <Button variant="secondary" className="btn-secondary-minimal modal-close-button" onPress={closeForm} isDisabled={saving}>Cerrar</Button>
            </div>

            <Form className="sucursal-form" onSubmit={handleSubmit}>
              <div className="edit-form-grid edit-form-grid-sucursal">
                <TextField>
                  <Label>Nombre</Label>
                  <Input value={formNombre} onChange={(e) => setFormNombre(e.target.value)} required />
                </TextField>

                <TextField>
                  <Label>Direccion</Label>
                  <Input value={formDireccion} onChange={(e) => setFormDireccion(e.target.value)} required />
                </TextField>

                <TextField>
                  <Label>Region</Label>
                  <select className="role-select" value={selectedRegionId} onChange={(e) => void handleRegionChange(e.target.value)} required>
                    <option value="">Seleccionar region</option>
                    {regiones.map((region) => (
                      <option key={region.id} value={region.id}>{region.nombre}</option>
                    ))}
                  </select>
                </TextField>

                <TextField>
                  <Label>Ciudad</Label>
                  <select className="role-select" value={selectedCityId} onChange={(e) => setSelectedCityId(e.target.value)} required disabled={!selectedRegionId}>
                    <option value="">Seleccionar ciudad</option>
                    {ciudades.map((ciudad) => (
                      <option key={ciudad.id} value={ciudad.id}>{ciudad.nombre}</option>
                    ))}
                  </select>
                </TextField>
              </div>

              <div className="selection-panel">
                <div className="selection-panel-head">
                  <p className="section-kicker">Usuarios asociados</p>
                  <span>{selectedUserIds.length} seleccionados</span>
                </div>
                <div className="selection-grid">
                  {users.map((user) => {
                    const selected = selectedUserIds.includes(user.id)
                    return (
                      <button
                        key={user.id}
                        type="button"
                        className={`selection-card ${selected ? 'selection-card-active' : ''}`}
                        onClick={() => toggleUser(user.id)}
                      >
                        <strong>{user.nombre} {user.apellido}</strong>
                        <span>{user.email}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {formError ? <p className="form-error">{formError}</p> : null}
              <div className="modal-actions">
                <Button variant="secondary" className="btn-secondary-minimal" onPress={closeForm} isDisabled={saving}>Cancelar</Button>
                <Button type="submit" variant="primary" className="submit-button modal-submit-button" isDisabled={saving}>
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
              <th>Region</th>
              <th>Ciudad</th>
              <th>Direccion</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sucursales.length === 0 ? (
              <tr><td colSpan={6} className="table-empty">No hay sucursales registradas</td></tr>
            ) : (
              sucursales.map((sucursal) => (
                <tr key={sucursal.id}>
                  <td><strong>{sucursal.nombre}</strong></td>
                  <td>{sucursal.region ?? '—'}</td>
                  <td>{sucursal.ciudad ?? '—'}</td>
                  <td>{sucursal.direccion}</td>
                  <td><span className="status-active">Activo</span></td>
                  <td>
                    <div className="action-buttons">
                      <Button size="sm" variant="secondary" className="btn-action-view" onPress={() => setViewTarget(sucursal)}>Ver</Button>
                      {canManageSucursales ? (
                        <>
                          <Button size="sm" variant="secondary" className="btn-action-edit" onPress={() => void openEdit(sucursal)}>Editar</Button>
                          <Button size="sm" variant="secondary" className="btn-action-deactivate" onPress={() => setToggleTarget(sucursal)}>Desactivar</Button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <SucursalViewModal sucursal={viewTarget} open={!!viewTarget} onClose={() => setViewTarget(null)} />
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
