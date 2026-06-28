import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { deactivateTenant, getTenant, updateTenant } from '@/api/tenants'
import { ApiError } from '@/api/client'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { tenantDetailQueryKey } from '@/lib/query'
import { tenantUpdateSchema, type TenantUpdateFormValues } from '@/lib/validators'

export function TenantEditPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deactivateOpen, setDeactivateOpen] = useState(false)

  const tenantQuery = useQuery({
    queryKey: tenantDetailQueryKey(id),
    queryFn: () => getTenant(id),
    enabled: Boolean(id),
  })

  const form = useForm<TenantUpdateFormValues>({
    resolver: zodResolver(tenantUpdateSchema),
    values: tenantQuery.data
      ? { name: tenantQuery.data.name, isActive: tenantQuery.data.isActive }
      : undefined,
  })

  const updateMutation = useMutation({
    mutationFn: (values: TenantUpdateFormValues) => updateTenant(id, values),
    onSuccess: async () => {
      toast.success(t('tenants.updateSuccess'))
      await queryClient.invalidateQueries({ queryKey: ['tenants'] })
      await queryClient.invalidateQueries({ queryKey: tenantDetailQueryKey(id) })
    },
    onError: (error: ApiError) => toast.error(error.problem?.detail ?? error.message),
  })

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateTenant(id),
    onSuccess: async () => {
      toast.success(t('tenants.deactivateSuccess'))
      setDeactivateOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['tenants'] })
      navigate('/tenants')
    },
    onError: (error: ApiError) => toast.error(error.problem?.detail ?? error.message),
  })

  if (tenantQuery.isLoading) return null
  if (!tenantQuery.data) return null

  const tenant = tenantQuery.data

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Button variant="outline" onClick={() => navigate('/tenants')}>
        {t('common.back')}
      </Button>
      <h1 className="text-2xl font-semibold">{t('tenants.edit')}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {tenant.name}
            {tenant.isSystemTenant && <Badge variant="outline">{t('tenants.system')}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit((values) => updateMutation.mutate(values))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">{t('tenants.name')}</Label>
              <Input id="name" {...form.register('name')} />
            </div>
            <div className="space-y-2">
              <Label>{t('tenants.slug')}</Label>
              <Input value={tenant.slug} disabled />
            </div>
            <Controller
              name="isActive"
              control={form.control}
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    disabled={tenant.isSystemTenant}
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                  {t('tenants.active')}
                </label>
              )}
            />
            <Button type="submit" disabled={updateMutation.isPending}>
              {t('common.save')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {!tenant.isSystemTenant && tenant.isActive && (
        <Button variant="destructive" onClick={() => setDeactivateOpen(true)}>
          {t('tenants.deactivate')}
        </Button>
      )}

      <ConfirmDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        title={t('tenants.deactivate')}
        description={t('tenants.deactivateConfirm', { name: tenant.name })}
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        loading={deactivateMutation.isPending}
        destructive
        onConfirm={() => deactivateMutation.mutate()}
      />
    </div>
  )
}
