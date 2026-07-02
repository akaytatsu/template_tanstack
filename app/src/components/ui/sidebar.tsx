'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { SITE } from '@/lib/site'
import {
  X,
  LayoutDashboard,
  LayoutList,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Boxes,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'

// Edit these groups to match your app. Groups flagged `adminOnly`
// are hidden unless the current user is an admin.
const navGroups = [
  {
    label: 'WORKSPACE',
    adminOnly: false,
    items: [{ icon: LayoutList, label: 'Examples', to: '/example' }],
  },
  {
    label: 'ADMIN',
    adminOnly: true,
    items: [{ icon: Settings, label: 'Settings', to: '/settings' }],
  },
] as const

export function Sidebar({
  open = false,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: {
  open?: boolean
  onClose?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  useEffect(() => {
    onClose?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          'fixed left-0 top-0 w-[260px] h-screen bg-surface-container-lowest flex flex-col overflow-y-auto overflow-x-hidden z-[120] transition-[transform,width] duration-200 ease-out lg:translate-x-0 lg:z-10',
          open ? 'translate-x-0' : '-translate-x-full',
          collapsed && 'lg:w-[72px]',
        )}
        data-collapsed={collapsed ? 'true' : 'false'}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div
          className={cn(
            'flex items-center gap-3 px-4 py-5',
            collapsed && 'lg:flex-col lg:gap-3 lg:px-0',
          )}
        >
          <div className="w-8 h-8 rounded-md gradient-primary flex items-center justify-center shrink-0">
            <Boxes className="w-4 h-4 text-surface-container-lowest" strokeWidth={1.5} />
          </div>
          <div className={cn('flex flex-col flex-1 min-w-0', collapsed && 'lg:hidden')}>
            <span className="text-[13px] font-semibold text-on-surface tracking-wide truncate">
              {SITE.shortName}
            </span>
            {user?.isAdmin && (
              <span className="text-code-sm text-on-surface-variant/50">Admin</span>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center p-1.5 rounded-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors shrink-0"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4" strokeWidth={1.5} />
            ) : (
              <PanelLeftClose className="w-4 h-4" strokeWidth={1.5} />
            )}
          </button>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 -mr-1 rounded-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-6">
          <div>
            <NavItem
              icon={LayoutDashboard}
              label="Home"
              to="/"
              isActive={location.pathname === '/'}
              collapsed={collapsed}
            />
          </div>

          {navGroups
            .filter((group) => !group.adminOnly || user?.isAdmin)
            .map((group) => (
              <div key={group.label}>
                <div className={cn('px-3 mb-1', collapsed && 'lg:hidden')}>
                  <span className="text-label-sm text-on-surface-variant/60">{group.label}</span>
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <NavItem
                      key={item.to}
                      icon={item.icon}
                      label={item.label}
                      to={item.to}
                      isActive={
                        location.pathname === item.to || location.pathname.startsWith(item.to + '/')
                      }
                      collapsed={collapsed}
                    />
                  ))}
                </div>
              </div>
            ))}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 py-4 space-y-3 border-t border-on-surface-variant/10">
          <button
            onClick={() => logout((to) => navigate({ to }))}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 text-body-sm text-on-surface-variant/50 hover:text-k-error transition-colors w-full',
              collapsed && 'lg:justify-center lg:px-0',
            )}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            <span className={cn(collapsed && 'lg:hidden')}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

function NavItem({
  icon: Icon,
  label,
  to,
  isActive,
  collapsed = false,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  to: string
  isActive: boolean
  collapsed?: boolean
}) {
  return (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      className={cn(
        'flex items-center gap-3 h-10 px-3 rounded-sm text-body-sm transition-all',
        isActive
          ? 'bg-surface-container-high text-on-surface border-l-[3px] border-k-primary-container'
          : 'text-on-surface-variant hover:bg-surface-container-high/50 border-l-[3px] border-transparent',
        collapsed && 'lg:justify-center lg:gap-0 lg:px-0',
      )}
    >
      <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
      <span className={cn('truncate', collapsed && 'lg:hidden')}>{label}</span>
    </Link>
  )
}
