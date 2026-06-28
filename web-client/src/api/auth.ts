import { api } from '@/api/client'
import type {
  AuthResponse,
  DisableTwoFactorRequest,
  EnableTwoFactorRequest,
  LoginRequest,
  RegisterRequest,
  TwoFactorSetupResponse,
  UserInfoDto,
} from '@/types/auth'

export function login(request: LoginRequest): Promise<AuthResponse> {
  return api<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function register(request: RegisterRequest): Promise<UserInfoDto> {
  return api<UserInfoDto>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function refresh(): Promise<AuthResponse> {
  return api<AuthResponse>('/api/auth/refresh', { method: 'POST' })
}

export function logout(): Promise<void> {
  return api<void>('/api/auth/logout', { method: 'POST' })
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
