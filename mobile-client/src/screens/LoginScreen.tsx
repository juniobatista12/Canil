import { useState } from 'react'
import { View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'
import * as authApi from '@/api/auth'
import { ApiError, TwoFactorRequiredError } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UIText } from '@/components/ui/text'
import { useAuth } from '@/hooks/useAuth'

export function LoginScreen() {
  const { t } = useTranslation()
  const { setUser } = useAuth()
  const [tenantSlug, setTenantSlug] = useState('system')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [requires2FA, setRequires2FA] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      const response = await authApi.login({
        tenantSlug,
        email,
        password,
        twoFactorCode: requires2FA ? twoFactorCode : undefined,
      })
      setUser(response.user)
    } catch (error) {
      if (error instanceof TwoFactorRequiredError) {
        setRequires2FA(true)
        Toast.show({ type: 'info', text1: t('auth.twoFactorCode') })
      } else if (error instanceof ApiError) {
        Toast.show({ type: 'error', text1: error.problem?.detail ?? error.message })
      } else {
        Toast.show({ type: 'error', text1: t('errors.generic') })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAwareScrollView
      className="bg-background flex-1"
      contentContainerClassName="flex-grow justify-center p-6"
      keyboardShouldPersistTaps="handled"
    >
      <Card>
        <CardHeader>
          <CardTitle title={t('auth.loginTitle')} />
          <UIText className="text-muted-foreground">{t('auth.loginSubtitle')}</UIText>
        </CardHeader>
        <CardContent className="gap-4">
          <View>
            <Label title={t('auth.tenantSlug')} />
            <Input
              value={tenantSlug}
              onChangeText={setTenantSlug}
              autoCapitalize="none"
              accessibilityLabel={t('auth.tenantSlug')}
              accessibilityHint="Informe o slug do tenant"
            />
          </View>
          <View>
            <Label title={t('auth.email')} />
            <Input
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel={t('auth.email')}
            />
          </View>
          <View>
            <Label title={t('auth.password')} />
            <Input
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              accessibilityLabel={t('auth.password')}
            />
          </View>
          {requires2FA ? (
            <View>
              <Label title={t('auth.twoFactorCode')} />
              <Input
                value={twoFactorCode}
                onChangeText={setTwoFactorCode}
                keyboardType="number-pad"
                maxLength={6}
                accessibilityLabel={t('auth.twoFactorCode')}
              />
            </View>
          ) : null}
          <Button
            title={t('auth.login')}
            onPress={() => void handleLogin()}
            disabled={loading}
            accessibilityLabel={t('auth.login')}
          />
        </CardContent>
      </Card>
    </KeyboardAwareScrollView>
  )
}
