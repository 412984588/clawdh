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
    <header className="h-14 border-b border-zinc-200 bg-white/95 backdrop-blur-sm flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white"
      >
        跳至主要内容
      </a>
      <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
        {roleLabel[role] ?? role}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium truncate">{email}</p>
            <p className="text-xs text-muted-foreground">{roleLabel[role] ?? role}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/settings/profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={isSigningOut}
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isSigningOut ? 'Signing out...' : 'Sign out'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
