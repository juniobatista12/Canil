import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { UIText } from '@/components/ui/text'

type PaginationProps = {
  page: number
  totalPages: number
  onPrevious: () => void
  onNext: () => void
}

export function Pagination({ page, totalPages, onPrevious, onNext }: PaginationProps) {
  const { t } = useTranslation()
  if (totalPages <= 1) return null

  return (
    <View className="mt-4 flex-row items-center justify-between gap-2">
      <Button
        title={t('common.previous')}
        variant="outline"
        onPress={onPrevious}
        disabled={page <= 1}
        accessibilityLabel={t('common.previous')}
      />
      <UIText accessibilityRole="text">
        {t('common.page', { page, total: totalPages })}
      </UIText>
      <Button
        title={t('common.next')}
        variant="outline"
        onPress={onNext}
        disabled={page >= totalPages}
        accessibilityLabel={t('common.next')}
      />
    </View>
  )
}
