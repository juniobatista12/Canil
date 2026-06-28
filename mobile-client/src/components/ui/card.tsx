import { View, type ViewProps } from 'react-native'
import { cn } from '@/lib/utils'
import { UIText } from '@/components/ui/text'

export function Card({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View className={cn('bg-card border-border rounded-lg border p-4', className)} {...props} />
  )
}

export function CardHeader({ className, ...props }: ViewProps & { className?: string }) {
  return <View className={cn('mb-3', className)} {...props} />
}

export function CardTitle({ title, className }: { title: string; className?: string }) {
  return <UIText className={cn('text-lg font-semibold', className)}>{title}</UIText>
}

export function CardContent({ className, ...props }: ViewProps & { className?: string }) {
  return <View className={cn('gap-2', className)} {...props} />
}
