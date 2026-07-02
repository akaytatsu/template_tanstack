// Client-side token/session helpers.
// The JWT is stored twice: as an httpOnly-style cookie set by the server
// functions (used during SSR) and in localStorage (used by the browser
// api-client). Keep the two names in sync — see server-fns.ts.
const TOKEN_KEY = 'app_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function isUnauthorized(status: number): boolean {
  return status === 401
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (!payload.exp) return false
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

// In-memory flag set once the server confirms the session, so we don't
// re-validate on every navigation within a single page load.
let authValidated = false

export function markAuthenticated(): void {
  authValidated = true
}

export function clearAuthFlag(): void {
  authValidated = false
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  if (authValidated) return true

  const localToken = getToken()
  return localToken ? !isTokenExpired(localToken) : false
}

const ADMIN_FLAG_KEY = 'app.admin'

export function setAdminFlag(isAdmin: boolean): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ADMIN_FLAG_KEY, String(isAdmin))
  }
}

export function isAdminUser(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(ADMIN_FLAG_KEY) === 'true'
}

export function removeAdminFlag(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ADMIN_FLAG_KEY)
  }
}
