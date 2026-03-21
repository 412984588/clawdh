import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/utils/get-session-user'
import { DashboardChrome } from './dashboard-chrome'
import type { UserRole } from '@/lib/types/enums'

export async function DashboardShell({ children }: { children: React.ReactNode }) {
  // React.cache ensures auth + role is queried only once per request
  const sessionUser = await getSessionUser()

  if (!sessionUser) {
    redirect('/login')
  }

  const role = sessionUser.role as UserRole
  const email = sessionUser.email as string

  return <DashboardChrome role={role} email={email}>{children}</DashboardChrome>
}
