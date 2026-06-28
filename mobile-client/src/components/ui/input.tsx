import { TextInput, type TextInputProps } from 'react-native'
import { cn } from '@/lib/utils'

export function Input({ className, ...props }: TextInputProps & { className?: string }) {
  return (
    <TextInput
      className={cn(
        'border-input bg-background text-foreground rounded-md border px-3 py-3 text-base',
        className,
      )}
      placeholderTextColor="#9ca3af"
      {...props}
    />
  )
}
