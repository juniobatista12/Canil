import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

interface PaginationProps {
  page: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
  onPageChange: (page: number) => void
}

export function Pagination({
  page,
  totalPages,
  hasPrevious,
  hasNext,
  onPageChange,
}: PaginationProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        {t('common.page', { page, total: Math.max(totalPages, 1) })}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={!hasPrevious} onClick={() => onPageChange(page - 1)}>
          {t('common.previous')}
        </Button>
        <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => onPageChange(page + 1)}>
          {t('common.next')}
        </Button>
      </div>
    </div>
  )
}
