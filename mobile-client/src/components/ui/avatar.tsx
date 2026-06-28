import { View } from 'react-native'
import { cn } from '@/lib/utils'
import { UIText } from '@/components/ui/text'

export function Avatar({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  const initials = label
    .split('@')[0]
    .slice(0, 2)
    .toUpperCase()
  return (
    <View
      className={cn(
        'bg-primary h-10 w-10 items-center justify-center rounded-full',
        className,
      )}
      accessibilityRole="image"
    >
      <UIText className="text-primary-foreground text-sm font-semibold">{initials}</UIText>
    </View>
  )
}
