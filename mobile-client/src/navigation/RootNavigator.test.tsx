import { describe, expect, it, jest } from '@jest/globals'
import { screen } from '@testing-library/react-native'
import { RootNavigator } from '@/navigation/RootNavigator'
import { useAuth } from '@/hooks/useAuth'
import { mockUseAuthReturn } from '@/test/mockUseAuth'
import { renderWithProviders } from '@/test/renderWithProviders'

jest.mock('@/hooks/useAuth')
jest.mock('@/navigation/DrawerNavigator', () => ({
  DrawerNavigator: () => {
    const { UIText } = require('@/components/ui/text')
    return <UIText>Main</UIText>
  },
}))
jest.mock('@/screens/LoginScreen', () => ({
  LoginScreen: () => {
    const { UIText } = require('@/components/ui/text')
    return <UIText>Login</UIText>
  },
}))

describe('RootNavigator', () => {
  it('shows main stack when authenticated', async () => {
    jest.mocked(useAuth).mockReturnValue(mockUseAuthReturn({ status: 'authenticated' }))

    await renderWithProviders(<RootNavigator />, { withNavigation: true })
    expect(screen.getByText('Main')).toBeTruthy()
  })

  it('shows login when unauthenticated', async () => {
    jest.mocked(useAuth).mockReturnValue(mockUseAuthReturn({ status: 'unauthenticated' }))

    await renderWithProviders(<RootNavigator />, { withNavigation: true })
    expect(screen.getByText('Login')).toBeTruthy()
  })
})
