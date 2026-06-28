import { ApiError } from '@/api/client'
import * as authApi from '@/api/auth'
import type { UserInfoDto } from '@/types/auth'

interface ResolveAuthSessionOptions {
  setUser: (user: UserInfoDto | null) => void
  clearUser: () => void
  isActive?: () => boolean
}

export async function resolveAuthSession({
  setUser,
  clearUser,
  isActive = () => true,
}: ResolveAuthSessionOptions) {
  try {
    const me = await authApi.getMe()
    if (isActive()) setUser(me)
  } catch (error) {
    if (!isActive()) return
    if (error instanceof ApiError && error.code === 'SESSION_EXPIRED') {
      clearUser()
      return
    }
    try {
      await authApi.refresh()
      const me = await authApi.getMe()
      if (isActive()) setUser(me)
    } catch {
      await authApi.logout().catch(() => undefined)
      if (isActive()) clearUser()
    }
  }
}
