import { useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'
import { setApiHandlers } from '@/api/client'
import { useAuth } from '@/hooks/useAuth'
import type { RootStackParamList } from '@/navigation/types'

export function SessionListener() {
  const { t } = useTranslation()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { clearUser } = useAuth()

  useEffect(() => {
    setApiHandlers({
      onSessionExpired: () => {
        clearUser()
        Toast.show({ type: 'error', text1: t('errors.sessionExpired') })
      },
      onForbidden: (message) => {
        Toast.show({ type: 'error', text1: message || t('errors.accessDenied') })
        if (navigation.canGoBack()) navigation.goBack()
      },
      onConflict: (message) => {
        Toast.show({ type: 'error', text1: message })
      },
    })
  }, [clearUser, navigation, t])

  return null
}
