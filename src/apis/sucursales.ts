import { bffRequest } from './client'

export type Sucursal = {
  id: string
  nombre: string
  direccion: string
  ciudadId: string | null
  ciudad: string | null
  regionId: string | null
  region: string | null
}

export type SucursalPayload = {
  nombre: string
  direccion: string
  ciudadId: string
  usuarioIds: string[]
}

export async function getAllSucursales(): Promise<Sucursal[]> {
  return bffRequest<Sucursal[]>('/bff/sucursales', { auth: true })
}

export async function getSucursalById(id: string): Promise<Sucursal> {
  return bffRequest<Sucursal>(`/bff/sucursales/${id}`, { auth: true })
}

export async function createSucursal(payload: SucursalPayload): Promise<Sucursal> {
  return bffRequest<Sucursal>('/bff/sucursales', {
    method: 'POST',
    body: payload,
    auth: true,
  })
}

export async function updateSucursal(id: string, payload: SucursalPayload): Promise<Sucursal> {
  return bffRequest<Sucursal>(`/bff/sucursales/${id}`, {
    method: 'PUT',
    body: payload,
    auth: true,
  })
}

export async function activateSucursal(id: string): Promise<Sucursal> {
  return bffRequest<Sucursal>(`/bff/sucursales/${id}/activar`, {
    method: 'PUT',
    auth: true,
  })
}

export async function deactivateSucursal(id: string): Promise<Sucursal> {
  return bffRequest<Sucursal>(`/bff/sucursales/${id}/desactivar`, {
    method: 'PUT',
    auth: true,
  })
}
