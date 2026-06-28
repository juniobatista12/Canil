import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import { NavigationHeaderLeft } from '@/components/NavigationHeaderLeft'
import { RegisterUserScreen } from '@/screens/users/RegisterUserScreen'
import { UserDetailScreen } from '@/screens/users/UserDetailScreen'
import { UsersListScreen } from '@/screens/users/UsersListScreen'
import { RoleGuard } from '@/components/RoleGuard'
import { ROLES } from '@/types/auth'
import type { UsersStackParamList } from '@/navigation/types'

const Stack = createNativeStackNavigator<UsersStackParamList>()

export function UsersStackNavigator() {
  const { t } = useTranslation()

  return (
    <RoleGuard roles={[ROLES.Admin, ROLES.SuperAdmin]}>
      <Stack.Navigator screenOptions={{ headerLeft: () => <NavigationHeaderLeft /> }}>
        <Stack.Screen name="UsersList" component={UsersListScreen} options={{ title: t('users.title') }} />
        <Stack.Screen name="UserDetail" component={UserDetailScreen} options={{ title: t('users.detail') }} />
        <Stack.Screen name="RegisterUser" component={RegisterUserScreen} options={{ title: t('users.register') }} />
      </Stack.Navigator>
    </RoleGuard>
  )
}
