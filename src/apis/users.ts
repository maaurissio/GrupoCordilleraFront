import { bffRequest } from './client'

export type UserProfile = {
  id: string
  rut: string
  dv: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  fechaNacimiento?: string
  estado: string
  roles: string[]
  sucursales: string[]
}

export type RegisterPayload = {
  rut: string
  dv: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  fechaNacimiento?: string
  password: string
  sucursalIds: string[]
}

export type UpdateUserPayload = {
  nombre?: string
  apellido?: string
  email?: string
  telefono?: string
  fechaNacimiento?: string
  sucursalIds?: string[]
}

export async function registerUser(payload: RegisterPayload): Promise<UserProfile> {
  return bffRequest<UserProfile>('/bff/usuarios/register', {
    method: 'POST',
    body: payload,
    auth: true,
  })
}

export async function getMyProfile(): Promise<UserProfile> {
  return bffRequest<UserProfile>('/bff/usuarios/me', { auth: true })
}

export async function getAllUsers(): Promise<UserProfile[]> {
  return bffRequest<UserProfile[]>('/bff/usuarios', { auth: true })
}

export async function getUserById(id: string): Promise<UserProfile> {
  return bffRequest<UserProfile>(`/bff/usuarios/${id}`, { auth: true })
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<UserProfile> {
  return bffRequest<UserProfile>(`/bff/usuarios/${id}`, {
    method: 'PUT',
    body: payload,
    auth: true,
  })
}

export async function deactivateUser(id: string): Promise<UserProfile> {
  return bffRequest<UserProfile>(`/bff/usuarios/${id}/desactivar`, {
    method: 'PUT',
    auth: true,
  })
}

export async function activateUser(id: string): Promise<UserProfile> {
  return bffRequest<UserProfile>(`/bff/usuarios/${id}/activar`, {
    method: 'PUT',
    auth: true,
  })
}
