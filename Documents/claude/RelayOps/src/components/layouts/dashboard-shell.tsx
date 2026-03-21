import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/utils/get-session-user'
import { SidebarNav } from './sidebar-nav'
import { Topbar } from './topbar'
import type { UserRole } from '@/lib/types/enums'

export async function DashboardShell({ children }: { children: React.ReactNode }) {
  // React.cache 保证同请求内 auth + role 只查一次
  const sessionUser = await getSessionUser()

  if (!sessionUser) {
    redirect('/login')
  }

  const role = sessionUser.role as UserRole
  const email = sessionUser.email as string

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <aside className="w-60 shrink-0 hidden md:flex flex-col bg-zinc-950 border-r border-zinc-800">
        <div className="h-14 flex items-center px-5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-blue-500 flex items-center justify-center shrink-0 shadow-[0_10px_30px_-18px_rgba(59,130,246,0.8)]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 4h4v4H2V4zm6 2h4v4H8V6z" fill="white" />
              </svg>
            </div>
            <span className="text-white font-semibold tracking-tight">RelayOps</span>
          </div>
        </div>
        <SidebarNav role={role} />
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <Topbar email={email} role={role} />
        <main id="main-content" className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
