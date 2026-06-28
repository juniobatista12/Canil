import { useEffect, useMemo, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'
import { addUserRole, getUserRoles, moveUserToSystemTenant, removeUserRole } from '@/api/users'
import { getTenants } from '@/api/tenants'
import { ApiError } from '@/api/client'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { RoleBadges } from '@/components/RoleBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UIText } from '@/components/ui/text'
import { useRole } from '@/hooks/useRole'
import { findUserInCache, userRolesQueryKey } from '@/lib/query'
import type { UsersStackParamList } from '@/navigation/types'
import { ROLES } from '@/types/auth'

export function UserDetailScreen() {
  const { t } = useTranslation()
  const route = useRoute<RouteProp<UsersStackParamList, 'UserDetail'>>()
  const navigation = useNavigation<NativeStackNavigationProp<UsersStackParamList>>()
  const queryClient = useQueryClient()
  const { isSuperAdmin } = useRole()
  const { id } = route.params
  const [selectedRole, setSelectedRole] = useState('')
  const [removeRole, setRemoveRole] = useState<string | null>(null)
  const [moveOpen, setMoveOpen] = useState(false)

  const baseUser = route.params.user ?? findUserInCache(queryClient, id)

  useEffect(() => {
    if (!baseUser) {
      Toast.show({ type: 'error', text1: t('users.notFound') })
      navigation.navigate('UsersList')
    }
  }, [baseUser, navigation, t])

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
      return roles.filter((role) => !rolesQuery.data?.roles.includes(role))
    }
    return [ROLES.User, ROLES.Admin].filter((role) => !rolesQuery.data?.roles.includes(role))
  }, [baseUser, isSuperAdmin, rolesQuery.data?.roles, systemTenantId])

  const addRoleMutation = useMutation({
    mutationFn: (role: string) => addUserRole(id, { role }),
    onSuccess: async () => {
      setSelectedRole('')
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.invalidateQueries({ queryKey: userRolesQueryKey(id) })
    },
    onError: (error: ApiError) => Toast.show({ type: 'error', text1: error.problem?.detail ?? error.message }),
  })

  const removeRoleMutation = useMutation({
    mutationFn: (role: string) => removeUserRole(id, role),
    onSuccess: async () => {
      setRemoveRole(null)
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.invalidateQueries({ queryKey: userRolesQueryKey(id) })
    },
    onError: (error: ApiError) => Toast.show({ type: 'error', text1: error.problem?.detail ?? error.message }),
  })

  const moveMutation = useMutation({
    mutationFn: () => moveUserToSystemTenant(id),
    onSuccess: async () => {
      setMoveOpen(false)
      Toast.show({ type: 'success', text1: t('users.moveToSystem') })
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.invalidateQueries({ queryKey: userRolesQueryKey(id) })
    },
    onError: (error: ApiError) => Toast.show({ type: 'error', text1: error.problem?.detail ?? error.message }),
  })

  if (!baseUser) return null

  const roles = rolesQuery.data?.roles ?? baseUser.roles
  const isAlreadySuperAdmin = roles.includes(ROLES.SuperAdmin)
  const isOnSystemTenant = systemTenantId ? baseUser.tenantId === systemTenantId : false

  return (
    <ScrollView className="bg-background flex-1 p-4">
      <Card className="mt-0">
        <CardHeader>
          <CardTitle title={t('users.detail')} />
        </CardHeader>
        <CardContent className="gap-2">
          <UIText>
            {t('users.email')}: {baseUser.email}
          </UIText>
          <UIText>
            {t('users.tenant')}: {baseUser.tenantName}
          </UIText>
          <RoleBadges roles={roles} />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle title={t('users.addRole')} />
        </CardHeader>
        <CardContent className="gap-2">
          <View className="flex-row flex-wrap gap-2">
            {availableRoles.map((role) => (
              <Button
                key={role}
                title={role}
                variant={selectedRole === role ? 'default' : 'outline'}
                onPress={() => setSelectedRole(role)}
              />
            ))}
          </View>
          <Button
            title={t('users.addRole')}
            disabled={!selectedRole}
            onPress={() => addRoleMutation.mutate(selectedRole)}
          />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle title={t('users.removeRole')} />
        </CardHeader>
        <CardContent className="flex-row flex-wrap gap-2">
          {roles.map((role) => (
            <Button key={role} title={role} variant="outline" onPress={() => setRemoveRole(role)} />
          ))}
        </CardContent>
      </Card>

      {isSuperAdmin && !isAlreadySuperAdmin && !isOnSystemTenant ? (
        <View className="mt-4">
          <Button title={t('users.moveToSystem')} onPress={() => setMoveOpen(true)} />
        </View>
      ) : null}

      <ConfirmDialog
        open={Boolean(removeRole)}
        title={t('users.removeRole')}
        description={removeRole ?? ''}
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        destructive
        onConfirm={() => removeRole && removeRoleMutation.mutate(removeRole)}
        onOpenChange={(open) => !open && setRemoveRole(null)}
      />

      <ConfirmDialog
        open={moveOpen}
        title={t('users.moveToSystem')}
        description={baseUser.email}
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => moveMutation.mutate()}
        onOpenChange={setMoveOpen}
      />
    </ScrollView>
  )
}
