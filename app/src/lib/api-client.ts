import { getToken } from './api'

/**
 * Returns the base URL for the backend API.
 * On the server (SSR), reads from process.env.API_BASE_URL.
 * On the client, uses VITE_API_BASE_URL (import.meta.env) to construct the URL.
 */
function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.API_BASE_URL || 'http://localhost:8080'
  }

  // In browser, use VITE_API_BASE_URL from env (set in .env or Docker build-arg)
  return import.meta.env.VITE_API_BASE_URL || ''
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
