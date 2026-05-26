import { useState, useEffect, useCallback } from 'react'
import { login as loginApi, logout as logoutApi } from '../apis/auth'
import { getMyProfile, type UserProfile } from '../apis/users'
import { getAccessToken, saveSession } from '../lib/session'

export function useAuth() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function restore() {
      if (!getAccessToken()) {
        setLoading(false)
        return
      }
      try {
        const me = await getMyProfile()
        setProfile(me)
      } catch {
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }
    void restore()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const authData = await loginApi(email, password)
    saveSession(authData.accessToken, authData.refreshToken)
    const me = await getMyProfile()
    setProfile(me)
    return me
  }, [])

  const logout = useCallback(async () => {
    await logoutApi()
    setProfile(null)
  }, [])

  return { profile, loading, login, logout, setProfile }
}
