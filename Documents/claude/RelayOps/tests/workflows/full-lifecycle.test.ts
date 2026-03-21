/**
 * Full business lifecycle integration tests.
 *
 * These tests chain all 8 workflow functions end-to-end to verify that the
 * complete ticket lifecycle works correctly. Each test uses mock Supabase
 * clients whose `.from()` calls are consumed sequentially by `mockReturnValueOnce`.
 *
 * Coverage:
 *   LC1 — Happy path: draft → submitted → needs_scope_review → scope_locked →
 *          invoiced → [payment webhook] → paid → queued → assigned →
 *          in_progress → submitted_for_review → approved → completed
 *   LC2 — Revision loop: worker submits → partner requests revision →
 *          worker resubmits → partner approves
 *   LC3 — Dispute path: approved → partner raises dispute →
 *          admin resolves with partial refund + ledger entry
 */
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createMockSupabase, ok } from '../helpers/mock-supabase'
import { submitTicketWorkflow } from '@/lib/workflows/submit-ticket'
import { scopeAndInvoiceWorkflow } from '@/lib/workflows/scope-and-invoice'
import { handlePaymentWorkflow } from '@/lib/workflows/handle-payment'
import { assignWorkerWorkflow } from '@/lib/workflows/assign-worker'
import { submitWorkWorkflow } from '@/lib/workflows/submit-work'
import { reviewSubmissionWorkflow } from '@/lib/workflows/review-submission'
import { raiseDisputeWorkflow } from '@/lib/workflows/raise-dispute'
import { resolveDisputeWorkflow } from '@/lib/workflows/resolve-dispute'
import { transitionTicket } from '@/lib/state-machine/engine'

// ── Fixtures ──────────────────────────────────────────────────────────────────
const TICKET_ID = 'ticket-lc-1'
const ORG_ID = 'org-lc-1'
const ADMIN_ID = 'admin-lc-1'
const WORKER_ID = 'worker-lc-1'
const PARTNER_ID = 'partner-lc-1'
const ASSIGNMENT_ID = 'assignment-lc-1'
const SUBMISSION_ID = 'submission-lc-1'
const INVOICE_ID = 'in_lc_mock_1'
const LEDGER_ID = 'ledger-lc-1'
const REVIEW_ID = 'review-lc-1'
const DISPUTE_ID = 'dispute-lc-1'

const TICKET_INPUT = {
  title: 'Fix the CRM import failure',
  category: 'crm_import_failure_diagnosis' as const,
  problem_summary: 'Imports failing for all records since the last platform update.',
  expected_output: 'All records imported successfully without errors or duplicates.',
  acceptance_criteria_json: [{ id: '1', description: 'All records imported', required: true }],
  out_of_scope_json: [],
  sensitivity_level: 'standard' as const,
}

const PARTNER_ACTOR = { id: PARTNER_ID, role: 'partner' as const, organizationId: ORG_ID }
const ADMIN_ACTOR = { id: ADMIN_ID, role: 'admin' as const }
const WORKER_ACTOR = { id: WORKER_ID, role: 'worker_internal' as const }

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Push 3 sequential mock calls representing one engine transition:
 *   1. fetch ticket (returns `fromStatus`)
 *   2. update ticket status
 *   3. insert ticket_events audit record
 */
function pushTransitionMocks(
  client: ReturnType<typeof createMockSupabase>,
  fromStatus: string
) {
  client.from
    .mockReturnValueOnce(ok({ id: TICKET_ID, status: fromStatus })) // fetch
    .mockReturnValueOnce(ok(null))                                   // update
    .mockReturnValueOnce(ok(null))                                   // event
}

// ── Admin client mock (used by handlePaymentWorkflow) ─────────────────────────
let mockAdmin: ReturnType<typeof createMockSupabase>
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => mockAdmin }))

// ─────────────────────────────────────────────────────────────────────────────
describe('Full business lifecycle', () => {
  let supabase: ReturnType<typeof createMockSupabase>

  beforeEach(() => {
    supabase = createMockSupabase()
    mockAdmin = createMockSupabase()
  })

  // ── LC1: Happy path ─────────────────────────────────────────────────────────
  it('LC1: happy path — draft → submitted → needs_scope_review → scope_locked → invoiced → paid → queued → assigned → in_progress → submitted_for_review → approved → completed', async () => {
    // ── Step 1: submitTicketWorkflow — draft → submitted (4+1 from calls) ───
    supabase.from.mockReturnValueOnce(
      ok({ id: TICKET_ID, status: 'draft', title: TICKET_INPUT.title })
    ) // createTicket insert
    supabase.from.mockReturnValueOnce(ok({ id: TICKET_ID })) // fetch existing ticket
    pushTransitionMocks(supabase, 'draft') // engine: draft → submitted
    supabase.from.mockReturnValueOnce(ok(null)) // notifyTicketEvent ticket query

    // ── Step 2: admin moves submitted → needs_scope_review (3 from calls) ───
    pushTransitionMocks(supabase, 'submitted')

    // ── Step 3: scopeAndInvoiceWorkflow — needs_scope_review → invoiced ─────
    //            (9 from calls; org has no stripe_customer_id → mock invoice)
    supabase.from
      .mockReturnValueOnce(
        ok({ id: TICKET_ID, title: TICKET_INPUT.title, organization_id: ORG_ID, status: 'needs_scope_review' })
      ) // fetch ticket
      .mockReturnValueOnce(ok({ id: ORG_ID, name: 'Org 1', stripe_customer_id: null })) // fetch org
      .mockReturnValueOnce(ok(null)) // update ticket with invoice fields
    pushTransitionMocks(supabase, 'needs_scope_review') // engine: → scope_locked
    pushTransitionMocks(supabase, 'scope_locked')       // engine: → invoiced
    supabase.from.mockReturnValueOnce(ok(null)) // notifyTicketEvent ticket query

    // ── Step 4: handlePaymentWorkflow — invoiced → paid → queued ────────────
    //            (12 mockAdmin.from calls — atomic claim + idempotency check + ledger + transitions + confirm + notify + clearRetry)
    mockAdmin.from
      .mockReturnValueOnce(ok({ id: TICKET_ID, organization_id: ORG_ID })) // atomic claim
      .mockReturnValueOnce(ok(null))                                         // idempotency check: no existing ledger
      .mockReturnValueOnce(ok({ id: LEDGER_ID, status: 'pending' }))        // createLedgerEntry insert
    // engine: invoiced → paid (3 calls)
    mockAdmin.from
      .mockReturnValueOnce(ok({ id: TICKET_ID, status: 'invoiced' }))
      .mockReturnValueOnce(ok(null))
      .mockReturnValueOnce(ok(null))
    // engine: paid → queued (3 calls)
    mockAdmin.from
      .mockReturnValueOnce(ok({ id: TICKET_ID, status: 'paid' }))
      .mockReturnValueOnce(ok(null))
      .mockReturnValueOnce(ok(null))
    mockAdmin.from
      .mockReturnValueOnce(ok(null)) // confirmLedgerEntry update
      .mockReturnValueOnce(ok(null)) // notifyTicketEvent ticket query
      .mockReturnValueOnce(ok(null)) // clearPaymentRetryFields

    // ── Step 5: assignWorkerWorkflow — queued → assigned (7+1 from calls) ───
    supabase.from
      .mockReturnValueOnce(ok({ id: TICKET_ID, status: 'queued' }))                  // fetch ticket
      .mockReturnValueOnce(ok({ id: WORKER_ID, approval_status: 'approved', kyc_status: 'verified', nickname: 'TestWorker' })) // fetch worker_profile
      .mockReturnValueOnce(ok({ id: ASSIGNMENT_ID }))                                 // insert assignment
    pushTransitionMocks(supabase, 'queued') // engine: queued → assigned
    supabase.from.mockReturnValueOnce(ok(null)) // assignment_created event
    supabase.from.mockReturnValueOnce(ok(null)) // notifyTicketEvent ticket query

    // ── Step 6: worker accepts — assigned → in_progress (3 from calls) ──────
    pushTransitionMocks(supabase, 'assigned')

    // ── Step 7: submitWorkWorkflow — in_progress → submitted_for_review ─────
    //            (9 from calls)
    supabase.from
      .mockReturnValueOnce(ok({ id: TICKET_ID, status: 'in_progress' }))      // fetch ticket
      .mockReturnValueOnce(ok({ id: ASSIGNMENT_ID, status: 'in_progress' }))  // fetch assignment
      .mockReturnValueOnce(ok({ id: SUBMISSION_ID }))                           // insert submission
      .mockReturnValueOnce(ok(null))                                             // update attachments
      .mockReturnValueOnce(ok(null))                                             // update assignment status
    pushTransitionMocks(supabase, 'in_progress') // engine: → submitted_for_review
    supabase.from.mockReturnValueOnce(ok(null))  // work_submitted event
    supabase.from.mockReturnValueOnce(ok(null))  // notifyTicketEvent ticket query

    // ── Step 8: reviewSubmissionWorkflow — approved (6+1 from calls) ────────
    supabase.from
      .mockReturnValueOnce(ok({ id: TICKET_ID, status: 'submitted_for_review' })) // fetch ticket
      .mockReturnValueOnce(ok({ id: REVIEW_ID }))                                   // insert review
    pushTransitionMocks(supabase, 'submitted_for_review') // engine: → approved
    supabase.from.mockReturnValueOnce(ok(null)) // review_submitted event
    supabase.from.mockReturnValueOnce(ok(null)) // notifyTicketEvent ticket query

    // ── Step 9: admin finalizes — approved → completed (3 from calls) ───────
    pushTransitionMocks(supabase, 'approved')

    // ── Execute all steps and assert each succeeds ───────────────────────────
    const submitResult = await submitTicketWorkflow(supabase as any, TICKET_INPUT, PARTNER_ACTOR)
    expect(submitResult.success).toBe(true)
    expect(submitResult.ticketId).toBe(TICKET_ID)

    const toScopeReview = await transitionTicket(
      supabase as any, TICKET_ID, 'needs_scope_review', ADMIN_ACTOR
    )
    expect(toScopeReview.success).toBe(true)

    const scopeResult = await scopeAndInvoiceWorkflow(supabase as any, {
      ticketId: TICKET_ID,
      priceDollars: 299,
      adminId: ADMIN_ID,
      adminRole: 'admin',
    })
    expect(scopeResult.success).toBe(true)
    expect(scopeResult.invoiceUrl).toMatch(/invoice\.stripe\.com/)

    const paymentResult = await handlePaymentWorkflow({
      stripeInvoiceId: INVOICE_ID,
      amountPaidDollars: 299,
      currency: 'usd',
      stripeCustomerId: 'cus_mock_1',
    })
    expect(paymentResult.success).toBe(true)
    expect(paymentResult.ticketId).toBe(TICKET_ID)

    const assignResult = await assignWorkerWorkflow(supabase as any, {
      ticketId: TICKET_ID,
      workerId: WORKER_ID,
      adminId: ADMIN_ID,
    })
    expect(assignResult.success).toBe(true)
    expect(assignResult.assignmentId).toBe(ASSIGNMENT_ID)

    const toInProgress = await transitionTicket(
      supabase as any, TICKET_ID, 'in_progress', WORKER_ACTOR
    )
    expect(toInProgress.success).toBe(true)

    const submitWorkResult = await submitWorkWorkflow(supabase as any, {
      ticketId: TICKET_ID,
      workerId: WORKER_ID,
      deliverySummary: 'All rows cleaned — data normalized to spec.',
      attachmentIds: ['attach-lc-1'],
    })
    expect(submitWorkResult.success).toBe(true)
    expect(submitWorkResult.submissionId).toBe(SUBMISSION_ID)

    const reviewResult = await reviewSubmissionWorkflow(supabase as any, {
      ticketId: TICKET_ID,
      reviewerId: PARTNER_ID,
      reviewerRole: 'partner',
      decision: 'approved',
      acceptanceFailures: [],
    })
    expect(reviewResult.success).toBe(true)
    expect(reviewResult.reviewId).toBe(REVIEW_ID)

    const toCompleted = await transitionTicket(
      supabase as any, TICKET_ID, 'completed', ADMIN_ACTOR
    )
    expect(toCompleted.success).toBe(true)

    // Confirm admin client calls: 1 (claim) + 1 (idempotency) + 1 (ledger) + 3+3 (transitions) + 1 (confirm) + 1 (notify) + 1 (clearRetry) = 12
    expect(mockAdmin.from).toHaveBeenCalledTimes(12)
    // Confirm ledger was written during payment
    expect(mockAdmin.from).toHaveBeenCalledWith('ledger_entries')
  })

  // ── LC2: Revision loop ──────────────────────────────────────────────────────
  it('LC2: revision loop — worker submits, partner requests revision, worker resubmits, partner approves', async () => {
    // First submitWorkWorkflow: in_progress → submitted_for_review (9+1 from calls)
    supabase.from
      .mockReturnValueOnce(ok({ id: TICKET_ID, status: 'in_progress' }))
      .mockReturnValueOnce(ok({ id: ASSIGNMENT_ID, status: 'in_progress' }))
      .mockReturnValueOnce(ok({ id: SUBMISSION_ID }))
      .mockReturnValueOnce(ok(null)) // attachments
      .mockReturnValueOnce(ok(null)) // assignment update
    pushTransitionMocks(supabase, 'in_progress')
    supabase.from.mockReturnValueOnce(ok(null)) // work_submitted event
    supabase.from.mockReturnValueOnce(ok(null)) // notifyTicketEvent ticket query

    // reviewSubmission: revision_requested (9+1 from calls)
    supabase.from
      .mockReturnValueOnce(ok({ id: TICKET_ID, status: 'submitted_for_review' }))
      .mockReturnValueOnce(ok({ id: REVIEW_ID }))
    pushTransitionMocks(supabase, 'submitted_for_review') // → revision_requested
    pushTransitionMocks(supabase, 'revision_requested')   // → in_progress
    supabase.from.mockReturnValueOnce(ok(null)) // review_submitted event
    supabase.from.mockReturnValueOnce(ok(null)) // notifyTicketEvent ticket query

    // Second submitWorkWorkflow: in_progress → submitted_for_review (9+1 from calls)
    supabase.from
      .mockReturnValueOnce(ok({ id: TICKET_ID, status: 'in_progress' }))
      .mockReturnValueOnce(ok({ id: ASSIGNMENT_ID, status: 'in_progress' }))
      .mockReturnValueOnce(ok({ id: 'submission-lc-2' }))
      .mockReturnValueOnce(ok(null)) // attachments
      .mockReturnValueOnce(ok(null)) // assignment update
    pushTransitionMocks(supabase, 'in_progress')
    supabase.from.mockReturnValueOnce(ok(null)) // work_submitted event
    supabase.from.mockReturnValueOnce(ok(null)) // notifyTicketEvent ticket query

    // reviewSubmission: approved (6+1 from calls)
    supabase.from
      .mockReturnValueOnce(ok({ id: TICKET_ID, status: 'submitted_for_review' }))
      .mockReturnValueOnce(ok({ id: 'review-lc-2' }))
    pushTransitionMocks(supabase, 'submitted_for_review') // → approved
    supabase.from.mockReturnValueOnce(ok(null)) // review_submitted event
    supabase.from.mockReturnValueOnce(ok(null)) // notifyTicketEvent ticket query

    // ── Execute ──────────────────────────────────────────────────────────────
    const sw1 = await submitWorkWorkflow(supabase as any, {
      ticketId: TICKET_ID,
      workerId: WORKER_ID,
      deliverySummary: 'First attempt — initial cleanup.',
      attachmentIds: ['attach-lc-1'],
    })
    expect(sw1.success).toBe(true)

    // Admin (not partner) requests revision — only admin/worker_internal can do
    // revision_requested → in_progress per the role guard in transitions.ts
    const rev1 = await reviewSubmissionWorkflow(supabase as any, {
      ticketId: TICKET_ID,
      reviewerId: ADMIN_ID,
      reviewerRole: 'admin',
      decision: 'revision_requested',
      acceptanceFailures: ['Null handling missing in column D'],
      notes: 'Please address the null values before resubmitting.',
    })
    expect(rev1.success).toBe(true)
    // revision_requested triggers two engine transitions (→revision_requested, →in_progress)
    // both should succeed — workflow returns success when both complete

    const sw2 = await submitWorkWorkflow(supabase as any, {
      ticketId: TICKET_ID,
      workerId: WORKER_ID,
      deliverySummary: 'Second attempt — null handling fixed.',
      attachmentIds: ['attach-lc-2'],
    })
    expect(sw2.success).toBe(true)
    expect(sw2.submissionId).toBe('submission-lc-2')

    const rev2 = await reviewSubmissionWorkflow(supabase as any, {
      ticketId: TICKET_ID,
      reviewerId: PARTNER_ID,
      reviewerRole: 'partner',
      decision: 'approved',
      acceptanceFailures: [],
    })
    expect(rev2.success).toBe(true)
  })

  // ── LC3: Dispute path ───────────────────────────────────────────────────────
  it('LC3: dispute path — partner raises dispute, admin resolves with partial refund and ledger entry', async () => {
    // raiseDisputeWorkflow: approved → disputed (6+1 from calls)
    supabase.from
      .mockReturnValueOnce(ok({ id: TICKET_ID, status: 'approved' })) // fetch ticket
      .mockReturnValueOnce(ok({ id: DISPUTE_ID }))                     // insert dispute
    pushTransitionMocks(supabase, 'approved') // engine: → disputed
    supabase.from.mockReturnValueOnce(ok(null)) // dispute_opened event
    supabase.from.mockReturnValueOnce(ok(null)) // notifyTicketEvent ticket query

    // resolveDisputeWorkflow: partial refund (8+1 from calls)
    supabase.from
      .mockReturnValueOnce(ok({ id: DISPUTE_ID, ticket_id: TICKET_ID, status: 'open' }))
      .mockReturnValueOnce(ok({ id: TICKET_ID, organization_id: ORG_ID })) // for ledger
      .mockReturnValueOnce(ok({ id: LEDGER_ID })) // createLedgerEntry
      .mockReturnValueOnce(ok(null)) // update dispute
    pushTransitionMocks(supabase, 'disputed') // engine: → resolved
    supabase.from.mockReturnValueOnce(ok(null)) // dispute_resolved event
    supabase.from.mockReturnValueOnce(ok(null)) // notifyTicketEvent ticket query

    // ── Execute ──────────────────────────────────────────────────────────────
    const raiseResult = await raiseDisputeWorkflow(supabase as any, {
      ticketId: TICKET_ID,
      raisedByUserId: PARTNER_ID,
      raisedByRole: 'partner',
      reason: 'Delivered data still contains duplicates despite acceptance criteria.',
    })
    expect(raiseResult.success).toBe(true)
    expect(raiseResult.disputeId).toBe(DISPUTE_ID)

    const resolveResult = await resolveDisputeWorkflow(supabase as any, {
      ticketId: TICKET_ID,
      disputeId: DISPUTE_ID,
      adminId: ADMIN_ID,
      resolutionSummary: 'Partial refund of $150 issued — work was 50% satisfactory.',
      disputeStatus: 'resolved_partial_refund',
      refundAmountDollars: 150,
    })
    expect(resolveResult.success).toBe(true)

    // Refund ledger entry should have been written
    expect(supabase.from).toHaveBeenCalledWith('ledger_entries')
    // dispute_resolved event should have been written
    expect(supabase.from).toHaveBeenCalledWith('ticket_events')
  })
})
