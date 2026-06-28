import type { UserInfoDto } from '@/types/auth'

export function mockUserInfo(overrides: Partial<UserInfoDto> = {}): UserInfoDto {
  return {
    id: '1',
    email: 'admin@localhost',
    roles: ['User'],
    twoFactorEnabled: false,
    ...overrides,
  }
}
