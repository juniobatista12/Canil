import { DarkTheme, DefaultTheme, type Theme as NavigationTheme } from '@react-navigation/native'
import type { Theme } from '@/providers/ThemeProvider'

const lightBackground = 'hsl(0, 0%, 100%)'
const lightForeground = 'hsl(222.2, 84%, 4.9%)'
const darkBackground = 'hsl(222.2, 84%, 4.9%)'
const darkForeground = 'hsl(210, 40%, 98%)'
const darkBorder = 'hsl(217.2, 32.6%, 17.5%)'

export const navigationLightTheme: NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: lightBackground,
    card: lightBackground,
    text: lightForeground,
    border: 'hsl(214.3, 31.8%, 91.4%)',
    primary: 'hsl(222.2, 47.4%, 11.2%)',
  },
}

export const navigationDarkTheme: NavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: darkBackground,
    card: darkBackground,
    text: darkForeground,
    border: darkBorder,
    primary: darkForeground,
  },
}

export function navigationThemeFor(mode: Theme): NavigationTheme {
  return mode === 'dark' ? navigationDarkTheme : navigationLightTheme
}

export function iconColorFor(mode: Theme): string {
  return mode === 'dark' ? darkForeground : lightForeground
}
