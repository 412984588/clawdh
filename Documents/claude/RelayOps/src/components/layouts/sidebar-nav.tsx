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
    <nav className={cn('flex flex-1 flex-col gap-0.5 py-4', collapsed ? 'px-2' : 'px-3')}>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            title={collapsed ? item.label : undefined}
            className={cn(
              'flex items-center rounded-md py-2 text-sm font-medium transition-colors',
              collapsed ? 'justify-center px-0' : 'gap-3 px-3',
              isActive
                ? 'bg-blue-500/20 text-white shadow-[inset_0_0_0_1px_rgba(96,165,250,0.22)]'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
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
