export interface UserListItemDto {
  id: string
  email: string
  roles: string[]
  twoFactorEnabled: boolean
}

export interface UserRolesResponse {
  userId: string
  email: string
  roles: string[]
}

export interface AddRoleRequest {
  role: string
}
