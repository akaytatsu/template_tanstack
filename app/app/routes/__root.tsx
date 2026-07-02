'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from '@/lib/auth'
import { clearAuthFlag, removeToken } from '@/lib/api'
import { logout } from '@/lib/server-fns'
import { SITE } from '@/lib/site'
import { Toaster } from 'sonner'
import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import '@/index.css'

function isAuthError(error: unknown): boolean {
  if (!error) return false
  if ((error as { status?: number }).status === 401) return true
  const msg = error instanceof Error ? error.message : ''
  return msg.toLowerCase().includes('unauthorized')
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { title: SITE.name },
      { name: 'description', content: SITE.description },
      { name: 'theme-color', content: SITE.themeColor },
      { name: 'application-name', content: SITE.name },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: SITE.name },
    ],
    links: [
      { rel: 'manifest', href: '/manifest.webmanifest' },
      { rel: 'icon', href: '/icons/icon.svg', type: 'image/svg+xml' },
      { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
    ],
  }),
  component: RootLayout,
})

function RootLayout() {
  const [queryClient] = useState(() => {
    // Centralize 401 handling: any query/mutation that errors with an auth
    // failure clears the session and bounces to /login.
    const onAuthError = (error: unknown) => {
      if (typeof window === 'undefined' || !isAuthError(error)) return
      if (window.location.pathname === '/login') return
      clearAuthFlag()
      removeToken()
      void logout()
        .catch(() => {})
        .finally(() => {
          window.location.href = '/login'
        })
    }
    return new QueryClient({
      queryCache: new QueryCache({ onError: onAuthError }),
      mutationCache: new MutationCache({ onError: onAuthError }),
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5,
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    })
  })

  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Outlet />
            <Toaster theme="dark" richColors position="bottom-right" />
          </AuthProvider>
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
