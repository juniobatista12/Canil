import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getUsers } from '@/api/users'
import { DataTable } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { RoleBadges } from '@/components/RoleBadge'
import { Button } from '@/components/ui/button'
import { usersQueryKey } from '@/lib/query'
import type { UserListItemDto } from '@/types/users'

export function UsersListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') ?? '1')
  const pageSize = 20

  const usersQuery = useQuery({
    queryKey: usersQueryKey({ page, pageSize }),
    queryFn: () => getUsers({ page, pageSize }),
  })

  const columns = useMemo(
    () => [
      { key: 'email', header: t('users.email'), cell: (row: UserListItemDto) => row.email },
      {
        key: 'roles',
        header: t('users.roles'),
        cell: (row: UserListItemDto) => <RoleBadges roles={row.roles} />,
      },
      {
        key: '2fa',
        header: t('users.twoFactor'),
        cell: (row: UserListItemDto) => (row.twoFactorEnabled ? t('common.yes') : t('common.no')),
      },
      {
        key: 'actions',
        header: t('common.actions'),
        cell: (row: UserListItemDto) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/users/${row.id}`, { state: { user: row } })}
          >
            {t('users.viewDetails')}
          </Button>
        ),
      },
    ],
    [navigate, t],
  )

  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(nextPage))
    setSearchParams(next)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t('users.title')}</h1>
        <Link to="/users/register">
          <Button>{t('users.register')}</Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={usersQuery.data?.items ?? []}
        loading={usersQuery.isLoading}
        rowKey={(row) => row.id}
      />

      {usersQuery.data && (
        <Pagination
          page={usersQuery.data.page}
          totalPages={usersQuery.data.totalPages}
          hasPrevious={usersQuery.data.hasPrevious}
          hasNext={usersQuery.data.hasNext}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
