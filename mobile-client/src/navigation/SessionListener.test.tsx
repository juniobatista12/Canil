import { describe, expect, it, jest, beforeEach } from '@jest/globals'
import { render, waitFor } from '@testing-library/react-native'
import { SessionListener } from '@/navigation/SessionListener'
import { setApiHandlers } from '@/api/client'
import { useAuth } from '@/hooks/useAuth'
import { mockUseAuthReturn } from '@/test/mockUseAuth'

jest.mock('@/api/client', () => ({
  setApiHandlers: jest.fn(),
  ApiError: class ApiError extends Error {},
}))
jest.mock('@/hooks/useAuth')
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ canGoBack: () => true, goBack: jest.fn() }),
}))
jest.mock('react-native-toast-message', () => ({ show: jest.fn() }))
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

describe('SessionListener', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useAuth).mockReturnValue(mockUseAuthReturn({ status: 'authenticated' }))
  })

  it('registers api handlers on mount', async () => {
    render(<SessionListener />)
    await waitFor(() => {
      expect(setApiHandlers).toHaveBeenCalled()
    })
    const handlers = jest.mocked(setApiHandlers).mock.calls[0][0]
    expect(handlers.onSessionExpired).toBeDefined()
    expect(handlers.onForbidden).toBeDefined()
  })
})
