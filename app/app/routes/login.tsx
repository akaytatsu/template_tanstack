'use client'

import React, { useState } from 'react'
import { createFileRoute, useNavigate, useSearch, redirect } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth'
import { isAuthenticated } from '@/lib/api'
import { checkServerAuth } from '@/lib/server-fns'
import { SITE } from '@/lib/site'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, ArrowRight, Boxes } from 'lucide-react'

export const Route = createFileRoute('/login')({
  component: LoginPage,
  beforeLoad: async () => {
    if (isAuthenticated()) {
      throw redirect({ to: '/' })
    }
    if (typeof window === 'undefined') {
      const auth = await checkServerAuth({ data: undefined })
      if (auth?.authenticated) {
        throw redirect({ to: '/' })
      }
    }
  },
})

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { redirect?: string }
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    const ok = await login(email, password)
    setIsLoading(false)
    if (ok) {
      navigate({ to: search.redirect || '/' })
    } else {
      setError('Invalid email or password.')
    }
  }

  return (
    <div className="min-h-screen bg-surface-dim flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Boxes className="w-6 h-6 text-surface-container-lowest" strokeWidth={1.5} />
          </div>
          <h1 className="text-title-sm text-on-surface">Sign in to {SITE.shortName}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                ) : (
                  <Eye className="w-4 h-4" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          {error && <p className="text-body-sm text-k-error">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign in'}
            {!isLoading && <ArrowRight />}
          </Button>
        </form>
      </div>
    </div>
  )
}
