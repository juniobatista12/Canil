jest.mock('react-native-safe-area-context', () => {
  const React = require('react')
  const inset = { top: 0, right: 0, bottom: 0, left: 0 }
  const SafeAreaInsetsContext = React.createContext(inset)
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: () => inset,
    SafeAreaInsetsContext,
    initialWindowMetrics: {
      insets: inset,
      frame: { x: 0, y: 0, width: 390, height: 844 },
    },
  }
})

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'))

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}))

jest.mock('react-native-keyboard-controller', () => {
  const React = require('react')
  const { ScrollView } = require('react-native')
  return {
    KeyboardProvider: ({ children }: { children: React.ReactNode }) => children,
    KeyboardAwareScrollView: ScrollView,
  }
})

jest.mock('@/providers/ThemeProvider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({ theme: 'light', ready: true, toggleTheme: jest.fn(), setTheme: jest.fn() }),
  useThemedSurface: () => ({ theme: 'light', style: {}, className: 'bg-background' }),
  ThemedSurface: ({ children }: { children: React.ReactNode }) => children,
}))

import { afterEach } from '@jest/globals'
import { clearTestQueryClients } from '@/test/createQueryClient'

afterEach(() => {
  clearTestQueryClients()
})
