import { bffRequest } from './client'

export type Role = {
  id: string
  nombre: string
  descripcion: string
}

export type RolePayload = {
  nombre: string
  descripcion?: string
}

export async function getAllRoles(): Promise<Role[]> {
  return bffRequest<Role[]>('/bff/roles', { auth: true })
}

export async function getRoleById(id: string): Promise<Role> {
  return bffRequest<Role>(`/bff/roles/${id}`, { auth: true })
}

export async function createRole(payload: RolePayload): Promise<Role> {
  return bffRequest<Role>('/bff/roles', {
    method: 'POST',
    body: payload,
    auth: true,
  })
}

export async function updateRole(id: string, payload: RolePayload): Promise<Role> {
  return bffRequest<Role>(`/bff/roles/${id}`, {
    method: 'PUT',
    body: payload,
    auth: true,
  })
}

export async function activateRole(id: string): Promise<Role> {
  return bffRequest<Role>(`/bff/roles/${id}/activar`, {
    method: 'PUT',
    auth: true,
  })
}

export async function deactivateRole(id: string): Promise<Role> {
  return bffRequest<Role>(`/bff/roles/${id}/desactivar`, {
    method: 'PUT',
    auth: true,
  })
}
