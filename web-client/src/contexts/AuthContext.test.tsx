import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { useAuthContext } from '@/hooks/useAuth'
import { renderWithProviders } from '@/test/renderWithProviders'
import { mockUserInfo } from '@/test/mockUserInfo'
import { ApiError } from '@/api/client'

const authMocks = vi.hoisted(() => ({
  getMe: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  setupTwoFactor: vi.fn(),
  enableTwoFactor: vi.fn(),
  disableTwoFactor: vi.fn(),
}))

vi.mock('@/api/auth', () => ({ ...authMocks }))

function Probe() {
  const { status, user } = useAuthContext()
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="email">{user?.email ?? 'none'}</span>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    authMocks.getMe.mockReset()
    authMocks.refresh.mockReset()
    authMocks.logout.mockReset()
    authMocks.logout.mockResolvedValue(undefined)
  })

  it('boots authenticated when getMe succeeds', async () => {
    authMocks.getMe.mockResolvedValue(mockUserInfo({ roles: ['SuperAdmin'] }))

    renderWithProviders(<Probe />, { withAuth: true })

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent(/^authenticated$/)
      expect(screen.getByTestId('email')).toHaveTextContent('superadmin@localhost')
    })
  })

  it('clears user when refresh fails with session expired', async () => {
    authMocks.getMe.mockRejectedValue(new ApiError(401, 'SESSION_EXPIRED'))
    authMocks.refresh.mockRejectedValue(new Error('refresh failed'))

    renderWithProviders(<Probe />, { withAuth: true })

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent(/^unauthenticated$/)
    })
  })
})
