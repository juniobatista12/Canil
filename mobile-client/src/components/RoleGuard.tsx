import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useIsFocused } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'
import { useRole } from '@/hooks/useRole'
import { navigationRef } from '@/navigation/navigationRef'

type RoleGuardProps = {
  roles: string[]
  children: ReactNode
  fallbackRoute?: string
}

export function RoleGuard({ roles, children, fallbackRoute = 'Dashboard' }: RoleGuardProps) {
  const { hasAnyRole } = useRole()
  const { t } = useTranslation()
  const isFocused = useIsFocused()
  const allowed = hasAnyRole(roles)
  const redirectedRef = useRef(false)

  useEffect(() => {
    if (!isFocused) {
      redirectedRef.current = false
      return
    }

    if (allowed) {
      redirectedRef.current = false
      return
    }

    if (!navigationRef.isReady() || redirectedRef.current) return

    redirectedRef.current = true
    Toast.show({ type: 'error', text1: t('errors.accessDenied') })
    navigationRef.navigate('Main', { screen: fallbackRoute } as never)
  }, [allowed, fallbackRoute, isFocused, t])

  if (!allowed) return null

  return children
}
