'use client'

import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth'
import { SITE } from '@/lib/site'
import { Button } from '@/components/ui/button'
import { ArrowRight, Boxes } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <div className="min-h-screen bg-surface-dim" />
  }

  return (
    <div className="min-h-screen bg-surface-dim flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-6 text-center max-w-lg">
        <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
          <Boxes className="w-7 h-7 text-surface-container-lowest" strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h1 className="text-display-sm text-on-surface">{SITE.name}</h1>
          <p className="text-body-sm text-on-surface-variant max-w-md">
            A TanStack Start starter wired with TanStack Router, TanStack Query, auth, and the
            Cortex design system. Edit <code className="text-code-sm">app/routes</code> to begin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Button asChild>
              <Link to="/example">
                Go to examples
                <ArrowRight />
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/login">
                Sign in
                <ArrowRight />
              </Link>
            </Button>
          )}
        </div>

        {isAuthenticated && user && (
          <p className="text-code-sm text-on-surface-variant/60">Signed in as {user.email}</p>
        )}
      </div>
    </div>
  )
}
