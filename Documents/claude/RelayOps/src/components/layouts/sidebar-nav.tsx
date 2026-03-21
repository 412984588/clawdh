'use client'

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
  role: UserRole
}

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname()
  const navItems = NAV_BY_ROLE[role] ?? []

  return (
    <nav className="flex flex-col gap-0.5 px-3 py-4 flex-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-blue-500/20 text-white shadow-[inset_0_0_0_1px_rgba(96,165,250,0.22)]'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
