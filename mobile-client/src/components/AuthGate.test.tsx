import { describe, expect, it, jest } from '@jest/globals'
import { screen } from '@testing-library/react-native'
import { UIText } from '@/components/ui/text'
import { AuthGate } from '@/components/AuthGate'
import { useAuth } from '@/hooks/useAuth'
import { mockUseAuthReturn } from '@/test/mockUseAuth'
import { renderWithProviders } from '@/test/renderWithProviders'

jest.mock('@/hooks/useAuth')

describe('AuthGate', () => {
  it('shows loading indicator while bootstrapping', async () => {
    jest.mocked(useAuth).mockReturnValue(mockUseAuthReturn({ status: 'loading' }))

    await renderWithProviders(
      <AuthGate>
        <UIText>content</UIText>
      </AuthGate>,
    )

    expect(screen.getByLabelText(/carregando/i)).toBeTruthy()
    expect(screen.queryByText('content')).toBeNull()
  })

  it('renders children when ready', async () => {
    jest.mocked(useAuth).mockReturnValue(mockUseAuthReturn({ status: 'authenticated' }))

    await renderWithProviders(
      <AuthGate>
        <UIText>content</UIText>
      </AuthGate>,
    )

    expect(screen.getByText('content')).toBeTruthy()
  })
})
