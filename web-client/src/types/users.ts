export interface UserListItemDto {
  id: string
  email: string
  tenantId: string
  tenantName: string
  roles: string[]
  twoFactorEnabled: boolean
}

export interface UserRolesResponse {
  userId: string
  email: string
  tenantId: string
  roles: string[]
}

export interface AddRoleRequest {
  role: string
}
