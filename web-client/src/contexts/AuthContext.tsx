import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { resetSessionExpired } from '@/api/client'
import { subscribeAuthLogout } from '@/lib/auth'
import { resolveAuthSession } from '@/lib/auth-session'
import type { UserInfoDto } from '@/types/auth'
import { AuthContext, type AuthStatus } from '@/contexts/auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUserState] = useState<UserInfoDto | null>(null)

  const clearUser = useCallback(() => {
    setUserState(null)
    setStatus('unauthenticated')
    queryClient.removeQueries({ queryKey: ['me'] })
  }, [queryClient])

  const setUser = useCallback((next: UserInfoDto | null) => {
    setUserState(next)
    setStatus(next ? 'authenticated' : 'unauthenticated')
    if (next) resetSessionExpired()
  }, [])

  const boot = useCallback(async () => {
    setStatus('loading')
    await resolveAuthSession({ setUser, clearUser })
  }, [clearUser, setUser])

  useEffect(() => {
    let active = true
    void resolveAuthSession({
      setUser,
      clearUser,
      isActive: () => active,
    })
    return () => {
      active = false
    }
  }, [clearUser, setUser])

  useEffect(() => {
    return subscribeAuthLogout(() => clearUser())
  }, [clearUser])

  const value = useMemo(
    () => ({ status, user, setUser, clearUser, boot }),
    [status, user, setUser, clearUser, boot],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
