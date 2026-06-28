import type { ReactNode } from 'react'
import { Image, Linking, View } from 'react-native'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UIText } from '@/components/ui/text'
import { toQrCodeDataUrl } from '@/lib/twoFactor'
import type { TwoFactorSetupResponse } from '@/types/auth'

type TwoFactorSetupProps = {
  setup: TwoFactorSetupResponse
  code: string
  onCodeChange: (code: string) => void
  /** Ação primária (ex.: Ativar 2FA) — renderizada logo após o código, antes do QR/chave */
  footer?: ReactNode
}

export function TwoFactorSetup({ setup, code, onCodeChange, footer }: TwoFactorSetupProps) {
  const { t } = useTranslation()

  const handleOpenAuthenticator = async () => {
    try {
      await Linking.openURL(setup.authenticatorUri)
    } catch {
      Toast.show({ type: 'error', text1: t('profile.openAuthenticatorError') })
    }
  }

  return (
    <View className="gap-4">
      <Button
        title={t('profile.openAuthenticator')}
        onPress={() => void handleOpenAuthenticator()}
        accessibilityHint={t('profile.openAuthenticatorHint')}
      />
      <View>
        <Label title={t('auth.twoFactorCode')} />
        <Input
          value={code}
          onChangeText={onCodeChange}
          keyboardType="number-pad"
          maxLength={6}
          accessibilityLabel={t('auth.twoFactorCode')}
          accessibilityHint={t('profile.twoFactorCodeHint')}
        />
      </View>
      {footer}
      <Image
        source={{ uri: toQrCodeDataUrl(setup.qrCodeBase64) }}
        className="mx-auto h-48 w-48"
        accessibilityLabel={t('profile.qrCodeAlt')}
        accessibilityRole="image"
      />
      <View>
        <Label title={t('profile.manualKey')} />
        <UIText className="text-muted-foreground text-sm" selectable>
          {setup.sharedKey}
        </UIText>
      </View>
    </View>
  )
}
