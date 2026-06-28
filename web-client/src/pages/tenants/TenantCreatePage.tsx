import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { createTenant } from '@/api/tenants'
import { ApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { tenantCreateSchema, type TenantCreateFormValues } from '@/lib/validators'

export function TenantCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const form = useForm<TenantCreateFormValues>({
    resolver: zodResolver(tenantCreateSchema),
    defaultValues: { name: '', slug: '' },
  })

  const mutation = useMutation({
    mutationFn: createTenant,
    onSuccess: async (tenant) => {
      toast.success(t('tenants.createSuccess'))
      await queryClient.invalidateQueries({ queryKey: ['tenants'] })
      navigate(`/tenants/${tenant.id}`)
    },
    onError: (error: ApiError) => toast.error(error.problem?.detail ?? error.message),
  })

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">{t('tenants.create')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('tenants.create')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">{t('tenants.name')}</Label>
              <Input id="name" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">{t('tenants.slug')}</Label>
              <Input id="slug" {...form.register('slug')} />
              {form.formState.errors.slug && (
                <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
              )}
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
