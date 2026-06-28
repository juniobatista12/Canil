import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import * as authApi from '@/api/auth'
import { ApiError, resetSessionExpired } from '@/api/client'
import { clearTokens, getRefreshToken } from '@/storage/tokenStorage'
import type { UserInfoDto } from '@/types/auth'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  status: AuthStatus
  user: UserInfoDto | null
  setUser: (user: UserInfoDto | null) => void
  clearUser: () => void
  boot: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUserState] = useState<UserInfoDto | null>(null)

  const clearUser = () => {
    setUserState(null)
    setStatus('unauthenticated')
    queryClient.removeQueries({ queryKey: ['me'] })
  }

  const setUser = (next: UserInfoDto | null) => {
    setUserState(next)
    setStatus(next ? 'authenticated' : 'unauthenticated')
    if (next) resetSessionExpired()
  }

  const boot = async () => {
    setStatus('loading')
    const refreshToken = await getRefreshToken()
    if (!refreshToken) {
      clearUser()
      return
    }

    try {
      const me = await authApi.getMe()
      setUser(me)
    } catch (error) {
      if (error instanceof ApiError && error.code === 'SESSION_EXPIRED') {
        clearUser()
        return
      }
      try {
        await authApi.refresh()
        const me = await authApi.getMe()
        setUser(me)
      } catch {
        await authApi.logout().catch(() => undefined)
        await clearTokens()
        clearUser()
      }
    }
  }

  useEffect(() => {
    void boot()
  }, [])

  const value = useMemo(
    () => ({ status, user, setUser, clearUser, boot }),
    [status, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
