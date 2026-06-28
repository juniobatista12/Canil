import { describe, expect, it, jest, beforeEach } from '@jest/globals'
import { screen, waitFor } from '@testing-library/react-native'
import { UIText } from '@/components/ui/text'
import * as authApi from '@/api/auth'
import { ApiError } from '@/api/client'
import { useAuthContext } from '@/contexts/AuthContext'
import { renderWithProviders } from '@/test/renderWithProviders'
import { mockUserInfo } from '@/test/mockUserInfo'
import * as tokenStorage from '@/storage/tokenStorage'

jest.mock('@/api/auth')
jest.mock('@/storage/tokenStorage')

function Probe() {
  const { status, user } = useAuthContext()
  return (
    <>
      <UIText testID="status">{status}</UIText>
      <UIText testID="email">{user?.email ?? 'none'}</UIText>
    </>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('boots authenticated when refresh token exists and getMe succeeds', async () => {
    jest.mocked(tokenStorage.getRefreshToken).mockResolvedValue('refresh')
    jest.mocked(authApi.getMe).mockResolvedValue(
      mockUserInfo({ roles: ['SuperAdmin'] }),
    )

    await renderWithProviders(<Probe />, { withAuth: true, withNavigation: true })

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated')
    })
  })

  it('clears user when refresh token is missing', async () => {
    jest.mocked(tokenStorage.getRefreshToken).mockResolvedValue(null)

    await renderWithProviders(<Probe />, { withAuth: true, withNavigation: true })

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated')
    })
  })

  it('clears user on session expired', async () => {
    jest.mocked(tokenStorage.getRefreshToken).mockResolvedValue('refresh')
    jest.mocked(authApi.getMe).mockRejectedValue(new ApiError(401, 'SESSION_EXPIRED'))
    jest.mocked(authApi.refresh).mockRejectedValue(new Error('refresh failed'))
    jest.mocked(authApi.logout).mockResolvedValue()
    jest.mocked(tokenStorage.clearTokens).mockResolvedValue()

    await renderWithProviders(<Probe />, { withAuth: true, withNavigation: true })

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated')
    })
  })
})
