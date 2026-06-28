export interface TenantDto {
  id: string
  name: string
  slug: string
  isActive: boolean
  isSystemTenant: boolean
  createdAt: string
}

export interface CreateTenantRequest {
  name: string
  slug: string
}

export interface UpdateTenantRequest {
  name: string
  isActive: boolean
}
