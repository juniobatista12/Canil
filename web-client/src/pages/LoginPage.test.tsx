import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginPage } from '@/pages/LoginPage'
import { renderWithProviders } from '@/test/renderWithProviders'
import { mockUserInfo } from '@/test/mockUserInfo'
import * as authApi from '@/api/auth'
import { useAuth } from '@/hooks/useAuth'
import { TwoFactorRequiredError } from '@/api/client'

vi.mock('@/api/auth')
vi.mock('@/hooks/useAuth')
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const mockUseAuth = vi.mocked(useAuth)

describe('LoginPage', () => {
  const setUser = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      status: 'unauthenticated',
      user: null,
      setUser,
      clearUser: vi.fn(),
      boot: vi.fn(),
    })
  })

  it('submits credentials and sets user on success', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockResolvedValue({
      token: 't',
      refreshToken: 'r',
      expiresAt: new Date().toISOString(),
      refreshExpiresAt: new Date().toISOString(),
      user: mockUserInfo({ roles: ['SuperAdmin'] }),
    })

    renderWithProviders(<LoginPage />, { route: '/login' })

    await user.type(screen.getByLabelText(/e-mail/i), 'superadmin@localhost')
    await user.type(screen.getByLabelText(/^senha$/i), 'SuperAdmin@123!')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalled()
      expect(setUser).toHaveBeenCalled()
    })
  })

  it('shows 2FA field when required', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login)
      .mockRejectedValueOnce(new TwoFactorRequiredError())
      .mockResolvedValueOnce({
        token: 't',
        refreshToken: 'r',
        expiresAt: new Date().toISOString(),
        refreshExpiresAt: new Date().toISOString(),
        user: mockUserInfo({ roles: ['SuperAdmin'] }),
      })

    renderWithProviders(<LoginPage />, { route: '/login' })

    await user.type(screen.getByLabelText(/e-mail/i), 'superadmin@localhost')
    await user.type(screen.getByLabelText(/^senha$/i), 'SuperAdmin@123!')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/código.*2fa|autenticação/i)).toBeInTheDocument()
    })
  })
})
