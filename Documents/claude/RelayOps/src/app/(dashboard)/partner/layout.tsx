import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/utils/get-session-user'

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('partner')
  if (!user) redirect('/login')

  return <>{children}</>
}
