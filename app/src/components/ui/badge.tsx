import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-label-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-surface-container-high text-on-surface-variant',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-k-error/20 text-k-error',
        success: 'bg-k-secondary/20 text-k-secondary',
        warning: 'bg-k-warning/20 text-k-warning',
        primary: 'bg-k-primary/20 text-k-primary',
        outline: 'text-on-surface-variant border ghost-border',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
