import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/utils/get-session-user'

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('worker_internal')
  if (!user) redirect('/login')

  return <>{children}</>
}
