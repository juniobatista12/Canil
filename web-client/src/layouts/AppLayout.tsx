import { Moon, Sun, User } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useTranslation } from 'react-i18next'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { logout } from '@/api/auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { publishAuthLogout } from '@/lib/auth'
import { ROLES } from '@/types/auth'

const navItems = [
  { to: '/', labelKey: 'nav.dashboard', roles: [] as string[] },
  { to: '/users', labelKey: 'nav.users', roles: [ROLES.Admin, ROLES.SuperAdmin] },
  { to: '/tenants', labelKey: 'nav.tenants', roles: [ROLES.SuperAdmin] },
]

export function AppLayout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, clearUser } = useAuth()
  const { hasAnyRole } = useRole()
  const { theme, setTheme } = useTheme()

  const handleLogout = async () => {
    await logout().catch(() => undefined)
    publishAuthLogout()
    clearUser()
    queryClient.removeQueries({ queryKey: ['me'] })
    navigate('/login', { replace: true })
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'JA'

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r bg-card md:block">
        <div className="flex h-14 items-center border-b px-4 font-semibold">{t('app.name')}</div>
        <nav className="space-y-1 p-3">
          {navItems
            .filter((item) => item.roles.length === 0 || hasAnyRole(item.roles))
            .map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
              >
                {t(item.labelKey)}
              </Link>
            ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4">
          <div className="font-semibold md:hidden">{t('app.name')}</div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={theme === 'dark' ? t('nav.themeLight') : t('nav.themeDark')}
            >
              <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" className="gap-2 px-2" />}
              >
                <Avatar className="size-8">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-40 truncate text-sm sm:inline">{user?.email}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="size-4" />
                  {t('nav.profile')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void handleLogout()}>{t('nav.logout')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
