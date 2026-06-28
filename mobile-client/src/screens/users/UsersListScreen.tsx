import { useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import { getUsers } from '@/api/users'
import { getTenants } from '@/api/tenants'
import { Pagination } from '@/components/Pagination'
import { RoleBadges } from '@/components/RoleBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UIText } from '@/components/ui/text'
import { useRole } from '@/hooks/useRole'
import { usersQueryKey } from '@/lib/query'
import type { UsersStackParamList } from '@/navigation/types'
import type { UserListItemDto } from '@/types/users'

export function UsersListScreen() {
  const { t } = useTranslation()
  const navigation = useNavigation<NativeStackNavigationProp<UsersStackParamList>>()
  const { isSuperAdmin } = useRole()
  const [page, setPage] = useState(1)
  const [tenantId, setTenantId] = useState<string | undefined>()
  const pageSize = 20

  const tenantsQuery = useQuery({
    queryKey: ['tenants', { page: 1, pageSize: 100 }],
    queryFn: () => getTenants({ page: 1, pageSize: 100 }),
    enabled: isSuperAdmin,
  })

  const usersQuery = useQuery({
    queryKey: usersQueryKey({ page, pageSize, tenantId }),
    queryFn: () => getUsers({ page, pageSize, tenantId }),
  })

  const renderItem = ({ item }: { item: UserListItemDto }) => (
    <Card className="mb-3">
      <CardContent className="gap-2">
        <UIText className="font-medium">{item.email}</UIText>
        <UIText className="text-muted-foreground text-sm">
          {t('users.tenant')}: {item.tenantName}
        </UIText>
        <RoleBadges roles={item.roles} />
        <UIText className="text-sm">
          {t('users.twoFactor')}: {item.twoFactorEnabled ? t('common.yes') : t('common.no')}
        </UIText>
        <Button
          title={t('users.viewDetails')}
          variant="outline"
          onPress={() => navigation.navigate('UserDetail', { id: item.id, user: item })}
          accessibilityLabel={`${t('users.viewDetails')} ${item.email}`}
        />
      </CardContent>
    </Card>
  )

  return (
    <View className="bg-background flex-1 p-4">
      <View className="mb-3 flex-row justify-end">
        <Button
          title={t('users.register')}
          accessibilityLabel={t('users.register')}
          onPress={() => navigation.navigate('RegisterUser')}
        />
      </View>

      {isSuperAdmin ? (
        <View className="mb-3 flex-row flex-wrap gap-2">
          <Pressable
            onPress={() => {
              setTenantId(undefined)
              setPage(1)
            }}
            className={`rounded-md border px-3 py-2 ${!tenantId ? 'bg-primary' : 'bg-background'}`}
            accessibilityRole="button"
          >
            <UIText className={!tenantId ? 'text-primary-foreground' : ''}>{t('users.allTenants')}</UIText>
          </Pressable>
          {tenantsQuery.data?.items.map((tenant) => (
            <Pressable
              key={tenant.id}
              onPress={() => {
                setTenantId(tenant.id)
                setPage(1)
              }}
              className={`rounded-md border px-3 py-2 ${tenantId === tenant.id ? 'bg-primary' : 'bg-background'}`}
              accessibilityRole="button"
            >
              <UIText className={tenantId === tenant.id ? 'text-primary-foreground' : ''}>
                {tenant.name}
              </UIText>
            </Pressable>
          ))}
        </View>
      ) : null}

      {usersQuery.isLoading ? (
        <ActivityIndicator className="mt-8" />
      ) : (
        <FlatList
          data={usersQuery.data?.items ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          accessibilityRole="list"
          ListEmptyComponent={<UIText className="text-muted-foreground text-center">{t('errors.generic')}</UIText>}
        />
      )}

      {usersQuery.data ? (
        <Pagination
          page={usersQuery.data.page}
          totalPages={usersQuery.data.totalPages}
          onPrevious={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => p + 1)}
        />
      ) : null}
    </View>
  )
}
