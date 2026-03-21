import { redirect } from 'next/navigation'
import { Shield, CheckCircle, XCircle, FileText } from 'lucide-react'
import { requireRole } from '@/lib/utils/get-session-user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createAdminClient } from '@/lib/supabase/admin'
import { approveKycWorkflow, rejectKycWorkflow } from '@/lib/workflows/kyc-review'

export const metadata = {
  title: 'KYC Review — RelayOps',
}

interface KycSubmission {
  id: string
  nickname: string
  real_name: string
  kyc_submitted_at: string
  kyc_documents_url: string
}

async function getPendingKycSubmissions(): Promise<KycSubmission[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('worker_profiles')
    .select('id, nickname, real_name, kyc_submitted_at, kyc_documents_url')
    .eq('kyc_status', 'pending')
    .not('kyc_submitted_at', 'is', null)
    .order('kyc_submitted_at', { ascending: true })

  if (error) {
    console.error('Failed to fetch pending KYC submissions:', error)
    return []
  }

  return data || []
}

export default async function AdminKycPage() {
  const sessionUser = await requireRole('admin')
  if (!sessionUser) redirect('/login')

  const pendingSubmissions = await getPendingKycSubmissions()

  return (
    <div className="dashboard-page">
      <section className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_34%),linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,0.94))] px-6 py-6 shadow-[0_34px_90px_-60px_rgba(15,23,42,0.45)] sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/80 shadow-sm">
              <Shield className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <span className="inline-flex rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-sm">
                Compliance
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                KYC Review
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Review pending identity submissions and unblock worker onboarding.
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className="rounded-full border-white/80 bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
          >
            {pendingSubmissions.length} pending
          </Badge>
        </div>
      </section>

      <Card className="rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_28px_70px_-52px_rgba(15,23,42,0.38)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            Pending Submissions
            <Badge variant="secondary" className="rounded-full">
              {pendingSubmissions.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 py-16 text-center">
              <CheckCircle className="mb-4 h-10 w-10 text-green-500" />
              <p className="text-muted-foreground text-sm">No pending KYC submissions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex flex-col gap-4 rounded-[24px] border border-slate-200/80 bg-slate-50/70 p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.24)] xl:flex-row xl:items-center xl:justify-between"
                >
                  <div className="space-y-2">
                    <Badge
                      variant="outline"
                      className="rounded-full border-amber-200 bg-amber-50 text-xs font-medium text-amber-700"
                    >
                      Pending review
                    </Badge>
                    <p className="text-lg font-semibold text-slate-900">{submission.nickname}</p>
                    <p className="text-sm text-muted-foreground">{submission.real_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted: {new Date(submission.kyc_submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                    {submission.kyc_documents_url && (
                      <a
                        href={submission.kyc_documents_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full border-slate-200 bg-white shadow-sm"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View Documents
                        </Button>
                      </a>
                    )}
                    <form
                      action={async () => {
                        'use server'
                        const supabase = createAdminClient()
                        await approveKycWorkflow(supabase, {
                          workerId: submission.id,
                          reviewerId: sessionUser.id,
                        })
                      }}
                    >
                      <Button
                        type="submit"
                        size="sm"
                        variant="default"
                        className="rounded-full shadow-sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    </form>
                    <form
                      action={async () => {
                        'use server'
                        const supabase = createAdminClient()
                        await rejectKycWorkflow(supabase, {
                          workerId: submission.id,
                          reviewerId: sessionUser.id,
                          reason: 'Documents do not meet requirements. Please resubmit.',
                        })
                      }}
                    >
                      <Button
                        type="submit"
                        size="sm"
                        variant="destructive"
                        className="rounded-full shadow-sm"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
