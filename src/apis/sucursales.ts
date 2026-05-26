import { bffRequest } from './client'

export type Sucursal = {
  id: string
  nombre: string
  direccion: string
}

export type SucursalPayload = {
  nombre: string
  direccion: string
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
