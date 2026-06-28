import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import { NavigationHeaderLeft } from '@/components/NavigationHeaderLeft'
import { TenantCreateScreen } from '@/screens/tenants/TenantCreateScreen'
import { TenantEditScreen } from '@/screens/tenants/TenantEditScreen'
import { TenantsListScreen } from '@/screens/tenants/TenantsListScreen'
import { RoleGuard } from '@/components/RoleGuard'
import { ROLES } from '@/types/auth'
import type { TenantsStackParamList } from '@/navigation/types'

const Stack = createNativeStackNavigator<TenantsStackParamList>()

export function TenantsStackNavigator() {
  const { t } = useTranslation()

  return (
    <RoleGuard roles={[ROLES.SuperAdmin]}>
      <Stack.Navigator screenOptions={{ headerLeft: () => <NavigationHeaderLeft /> }}>
        <Stack.Screen name="TenantsList" component={TenantsListScreen} options={{ title: t('tenants.title') }} />
        <Stack.Screen name="TenantCreate" component={TenantCreateScreen} options={{ title: t('tenants.create') }} />
        <Stack.Screen name="TenantEdit" component={TenantEditScreen} options={{ title: t('tenants.edit') }} />
      </Stack.Navigator>
    </RoleGuard>
  )
}
