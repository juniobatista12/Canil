import { useState } from 'react'
import { View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'
import { createTenant } from '@/api/tenants'
import { ApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { TenantsStackParamList } from '@/navigation/types'

export function TenantCreateScreen() {
  const { t } = useTranslation()
  const navigation = useNavigation<NativeStackNavigationProp<TenantsStackParamList>>()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  const mutation = useMutation({
    mutationFn: createTenant,
    onSuccess: async (tenant) => {
      Toast.show({ type: 'success', text1: t('tenants.createSuccess') })
      await queryClient.invalidateQueries({ queryKey: ['tenants'] })
      navigation.replace('TenantEdit', { id: tenant.id })
    },
    onError: (error: ApiError) => Toast.show({ type: 'error', text1: error.problem?.detail ?? error.message }),
  })

  return (
    <KeyboardAwareScrollView className="bg-background flex-1 p-4" keyboardShouldPersistTaps="handled">
      <Card>
        <CardHeader>
          <CardTitle title={t('tenants.create')} />
        </CardHeader>
        <CardContent className="gap-4">
          <View>
            <Label title={t('tenants.name')} />
            <Input value={name} onChangeText={setName} accessibilityLabel={t('tenants.name')} />
          </View>
          <View>
            <Label title={t('tenants.slug')} />
            <Input
              value={slug}
              onChangeText={setSlug}
              autoCapitalize="none"
              accessibilityLabel={t('tenants.slug')}
            />
          </View>
          <Button
            title={t('common.save')}
            onPress={() => mutation.mutate({ name, slug })}
            disabled={mutation.isPending}
          />
        </CardContent>
      </Card>
    </KeyboardAwareScrollView>
  )
}
