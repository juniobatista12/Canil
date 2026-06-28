import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { RoleBadges } from '@/components/RoleBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { ROLES } from '@/types/auth'

export function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { hasAnyRole } = useRole()

  if (!user) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.welcome', { email: user.email })}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">{t('dashboard.roles')}:</span>
            <RoleBadges roles={user.roles} />
          </div>
          <p>
            <span className="font-medium">{t('dashboard.twoFactor')}:</span>{' '}
            {user.twoFactorEnabled ? t('dashboard.enabled') : t('dashboard.disabled')}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">{t('dashboard.quickLinks')}</h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/profile">
            <Button variant="outline">{t('nav.profile')}</Button>
          </Link>
          {hasAnyRole([ROLES.Admin]) && (
            <Link to="/users">
              <Button variant="outline">{t('nav.users')}</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
