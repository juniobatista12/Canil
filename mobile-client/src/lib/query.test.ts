import { describe, expect, it } from '@jest/globals'
import { findUserInCache, tenantsQueryKey, userRolesQueryKey, usersQueryKey } from '@/lib/query'
import { createTestQueryClient } from '@/test/createQueryClient'
import type { PagedResult } from '@/types/api'
import type { UserListItemDto } from '@/types/users'

describe('query helpers', () => {
  it('finds user in cache', () => {
    const queryClient = createTestQueryClient()
    const user: UserListItemDto = {
      id: 'u1',
      email: 'a@test.com',
      roles: ['User'],
      tenantId: 't1',
      tenantName: 'System',
      twoFactorEnabled: false,
    }
    queryClient.setQueryData(['users', { page: 1, pageSize: 10 }], {
      items: [user],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false,
    } satisfies PagedResult<UserListItemDto>)

    expect(findUserInCache(queryClient, 'u1')).toEqual(user)
    expect(findUserInCache(queryClient, 'missing')).toBeNull()
  })

  it('builds stable query keys', () => {
    expect(usersQueryKey({ page: 1, pageSize: 20 })).toEqual(['users', { page: 1, pageSize: 20 }])
    expect(tenantsQueryKey({ page: 1, pageSize: 20 })).toEqual(['tenants', { page: 1, pageSize: 20 }])
    expect(userRolesQueryKey('u1')).toEqual(['users', 'u1', 'roles'])
  })
})
