import { api } from '@/api/client'
import { getRefreshToken, setTokens } from '@/storage/tokenStorage'
import type {
  AuthResponse,
  DisableTwoFactorRequest,
  EnableTwoFactorRequest,
  LoginRequest,
  RegisterRequest,
  TwoFactorSetupResponse,
  UserInfoDto,
} from '@/types/auth'

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await api<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  })
  await setTokens(response.token, response.refreshToken)
  return response
}

export function register(request: RegisterRequest): Promise<UserInfoDto> {
  return api<UserInfoDto>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export async function refresh(): Promise<AuthResponse> {
  const refreshToken = await getRefreshToken()
  const response = await api<AuthResponse>('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  })
  await setTokens(response.token, response.refreshToken)
  return response
}

export async function logout(): Promise<void> {
  const refreshToken = await getRefreshToken()
  await api<void>('/api/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  })
}

export function getMe(): Promise<UserInfoDto> {
  return api<UserInfoDto>('/api/auth/me')
}

export function setupTwoFactor(): Promise<TwoFactorSetupResponse> {
  return api<TwoFactorSetupResponse>('/api/auth/2fa/setup', { method: 'POST' })
}

export function enableTwoFactor(request: EnableTwoFactorRequest): Promise<void> {
  return api<void>('/api/auth/2fa/enable', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function disableTwoFactor(request: DisableTwoFactorRequest): Promise<void> {
  return api<void>('/api/auth/2fa/disable', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}
