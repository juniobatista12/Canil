import { jest } from '@jest/globals'
import type { AuthStatus } from '@/contexts/AuthContext'
import type { UserInfoDto } from '@/types/auth'

export type MockAuthValue = {
  status: AuthStatus
  user: UserInfoDto | null
  setUser: jest.Mock<(user: UserInfoDto | null) => void>
  clearUser: jest.Mock<() => void>
  boot: jest.Mock<() => Promise<void>>
}

export function mockUseAuthReturn(overrides: Partial<MockAuthValue> = {}): MockAuthValue {
  return {
    status: 'unauthenticated',
    user: null,
    setUser: jest.fn(),
    clearUser: jest.fn(),
    boot: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    ...overrides,
  }
}
