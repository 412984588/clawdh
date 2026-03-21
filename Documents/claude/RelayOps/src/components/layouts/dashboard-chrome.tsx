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
    <div className="min-h-screen bg-zinc-50 flex">
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
        className="hidden shrink-0 overflow-hidden border-r border-zinc-800 bg-zinc-950 md:flex md:flex-col"
        style={
          reduced
            ? { width: collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded }
            : {
                width: collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded,
                willChange: 'width',
              }
        }
      >
        <div className="relative h-14 border-b border-zinc-800">
          <div
            className={cn(
              'flex h-full items-center',
              collapsed ? 'justify-center px-3' : 'justify-between px-4'
            )}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500 shadow-[0_10px_30px_-18px_rgba(59,130,246,0.8)]">
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
                    className="truncate text-white font-semibold tracking-tight"
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
                className="h-8 w-8 shrink-0 text-zinc-400 hover:bg-white/5 hover:text-white"
              >
                <PanelLeftClose className="h-4 w-4" />
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
              className="absolute right-2 top-3 h-8 w-8 text-zinc-400 hover:bg-white/5 hover:text-white"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          )}
        </div>

        <SidebarNav role={role} collapsed={collapsed} />
      </m.aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <Topbar email={email} role={role} />
        <main id="main-content" className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
          <SlideUp key={pathname} className="h-full">
            {children}
          </SlideUp>
        </main>
      </div>
    </div>
  )
}
