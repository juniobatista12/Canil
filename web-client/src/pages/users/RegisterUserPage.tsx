import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { register } from '@/api/auth'
import { ApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toUserListItem, upsertUserInCache } from '@/lib/query'
import { registerSchema, type RegisterFormValues } from '@/lib/validators'
import { ROLES } from '@/types/auth'

export function RegisterUserPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      role: ROLES.User,
    },
  })

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: (user) => {
      toast.success(t('users.registerSuccess'))
      const listItem = toUserListItem(user)
      upsertUserInCache(queryClient, listItem)
      navigate(`/users/${listItem.id}`, { state: { user: listItem } })
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: ApiError) => {
      if (error.problem?.errors) {
        Object.entries(error.problem.errors).forEach(([field, messages]) => {
          const key = field.toLowerCase() as keyof RegisterFormValues
          if (messages[0]) form.setError(key, { message: messages[0] })
        })
        return
      }
      toast.error(error.problem?.detail ?? error.message)
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate({
      email: values.email,
      password: values.password,
      roles: [values.role],
    })
  })

  const roleOptions = [ROLES.User, ROLES.Admin]

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">{t('users.register')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('users.register')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('users.email')}</Label>
              <Input id="email" type="email" {...form.register('email')} />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input id="password" type="password" {...form.register('password')} />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t('users.roles')}</Label>
              <Controller
                name="role"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('users.selectRole')} />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <Button type="submit" disabled={mutation.isPending}>
              {t('common.save')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
