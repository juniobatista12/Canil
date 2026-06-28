import { useState } from 'react'
import { Keyboard } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'
import * as authApi from '@/api/auth'
import { ApiError } from '@/api/client'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { RoleBadges } from '@/components/RoleBadge'
import { TwoFactorSetup } from '@/components/TwoFactorSetup'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UIText } from '@/components/ui/text'
import { useAuth } from '@/hooks/useAuth'
import type { TwoFactorSetupResponse } from '@/types/auth'

export function ProfileScreen() {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const queryClient = useQueryClient()
  const { user, setUser } = useAuth()
  const [setup, setSetup] = useState<TwoFactorSetupResponse | null>(null)
  const [enableCode, setEnableCode] = useState('')
  const [enableOpen, setEnableOpen] = useState(false)
  const [disableOpen, setDisableOpen] = useState(false)
  const [disablePassword, setDisablePassword] = useState('')
  const [disableCode, setDisableCode] = useState('')

  const trimmedEnableCode = enableCode.trim()
  const canEnable = trimmedEnableCode.length === 6
  const trimmedDisableCode = disableCode.trim()
  const canDisable = disablePassword.length > 0 && trimmedDisableCode.length === 6

  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: authApi.getMe,
    initialData: user ?? undefined,
  })

  const setupMutation = useMutation({
    mutationFn: authApi.setupTwoFactor,
    onSuccess: (data) => setSetup(data),
    onError: (error: ApiError) => Toast.show({ type: 'error', text1: error.problem?.detail ?? error.message }),
  })

  const enableMutation = useMutation({
    mutationFn: (code: string) => authApi.enableTwoFactor({ code }),
    onSuccess: async () => {
      Toast.show({ type: 'success', text1: t('profile.enableSuccess') })
      setEnableOpen(false)
      setSetup(null)
      setEnableCode('')
      await queryClient.invalidateQueries({ queryKey: ['me'] })
      const me = await authApi.getMe()
      setUser(me)
    },
    onError: (error: ApiError) => Toast.show({ type: 'error', text1: error.problem?.detail ?? error.message }),
  })

  const disableMutation = useMutation({
    mutationFn: () => authApi.disableTwoFactor({ password: disablePassword, code: trimmedDisableCode }),
    onSuccess: async () => {
      Toast.show({ type: 'success', text1: t('profile.disableSuccess') })
      setDisableOpen(false)
      setDisablePassword('')
      setDisableCode('')
      await queryClient.invalidateQueries({ queryKey: ['me'] })
      const me = await authApi.getMe()
      setUser(me)
    },
    onError: (error: ApiError) => Toast.show({ type: 'error', text1: error.problem?.detail ?? error.message }),
  })

  const openEnableDialog = () => {
    Keyboard.dismiss()
    setEnableOpen(true)
  }

  const handleDisableOpenChange = (open: boolean) => {
    setDisableOpen(open)
    if (!open) {
      setDisablePassword('')
      setDisableCode('')
    }
  }

  const current = meQuery.data ?? user
  if (!current) return null

  const scrollBottomPadding = insets.bottom + 32

  return (
    <>
      <KeyboardAwareScrollView
        className="bg-background flex-1 p-4"
        keyboardShouldPersistTaps="handled"
        bottomOffset={insets.bottom}
        contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
      >
        <Card className="mb-4">
          <CardHeader>
            <CardTitle title={t('profile.title')} />
          </CardHeader>
          <CardContent className="gap-3">
            <UIText>{current.email}</UIText>
            <UIText>
              {t('dashboard.tenant')}: {current.tenantName}
            </UIText>
            <RoleBadges roles={current.roles} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle title={t('profile.twoFactorTitle')} />
            <UIText className="text-muted-foreground">
              {current.twoFactorEnabled ? t('dashboard.enabled') : t('dashboard.disabled')}
            </UIText>
          </CardHeader>
          <CardContent className="gap-3">
            {!current.twoFactorEnabled && !setup ? (
              <Button title={t('profile.setup')} onPress={() => setupMutation.mutate()} />
            ) : null}

            {setup && !current.twoFactorEnabled ? (
              <TwoFactorSetup
                setup={setup}
                code={enableCode}
                onCodeChange={setEnableCode}
                footer={
                  <Button
                    title={t('profile.enable')}
                    disabled={!canEnable}
                    onPress={openEnableDialog}
                  />
                }
              />
            ) : null}

            {current.twoFactorEnabled ? (
              <Button
                title={t('profile.disable')}
                variant="destructive"
                onPress={() => {
                  Keyboard.dismiss()
                  setDisableOpen(true)
                }}
              />
            ) : null}
          </CardContent>
        </Card>
      </KeyboardAwareScrollView>

      <ConfirmDialog
        open={enableOpen}
        title={t('profile.enable')}
        description={t('profile.enableWarning')}
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        loading={enableMutation.isPending}
        onConfirm={() => enableMutation.mutate(trimmedEnableCode)}
        onOpenChange={setEnableOpen}
      />

      <ConfirmDialog
        open={disableOpen}
        title={t('profile.disable')}
        description={t('profile.disableWarning')}
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        destructive
        loading={disableMutation.isPending}
        confirmDisabled={!canDisable}
        onConfirm={() => disableMutation.mutate()}
        onOpenChange={handleDisableOpenChange}
      >
        <Label title={t('auth.password')} />
        <Input
          value={disablePassword}
          onChangeText={setDisablePassword}
          secureTextEntry
          accessibilityLabel={t('auth.password')}
        />
        <Label title={t('auth.twoFactorCode')} />
        <Input
          value={disableCode}
          onChangeText={setDisableCode}
          keyboardType="number-pad"
          maxLength={6}
          accessibilityLabel={t('auth.twoFactorCode')}
          accessibilityHint={t('profile.twoFactorCodeHint')}
        />
      </ConfirmDialog>
    </>
  )
}
