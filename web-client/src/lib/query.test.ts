import { describe, expect, it } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { findUserInCache, toUserListItem, upsertUserInCache } from '@/lib/query'
import type { PagedResult } from '@/types/api'
import type { UserListItemDto } from '@/types/users'

describe('toUserListItem', () => {
  it('normalizes missing roles', () => {
    expect(
      toUserListItem({
        id: 'u1',
        email: 'a@test.com',
        roles: undefined as unknown as string[],
        twoFactorEnabled: false,
      }),
    ).toEqual({
      id: 'u1',
      email: 'a@test.com',
      roles: [],
      twoFactorEnabled: false,
    })
  })
})

describe('upsertUserInCache', () => {
  it('seeds first page when cache is empty', () => {
    const queryClient = new QueryClient()
    const user: UserListItemDto = {
      id: 'u-new',
      email: 'new@test.com',
      roles: ['User'],
      twoFactorEnabled: false,
    }

    upsertUserInCache(queryClient, user)

    expect(findUserInCache(queryClient, 'u-new')).toEqual(user)
  })
})

describe('findUserInCache', () => {
  it('finds user across cached pages', () => {
    const queryClient = new QueryClient()
    const user: UserListItemDto = {
      id: 'u1',
      email: 'a@test.com',
      roles: ['User'],
      twoFactorEnabled: false,
    }

    queryClient.setQueryData<PagedResult<UserListItemDto>>(['users', { page: 1, pageSize: 20 }], {
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0,
      hasPrevious: false,
      hasNext: false,
    })

    queryClient.setQueryData<PagedResult<UserListItemDto>>(['users', { page: 2, pageSize: 20 }], {
      items: [user],
      page: 2,
      pageSize: 20,
      totalCount: 1,
      totalPages: 1,
      hasPrevious: true,
      hasNext: false,
    })

    expect(findUserInCache(queryClient, 'u1')).toEqual(user)
    expect(findUserInCache(queryClient, 'missing')).toBeNull()
  })
})
