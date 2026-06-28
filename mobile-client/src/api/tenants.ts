import { api } from '@/api/client'
import type { PagedResult, PaginationQuery } from '@/types/api'
import type { CreateTenantRequest, TenantDto, UpdateTenantRequest } from '@/types/tenants'

function toQuery(params: PaginationQuery): string {
  const search = new URLSearchParams()
  if (params.page) search.set('page', String(params.page))
  if (params.pageSize) search.set('pageSize', String(params.pageSize))
  const query = search.toString()
  return query ? `?${query}` : ''
}

export function getTenants(query: PaginationQuery = {}): Promise<PagedResult<TenantDto>> {
  return api<PagedResult<TenantDto>>(`/api/tenants${toQuery(query)}`)
}

export function getTenant(id: string): Promise<TenantDto> {
  return api<TenantDto>(`/api/tenants/${id}`)
}

export function createTenant(request: CreateTenantRequest): Promise<TenantDto> {
  return api<TenantDto>('/api/tenants', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function updateTenant(id: string, request: UpdateTenantRequest): Promise<TenantDto> {
  return api<TenantDto>(`/api/tenants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function deactivateTenant(id: string): Promise<void> {
  return api<void>(`/api/tenants/${id}`, { method: 'DELETE' })
}
