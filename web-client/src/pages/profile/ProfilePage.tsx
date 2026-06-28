import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import * as authApi from '@/api/auth'
import { ApiError } from '@/api/client'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { RoleBadges } from '@/components/RoleBadge'
import { TwoFactorSetup } from '@/components/TwoFactorSetup'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { disableTwoFactorSchema, type DisableTwoFactorFormValues } from '@/lib/validators'
import type { TwoFactorSetupResponse } from '@/types/auth'

export function ProfilePage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { user, setUser } = useAuth()
  const [setup, setSetup] = useState<TwoFactorSetupResponse | null>(null)
  const [enableCode, setEnableCode] = useState('')
  const [enableOpen, setEnableOpen] = useState(false)
  const [disableOpen, setDisableOpen] = useState(false)

  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: authApi.getMe,
    initialData: user ?? undefined,
  })

  const disableForm = useForm<DisableTwoFactorFormValues>({
    resolver: zodResolver(disableTwoFactorSchema),
    defaultValues: { password: '', code: '' },
  })

  const setupMutation = useMutation({
    mutationFn: authApi.setupTwoFactor,
    onSuccess: (data) => setSetup(data),
    onError: (error: ApiError) => toast.error(error.problem?.detail ?? error.message),
  })

  const enableMutation = useMutation({
    mutationFn: (code: string) => authApi.enableTwoFactor({ code }),
    onSuccess: async () => {
      toast.success(t('profile.enableSuccess'))
      setEnableOpen(false)
      setSetup(null)
      setEnableCode('')
      await queryClient.invalidateQueries({ queryKey: ['me'] })
      const me = await authApi.getMe()
      setUser(me)
    },
    onError: (error: ApiError) => toast.error(error.problem?.detail ?? error.message),
  })

  const disableMutation = useMutation({
    mutationFn: authApi.disableTwoFactor,
    onSuccess: async () => {
      toast.success(t('profile.disableSuccess'))
      setDisableOpen(false)
      disableForm.reset()
      await queryClient.invalidateQueries({ queryKey: ['me'] })
      const me = await authApi.getMe()
      setUser(me)
    },
    onError: (error: ApiError) => toast.error(error.problem?.detail ?? error.message),
  })

  const current = meQuery.data ?? user
  if (!current) return null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">{t('profile.title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{current.email}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">{t('dashboard.roles')}:</span>
            <RoleBadges roles={current.roles} />
          </div>
          <p>
            <span className="font-medium">{t('dashboard.twoFactor')}:</span>{' '}
            {current.twoFactorEnabled ? t('dashboard.enabled') : t('dashboard.disabled')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('profile.twoFactorTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!current.twoFactorEnabled && !setup && (
            <Button onClick={() => setupMutation.mutate()} disabled={setupMutation.isPending}>
              {t('profile.setup')}
            </Button>
          )}

          {setup && (
            <>
              <TwoFactorSetup setup={setup} code={enableCode} onCodeChange={setEnableCode} />
              <Button onClick={() => setEnableOpen(true)} disabled={enableCode.length !== 6}>
                {t('profile.enable')}
              </Button>
            </>
          )}

          {current.twoFactorEnabled && (
            <Button variant="destructive" onClick={() => setDisableOpen(true)}>
              {t('profile.disable')}
            </Button>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={enableOpen}
        onOpenChange={setEnableOpen}
        title={t('profile.enable')}
        description={t('profile.enableWarning')}
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        loading={enableMutation.isPending}
        onConfirm={() => enableMutation.mutate(enableCode)}
      />

      <ConfirmDialog
        open={disableOpen}
        onOpenChange={setDisableOpen}
        title={t('profile.disable')}
        description={t('profile.disableWarning')}
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        loading={disableMutation.isPending}
        destructive
        onConfirm={disableForm.handleSubmit((values) => disableMutation.mutate(values))}
      >
        <form className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="disable-password">{t('auth.password')}</Label>
            <Input id="disable-password" type="password" {...disableForm.register('password')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="disable-code">{t('auth.twoFactorCode')}</Label>
            <Input id="disable-code" maxLength={6} {...disableForm.register('code')} />
          </div>
        </form>
      </ConfirmDialog>
    </div>
  )
}
