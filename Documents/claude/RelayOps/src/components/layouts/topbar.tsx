'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { signOutAction } from '@/lib/actions/auth.actions'

interface TopbarProps {
  email: string
  role: string
}

export function Topbar({ email, role }: TopbarProps) {
  const router = useRouter()
  const [isSigningOut, startSignOutTransition] = useTransition()

  async function handleLogout() {
    startSignOutTransition(async () => {
      const result = await signOutAction()
      if (result.success) {
        router.push('/login')
        router.refresh()
      }
    })
  }

  const initials = email
    .split('@')[0]
    .slice(0, 2)
    .toUpperCase()

  const roleLabel: Record<string, string> = {
    admin: 'Admin',
    partner: 'Partner',
    worker_internal: 'Worker',
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 shadow-[0_16px_42px_-36px_rgba(15,23,42,0.5)] backdrop-blur-xl sm:px-6">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-zinc-950 focus:px-4 focus:py-2 focus:text-white"
      >
        跳至主要内容
      </a>
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/90 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-blue-500" aria-hidden="true" />
        {roleLabel[role] ?? role}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-10 w-10 rounded-full border border-slate-200/80 bg-white/90 p-0 shadow-sm hover:bg-slate-50 hover:shadow-md"
            aria-label={`${roleLabel[role] ?? role} account menu`}
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-100 text-xs font-semibold text-blue-700 ring-1 ring-blue-200/70">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-60 rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.38)]"
        >
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium truncate">{email}</p>
            <p className="text-xs text-muted-foreground">{roleLabel[role] ?? role}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/settings/profile">
              <User className="mr-2 h-4 w-4" aria-hidden="true" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={isSigningOut}
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            {isSigningOut ? 'Signing out...' : 'Sign out'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
