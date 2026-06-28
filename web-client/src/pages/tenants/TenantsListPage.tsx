import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getTenants } from '@/api/tenants'
import { DataTable } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { tenantsQueryKey } from '@/lib/query'
import type { TenantDto } from '@/types/tenants'

export function TenantsListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') ?? '1')
  const pageSize = 20

  const tenantsQuery = useQuery({
    queryKey: tenantsQueryKey({ page, pageSize }),
    queryFn: () => getTenants({ page, pageSize }),
  })

  const columns = useMemo(
    () => [
      { key: 'name', header: t('tenants.name'), cell: (row: TenantDto) => row.name },
      { key: 'slug', header: t('tenants.slug'), cell: (row: TenantDto) => row.slug },
      {
        key: 'status',
        header: t('tenants.status'),
        cell: (row: TenantDto) => (
          <div className="flex gap-1">
            <Badge variant={row.isActive ? 'default' : 'secondary'}>
              {row.isActive ? t('tenants.active') : t('tenants.inactive')}
            </Badge>
            {row.isSystemTenant && <Badge variant="outline">{t('tenants.system')}</Badge>}
          </div>
        ),
      },
      {
        key: 'actions',
        header: t('common.actions'),
        cell: (row: TenantDto) => (
          <Button variant="outline" size="sm" onClick={() => navigate(`/tenants/${row.id}`)}>
            {t('tenants.edit')}
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('tenants.title')}</h1>
        <Link to="/tenants/new">
          <Button>{t('tenants.create')}</Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={tenantsQuery.data?.items ?? []}
        loading={tenantsQuery.isLoading}
        rowKey={(row) => row.id}
      />

      {tenantsQuery.data && (
        <Pagination
          page={tenantsQuery.data.page}
          totalPages={tenantsQuery.data.totalPages}
          hasPrevious={tenantsQuery.data.hasPrevious}
          hasNext={tenantsQuery.data.hasNext}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
