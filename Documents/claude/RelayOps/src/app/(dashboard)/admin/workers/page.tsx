import { redirect } from 'next/navigation'
import { Users } from 'lucide-react'
import { requireRole } from '@/lib/utils/get-session-user'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'Workers — RelayOps',
}

export default async function AdminWorkersPage() {
  const sessionUser = await requireRole('admin')
  if (!sessionUser) redirect('/login')

  return (
    <div className="dashboard-page">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-slate-500" />
        <h1 className="text-2xl font-bold">Workers</h1>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-10 w-10 text-slate-300 mb-4" />
          <p className="text-muted-foreground text-sm">Worker management is under development.</p>
        </CardContent>
      </Card>
    </div>
  )
}
