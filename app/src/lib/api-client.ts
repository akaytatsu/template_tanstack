import { getToken } from './api'

/**
 * Returns the base URL for the backend API.
 * On the server (SSR), reads from process.env.API_BASE_URL.
 * On the client, the origin comes entirely from VITE_API_DOMAIN: a bare host
 * (e.g. "api.example.com") is assumed to be https, while a value that already
 * carries a scheme (e.g. "http://localhost:8080") is used verbatim. The page
 * protocol (window.location) is intentionally NOT used.
 */
function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.API_BASE_URL || 'http://localhost:8080'
  }

  // Browser: VITE_API_DOMAIN is inlined into the bundle at build time (or read
  // from the dev-server env). The whole origin derives from it.
  const domain = import.meta.env.VITE_API_DOMAIN as string | undefined
  if (!domain) return 'http://localhost:8080'
  const origin = /^https?:\/\//i.test(domain) ? domain : `https://${domain}`
  return origin.replace(/\/+$/, '')
}

interface ApiResponse<T> {
  data: T | null
  status: number
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: { auth?: boolean },
): Promise<ApiResponse<T>> {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}/api/${path.replace(/^\/+/, '')}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (options?.auth !== false) {
    const token = getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = res.status === 204 ? null : await res.json()
    return { data, status: res.status }
  } catch {
    return { data: null, status: 0 }
  }
}

export const api = {
  get: <T>(path: string, options?: { auth?: boolean }) =>
    request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: { auth?: boolean }) =>
    request<T>('POST', path, body, options),
  put: <T>(path: string, body?: unknown, options?: { auth?: boolean }) =>
    request<T>('PUT', path, body, options),
  delete: <T>(path: string, options?: { auth?: boolean }) =>
    request<T>('DELETE', path, undefined, options),
}
