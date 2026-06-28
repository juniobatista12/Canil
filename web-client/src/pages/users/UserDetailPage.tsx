import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { addUserRole, getUserRoles, moveUserToSystemTenant, removeUserRole } from '@/api/users'
import { getTenants } from '@/api/tenants'
import { ApiError } from '@/api/client'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { RoleBadges } from '@/components/RoleBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRole } from '@/hooks/useRole'
import { findUserInCache, toUserListItem, userRolesQueryKey } from '@/lib/query'
import { ROLES } from '@/types/auth'
import type { UserListItemDto } from '@/types/users'

export function UserDetailPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { isSuperAdmin } = useRole()
  const [selectedRole, setSelectedRole] = useState('')
  const [removeRole, setRemoveRole] = useState<string | null>(null)
  const [moveOpen, setMoveOpen] = useState(false)

  const stateUser = (location.state as { user?: UserListItemDto } | null)?.user
  const cachedUser = findUserInCache(queryClient, id)
  const baseUser = stateUser ? toUserListItem(stateUser) : cachedUser

  useEffect(() => {
    if (baseUser) return
    toast.error(t('users.notFound'))
    navigate('/users', { replace: true })
  }, [baseUser, navigate, t])

  const rolesQuery = useQuery({
    queryKey: userRolesQueryKey(id),
    queryFn: () => getUserRoles(id),
    enabled: Boolean(id),
  })

  const tenantsQuery = useQuery({
    queryKey: ['tenants', { page: 1, pageSize: 100 }],
    queryFn: () => getTenants({ page: 1, pageSize: 100 }),
    enabled: isSuperAdmin,
  })

  const systemTenantId = tenantsQuery.data?.items.find((tenant) => tenant.isSystemTenant)?.id

  const availableRoles = useMemo(() => {
    if (isSuperAdmin) {
      const roles: string[] = [ROLES.User, ROLES.Admin]
      if (baseUser && systemTenantId && baseUser.tenantId === systemTenantId) {
        roles.push(ROLES.SuperAdmin)
      }
      return roles.filter((role) => !rolesQuery.data?.roles?.includes(role))
    }
    return [ROLES.User, ROLES.Admin].filter((role) => !rolesQuery.data?.roles?.includes(role))
  }, [baseUser, isSuperAdmin, rolesQuery.data?.roles, systemTenantId])

  const addRoleMutation = useMutation({
    mutationFn: (role: string) => addUserRole(id, { role }),
    onSuccess: async () => {
      setSelectedRole('')
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.invalidateQueries({ queryKey: userRolesQueryKey(id) })
    },
    onError: (error: ApiError) => toast.error(error.problem?.detail ?? error.message),
  })

  const removeRoleMutation = useMutation({
    mutationFn: (role: string) => removeUserRole(id, role),
    onSuccess: async () => {
      setRemoveRole(null)
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.invalidateQueries({ queryKey: userRolesQueryKey(id) })
    },
    onError: (error: ApiError) => toast.error(error.problem?.detail ?? error.message),
  })

  const moveMutation = useMutation({
    mutationFn: () => moveUserToSystemTenant(id),
    onSuccess: async () => {
      setMoveOpen(false)
      toast.success(t('users.moveToSystem'))
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.invalidateQueries({ queryKey: userRolesQueryKey(id) })
    },
    onError: (error: ApiError) => toast.error(error.problem?.detail ?? error.message),
  })

  if (!baseUser) {
    return (
      <div className="mx-auto max-w-3xl py-8 text-center text-muted-foreground">
        {t('app.loading')}
      </div>
    )
  }

  const roles = rolesQuery.data?.roles ?? baseUser.roles ?? []
  const isAlreadySuperAdmin = roles.includes(ROLES.SuperAdmin)
  const isOnSystemTenant = systemTenantId ? baseUser.tenantId === systemTenantId : false

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="outline" onClick={() => navigate('/users')}>
        {t('common.back')}
      </Button>

      <h1 className="text-2xl font-semibold">{t('users.detail')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('users.detail')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">{t('users.email')}:</span> {baseUser.email}
          </p>
          <p>
            <span className="font-medium">{t('users.tenant')}:</span> {baseUser.tenantName}
          </p>
          <div className="flex items-center gap-2">
            <span className="font-medium">{t('users.roles')}:</span>
            <RoleBadges roles={roles} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('users.addRole')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value ?? '')}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t('users.selectRole')} />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            disabled={!selectedRole || addRoleMutation.isPending}
            onClick={() => addRoleMutation.mutate(selectedRole)}
          >
            {t('users.addRole')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('users.removeRole')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {roles.map((role) => (
            <Button key={role} variant="outline" size="sm" onClick={() => setRemoveRole(role)}>
              {role}
            </Button>
          ))}
        </CardContent>
      </Card>

      {isSuperAdmin && !isAlreadySuperAdmin && !isOnSystemTenant && (
        <Button onClick={() => setMoveOpen(true)}>{t('users.moveToSystem')}</Button>
      )}

      <ConfirmDialog
        open={Boolean(removeRole)}
        onOpenChange={(open) => !open && setRemoveRole(null)}
        title={t('users.removeRole')}
        description={removeRole ?? ''}
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        loading={removeRoleMutation.isPending}
        destructive
        onConfirm={() => removeRole && removeRoleMutation.mutate(removeRole)}
      />

      <ConfirmDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        title={t('users.moveToSystem')}
        description={baseUser.email}
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        loading={moveMutation.isPending}
        onConfirm={() => moveMutation.mutate()}
      />
    </div>
  )
}
