import { api } from '@/api/client'
import type { PagedResult, PaginationQuery } from '@/types/api'
import type { AddRoleRequest, UserListItemDto, UserRolesResponse } from '@/types/users'

function toQuery(params: PaginationQuery): string {
  const search = new URLSearchParams()
  if (params.page) search.set('page', String(params.page))
  if (params.pageSize) search.set('pageSize', String(params.pageSize))
  const query = search.toString()
  return query ? `?${query}` : ''
}

export function getUsers(query: PaginationQuery = {}): Promise<PagedResult<UserListItemDto>> {
  return api<PagedResult<UserListItemDto>>(`/api/users${toQuery(query)}`)
}

export function getUserRoles(userId: string): Promise<UserRolesResponse> {
  return api<UserRolesResponse>(`/api/users/${userId}/roles`)
}

export function addUserRole(userId: string, request: AddRoleRequest): Promise<void> {
  return api<void>(`/api/users/${userId}/roles`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function removeUserRole(userId: string, roleName: string): Promise<void> {
  return api<void>(`/api/users/${userId}/roles/${encodeURIComponent(roleName)}`, {
    method: 'DELETE',
  })
}
