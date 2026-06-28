import { View } from 'react-native'
import { cn } from '@/lib/utils'

export function Separator({ className }: { className?: string }) {
  return <View className={cn('bg-border my-3 h-px w-full', className)} />
}
