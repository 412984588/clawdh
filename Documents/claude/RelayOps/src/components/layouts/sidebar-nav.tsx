'use client'

import { AnimatePresence, m } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Ticket,
  Users,
  Building2,
  Wallet,
  Settings,
  ClipboardList,
  FileCheck,
  AlertTriangle,
} from 'lucide-react'
import {
  MOTION_DURATIONS,
  MOTION_EASE,
  useReducedMotionPreference,
} from '@/components/ui/motion'
import { cn } from '@/lib/utils/cn'
import type { UserRole } from '@/lib/types/enums'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

const ADMIN_NAV: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/tickets', label: 'Tickets', icon: Ticket },
  { href: '/admin/partners', label: 'Partners', icon: Building2 },
  { href: '/admin/workers', label: 'Workers', icon: Users },
  { href: '/admin/ledger', label: 'Ledger', icon: Wallet },
  { href: '/admin/disputes', label: 'Disputes', icon: AlertTriangle },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

const PARTNER_NAV: NavItem[] = [
  { href: '/partner', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/partner/tickets', label: 'Tickets', icon: Ticket },
  { href: '/partner/billing', label: 'Billing', icon: Wallet },
]

const WORKER_NAV: NavItem[] = [
  { href: '/worker', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/worker/assignments', label: 'My Assignments', icon: ClipboardList },
  { href: '/worker/submissions', label: 'Submissions', icon: FileCheck },
  { href: '/worker/earnings', label: 'Earnings', icon: Wallet },
]

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  admin: ADMIN_NAV,
  partner: PARTNER_NAV,
  worker_internal: WORKER_NAV,
}

interface SidebarNavProps {
  collapsed?: boolean
  role: UserRole
}

export function SidebarNav({ role, collapsed = false }: SidebarNavProps) {
  const pathname = usePathname()
  const reduced = useReducedMotionPreference()
  const navItems = NAV_BY_ROLE[role] ?? []

  return (
    <nav
      className={cn('flex flex-1 flex-col gap-1.5 py-5', collapsed ? 'px-2.5' : 'px-3.5')}
    >
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            title={collapsed ? item.label : undefined}
            className={cn(
              'group relative flex min-h-11 items-center overflow-hidden rounded-2xl py-2.5 text-sm font-medium transition-all duration-200',
              collapsed ? 'justify-center px-0' : 'gap-3 px-3.5',
              isActive
                ? 'bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_30px_-26px_rgba(59,130,246,0.95)] ring-1 ring-white/10'
                : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
            )}
          >
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-blue-400"
              />
            )}

            <span
              className={cn(
                'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-colors',
                isActive
                  ? 'border-white/10 bg-blue-500/20 text-blue-100'
                  : 'border-white/5 bg-white/[0.03] text-zinc-400 group-hover:border-white/10 group-hover:bg-white/[0.07] group-hover:text-zinc-100'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
            </span>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <m.span
                  key={`${item.href}-label`}
                  initial={reduced ? false : { opacity: 0, x: -6, scale: 0.96 }}
                  animate={reduced ? undefined : { opacity: 1, x: 0, scale: 1 }}
                  exit={reduced ? undefined : { opacity: 0, x: -6, scale: 0.96 }}
                  transition={
                    reduced
                      ? undefined
                      : { duration: MOTION_DURATIONS.fast, ease: MOTION_EASE }
                  }
                  className="truncate"
                  style={reduced ? undefined : { willChange: 'transform, opacity' }}
                >
                  {item.label}
                </m.span>
              )}
            </AnimatePresence>
          </Link>
        )
      })}
    </nav>
  )
}
