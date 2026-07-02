import { createServerFn } from '@tanstack/react-start'

// ── Server-side API base URL (never exposed to the browser) ──
// Set API_BASE_URL in the environment (see .env.sample). Used only during SSR.
const apiBaseUrl = () => process.env.API_BASE_URL || ''

// Cookie name must match the localStorage key used client-side (see api.ts).
const TOKEN_COOKIE = 'app_token'

/**
 * Exchanges credentials for a JWT and stores it as a cookie so SSR requests
 * can read it. Adjust the endpoint/shape to match your backend.
 */
export const login = createServerFn({ method: 'POST' })
  .validator((d: { email: string; password: string }) => ({
    email: String(d.email),
    password: String(d.password),
  }))
  .handler(async ({ data: { email, password } }) => {
    try {
      const res = await fetch(`${apiBaseUrl()}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (res.ok && data.token) {
        const { setCookie } = await import('@tanstack/react-start/server')
        setCookie(TOKEN_COOKIE, data.token, {
          path: '/',
          maxAge: 60 * 60 * 24, // 24h
          sameSite: 'lax',
          secure: true,
        })
      }

      return { data, status: res.status }
    } catch {
      return { data: null, status: 401 }
    }
  })

/** Returns the current user for the session cookie (used to hydrate auth on SSR). */
export const fetchCurrentUser = createServerFn({ method: 'POST' }).handler(async () => {
  try {
    const { getCookie } = await import('@tanstack/react-start/server')
    const token = getCookie(TOKEN_COOKIE)
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${apiBaseUrl()}/api/user/me`, { headers })
    const data = await res.json()
    return { data, status: res.status }
  } catch {
    return { data: null, status: 401 }
  }
})

/** Clears the session cookie. */
export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  const { deleteCookie } = await import('@tanstack/react-start/server')
  deleteCookie(TOKEN_COOKIE, { path: '/' })
  return { success: true }
})

/**
 * Cheap SSR auth check straight from the JWT (no backend round-trip).
 * Used by route `beforeLoad` guards to avoid a flash of the login page.
 */
export const checkServerAuth = createServerFn({ method: 'POST' }).handler(async () => {
  const { getCookie } = await import('@tanstack/react-start/server')
  const token = getCookie(TOKEN_COOKIE)
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (!payload.exp || payload.exp * 1000 > Date.now()) {
        return { authenticated: true }
      }
    } catch {
      // invalid token → treated as unauthenticated
    }
  }
  return { authenticated: false }
})
