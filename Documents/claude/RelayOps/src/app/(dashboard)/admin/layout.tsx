import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/utils/get-session-user'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('admin')
  if (!user) redirect('/login')

  return <>{children}</>
}
