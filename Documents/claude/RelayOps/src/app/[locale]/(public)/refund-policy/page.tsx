import Link from 'next/link'
import { createPublicMetadata, publicPageDefinitions } from '@/lib/seo'
import { MotionProvider, FadeIn, StaggerList, StaggerItem } from '@/components/ui/motion'
import { cn } from '@/lib/utils/cn'

export const metadata = createPublicMetadata(publicPageDefinitions.refundPolicy)

const SCENARIOS = [
  {
    status: 'Paid — not yet assigned',
    refund: '100%',
    refundClass: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    detail:
      "If you cancel after paying but before processing has started, you receive a full refund. No questions asked. The job must not have entered the processing queue. Contact support or cancel through your portal.",
  },
  {
    status: 'Assigned — no submission yet',
    refund: 'Admin discretion',
    refundClass: 'text-blue-700 bg-blue-50 border-blue-100',
    detail:
      "If processing has started but no submission has been made yet, refund eligibility is at admin discretion based on how much work has been done. In most cases, a partial refund is offered. Submit a cancellation request through your portal with a brief reason.",
  },
  {
    status: 'Submission exists — issues found',
    refund: 'Revision first',
    refundClass: 'text-slate-700 bg-slate-100 border-slate-200',
    detail:
      'If a deliverable has been submitted, the first step is to request a revision. Clearly describe which acceptance criterion was not met. We will resubmit within 24 hours. Most delivery issues are resolved at this stage.',
  },
  {
    status: 'Revision requested — still not resolved',
    refund: 'Dispute process',
    refundClass: 'text-teal-700 bg-teal-50 border-teal-100',
    detail:
      "If the revision still doesn't meet the brief, you can open a dispute. An admin reviews both the original brief and the deliverable(s). The admin determines whether the brief was met, partially met, or not met. Outcome is one of: no refund, 50% refund, or full refund.",
  },
  {
    status: 'Job expired — no submission',
    refund: '100%',
    refundClass: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    detail:
      "If a job expires (SLA window passes with no submission), you are entitled to a full refund automatically. Expired jobs trigger an automatic refund process through Stripe. You'll receive an email confirmation.",
  },
  {
    status: 'Job approved by partner',
    refund: 'No refund',
    refundClass: 'text-slate-700 bg-slate-100 border-slate-200',
    detail:
      "Once you approve a job in the portal, the job is closed and the transaction is final. Please review deliverables carefully before clicking Approve. If you find an issue after approval, contact support — we'll review the situation, but approval is considered acceptance of the delivered work.",
  },
]

const DISPUTE_OUTCOMES = [
  {
    outcome: 'Full refund (100%)',
    condition:
      "The submission demonstrably did not address the core acceptance criteria. For example: wrong columns cleaned, output format completely different from what was scoped, or data was not processed at all.",
  },
  {
    outcome: 'Partial refund (50%)',
    condition:
      "The submission partially met the brief — some criteria were fulfilled but meaningful gaps exist. For example: deduplication was done correctly but field normalization was incomplete.",
  },
  {
    outcome: 'No refund (0%)',
    condition:
      "The submission meets the acceptance criteria as written. If the result isn't what you expected, the issue may be in how the brief was scoped rather than in the delivery. An admin may advise on re-scoping for a follow-up job.",
  },
]

export default function RefundPolicyPage() {
  return (
    <MotionProvider>
      <div className="bg-[#f8fafc] py-14 md:py-20 min-h-screen">
        <div className="container mx-auto px-4 max-w-2xl">
          <FadeIn>
            <div className="space-y-2 mb-10">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">Last updated: January 2025</p>
              <h1 className="font-display text-4xl font-bold tracking-[-0.06em] text-slate-900">Refund Policy</h1>
              <p className="text-lg text-slate-600">
                Refund eligibility depends on where a job is in the workflow when the request
                is made. We aim to be fair to all parties.
              </p>
            </div>
          </FadeIn>

          {/* Scenario table */}
          <section className="space-y-6 mb-16">
            <FadeIn>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">Refund by Job Status</h2>
            </FadeIn>
            <StaggerList className="space-y-4">
              {SCENARIOS.map((s) => (
                <StaggerItem
                  key={s.status}
                  className="rounded-[1.5rem] border border-slate-200 overflow-hidden bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between px-5 py-4 bg-slate-50/50 border-b border-slate-200">
                    <span className="text-sm font-bold text-slate-900">{s.status}</span>
                    <span
                      className={cn(
                        "text-[11px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider",
                        s.refundClass
                      )}
                    >
                      {s.refund}
                    </span>
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-sm text-slate-600 leading-relaxed">{s.detail}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerList>
          </section>

          {/* Dispute outcomes */}
          <section className="space-y-6 mb-16">
            <FadeIn>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">Dispute Outcomes</h2>
              <p className="mt-3 text-sm text-slate-600">
                When a dispute is opened, an admin reviews the brief, deliverable(s), and any
                comments from both sides. The three possible outcomes are:
              </p>
            </FadeIn>
            <StaggerList className="space-y-4">
              {DISPUTE_OUTCOMES.map((d) => (
                <StaggerItem
                  key={d.outcome}
                  className="rounded-[1.25rem] border border-slate-200 p-5 space-y-2 bg-white shadow-sm"
                >
                  <h3 className="text-base font-bold text-slate-900">{d.outcome}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{d.condition}</p>
                </StaggerItem>
              ))}
            </StaggerList>
            <FadeIn>
              <p className="text-xs text-slate-500 italic">
                Admin decisions on disputes are final. We aim to resolve all disputes within 3
                business days of opening.
              </p>
            </FadeIn>
          </section>

          {/* How to request */}
          <section className="space-y-6 mb-16">
            <FadeIn>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">How to Request a Refund</h2>
              <div className="mt-5 text-sm text-slate-700 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p>
                    <strong className="text-slate-900">Via portal:</strong> Navigate to the ticket in question, click "Cancel"
                    or "Open Dispute" depending on job status. You'll be prompted to select a reason
                    and optionally add notes.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p>
                    <strong className="text-slate-900">Via support:</strong> If you're unable to action the request in-portal,
                    contact support with your ticket ID and the nature of the issue.
                  </p>
                </div>
                <p className="px-2 text-xs text-slate-500">
                  Approved refunds are processed through Stripe within 5–10 business days
                  depending on your card issuer.
                </p>
              </div>
            </FadeIn>
          </section>

          {/* Related */}
          <FadeIn>
            <div className="rounded-[1.75rem] bg-blue-50 border border-blue-100 p-6 space-y-3 text-sm mb-10">
              <p className="font-bold text-blue-900">Related policies</p>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="text-blue-700 font-medium hover:underline flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    Terms of Service — payment terms and acceptance
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="text-blue-700 font-medium hover:underline flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    Security & Data Handling — data retention after disputes
                  </Link>
                </li>
              </ul>
            </div>
          </FadeIn>
        </div>
      </div>
    </MotionProvider>
  )
}
