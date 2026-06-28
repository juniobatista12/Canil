import type { ReactElement, ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import '@/i18n'

interface Options extends Omit<RenderOptions, 'wrapper'> {
  route?: string
  withAuth?: boolean
}

export function renderWithProviders(ui: ReactElement, options: Options = {}) {
  const { route = '/', withAuth = false, ...renderOptions } = options
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  function Wrapper({ children }: { children: ReactNode }) {
    const inner = withAuth ? <AuthProvider>{children}</AuthProvider> : children

    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{inner}</MemoryRouter>
      </QueryClientProvider>
    )
  }

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }), queryClient }
}
