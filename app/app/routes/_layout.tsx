'use client'

import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppLayout } from '@/components/layout/app-layout'
import { isAuthenticated } from '@/lib/api'
import { checkServerAuth } from '@/lib/server-fns'

// Everything nested under `_layout` requires an authenticated session.
export const Route = createFileRoute('/_layout')({
  component: ProtectedLayout,
  beforeLoad: async ({ location }) => {
    if (!isAuthenticated()) {
      // On the server, fall back to the cookie-based check before redirecting.
      if (typeof window === 'undefined') {
        const auth = await checkServerAuth({ data: undefined })
        if (auth?.authenticated) return
      }
      throw redirect({
        to: '/login',
        search: { redirect: location.pathname },
      })
    }
  },
})

function ProtectedLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
