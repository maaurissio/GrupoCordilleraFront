import { bffRequest } from './client'

export type UsuarioSucursalAssignment = {
  id: string
  usuarioId: string
  nombreUsuario: string
  sucursalId: string
  nombreSucursal: string
  asignadoEn: string
}

export async function getAssignmentsByUsuario(usuarioId: string): Promise<UsuarioSucursalAssignment[]> {
  return bffRequest<UsuarioSucursalAssignment[]>(`/bff/usuario-sucursales/usuario/${usuarioId}`, { auth: true })
}

export async function getAssignmentsBySucursal(sucursalId: string): Promise<UsuarioSucursalAssignment[]> {
  return bffRequest<UsuarioSucursalAssignment[]>(`/bff/usuario-sucursales/sucursal/${sucursalId}`, { auth: true })
}
