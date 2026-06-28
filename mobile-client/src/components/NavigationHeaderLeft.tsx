import { useNavigation } from '@react-navigation/native'
import { Pressable, View } from 'react-native'
import { ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { DrawerMenuButton } from '@/components/DrawerMenuButton'
import { iconColorFor } from '@/lib/navigation-theme'
import { useTheme } from '@/providers/ThemeProvider'

export function NavigationHeaderLeft() {
  const navigation = useNavigation()
  const { theme } = useTheme()
  const { t } = useTranslation()
  const iconColor = iconColorFor(theme)
  const canGoBack = navigation.canGoBack()

  return (
    <View className="flex-row items-center">
      {canGoBack ? (
        <Pressable
          onPress={() => navigation.goBack()}
          className="p-2"
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <ChevronLeft size={22} color={iconColor} />
        </Pressable>
      ) : null}
      <DrawerMenuButton />
    </View>
  )
}
