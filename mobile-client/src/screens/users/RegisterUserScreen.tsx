import { useState } from 'react'
import { View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'
import { register } from '@/api/auth'
import { getTenants } from '@/api/tenants'
import { ApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UIText } from '@/components/ui/text'
import { useRole } from '@/hooks/useRole'
import type { UsersStackParamList } from '@/navigation/types'
import { ROLES } from '@/types/auth'

export function RegisterUserScreen() {
  const { t } = useTranslation()
  const navigation = useNavigation<NativeStackNavigationProp<UsersStackParamList>>()
  const queryClient = useQueryClient()
  const { isSuperAdmin } = useRole()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [role, setRole] = useState<string>(ROLES.User)

  const tenantsQuery = useQuery({
    queryKey: ['tenants', { page: 1, pageSize: 100 }],
    queryFn: () => getTenants({ page: 1, pageSize: 100 }),
    enabled: isSuperAdmin,
  })

  const roleOptions = isSuperAdmin ? [ROLES.User, ROLES.Admin] : [ROLES.User]

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: async (user) => {
      Toast.show({ type: 'success', text1: t('users.registerSuccess') })
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      navigation.replace('UserDetail', {
        id: user.id,
        user: {
          id: user.id,
          email: user.email,
          tenantId: user.tenantId,
          tenantName: user.tenantName,
          roles: user.roles,
          twoFactorEnabled: user.twoFactorEnabled,
        },
      })
    },
    onError: (error: ApiError) => Toast.show({ type: 'error', text1: error.problem?.detail ?? error.message }),
  })

  return (
    <KeyboardAwareScrollView className="bg-background flex-1 p-4" keyboardShouldPersistTaps="handled">
      <Card>
        <CardHeader>
          <CardTitle title={t('users.register')} />
        </CardHeader>
        <CardContent className="gap-4">
          <View>
            <Label title={t('users.email')} />
            <Input
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel={t('users.email')}
            />
          </View>
          <View>
            <Label title={t('auth.password')} />
            <Input
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              accessibilityLabel={t('auth.password')}
            />
          </View>

          {isSuperAdmin ? (
            <View>
              <Label title={t('users.tenant')} />
              <View className="flex-row flex-wrap gap-2">
                {tenantsQuery.data?.items.map((tenant) => (
                  <Button
                    key={tenant.id}
                    title={tenant.name}
                    variant={tenantId === tenant.id ? 'default' : 'outline'}
                    onPress={() => setTenantId(tenant.id)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <View>
            <Label title={t('users.roles')} />
            <View className="flex-row flex-wrap gap-2">
              {roleOptions.map((option) => (
                <Button
                  key={option}
                  title={option}
                  variant={role === option ? 'default' : 'outline'}
                  onPress={() => setRole(option)}
                  disabled={!isSuperAdmin && option !== ROLES.User}
                />
              ))}
            </View>
            {!isSuperAdmin ? <UIText className="text-muted-foreground text-sm">{ROLES.User}</UIText> : null}
          </View>

          <Button
            title={t('common.save')}
            onPress={() =>
              mutation.mutate({
                email,
                password,
                roles: [role],
                tenantId: isSuperAdmin && tenantId ? tenantId : undefined,
              })
            }
            disabled={mutation.isPending}
          />
        </CardContent>
      </Card>
    </KeyboardAwareScrollView>
  )
}
