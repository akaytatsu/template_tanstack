'use client'

import { Menu, LogOut } from 'lucide-react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth'
import { SITE } from '@/lib/site'
import { getInitials, getAvatarColor } from '@/lib/user-utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

// Maps the first path segment to a breadcrumb label. Extend as you add routes.
const routeNames: Record<string, string> = {
  '': 'Home',
  example: 'Examples',
  settings: 'Settings',
}

function breadcrumbParts(pathname: string): string[] {
  const segments = pathname.split('/').filter(Boolean)
  const root = routeNames[segments[0] ?? '']
  if (!root) return [SITE.name]
  if (segments.length <= 1) return [root]
  const second = segments[1]
  if (second === 'new') return [root, 'New']
  return [root, 'Details']
}

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const location = useLocation()
  const pathname = location.pathname
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const parts = breadcrumbParts(pathname)
  const initials = user ? getInitials(user.name) : '?'
  const avatarColor = user ? getAvatarColor(user.name) : ''

  return (
    <header className="sticky top-0 z-20 h-12 bg-surface-dim flex items-center justify-between gap-3 px-4 sm:px-6 border-b border-on-surface-variant/10">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 -ml-1.5 rounded-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" strokeWidth={1.5} />
        </button>
        {parts.length > 1 ? (
          <>
            <span className="text-body-sm text-on-surface font-medium truncate">{parts[0]}</span>
            <span className="text-on-surface-variant/40">/</span>
            <span className="text-body-sm text-on-surface-variant truncate">{parts[1]}</span>
          </>
        ) : (
          <span className="text-title-sm text-on-surface font-semibold truncate">{parts[0]}</span>
        )}
      </div>

      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none">
              <Avatar className="w-8 h-8 cursor-pointer">
                <AvatarFallback className={`text-label-sm font-medium ${avatarColor}`}>
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-surface-container-low border-on-surface-variant/10 min-w-[200px]"
          >
            {user && (
              <div className="px-2 py-1.5 border-b border-on-surface-variant/10 mb-1">
                <p className="text-body-sm text-on-surface truncate">{user.name}</p>
                <p className="text-code-sm text-on-surface-variant truncate">{user.email}</p>
              </div>
            )}
            <DropdownMenuItem
              className="text-on-surface-variant hover:text-k-error focus:text-k-error focus:bg-surface-container-high cursor-pointer gap-3"
              onClick={() => logout((to) => navigate({ to }))}
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
