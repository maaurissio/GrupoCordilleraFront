import { clearSession, getAccessToken, getRefreshToken, saveSession } from '../lib/session'

const BFF_BASE_URL = import.meta.env.DEV ? '' : 'http://localhost:8080'

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  auth?: boolean
  retryOnUnauthorized?: boolean
}

export type ApiError = Error & { status?: number }

async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    const data = await request<{ accessToken: string; refreshToken: string }>(
      BFF_BASE_URL,
      '/bff/auth/refresh',
      { method: 'POST', body: { refreshToken }, retryOnUnauthorized: false },
    )
    saveSession(data.accessToken, data.refreshToken)
    return true
  } catch {
    return false
  }
}

export async function request<T>(
  baseUrl: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, auth = false, retryOnUnauthorized = true } = options
  const headers = new Headers({ 'Content-Type': 'application/json' })

  if (auth) {
    const token = getAccessToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401 && auth && retryOnUnauthorized) {
    const refreshed = await refreshTokens()
    if (refreshed) {
      return request<T>(baseUrl, path, { ...options, retryOnUnauthorized: false })
    }
    clearSession()
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const data = await response.json()
      if (typeof data?.message === 'string') message = data.message
    } catch {
      // Ignore non-json error bodies.
    }
    const error: ApiError = new Error(message)
    error.status = response.status
    throw error
  }

  if (response.status === 204) return undefined as T

  return (await response.json()) as T
}

export function bffRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return request<T>(BFF_BASE_URL, path, options)
}
