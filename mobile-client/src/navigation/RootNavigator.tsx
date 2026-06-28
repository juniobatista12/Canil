import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { DrawerNavigator } from '@/navigation/DrawerNavigator'
import { LoginScreen } from '@/screens/LoginScreen'
import { useAuth } from '@/hooks/useAuth'
import type { RootStackParamList } from '@/navigation/types'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  const { status } = useAuth()

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {status === 'authenticated' ? (
        <Stack.Screen name="Main" component={DrawerNavigator} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  )
}
