import { Text } from 'react-native'
import { render, screen } from '@testing-library/react-native'
import { RoleGuard } from '@/components/RoleGuard'

const mockNavigate = jest.fn()
const mockIsReady = jest.fn(() => true)
const mockIsFocused = jest.fn(() => true)

jest.mock('@/navigation/navigationRef', () => ({
  navigationRef: {
    isReady: () => mockIsReady(),
    navigate: (...args: unknown[]) => mockNavigate(...args),
  },
}))

jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => mockIsFocused(),
}))

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: { show: jest.fn() },
}))

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

const mockHasAnyRole = jest.fn()

jest.mock('@/hooks/useRole', () => ({
  useRole: () => ({ hasAnyRole: mockHasAnyRole }),
}))

describe('RoleGuard', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    mockHasAnyRole.mockReset()
    mockIsReady.mockReturnValue(true)
    mockIsFocused.mockReturnValue(true)
  })

  it('renders children when role is allowed', async () => {
    mockHasAnyRole.mockReturnValue(true)
    await render(
      <RoleGuard roles={['Admin']}>
        <Text>Protected</Text>
      </RoleGuard>,
    )
    expect(screen.getByText('Protected')).toBeTruthy()
  })

  it('blocks children when role is denied on focused screen', async () => {
    mockHasAnyRole.mockReturnValue(false)
    await render(
      <RoleGuard roles={['Admin']}>
        <Text>Protected</Text>
      </RoleGuard>,
    )
    expect(screen.queryByText('Protected')).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('Main', { screen: 'Dashboard' })
  })

  it('does not redirect when screen is not focused', async () => {
    mockHasAnyRole.mockReturnValue(false)
    mockIsFocused.mockReturnValue(false)
    await render(
      <RoleGuard roles={['Admin']}>
        <Text>Protected</Text>
      </RoleGuard>,
    )
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
