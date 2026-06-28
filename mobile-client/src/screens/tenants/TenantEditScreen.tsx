import { useEffect, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'
import { deactivateTenant, getTenant, updateTenant } from '@/api/tenants'
import { ApiError } from '@/api/client'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Badge } from '@/components/RoleBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UIText } from '@/components/ui/text'
import { tenantDetailQueryKey } from '@/lib/query'
import type { TenantsStackParamList } from '@/navigation/types'

export function TenantEditScreen() {
  const { t } = useTranslation()
  const route = useRoute<RouteProp<TenantsStackParamList, 'TenantEdit'>>()
  const navigation = useNavigation<NativeStackNavigationProp<TenantsStackParamList>>()
  const queryClient = useQueryClient()
  const { id } = route.params
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [name, setName] = useState('')
  const [isActive, setIsActive] = useState(true)

  const tenantQuery = useQuery({
    queryKey: tenantDetailQueryKey(id),
    queryFn: () => getTenant(id),
    enabled: Boolean(id),
  })

  const tenant = tenantQuery.data

  useEffect(() => {
    if (tenant) {
      setName(tenant.name)
      setIsActive(tenant.isActive)
    }
  }, [tenant])

  const updateMutation = useMutation({
    mutationFn: () => updateTenant(id, { name, isActive }),
    onSuccess: async () => {
      Toast.show({ type: 'success', text1: t('tenants.updateSuccess') })
      await queryClient.invalidateQueries({ queryKey: ['tenants'] })
      await queryClient.invalidateQueries({ queryKey: tenantDetailQueryKey(id) })
    },
    onError: (error: ApiError) => Toast.show({ type: 'error', text1: error.problem?.detail ?? error.message }),
  })

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateTenant(id),
    onSuccess: async () => {
      Toast.show({ type: 'success', text1: t('tenants.deactivateSuccess') })
      setDeactivateOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['tenants'] })
      navigation.navigate('TenantsList')
    },
    onError: (error: ApiError) => Toast.show({ type: 'error', text1: error.problem?.detail ?? error.message }),
  })

  if (tenantQuery.isLoading || !tenant) {
    return null
  }

  return (
    <ScrollView className="bg-background flex-1 p-4">
      <Card>
        <CardHeader>
          <View className="flex-row items-center gap-2">
            <CardTitle title={tenant.name} />
            {tenant.isSystemTenant ? <Badge label={t('tenants.system')} variant="outline" /> : null}
          </View>
        </CardHeader>
        <CardContent className="gap-4">
          <View>
            <Label title={t('tenants.name')} />
            <Input value={name} onChangeText={setName} accessibilityLabel={t('tenants.name')} />
          </View>
          <View>
            <Label title={t('tenants.slug')} />
            <Input value={tenant.slug} editable={false} accessibilityLabel={t('tenants.slug')} />
          </View>
          <Pressable
            className="flex-row items-center gap-2"
            disabled={tenant.isSystemTenant}
            onPress={() => setIsActive((prev) => !prev)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isActive, disabled: tenant.isSystemTenant }}
          >
            <UIText>{isActive ? '☑' : '☐'} {t('tenants.active')}</UIText>
          </Pressable>
          <Button title={t('common.save')} onPress={() => updateMutation.mutate()} />
        </CardContent>
      </Card>

      {!tenant.isSystemTenant && tenant.isActive ? (
        <View className="mt-4">
          <Button title={t('tenants.deactivate')} variant="destructive" onPress={() => setDeactivateOpen(true)} />
        </View>
      ) : null}

      <ConfirmDialog
        open={deactivateOpen}
        title={t('tenants.deactivate')}
        description={t('tenants.deactivateConfirm', { name: tenant.name })}
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        destructive
        onConfirm={() => deactivateMutation.mutate()}
        onOpenChange={setDeactivateOpen}
      />
    </ScrollView>
  )
}
