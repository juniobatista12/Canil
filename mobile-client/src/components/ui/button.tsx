import { Pressable, type PressableProps } from 'react-native'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { UIText } from '@/components/ui/text'

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-md px-4 py-3',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        outline: 'border border-border bg-background',
        destructive: 'bg-destructive',
        ghost: 'bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const labelVariants = cva('text-base font-medium', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      outline: 'text-foreground',
      destructive: 'text-destructive-foreground',
      ghost: 'text-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

type ButtonProps = PressableProps &
  VariantProps<typeof buttonVariants> & {
    className?: string
    labelClassName?: string
    title: string
  }

export function Button({
  variant,
  className,
  labelClassName,
  title,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={cn(buttonVariants({ variant }), disabled && 'opacity-50', className)}
      disabled={disabled}
      accessibilityRole="button"
      {...props}
    >
      <UIText className={cn(labelVariants({ variant }), labelClassName)}>{title}</UIText>
    </Pressable>
  )
}
