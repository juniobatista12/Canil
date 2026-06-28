import { useState } from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import { getTenants } from '@/api/tenants'
import { Badge } from '@/components/RoleBadge'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UIText } from '@/components/ui/text'
import { tenantsQueryKey } from '@/lib/query'
import type { TenantsStackParamList } from '@/navigation/types'
import type { TenantDto } from '@/types/tenants'

export function TenantsListScreen() {
  const { t } = useTranslation()
  const navigation = useNavigation<NativeStackNavigationProp<TenantsStackParamList>>()
  const [page, setPage] = useState(1)
  const pageSize = 20

  const tenantsQuery = useQuery({
    queryKey: tenantsQueryKey({ page, pageSize }),
    queryFn: () => getTenants({ page, pageSize }),
  })

  const renderItem = ({ item }: { item: TenantDto }) => (
    <Card className="mb-3">
      <CardContent className="gap-2">
        <UIText className="font-medium">{item.name}</UIText>
        <UIText className="text-muted-foreground text-sm">{item.slug}</UIText>
        <View className="flex-row flex-wrap gap-2">
          <Badge
            label={item.isActive ? t('tenants.active') : t('tenants.inactive')}
            variant={item.isActive ? 'default' : 'secondary'}
          />
          {item.isSystemTenant ? <Badge label={t('tenants.system')} variant="outline" /> : null}
        </View>
        <Button
          title={t('tenants.edit')}
          variant="outline"
          onPress={() => navigation.navigate('TenantEdit', { id: item.id })}
          accessibilityLabel={`${t('tenants.edit')} ${item.name}`}
        />
      </CardContent>
    </Card>
  )

  return (
    <View className="bg-background flex-1 p-4">
      <View className="mb-3 flex-row justify-end">
        <Button
          title={t('tenants.create')}
          accessibilityLabel={t('tenants.create')}
          onPress={() => navigation.navigate('TenantCreate')}
        />
      </View>

      {tenantsQuery.isLoading ? (
        <ActivityIndicator className="mt-8" />
      ) : (
        <FlatList
          data={tenantsQuery.data?.items ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          accessibilityRole="list"
        />
      )}

      {tenantsQuery.data ? (
        <Pagination
          page={tenantsQuery.data.page}
          totalPages={tenantsQuery.data.totalPages}
          onPrevious={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => p + 1)}
        />
      ) : null}
    </View>
  )
}
