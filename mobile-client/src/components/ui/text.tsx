import { Text, type TextProps } from 'react-native'
import { cn } from '@/lib/utils'

export function UIText({ className, ...props }: TextProps & { className?: string }) {
  return <Text className={cn('text-foreground text-base', className)} {...props} />
}
