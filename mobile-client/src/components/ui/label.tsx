import { View, type ViewProps } from 'react-native'
import { cn } from '@/lib/utils'
import { UIText } from '@/components/ui/text'

export function Label({
  className,
  title,
  ...props
}: ViewProps & { className?: string; title: string }) {
  return (
    <View className={cn('mb-1', className)} {...props}>
      <UIText className="text-sm font-medium">{title}</UIText>
    </View>
  )
}
