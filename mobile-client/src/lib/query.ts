import type { QueryClient } from '@tanstack/react-query'
import type { PagedResult } from '@/types/api'
import type { UserListItemDto } from '@/types/users'

export function findUserInCache(queryClient: QueryClient, id: string): UserListItemDto | null {
  const entries = queryClient.getQueriesData<PagedResult<UserListItemDto>>({
    queryKey: ['users'],
  })
  for (const [, data] of entries) {
    const user = data?.items.find((item) => item.id === id)
    if (user) return user
  }
  return null
}

export function usersQueryKey(filters: { page: number; pageSize: number; tenantId?: string }) {
  return ['users', filters] as const
}

export function tenantsQueryKey(filters: { page: number; pageSize: number }) {
  return ['tenants', filters] as const
}

export function userRolesQueryKey(userId: string) {
  return ['users', userId, 'roles'] as const
}

export function tenantDetailQueryKey(tenantId: string) {
  return ['tenants', tenantId] as const
}
