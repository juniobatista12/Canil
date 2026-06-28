import { useAuth } from '@/hooks/useAuth'

export function useRole() {
  const { user } = useAuth()

  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) ?? false
  }

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some((role) => hasRole(role))
  }

  return {
    user,
    hasRole,
    hasAnyRole,
    isAdmin: hasRole('Admin'),
  }
}
