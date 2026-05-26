import { useState, useCallback } from 'react'
import {
  getAllUsers,
  updateUser,
  deactivateUser,
  activateUser,
  registerUser,
  type UserProfile,
  type RegisterPayload,
  type UpdateUserPayload,
} from '../apis/users'

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAllUsers()
      setUsers(data)
    } catch (err) {
      setError((err as { status?: number }).status === 401
        ? 'Sesion expirada, inicia sesion nuevamente.'
        : 'Error al cargar usuarios.')
    } finally {
      setLoading(false)
    }
  }, [])

  const createUser = useCallback(async (payload: RegisterPayload) => {
    const created = await registerUser(payload)
    setUsers((prev) => [...prev, created])
    return created
  }, [])

  const editUser = useCallback(async (id: string, payload: UpdateUserPayload) => {
    const updated = await updateUser(id, payload)
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
    return updated
  }, [])

  const toggleUserStatus = useCallback(async (id: string, currentStatus: string) => {
    const updated = currentStatus === 'ACTIVO' ? await deactivateUser(id) : await activateUser(id)
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
    return updated
  }, [])

  return { users, loading, error, fetchUsers, createUser, editUser, toggleUserStatus }
}
