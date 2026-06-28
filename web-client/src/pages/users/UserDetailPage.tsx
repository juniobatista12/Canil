import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { addUserRole, getUserRoles, removeUserRole } from '@/api/users'
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
import { findUserInCache, toUserListItem, userRolesQueryKey } from '@/lib/query'
import { ROLES } from '@/types/auth'
import type { UserListItemDto } from '@/types/users'

export function UserDetailPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [selectedRole, setSelectedRole] = useState('')
  const [removeRole, setRemoveRole] = useState<string | null>(null)

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

  const availableRoles = useMemo(() => {
    return [ROLES.User, ROLES.Admin].filter((role) => !rolesQuery.data?.roles?.includes(role))
  }, [rolesQuery.data?.roles])

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

  if (!baseUser) {
    return (
      <div className="mx-auto max-w-3xl py-8 text-center text-muted-foreground">
        {t('app.loading')}
      </div>
    )
  }

  const roles = rolesQuery.data?.roles ?? baseUser.roles ?? []

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
    </div>
  )
}
