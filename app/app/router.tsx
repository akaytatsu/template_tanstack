import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { RouteErrorComponent } from '@/components/route-error'

export function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: RouteErrorComponent,
    context: {
      auth: undefined as { isAuthenticated: boolean } | undefined,
    },
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
  interface RouterContext {
    auth?: { isAuthenticated: boolean }
  }
}
