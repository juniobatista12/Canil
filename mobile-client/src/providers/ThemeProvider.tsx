import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { View, type ViewProps } from 'react-native'
import { themeVarsFor } from '@/lib/theme-vars'
import { cn } from '@/lib/utils'

const THEME_KEY = 'jadmin_theme'

export type Theme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  ready: boolean
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (cancelled) return
      if (stored === 'light' || stored === 'dark') {
        setThemeState(stored)
      }
      setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    void AsyncStorage.setItem(THEME_KEY, next)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark'
      void AsyncStorage.setItem(THEME_KEY, next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ theme, ready, toggleTheme, setTheme }),
    [theme, ready, toggleTheme, setTheme],
  )

  return (
    <ThemeContext.Provider value={value}>
      <View style={themeVarsFor(theme)} className="flex-1 bg-background">
        {children}
      </View>
    </ThemeContext.Provider>
  )
}

/** Superfície temática com `vars()` — obrigatório em portais nativos (drawer) que não herdam o wrapper do provider. */
export function useThemedSurface(...inputs: Parameters<typeof cn>) {
  const { theme } = useTheme()
  return {
    theme,
    style: themeVarsFor(theme),
    className: cn('bg-background', ...inputs),
  }
}

export function ThemedSurface({ className, children, ...props }: ViewProps) {
  const surface = useThemedSurface(className)
  return (
    <View style={surface.style} className={surface.className} {...props}>
      {children}
    </View>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
