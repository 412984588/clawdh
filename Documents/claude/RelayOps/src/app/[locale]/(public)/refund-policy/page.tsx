import Link from 'next/link'
import { createPublicMetadata, publicPageDefinitions } from '@/lib/seo'

export const metadata = createPublicMetadata(publicPageDefinitions.refundPolicy)

const SCENARIOS = [
  {
    status: 'Paid — not yet assigned',
    refund: '100%',
    refundClass: 'text-green-700 bg-green-50',
    detail:
      "If you cancel after paying but before processing has started, you receive a full refund. No questions asked. The job must not have entered the processing queue. Contact support or cancel through your portal.",
  },
  {
    status: 'Assigned — no submission yet',
    refund: 'Admin discretion',
    refundClass: 'text-amber-700 bg-amber-50',
    detail:
      "If processing has started but no submission has been made yet, refund eligibility is at admin discretion based on how much work has been done. In most cases, a partial refund is offered. Submit a cancellation request through your portal with a brief reason.",
  },
  {
    status: 'Submission exists — issues found',
    refund: 'Revision first',
    refundClass: 'text-blue-700 bg-blue-50',
    detail:
      'If a deliverable has been submitted, the first step is to request a revision. Clearly describe which acceptance criterion was not met. We will resubmit within 24 hours. Most delivery issues are resolved at this stage.',
  },
  {
    status: 'Revision requested — still not resolved',
    refund: 'Dispute process',
    refundClass: 'text-purple-700 bg-purple-50',
    detail:
      "If the revision still doesn't meet the brief, you can open a dispute. An admin reviews both the original brief and the deliverable(s). The admin determines whether the brief was met, partially met, or not met. Outcome is one of: no refund, 50% refund, or full refund.",
  },
  {
    status: 'Job expired — no submission',
    refund: '100%',
    refundClass: 'text-green-700 bg-green-50',
    detail:
      "If a job expires (SLA window passes with no submission), you are entitled to a full refund automatically. Expired jobs trigger an automatic refund process through Stripe. You'll receive an email confirmation.",
  },
  {
    status: 'Job approved by partner',
    refund: 'No refund',
    refundClass: 'text-slate-700 bg-slate-100',
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
    <div className="bg-white py-14 md:py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="space-y-2 mb-10">
          <p className="text-sm text-slate-500">Last updated: January 2025</p>
          <h1 className="text-3xl font-bold text-slate-900">Refund Policy</h1>
          <p className="text-slate-600">
            Refund eligibility depends on where a job is in the workflow when the request
            is made. We aim to be fair to all parties.
          </p>
        </div>

        {/* Scenario table */}
        <div className="space-y-4 mb-12">
          <h2 className="text-lg font-semibold text-slate-900">Refund by Job Status</h2>
          <div className="space-y-3">
            {SCENARIOS.map((s) => (
              <div
                key={s.status}
                className="rounded-xl border border-slate-200 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <span className="text-sm font-semibold text-slate-800">{s.status}</span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.refundClass}`}
                  >
                    {s.refund}
                  </span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm text-slate-600 leading-relaxed">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dispute outcomes */}
        <div className="space-y-4 mb-12">
          <h2 className="text-lg font-semibold text-slate-900">Dispute Outcomes</h2>
          <p className="text-sm text-slate-600">
            When a dispute is opened, an admin reviews the brief, deliverable(s), and any
            comments from both sides. The three possible outcomes are:
          </p>
          <div className="space-y-3">
            {DISPUTE_OUTCOMES.map((d) => (
              <div
                key={d.outcome}
                className="rounded-xl border border-slate-200 p-4 space-y-1.5"
              >
                <h3 className="text-sm font-semibold text-slate-900">{d.outcome}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{d.condition}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Admin decisions on disputes are final. We aim to resolve all disputes within 3
            business days of opening.
          </p>
        </div>

        {/* How to request */}
        <div className="space-y-4 mb-12">
          <h2 className="text-lg font-semibold text-slate-900">How to Request a Refund</h2>
          <div className="text-sm text-slate-700 space-y-3">
            <p>
              <strong>Via portal:</strong> Navigate to the ticket in question, click "Cancel"
              or "Open Dispute" depending on job status. You'll be prompted to select a reason
              and optionally add notes.
            </p>
            <p>
              <strong>Via support:</strong> If you're unable to action the request in-portal,
              contact support with your ticket ID and the nature of the issue.
            </p>
            <p>
              Approved refunds are processed through Stripe within 5–10 business days
              depending on your card issuer.
            </p>
          </div>
        </div>

        {/* Related */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 space-y-2 text-sm">
          <p className="font-semibold text-slate-800">Related policies</p>
          <ul className="space-y-1">
            <li>
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{' '}
              — payment terms and acceptance
            </li>
            <li>
              <Link href="/security" className="text-blue-600 hover:underline">
                Security & Data Handling
              </Link>{' '}
              — data retention after disputes
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
