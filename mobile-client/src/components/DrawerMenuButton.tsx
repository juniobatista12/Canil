import { DrawerActions, useNavigation } from '@react-navigation/native'
import { Pressable } from 'react-native'
import { Menu } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { iconColorFor } from '@/lib/navigation-theme'
import { useTheme } from '@/providers/ThemeProvider'

export function DrawerMenuButton() {
  const navigation = useNavigation()
  const { theme } = useTheme()
  const { t } = useTranslation()
  const iconColor = iconColorFor(theme)

  return (
    <Pressable
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      className="p-2"
      accessibilityRole="button"
      accessibilityLabel={t('nav.openMenu')}
    >
      <Menu size={22} color={iconColor} />
    </Pressable>
  )
}
