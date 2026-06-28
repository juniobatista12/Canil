import { createContext } from 'react'
import type { UserInfoDto } from '@/types/auth'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthContextValue {
  status: AuthStatus
  user: UserInfoDto | null
  setUser: (user: UserInfoDto | null) => void
  clearUser: () => void
  boot: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
