import type { UserInfoDto } from '@/types/auth'

export function mockUserInfo(overrides: Partial<UserInfoDto> = {}): UserInfoDto {
  return {
    id: '1',
    email: 'superadmin@localhost',
    tenantId: 't1',
    tenantName: 'System',
    roles: ['User'],
    twoFactorEnabled: false,
    ...overrides,
  }
}
