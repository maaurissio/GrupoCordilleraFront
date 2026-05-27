import { bffRequest } from './client'

export type Region = {
  id: string
  nombre: string
}

export async function getAllRegiones(): Promise<Region[]> {
  return bffRequest<Region[]>('/bff/regiones', { auth: true })
}
