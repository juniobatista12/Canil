import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { DashboardContentScreen } from '@/screens/DashboardContentScreen'
import { Avatar } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'

const Tab = createBottomTabNavigator()

export function DashboardTabs() {
  const { user } = useAuth()

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Home"
        component={DashboardContentScreen}
        options={{
          tabBarIcon: () => <Avatar label={user?.email ?? 'U'} />,
          tabBarLabel: '',
          tabBarAccessibilityLabel: 'Perfil resumo',
        }}
      />
    </Tab.Navigator>
  )
}
