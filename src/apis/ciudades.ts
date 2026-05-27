import { bffRequest } from './client'

export type Ciudad = {
  id: string
  nombre: string
  regionId: string
  region: string
}

export async function getAllCiudades(): Promise<Ciudad[]> {
  return bffRequest<Ciudad[]>('/bff/ciudades', { auth: true })
}

export async function getCiudadesByRegion(regionId: string): Promise<Ciudad[]> {
  return bffRequest<Ciudad[]>(`/bff/ciudades/region/${regionId}`, { auth: true })
}
