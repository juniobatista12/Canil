import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '@/test/renderWithProviders'
import { mockUserInfo } from '@/test/mockUserInfo'
import { useAuth } from '@/hooks/useAuth'

vi.mock('@/hooks/useAuth')
vi.mock('lucide-react', () => ({
  Loader2: (props: Record<string, unknown>) => <svg data-testid="lucide-icon" {...props} />,
}))

import { ProtectedRoute } from '@/routes/ProtectedRoute'

const mockUseAuth = vi.mocked(useAuth)

function renderApp(route = '/') {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<div>login-page</div>} />
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <div>secret</div>
          </ProtectedRoute>
        }
      />
    </Routes>,
    { route },
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading spinner while bootstrapping', () => {
    mockUseAuth.mockReturnValue({
      status: 'loading',
      user: null,
      setUser: vi.fn(),
      clearUser: vi.fn(),
      boot: vi.fn(),
    })

    renderWithProviders(
      <ProtectedRoute>
        <div>secret</div>
      </ProtectedRoute>,
    )

    expect(screen.getByTestId('lucide-icon')).toBeInTheDocument()
    expect(screen.getByText(/carregando/i)).toBeInTheDocument()
    expect(screen.queryByText('secret')).not.toBeInTheDocument()
  })

  it('redirects unauthenticated users to login', async () => {
    mockUseAuth.mockReturnValue({
      status: 'unauthenticated',
      user: null,
      setUser: vi.fn(),
      clearUser: vi.fn(),
      boot: vi.fn(),
    })

    renderApp('/users')

    await waitFor(() => {
      expect(screen.getByText('login-page')).toBeInTheDocument()
    })
    expect(screen.queryByText('secret')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    mockUseAuth.mockReturnValue({
      status: 'authenticated',
      user: mockUserInfo({ email: 'u@test.com' }),
      setUser: vi.fn(),
      clearUser: vi.fn(),
      boot: vi.fn(),
    })

    renderApp('/users')

    expect(screen.getByText('secret')).toBeInTheDocument()
  })
})
