'use client'

import React, { useState, useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from '@/components/ui/sidebar'
import { TopBar } from '@/components/ui/topbar'

const SIDEBAR_COLLAPSED_KEY = 'app.sidebar.collapsed'

const collapseListeners = new Set<() => void>()

function getCollapsedSnapshot(): boolean {
  return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
}

function getCollapsedServerSnapshot(): boolean {
  return false
}

function subscribeCollapsed(callback: () => void): () => void {
  collapseListeners.add(callback)
  window.addEventListener('storage', callback)
  return () => {
    collapseListeners.delete(callback)
    window.removeEventListener('storage', callback)
  }
}

function setCollapsedStore(next: boolean): void {
  window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next))
  collapseListeners.forEach((listener) => listener())
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    getCollapsedSnapshot,
    getCollapsedServerSnapshot,
  )

  const toggleCollapsed = () => setCollapsedStore(!collapsed)

  return (
    <div className="flex min-h-screen bg-surface-dim">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed}
      />
      <div
        className={cn(
          'flex-1 min-w-0 flex flex-col min-h-screen transition-[margin] duration-200 ease-out',
          collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]',
        )}
      >
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 animate-fade-in">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  )
}
