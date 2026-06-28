import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toQrCodeDataUrl } from '@/lib/twoFactor'
import type { TwoFactorSetupResponse } from '@/types/auth'

interface TwoFactorSetupProps {
  setup: TwoFactorSetupResponse
  code: string
  onCodeChange: (code: string) => void
}

export function TwoFactorSetup({ setup, code, onCodeChange }: TwoFactorSetupProps) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profile.twoFactorTitle')}</CardTitle>
        <CardDescription>{t('profile.setup')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <img
            src={toQrCodeDataUrl(setup.qrCodeBase64)}
            alt={t('profile.qrCodeAlt')}
            className="h-48 w-48 rounded-lg border"
          />
        </div>
        <div className="space-y-2">
          <Label>{t('profile.manualKey')}</Label>
          <p className="break-all rounded-md bg-muted p-2 font-mono text-sm">{setup.sharedKey}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="totp-code">{t('auth.twoFactorCode')}</Label>
          <Input
            id="totp-code"
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
          />
        </div>
      </CardContent>
    </Card>
  )
}
