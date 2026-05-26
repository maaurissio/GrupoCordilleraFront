import { useState, useCallback } from 'react'
import {
  getAllSucursales,
  createSucursal,
  updateSucursal,
  deactivateSucursal,
  activateSucursal,
  type Sucursal,
  type SucursalPayload,
} from '../apis/sucursales'

export function useSucursales() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchSucursales = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAllSucursales()
      setSucursales(data)
    } catch {
      setError('Error al cargar sucursales.')
    } finally {
      setLoading(false)
    }
  }, [])

  const addSucursal = useCallback(async (payload: SucursalPayload) => {
    const created = await createSucursal(payload)
    setSucursales((prev) => [...prev, created])
    return created
  }, [])

  const editSucursal = useCallback(async (id: string, payload: SucursalPayload) => {
    const updated = await updateSucursal(id, payload)
    setSucursales((prev) => prev.map((s) => (s.id === id ? updated : s)))
    return updated
  }, [])

  const toggleSucursalStatus = useCallback(async (id: string, _active: boolean) => {
    const updated = _active ? await deactivateSucursal(id) : await activateSucursal(id)
    setSucursales((prev) => prev.map((s) => (s.id === id ? updated : s)))
    return updated
  }, [])

  return { sucursales, loading, error, fetchSucursales, addSucursal, editSucursal, toggleSucursalStatus }
}
