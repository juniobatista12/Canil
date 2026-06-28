export interface UserInfoDto {
  id: string
  email: string
  roles: string[]
  twoFactorEnabled: boolean
}

export interface AuthResponse {
  token: string
  refreshToken: string
  expiresAt: string
  refreshExpiresAt: string
  user: UserInfoDto
}

export interface LoginRequest {
  email: string
  password: string
  twoFactorCode?: string
}

export interface RegisterRequest {
  email: string
  password: string
  roles: string[]
}

export interface TwoFactorSetupResponse {
  sharedKey: string
  qrCodeBase64: string
  authenticatorUri: string
}

export interface EnableTwoFactorRequest {
  code: string
}

export interface DisableTwoFactorRequest {
  password: string
  code: string
}

export const ROLES = {
  Admin: 'Admin',
  User: 'User',
} as const

export type RoleName = (typeof ROLES)[keyof typeof ROLES]
