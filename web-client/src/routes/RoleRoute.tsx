import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useRole } from '@/hooks/useRole'

export function RoleRoute({
  roles,
  children,
}: {
  roles: string[]
  children: React.ReactNode
}) {
  const { hasAnyRole } = useRole()
  const { t } = useTranslation()

  const allowed = hasAnyRole(roles)

  useEffect(() => {
    if (!allowed) {
      toast.error(t('errors.accessDenied'))
    }
  }, [allowed, t])

  if (!allowed) {
    return <Navigate to="/" replace />
  }

  return children
}
