'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ErrorComponentProps } from '@tanstack/react-router'

export function RouteErrorComponent({ error, reset }: ErrorComponentProps) {
  const message = error instanceof Error ? error.message : String(error)

  return (
    <div className="min-h-screen bg-surface-dim flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <AlertTriangle className="size-8 text-destructive" />
        <div className="space-y-1">
          <p className="text-foreground font-medium">Something went wrong</p>
          {message ? <p className="text-muted-foreground text-sm break-words">{message}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => reset()} variant="outline" size="sm">
            Try again
          </Button>
          <Button onClick={() => window.location.reload()} size="sm">
            <RefreshCw />
            Reload
          </Button>
        </div>
      </div>
    </div>
  )
}
