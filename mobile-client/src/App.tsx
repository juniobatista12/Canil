import { useMemo } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PortalHost } from '@rn-primitives/portal'
import Toast from 'react-native-toast-message'
import '@/i18n'
import { AuthGate } from '@/components/AuthGate'
import { AuthProvider } from '@/contexts/AuthContext'
import { navigationThemeFor } from '@/lib/navigation-theme'
import { navigationRef } from '@/navigation/navigationRef'
import { RootNavigator } from '@/navigation/RootNavigator'
import { SessionListener } from '@/navigation/SessionListener'
import { ThemeProvider, useTheme } from '@/providers/ThemeProvider'

function ThemedStatusBar() {
  const { theme } = useTheme()
  return <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
}

function ThemedNavigationTree() {
  useTheme()
  return (
    <>
      <RootNavigator />
      <SessionListener />
    </>
  )
}

function NavigationRoot() {
  const { theme } = useTheme()
  const navigationTheme = useMemo(() => navigationThemeFor(theme), [theme])

  return (
    <AuthGate>
      <View className="flex-1">
        <NavigationContainer ref={navigationRef} theme={navigationTheme}>
          <ThemedNavigationTree />
        </NavigationContainer>
      </View>
    </AuthGate>
  )
}

function ThemedOverlays() {
  return (
    <View style={styles.overlays} pointerEvents="box-none">
      <PortalHost />
      <Toast />
    </View>
  )
}

const styles = StyleSheet.create({
  overlays: {
    ...StyleSheet.absoluteFillObject,
  },
})

function AppContent() {
  useTheme()

  return (
    <View className="flex-1">
      <ThemedStatusBar />
      <NavigationRoot />
      <ThemedOverlays />
    </View>
  )
}

export default function App() {
  const queryClient = useMemo(() => new QueryClient(), [])

  return (
    <GestureHandlerRootView className="flex-1">
      <KeyboardProvider>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  )
}
