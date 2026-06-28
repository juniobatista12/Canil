import { useAuth } from '@/hooks/useAuth'

export function useRole() {
  const { user } = useAuth()

  const hasRole = (role: string): boolean => user?.roles.includes(role) ?? false

  const hasAnyRole = (roles: string[]): boolean => roles.some((role) => hasRole(role))

  const isSuperAdmin = hasRole('SuperAdmin')
  const isAdmin = hasRole('Admin')

  return { hasRole, hasAnyRole, isSuperAdmin, isAdmin }
}
