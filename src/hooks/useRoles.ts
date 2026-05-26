import { useState, useCallback } from 'react'
import {
  getAllRoles,
  createRole,
  updateRole,
  deactivateRole,
  activateRole,
  type Role,
  type RolePayload,
} from '../apis/roles'

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchRoles = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAllRoles()
      setRoles(data)
    } catch {
      setError('Error al cargar roles.')
    } finally {
      setLoading(false)
    }
  }, [])

  const addRole = useCallback(async (payload: RolePayload) => {
    const created = await createRole(payload)
    setRoles((prev) => [...prev, created])
    return created
  }, [])

  const editRole = useCallback(async (id: string, payload: RolePayload) => {
    const updated = await updateRole(id, payload)
    setRoles((prev) => prev.map((r) => (r.id === id ? updated : r)))
    return updated
  }, [])

  const toggleRoleStatus = useCallback(async (id: string, _active: boolean) => {
    const updated = _active ? await deactivateRole(id) : await activateRole(id)
    setRoles((prev) => prev.map((r) => (r.id === id ? updated : r)))
    return updated
  }, [])

  return { roles, loading, error, fetchRoles, addRole, editRole, toggleRoleStatus }
}
