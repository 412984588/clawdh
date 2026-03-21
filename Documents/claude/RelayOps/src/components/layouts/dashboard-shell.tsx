import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/utils/get-session-user'
import { DashboardChrome } from './dashboard-chrome'
import type { UserRole } from '@/lib/types/enums'

export async function DashboardShell({ children }: { children: React.ReactNode }) {
  // React.cache 保证同请求内 auth + role 只查一次
  const sessionUser = await getSessionUser()

  if (!sessionUser) {
    redirect('/login')
  }

  const role = sessionUser.role as UserRole
  const email = sessionUser.email as string

  return <DashboardChrome role={role} email={email}>{children}</DashboardChrome>
}
