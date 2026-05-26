import { clearSession, getRefreshToken } from '../lib/session'
import { bffRequest, type RequestOptions } from './client'

export type AuthTokens = {
  usuarioId: string
  email: string
  accessToken: string
  refreshToken: string
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  return bffRequest<AuthTokens>('/bff/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    clearSession()
    return
  }
  try {
    await bffRequest<void>('/bff/auth/logout', {
      method: 'POST',
      body: { refreshToken },
      retryOnUnauthorized: false,
    } as RequestOptions)
  } finally {
    clearSession()
  }
}
