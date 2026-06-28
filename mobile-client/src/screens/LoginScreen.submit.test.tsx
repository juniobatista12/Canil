import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals'
import { cleanup, screen, userEvent, waitFor } from '@testing-library/react-native'
import { LoginScreen } from '@/screens/LoginScreen'
import * as authApi from '@/api/auth'
import { useAuth } from '@/hooks/useAuth'
import type { UserInfoDto } from '@/types/auth'
import { renderWithProviders } from '@/test/renderWithProviders'
import { mockUseAuthReturn } from '@/test/mockUseAuth'
import { mockUserInfo } from '@/test/mockUserInfo'

jest.mock('@/api/auth')
jest.mock('@/hooks/useAuth')
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}))

describe('LoginScreen submit', () => {
  const setUser = jest.fn<(user: UserInfoDto | null) => void>()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useAuth).mockReturnValue(mockUseAuthReturn({ setUser }))
  })

  afterEach(() => {
    cleanup()
  })

  it('submits login and sets user', async () => {
    jest.mocked(authApi.login).mockResolvedValue({
      token: 't',
      refreshToken: 'r',
      expiresAt: new Date().toISOString(),
      refreshExpiresAt: new Date().toISOString(),
      user: mockUserInfo({ roles: ['SuperAdmin'] }),
    })

    const user = userEvent.setup()
    await renderWithProviders(<LoginScreen />)

    await user.type(screen.getByLabelText(/e-mail/i), 'superadmin@localhost')
    await user.type(screen.getByLabelText(/senha/i), 'SuperAdmin@123!')
    await user.press(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => expect(setUser).toHaveBeenCalled())
  })
})
