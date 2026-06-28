import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { RoleRoute } from '@/routes/RoleRoute'
import { renderWithProviders } from '@/test/renderWithProviders'
import { useRole } from '@/hooks/useRole'

vi.mock('@/hooks/useRole')
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))

const mockUseRole = vi.mocked(useRole)

describe('RoleRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children when role is allowed', () => {
    mockUseRole.mockReturnValue({
      user: null,
      hasRole: vi.fn(),
      hasAnyRole: () => true,
      isSuperAdmin: false,
      isAdmin: true,
    })

    renderWithProviders(
      <RoleRoute roles={['Admin']}>
        <div>admin-area</div>
      </RoleRoute>,
    )

    expect(screen.getByText('admin-area')).toBeInTheDocument()
  })

  it('redirects when role is insufficient', () => {
    mockUseRole.mockReturnValue({
      user: null,
      hasRole: vi.fn(),
      hasAnyRole: () => false,
      isSuperAdmin: false,
      isAdmin: false,
    })

    renderWithProviders(
      <RoleRoute roles={['SuperAdmin']}>
        <div>restricted</div>
      </RoleRoute>,
    )

    expect(screen.queryByText('restricted')).not.toBeInTheDocument()
  })
})
