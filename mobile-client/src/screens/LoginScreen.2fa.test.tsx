import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals'
import { cleanup, screen, userEvent, waitFor } from '@testing-library/react-native'
import { LoginScreen } from '@/screens/LoginScreen'
import * as authApi from '@/api/auth'
import { TwoFactorRequiredError } from '@/api/client'
import { useAuth } from '@/hooks/useAuth'
import { renderWithProviders } from '@/test/renderWithProviders'
import { mockUseAuthReturn } from '@/test/mockUseAuth'

jest.mock('@/api/auth')
jest.mock('@/hooks/useAuth')
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}))

describe('LoginScreen 2FA', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useAuth).mockReturnValue(mockUseAuthReturn())
  })

  afterEach(() => {
    cleanup()
  })

  it('shows 2FA field after TwoFactorRequiredError', async () => {
    jest.mocked(authApi.login).mockRejectedValue(new TwoFactorRequiredError())

    const user = userEvent.setup()
    await renderWithProviders(<LoginScreen />)

    await user.type(screen.getByLabelText(/e-mail/i), 'superadmin@localhost')
    await user.type(screen.getByLabelText(/senha/i), 'SuperAdmin@123!')
    await user.press(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/código 2fa/i)).toBeTruthy()
    })
  })
})
