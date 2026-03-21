'use client'

import { AnimatePresence, m } from 'framer-motion'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { SidebarNav } from './sidebar-nav'
import { Topbar } from './topbar'
import { Button } from '@/components/ui/button'
import {
  MOTION_DURATIONS,
  MOTION_EASE,
  MotionProvider,
  SlideUp,
  useReducedMotionPreference,
} from '@/components/ui/motion'
import { cn } from '@/lib/utils/cn'
import type { UserRole } from '@/lib/types/enums'

interface DashboardChromeProps {
  children: React.ReactNode
  email: string
  role: UserRole
}

const SIDEBAR_WIDTH = {
  expanded: 240,
  collapsed: 88,
} as const

export function DashboardChrome(props: DashboardChromeProps) {
  return (
    <MotionProvider>
      <DashboardChromeFrame {...props} />
    </MotionProvider>
  )
}

function DashboardChromeFrame({ children, email, role }: DashboardChromeProps) {
  const pathname = usePathname()
  const reduced = useReducedMotionPreference()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_46%,#f1f5f9_100%)]">
      <m.aside
        data-testid="dashboard-sidebar"
        data-collapsed={collapsed ? 'true' : 'false'}
        initial={false}
        animate={
          reduced
            ? undefined
            : { width: collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded }
        }
        transition={
          reduced
            ? undefined
            : { duration: MOTION_DURATIONS.base, ease: MOTION_EASE }
        }
        className="relative hidden shrink-0 overflow-hidden border-r border-zinc-800/90 bg-zinc-950 shadow-[24px_0_60px_-48px_rgba(15,23,42,0.95)] md:flex md:flex-col"
        style={
          reduced
            ? { width: collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded }
            : {
                width: collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded,
                willChange: 'width',
            }
        }
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.24),transparent_60%)]"
        />

        <div className="relative h-16 border-b border-white/10">
          <div
            className={cn(
              'flex h-full items-center',
              collapsed ? 'justify-center px-3' : 'justify-between px-4'
            )}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 shadow-[0_16px_30px_-18px_rgba(59,130,246,0.75)] backdrop-blur-sm">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 4h4v4H2V4zm6 2h4v4H8V6z" fill="white" />
                </svg>
              </div>

              <AnimatePresence initial={false} mode="wait">
                {!collapsed && (
                  <m.span
                    key="wordmark"
                    initial={reduced ? false : { opacity: 0, x: -6 }}
                    animate={reduced ? undefined : { opacity: 1, x: 0 }}
                    exit={reduced ? undefined : { opacity: 0, x: -6 }}
                    transition={
                      reduced
                        ? undefined
                        : { duration: MOTION_DURATIONS.fast, ease: MOTION_EASE }
                    }
                    className="truncate text-xs font-semibold uppercase tracking-[0.24em] text-white/95"
                    style={reduced ? undefined : { willChange: 'transform, opacity' }}
                  >
                    RelayOps
                  </m.span>
                )}
              </AnimatePresence>
            </div>

            {!collapsed && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Collapse sidebar"
                aria-pressed={collapsed}
                onClick={() => setCollapsed(true)}
                className="h-9 w-9 shrink-0 rounded-xl border border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/10 hover:text-white"
              >
                <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>

          {collapsed && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Expand sidebar"
              aria-pressed={collapsed}
              onClick={() => setCollapsed(false)}
              className="absolute right-2 top-3.5 h-9 w-9 rounded-xl border border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/10 hover:text-white"
            >
              <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>

        <SidebarNav role={role} collapsed={collapsed} />
      </m.aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <Topbar email={email} role={role} />
        <main
          id="main-content"
          className="flex-1 overflow-auto px-4 py-5 sm:px-6 lg:px-10 lg:py-8"
        >
          <SlideUp key={pathname} className="h-full">
            {children}
          </SlideUp>
        </main>
      </div>
    </div>
  )
}
