import { redirect } from 'next/navigation'
import { Wallet } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/utils/get-session-user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export const metadata = {
  title: 'Earnings — RelayOps',
}

export default async function WorkerEarningsPage() {
  const sessionUser = await requireRole('worker_internal')
  if (!sessionUser) redirect('/login')

  const admin = createAdminClient()

  // 查 worker_profiles 以获取 profile id（用于 ledger 关联）
  const { data: workerProfile } = await admin
    .from('worker_profiles')
    .select('id')
    .eq('user_id', sessionUser.id)
    .maybeSingle()

  if (!workerProfile) {
    return (
      <div className="dashboard-page-narrow">
        <p className="text-muted-foreground text-sm">
          Your worker profile is not set up yet. Please contact support.
        </p>
      </div>
    )
  }

  // 查该 worker 的 ledger_entries（worker_payout 类型）
  const { data: entries } = await admin
    .from('ledger_entries')
    .select('id, amount, currency, status, created_at, tickets(title)')
    .eq('worker_id', workerProfile.id)
    .eq('type', 'worker_payout')
    .order('created_at', { ascending: false })

  const payouts = entries ?? []

  // 汇总
  const confirmedTotal = payouts
    .filter((e) => e.status === 'confirmed')
    .reduce((sum, e) => sum + (e.amount as number), 0)

  const pendingTotal = payouts
    .filter((e) => e.status === 'pending')
    .reduce((sum, e) => sum + (e.amount as number), 0)

  return (
    <div className="dashboard-page-narrow">
      <div className="flex items-center gap-3">
        <Wallet className="h-6 w-6 text-slate-500" />
        <h1 className="text-2xl font-bold">Earnings</h1>
      </div>

      {/* 汇总卡片 */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-t-2 border-emerald-500">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-widest">
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-slate-900">
              ${confirmedTotal.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-t-2 border-amber-400">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-widest">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-slate-900">
              ${pendingTotal.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 明细列表 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No payouts yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {payouts.map((entry) => {
                type TicketRow = { title: string } | { title: string }[] | null
                const rawTicket = entry.tickets as TicketRow
                const ticketTitle = Array.isArray(rawTicket)
                  ? (rawTicket[0]?.title ?? '—')
                  : (rawTicket?.title ?? '—')

                return (
                  <div key={entry.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {ticketTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(entry.created_at as string), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4 shrink-0">
                      <Badge
                        variant={entry.status === 'confirmed' ? 'default' : 'outline'}
                        className="text-xs capitalize"
                      >
                        {(entry.status as string).replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-sm font-semibold text-slate-900">
                        ${(entry.amount as number).toFixed(2)} {entry.currency}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
