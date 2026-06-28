import {
  createDrawerNavigator,
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer'
import { Pressable, View } from 'react-native'
import { Moon, Sun } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import * as authApi from '@/api/auth'
import { DrawerMenuButton } from '@/components/DrawerMenuButton'
import { clearTokens } from '@/storage/tokenStorage'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { UIText } from '@/components/ui/text'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { iconColorFor } from '@/lib/navigation-theme'
import { useTheme, useThemedSurface } from '@/providers/ThemeProvider'
import { DashboardTabs } from '@/navigation/DashboardTabs'
import { TenantsStackNavigator } from '@/navigation/TenantsStackNavigator'
import { UsersStackNavigator } from '@/navigation/UsersStackNavigator'
import { ProfileScreen } from '@/screens/ProfileScreen'
import { ROLES } from '@/types/auth'
import type { DrawerParamList } from '@/navigation/types'

const Drawer = createDrawerNavigator<DrawerParamList>()

function DrawerContent(props: DrawerContentComponentProps) {
  const { t } = useTranslation()
  const { clearUser, user } = useAuth()
  const { hasAnyRole } = useRole()
  const { theme, toggleTheme } = useTheme()
  const queryClient = useQueryClient()

  const items = [
    { name: 'Dashboard' as const, label: t('nav.dashboard'), visible: true },
    { name: 'Profile' as const, label: t('nav.profile'), visible: true },
    {
      name: 'UsersStack' as const,
      label: t('nav.users'),
      visible: hasAnyRole([ROLES.Admin, ROLES.SuperAdmin]),
    },
    { name: 'TenantsStack' as const, label: t('nav.tenants'), visible: hasAnyRole([ROLES.SuperAdmin]) },
  ]

  const handleLogout = async () => {
    await authApi.logout().catch(() => undefined)
    await clearTokens()
    clearUser()
    queryClient.clear()
  }

  const drawerSurface = useThemedSurface()
  const iconColor = iconColorFor(theme)

  return (
    <DrawerContentScrollView {...props} style={drawerSurface.style} className={drawerSurface.className}>
      <View className="px-4 py-3">
        <UIText className="text-lg font-semibold">{t('app.name')}</UIText>
        {user ? <UIText className="text-muted-foreground text-sm">{user.email}</UIText> : null}
      </View>
      <Separator />
      {items
        .filter((item) => item.visible)
        .map((item) => (
          <Pressable
            key={item.name}
            className="px-4 py-3"
            onPress={() => props.navigation.navigate(item.name)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <UIText>{item.label}</UIText>
          </Pressable>
        ))}
      <Separator />
      <Pressable
        className="flex-row items-center gap-2 px-4 py-3"
        onPress={toggleTheme}
        accessibilityRole="button"
        accessibilityLabel={theme === 'dark' ? t('nav.themeDark') : t('nav.themeLight')}
      >
        {theme === 'dark' ? <Moon size={18} color={iconColor} /> : <Sun size={18} color={iconColor} />}
        <UIText>{theme === 'dark' ? t('nav.themeDark') : t('nav.themeLight')}</UIText>
      </Pressable>
      <View className="px-4 py-3">
        <Button
          title={t('nav.logout')}
          variant="outline"
          onPress={() => void handleLogout()}
          accessibilityLabel={t('nav.logout')}
        />
      </View>
    </DrawerContentScrollView>
  )
}

export function DrawerNavigator() {
  const { t } = useTranslation()

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        swipeEnabled: true,
        headerLeft: () => <DrawerMenuButton />,
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardTabs}
        options={{ title: t('nav.dashboard'), headerShown: true }}
      />
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: t('nav.profile') }} />
      <Drawer.Screen
        name="UsersStack"
        component={UsersStackNavigator}
        options={{ title: t('nav.users'), headerShown: false }}
      />
      <Drawer.Screen
        name="TenantsStack"
        component={TenantsStackNavigator}
        options={{ title: t('nav.tenants'), headerShown: false }}
      />
    </Drawer.Navigator>
  )
}
