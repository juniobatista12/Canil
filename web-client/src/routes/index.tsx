import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { setApiHandlers } from '@/api/client'
import { AppLayout } from '@/layouts/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { LoginPage } from '@/pages/LoginPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { RegisterUserPage } from '@/pages/users/RegisterUserPage'
import { UserDetailPage } from '@/pages/users/UserDetailPage'
import { UsersListPage } from '@/pages/users/UsersListPage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { RoleRoute } from '@/routes/RoleRoute'
import { ROLES } from '@/types/auth'
import { useAuth } from '@/hooks/useAuth'
import { publishAuthLogout } from '@/lib/auth'

function SessionExpiredListener() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { clearUser } = useAuth()

  useEffect(() => {
    setApiHandlers({
      onSessionExpired: () => {
        clearUser()
        publishAuthLogout()
        toast.error(t('errors.sessionExpired'))
        navigate('/login', { replace: true })
      },
      onForbidden: (message) => {
        toast.error(message || t('errors.accessDenied'))
        if (window.history.length > 1) navigate(-1)
      },
      onConflict: (message) => {
        toast.error(message)
      },
    })
  }, [clearUser, navigate, t])

  return null
}

function AuthenticatedRedirect({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()
  if (status === 'authenticated') {
    return <Navigate to="/" replace />
  }
  return children
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <SessionExpiredListener />
      <Routes>
        <Route
          path="/login"
          element={
            <AuthenticatedRedirect>
              <LoginPage />
            </AuthenticatedRedirect>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route
            path="users"
            element={
              <RoleRoute roles={[ROLES.Admin]}>
                <UsersListPage />
              </RoleRoute>
            }
          />
          <Route
            path="users/register"
            element={
              <RoleRoute roles={[ROLES.Admin]}>
                <RegisterUserPage />
              </RoleRoute>
            }
          />
          <Route
            path="users/:id"
            element={
              <RoleRoute roles={[ROLES.Admin]}>
                <UserDetailPage />
              </RoleRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
