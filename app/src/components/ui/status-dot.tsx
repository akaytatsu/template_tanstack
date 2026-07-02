import { cn } from '@/lib/utils'

interface StatusDotProps {
  status:
    | 'active'
    | 'success'
    | 'inactive'
    | 'offline'
    | 'failed'
    | 'error'
    | 'running'
    | 'warning'
    | 'pending'
  size?: 'sm' | 'md'
  pulse?: boolean
}

const statusColors: Record<string, string> = {
  active: 'bg-k-secondary',
  success: 'bg-k-secondary',
  inactive: 'bg-on-surface-variant/50',
  offline: 'bg-on-surface-variant/50',
  failed: 'bg-k-error',
  error: 'bg-k-error',
  running: 'bg-k-primary-container',
  warning: 'bg-k-warning',
  pending: 'bg-on-surface-variant/40',
}

export function StatusDot({ status, size = 'sm', pulse = true }: StatusDotProps) {
  const colorClass = statusColors[status] || statusColors.pending
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
  const ringSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'

  return (
    <div className="relative flex items-center justify-center w-5 h-5">
      <div className={cn('rounded-full', dotSize, colorClass)} />
      {pulse && (status === 'active' || status === 'success' || status === 'running') && (
        <div
          className={cn('absolute rounded-full animate-pulse-ring', ringSize, colorClass)}
          style={{ opacity: 0.2 }}
        />
      )}
    </div>
  )
}
