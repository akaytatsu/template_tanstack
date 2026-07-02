'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import {
  setToken,
  removeToken,
  isUnauthorized,
  markAuthenticated,
  clearAuthFlag,
  setAdminFlag,
  removeAdminFlag,
} from '@/lib/api'
import {
  login as serverLogin,
  fetchCurrentUser as serverFetchCurrentUser,
  logout as serverLogout,
} from '@/lib/server-fns'

// The app-facing user shape. Adapt to your domain as needed.
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  isAdmin: boolean
  permissions: string[]
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  refreshUser: () => Promise<User | null>
  logout: (navigate?: (to: string) => void) => void
  can: (permission: string) => boolean
}

// Shape returned by GET /api/user/me — adapt to your backend.
export interface MeResponse {
  id: number | string
  name: string
  email: string
  is_admin?: boolean
  permissions?: string[]
}

const AuthContext = createContext<AuthContextType | null>(null)

export function mapUser(data: MeResponse): User {
  return {
    id: String(data.id ?? ''),
    name: data.name ?? '',
    email: data.email ?? '',
    isAdmin: data.is_admin ?? false,
    permissions: data.permissions ?? [],
  }
}

async function fetchCurrentUser(): Promise<User | null> {
  const { data, status } = await serverFetchCurrentUser()
  if (isUnauthorized(status) || !data) {
    clearAuthFlag()
    removeToken()
    removeAdminFlag()
    return null
  }
  markAuthenticated()
  const user = mapUser(data as MeResponse)
  setAdminFlag(user.isAdmin)
  return user
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  })

  React.useEffect(() => {
    fetchCurrentUser()
      .then((user) => {
        setState({ isAuthenticated: !!user, user, isLoading: false })
      })
      .catch(() => {
        clearAuthFlag()
        removeToken()
        removeAdminFlag()
        setState({ isAuthenticated: false, user: null, isLoading: false })
      })
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true }))

    const result = await serverLogin({ data: { email, password } })
    setState((prev) => ({ ...prev, isLoading: false }))

    if (isUnauthorized(result.status) || !result.data) {
      return false
    }

    // Persist the JWT so client-side api-client requests carry the Bearer header.
    setToken(result.data.token)
    markAuthenticated()
    const user = await fetchCurrentUser()
    if (user) {
      setState({ isAuthenticated: true, user, isLoading: false })
      return true
    }
    return false
  }, [])

  const refreshUser = useCallback(async (): Promise<User | null> => {
    const user = await fetchCurrentUser()
    setState({ isAuthenticated: !!user, user, isLoading: false })
    return user
  }, [])

  const logout = useCallback((navigate?: (to: string) => void) => {
    serverLogout().catch(() => {})
    clearAuthFlag()
    removeToken()
    removeAdminFlag()
    setState({ isAuthenticated: false, user: null, isLoading: false })
    navigate?.('/')
  }, [])

  const can = useCallback(
    (permission: string) => {
      if (!state.user) return false
      if (state.user.isAdmin) return true
      return state.user.permissions.includes(permission)
    },
    [state.user],
  )

  return (
    <AuthContext.Provider value={{ ...state, login, refreshUser, logout, can }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useCan() {
  return useAuth().can
}
