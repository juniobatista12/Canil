import { ActivityIndicator, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { UIText } from '@/components/ui/text'
import { useAuth } from '@/hooks/useAuth'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()
  const { t } = useTranslation()

  if (status === 'loading') {
    return (
      <View
        className="bg-background flex-1 items-center justify-center"
        accessibilityRole="progressbar"
        accessibilityLabel={t('app.loading')}
      >
        <ActivityIndicator size="large" />
        <UIText className="text-muted-foreground mt-3">{t('app.loading')}</UIText>
      </View>
    )
  }

  return children
}
