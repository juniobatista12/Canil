import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { login } from '@/api/auth'
import { ApiError, TwoFactorRequiredError } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { sanitizeRedirect } from '@/lib/auth'
import { loginSchema, type LoginFormValues } from '@/lib/validators'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { status, setUser } = useAuth()
  const [requires2FA, setRequires2FA] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      twoFactorCode: '',
    },
  })

  useEffect(() => {
    if (status === 'authenticated') {
      const from = sanitizeRedirect((location.state as { from?: string } | null)?.from)
      navigate(from ?? '/', { replace: true })
    }
  }, [status, location.state, navigate])

  if (status === 'loading') return null
  if (status === 'authenticated') {
    return <Navigate to={sanitizeRedirect((location.state as { from?: string } | null)?.from) ?? '/'} replace />
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await login({
        email: values.email,
        password: values.password,
        twoFactorCode: values.twoFactorCode || undefined,
      })
      setUser(response.user)
      toast.success(t('auth.login'))
      const from = sanitizeRedirect((location.state as { from?: string } | null)?.from)
      navigate(from ?? '/', { replace: true })
    } catch (error) {
      if (error instanceof TwoFactorRequiredError) {
        setRequires2FA(true)
        return
      }
      if (error instanceof ApiError && error.problem?.errors) {
        Object.entries(error.problem.errors).forEach(([field, messages]) => {
          const key = field.toLowerCase() as keyof LoginFormValues
          if (messages[0]) form.setError(key, { message: messages[0] })
        })
        return
      }
      const message =
        error instanceof ApiError
          ? error.problem?.detail ?? error.message
          : await Promise.resolve(t('errors.generic'))
      toast.error(message)
    }
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('auth.loginTitle')}</CardTitle>
          <CardDescription>{t('auth.loginSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input id="email" type="email" autoComplete="username" {...form.register('email')} />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input id="password" type="password" autoComplete="current-password" {...form.register('password')} />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
            {requires2FA && (
              <div className="space-y-2">
                <Label htmlFor="twoFactorCode">{t('auth.twoFactorCode')}</Label>
                <Input
                  id="twoFactorCode"
                  maxLength={6}
                  inputMode="numeric"
                  {...form.register('twoFactorCode')}
                />
                {form.formState.errors.twoFactorCode && (
                  <p className="text-sm text-destructive">{form.formState.errors.twoFactorCode.message}</p>
                )}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {t('auth.login')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
