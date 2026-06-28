import { View } from 'react-native'
import { cn } from '@/lib/utils'
import { UIText } from '@/components/ui/text'

export function Badge({
  label,
  variant = 'default',
  className,
}: {
  label: string
  variant?: 'default' | 'secondary' | 'outline'
  className?: string
}) {
  const variants = {
    default: 'bg-primary',
    secondary: 'bg-secondary',
    outline: 'border border-border bg-transparent',
  }
  const textVariants = {
    default: 'text-primary-foreground',
    secondary: 'text-secondary-foreground',
    outline: 'text-foreground',
  }
  return (
    <View className={cn('self-start rounded-full px-2 py-1', variants[variant], className)}>
      <UIText className={cn('text-xs font-medium', textVariants[variant])}>{label}</UIText>
    </View>
  )
}

export function RoleBadges({ roles }: { roles: string[] }) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {roles.map((role) => (
        <Badge key={role} label={role} variant="secondary" />
      ))}
    </View>
  )
}
