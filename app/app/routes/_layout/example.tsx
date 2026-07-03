'use client'

import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, Inbox } from 'lucide-react'
import { useExamples } from '@/lib/queries/example'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { safeFormatDistanceToNow } from '@/lib/utils'
import type { ExampleStatus } from '@/types/example'

export const Route = createFileRoute('/_layout/example')({
  component: ExampleListPage,
})

const statusVariant: Record<ExampleStatus, 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  draft: 'secondary',
  archived: 'outline',
}

function ExampleListPage() {
  const { data, isLoading, isError } = useExamples()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title-sm text-on-surface">Examples</h1>
          <p className="text-body-sm text-on-surface-variant">
            A sample CRUD entity wired with TanStack Query.
          </p>
        </div>
        <Button asChild>
          <Link to="/example/new">
            <Plus />
            New example
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <Card>
          <CardHeader>
            <CardTitle>Could not load examples</CardTitle>
            <CardDescription>
              Point <code className="text-code-sm">VITE_API_DOMAIN</code> at a backend that serves{' '}
              <code className="text-code-sm">/api/examples</code>, or edit{' '}
              <code className="text-code-sm">lib/queries/example.ts</code>.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Inbox className="w-8 h-8 text-on-surface-variant/40" strokeWidth={1.5} />
          <p className="text-body-sm text-on-surface-variant">No examples yet.</p>
        </div>
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((item) => (
            <Link key={item.id} to="/example/$id" params={{ id: String(item.id) }}>
              <Card className="h-full transition-colors hover:border-k-primary-container/40">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="truncate">{item.title}</CardTitle>
                    <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                  <span className="text-code-sm text-on-surface-variant/50">
                    Updated {safeFormatDistanceToNow(item.updated_at)}
                  </span>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
