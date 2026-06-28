import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react-native'
import { QueryClientProvider } from '@tanstack/react-query'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '@/contexts/AuthContext'
import { createTestQueryClient } from '@/test/createQueryClient'
import '@/i18n'

interface Options extends Omit<RenderOptions, 'wrapper'> {
  withAuth?: boolean
  withNavigation?: boolean
}

export async function renderWithProviders(ui: ReactElement, options: Options = {}) {
  const { withAuth = false, withNavigation = false, ...renderOptions } = options
  const queryClient = createTestQueryClient()

  function Wrapper({ children }: { children: ReactNode }) {
    let tree: ReactNode = children
    if (withAuth) tree = <AuthProvider>{tree}</AuthProvider>
    if (withNavigation) tree = <NavigationContainer>{tree}</NavigationContainer>

    return (
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>{tree}</QueryClientProvider>
      </SafeAreaProvider>
    )
  }

  const result = await render(ui, { wrapper: Wrapper, ...renderOptions })
  return { ...result, queryClient }
}
