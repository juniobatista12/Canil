import type { QueryClient } from '@tanstack/react-query'
import type { UserInfoDto } from '@/types/auth'
import type { UserListItemDto } from '@/types/users'
import type { PagedResult } from '@/types/api'

type UserListItemSource = Pick<UserInfoDto, 'id' | 'email' | 'roles' | 'twoFactorEnabled'>

export function toUserListItem(user: UserListItemSource): UserListItemDto {
  return {
    id: user.id,
    email: user.email,
    roles: user.roles ?? [],
    twoFactorEnabled: user.twoFactorEnabled ?? false,
  }
}

export function upsertUserInCache(queryClient: QueryClient, user: UserListItemDto): void {
  const entries = queryClient.getQueriesData<PagedResult<UserListItemDto>>({
    queryKey: ['users'],
  })

  for (const [key, data] of entries) {
    if (!data) continue

    if (data.items.some((item) => item.id === user.id)) {
      queryClient.setQueryData<PagedResult<UserListItemDto>>(key, {
        ...data,
        items: data.items.map((item) => (item.id === user.id ? user : item)),
      })
      return
    }

    queryClient.setQueryData<PagedResult<UserListItemDto>>(key, {
      ...data,
      items: [user, ...data.items],
      totalCount: data.totalCount + 1,
    })
    return
  }

  queryClient.setQueryData<PagedResult<UserListItemDto>>(['users', { page: 1, pageSize: 20 }], {
    items: [user],
    page: 1,
    pageSize: 20,
    totalCount: 1,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  })
}

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

export function usersQueryKey(filters: { page: number; pageSize: number }) {
  return ['users', filters] as const
}

export function userRolesQueryKey(userId: string) {
  return ['users', userId, 'roles'] as const
}
