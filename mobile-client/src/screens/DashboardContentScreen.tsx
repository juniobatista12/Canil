import { ScrollView, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import * as authApi from '@/api/auth'
import { RoleBadges } from '@/components/RoleBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UIText } from '@/components/ui/text'
import { useAuth } from '@/hooks/useAuth'

export function DashboardContentScreen() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: authApi.getMe,
    initialData: user ?? undefined,
  })

  const current = meQuery.data ?? user
  if (!current) return null

  return (
    <ScrollView className="bg-background flex-1 p-4" accessibilityLabel={t('dashboard.title')}>
      <Card>
        <CardHeader>
          <CardTitle title={t('dashboard.title')} />
          <UIText className="text-muted-foreground">{t('dashboard.welcome', { email: current.email })}</UIText>
        </CardHeader>
        <CardContent>
          <View className="gap-3">
            <View>
              <UIText className="font-medium">{t('auth.email')}</UIText>
              <UIText>{current.email}</UIText>
            </View>
            <View>
              <UIText className="font-medium">{t('dashboard.tenant')}</UIText>
              <UIText>{current.tenantName}</UIText>
            </View>
            <View>
              <UIText className="font-medium">{t('dashboard.roles')}</UIText>
              <RoleBadges roles={current.roles} />
            </View>
            <View>
              <UIText className="font-medium">{t('dashboard.twoFactor')}</UIText>
              <UIText>
                {current.twoFactorEnabled ? t('dashboard.enabled') : t('dashboard.disabled')}
              </UIText>
            </View>
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  )
}
