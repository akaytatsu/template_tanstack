import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-body-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'gradient-primary text-surface-container-lowest hover:brightness-110',
        secondary:
          'bg-transparent ghost-border-20 border text-on-surface hover:bg-surface-container-high/50',
        destructive: 'bg-k-error/20 text-k-error border border-k-error/40 hover:bg-k-error/30',
        ghost: 'hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface',
        outline:
          'border ghost-border bg-transparent hover:bg-surface-container-high/50 text-on-surface',
        link: 'text-k-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-3 py-2',
        sm: 'h-8 px-3 text-label-sm',
        lg: 'h-10 px-4',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
