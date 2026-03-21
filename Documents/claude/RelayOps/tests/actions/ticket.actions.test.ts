import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createMockSupabase, ok } from '../helpers/mock-supabase'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import * as submitTicketWorkflows from '@/lib/workflows/submit-ticket'
import { reviewSubmissionWorkflow } from '@/lib/workflows/review-submission'
import { transitionTicket } from '@/lib/state-machine/engine'
import { addComment } from '@/lib/services/comment.service'
import { createTicket } from '@/lib/services/ticket.service'
import * as ticketActions from '@/lib/actions/ticket.actions'
import { createAndSubmitTicket, adminTransitionTicket, partnerTransitionTicket } from '@/lib/actions/ticket.actions'
import { raiseDisputeWorkflow } from '@/lib/workflows/raise-dispute'

vi.mock('@/lib/supabase/server', () => ({ createServerClient: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/workflows/submit-ticket', () => ({
  submitTicketWorkflow: vi.fn(),
  submitExistingTicketWorkflow: vi.fn(),
}))
vi.mock('@/lib/workflows/review-submission', () => ({ reviewSubmissionWorkflow: vi.fn() }))
vi.mock('@/lib/workflows/raise-dispute', () => ({ raiseDisputeWorkflow: vi.fn() }))
vi.mock('@/lib/state-machine/engine', () => ({ transitionTicket: vi.fn() }))
vi.mock('@/lib/services/comment.service', () => ({ addComment: vi.fn() }))
vi.mock('@/lib/services/ticket.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/services/ticket.service')>()
  return { ...actual, createTicket: vi.fn() }
})

const TICKET_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const PARTNER_TICKET_ID = '11111111-2222-4333-8444-555555555555'

const validTicketData = {
  title: 'Fix CRM import failure',
  category: 'crm_import_failure_diagnosis',
  problem_summary: 'Imports failing for all records since last update.',
  expected_output: 'All records imported without errors.',
  acceptance_criteria_json: [{ id: '1', description: 'All records imported', required: true }],
  out_of_scope_json: [],
  sensitivity_level: 'standard',
}

describe('ticket.actions', () => {
  let mockServer: ReturnType<typeof createMockSupabase>
  let mockAdmin: ReturnType<typeof createMockSupabase>

  beforeEach(() => {
    mockServer = createMockSupabase()
    mockAdmin = createMockSupabase()
    vi.mocked(createServerClient).mockResolvedValue(mockServer as any)
    vi.mocked(createAdminClient).mockReturnValue(mockAdmin as any)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('createAndSubmitTicket', () => {
    it('returns validation error for invalid input', async () => {
      const result = await createAndSubmitTicket({})
      expect(result.success).toBe(false)
    })

    it('returns Unauthorized when not authenticated', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

      const result = await createAndSubmitTicket(validTicketData)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns error when user is not a partner', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'user-1', role: 'admin', organization_id: 'org-1' }))

      const result = await createAndSubmitTicket(validTicketData)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Only partners can submit tickets')
    })

    it('returns error when partner has no organization', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'user-1', role: 'partner', organization_id: null }))

      const result = await createAndSubmitTicket(validTicketData)
      expect(result.success).toBe(false)
      expect(result.error).toBe('User has no organization')
    })

    it('returns ticketId on success', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'user-1', role: 'partner', organization_id: 'org-1' }))
      vi.mocked(createTicket).mockResolvedValue({
        data: { id: TICKET_ID, status: 'draft' },
        error: null,
      } as any)
      vi.mocked((submitTicketWorkflows as any).submitExistingTicketWorkflow).mockResolvedValue({
        success: true,
        ticketId: TICKET_ID,
      } as any)

      const result = await createAndSubmitTicket(validTicketData)
      expect(result.success).toBe(true)
      expect((result as any).data?.ticketId).toBe(TICKET_ID)
    })

    it('returns workflow error on submission failure', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'user-1', role: 'partner', organization_id: 'org-1' }))
      vi.mocked(createTicket).mockResolvedValue({
        data: { id: TICKET_ID, status: 'draft' },
        error: null,
      } as any)
      vi.mocked((submitTicketWorkflows as any).submitExistingTicketWorkflow).mockResolvedValue({
        success: false,
        error: 'workflow failed',
      } as any)

      const result = await createAndSubmitTicket(validTicketData)
      expect(result.success).toBe(false)
      expect(result.error).toBe('workflow failed')
    })

    it('cleans up the draft ticket when admin-side submission fails', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'user-1', role: 'partner', organization_id: 'org-1' }))
      vi.mocked(createTicket).mockResolvedValue({
        data: { id: TICKET_ID, status: 'draft' },
        error: null,
      } as any)
      vi.mocked((submitTicketWorkflows as any).submitExistingTicketWorkflow).mockResolvedValue({
        success: false,
        error: 'workflow failed',
      } as any)

      const result = await createAndSubmitTicket(validTicketData)

      expect(result.success).toBe(false)
      expect(mockAdmin.from).toHaveBeenCalledWith('tickets')
    })
  })

  describe('adminTransitionTicket', () => {
    it('returns Unauthorized when not authenticated', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

      const result = await adminTransitionTicket(TICKET_ID, 'in_progress' as any)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns error when user is not admin', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'user-1', role: 'partner' }))

      const result = await adminTransitionTicket(TICKET_ID, 'in_progress' as any)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Admin only')
    })

    it('returns success on valid transition', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'admin-1', role: 'admin' }))
      vi.mocked(transitionTicket).mockResolvedValue({ success: true } as any)

      const result = await adminTransitionTicket(TICKET_ID, 'in_progress' as any)
      expect(result.success).toBe(true)
    })

    it('returns transition error on failure', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'admin-1', role: 'admin' }))
      vi.mocked(transitionTicket).mockResolvedValue({ success: false, error: 'Invalid transition' } as any)

      const result = await adminTransitionTicket(TICKET_ID, 'draft' as any)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid transition')
    })
  })

  describe('partnerTransitionTicket', () => {
    it('returns Unauthorized when not authenticated', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

      const result = await partnerTransitionTicket(TICKET_ID, 'submitted' as any)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns error when user is not a partner', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'user-1', role: 'admin' }))

      const result = await partnerTransitionTicket(TICKET_ID, 'submitted' as any)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Partners only')
    })

    it('returns success on valid transition', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'user-1', role: 'partner', organization_id: 'org-1' }))
      // getPartnerOwnedTicket 现在使用 server client（RLS）
      mockServer.from.mockReturnValueOnce(ok({ id: TICKET_ID, organization_id: 'org-1' }))
      vi.mocked(transitionTicket).mockResolvedValue({ success: true } as any)

      const result = await partnerTransitionTicket(TICKET_ID, 'submitted' as any)
      expect(result.success).toBe(true)
    })
  })

  describe('partnerReviewSubmissionAction', () => {
    it('returns error for invalid decision value', async () => {
      const action = (ticketActions as any).partnerReviewSubmissionAction
      const result = await action(PARTNER_TICKET_ID, 'invalid_decision', 'Note')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid review decision')
    })

    it('returns error when non-partner tries to review', async () => {
      const action = (ticketActions as any).partnerReviewSubmissionAction
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'w-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'w-1', role: 'worker' }))
      const result = await action(PARTNER_TICKET_ID, 'approved', 'Good')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Partners only')
    })

    it('returns error when partner has no organization', async () => {
      const action = (ticketActions as any).partnerReviewSubmissionAction
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'p-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'p-1', role: 'partner', organization_id: null }))
      const result = await action(PARTNER_TICKET_ID, 'approved', 'Good')
      expect(result.success).toBe(false)
      expect(result.error).toBe('User has no organization')
    })

    it('returns error when revision_requested has no note', async () => {
      const action = (ticketActions as any).partnerReviewSubmissionAction
      const result = await action(PARTNER_TICKET_ID, 'revision_requested', '')
      expect(result.success).toBe(false)
      expect(result.error).toMatch(/explain/)
    })

    it('routes partner review through reviewSubmissionWorkflow', async () => {
      const action = (ticketActions as any).partnerReviewSubmissionAction
      expect(action).toBeTypeOf('function')

      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'partner-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'partner-1', role: 'partner', organization_id: 'org-1' }))
      // getPartnerOwnedTicket 现在使用 server client（RLS）
      mockServer.from.mockReturnValueOnce(ok({ id: PARTNER_TICKET_ID, organization_id: 'org-1', status: 'submitted_for_review' }))
      vi.mocked(reviewSubmissionWorkflow).mockResolvedValue({ success: true, reviewId: 'review-1' } as any)

      const result = await action(PARTNER_TICKET_ID, 'approved', 'Looks good')

      expect(result.success).toBe(true)
      expect(reviewSubmissionWorkflow).toHaveBeenCalledWith(
        mockAdmin as any,
        expect.objectContaining({
          ticketId: PARTNER_TICKET_ID,
          reviewerId: 'partner-1',
          reviewerRole: 'partner',
          decision: 'approved',
          acceptanceFailures: [],
          notes: 'Looks good',
        })
      )
    })
  })

  describe('addPartnerCommentAction', () => {
    it('posts partner comments with fixed partner_admin visibility', async () => {
      const action = (ticketActions as any).addPartnerCommentAction
      expect(action).toBeTypeOf('function')

      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'partner-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'partner-1', role: 'partner', organization_id: 'org-1' }))
      // getPartnerOwnedTicket 现在使用 server client（RLS）
      mockServer.from.mockReturnValueOnce(ok({ id: PARTNER_TICKET_ID, organization_id: 'org-1' }))
      vi.mocked(addComment).mockResolvedValue({ data: { id: 'comment-1' }, error: null } as any)

      const result = await action({ ticketId: PARTNER_TICKET_ID, body: 'Need an update.' })

      expect(result.success).toBe(true)
      expect(addComment).toHaveBeenCalledWith(
        mockAdmin as any,
        expect.objectContaining({
          ticketId: PARTNER_TICKET_ID,
          authorId: 'partner-1',
          authorRole: 'partner',
          visibility: 'partner_admin',
          body: 'Need an update.',
        })
      )
    })

    it('rejects comments on tickets outside the partner organization', async () => {
      const action = (ticketActions as any).addPartnerCommentAction
      expect(action).toBeTypeOf('function')

      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'partner-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'partner-1', role: 'partner', organization_id: 'org-1' }))
      // getPartnerOwnedTicket 现在使用 server client（RLS），org-2 != org-1 触发拒绝
      mockServer.from.mockReturnValueOnce(ok({ id: PARTNER_TICKET_ID, organization_id: 'org-2' }))

      const result = await action({ ticketId: PARTNER_TICKET_ID, body: 'Need an update.' })

      expect(result.success).toBe(false)
      expect(addComment).not.toHaveBeenCalled()
    })

    it('returns validation error for missing body', async () => {
      const action = (ticketActions as any).addPartnerCommentAction
      const result = await action({ ticketId: PARTNER_TICKET_ID, body: '' })
      expect(result.success).toBe(false)
    })

    it('returns Unauthorized when not authenticated (comment)', async () => {
      const action = (ticketActions as any).addPartnerCommentAction
      mockServer.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
      const result = await action({ ticketId: PARTNER_TICKET_ID, body: 'Hi' })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns error when partner has no organization (comment)', async () => {
      const action = (ticketActions as any).addPartnerCommentAction
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'p-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'p-1', role: 'partner', organization_id: null }))
      const result = await action({ ticketId: PARTNER_TICKET_ID, body: 'Hi there partner' })
      expect(result.success).toBe(false)
      expect(result.error).toBe('User has no organization')
    })

    it('returns error when non-partner tries to comment', async () => {
      const action = (ticketActions as any).addPartnerCommentAction
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'admin-1', role: 'admin', organization_id: 'org-1' }))
      const result = await action({ ticketId: PARTNER_TICKET_ID, body: 'Hi' })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Partners only')
    })
  })

  describe('raiseDisputeAction', () => {
    const raiseDispute = () => (ticketActions as any).raiseDisputeAction

    it('returns error when reason is too short', async () => {
      const result = await raiseDispute()(PARTNER_TICKET_ID, 'too short')
      expect(result.success).toBe(false)
      expect(result.error).toMatch(/10 characters/)
    })

    it('returns Unauthorized when not authenticated', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
      const result = await raiseDispute()(PARTNER_TICKET_ID, 'This is a valid long enough reason')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns error when user is not a partner', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'admin-1', role: 'admin' }))
      const result = await raiseDispute()(PARTNER_TICKET_ID, 'This is a valid long enough reason')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Partners only')
    })

    it('returns error when partner has no organization', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'p-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'p-1', role: 'partner', organization_id: null }))
      const result = await raiseDispute()(PARTNER_TICKET_ID, 'This is a valid long enough reason')
      expect(result.success).toBe(false)
      expect(result.error).toBe('User has no organization')
    })

    it('returns error when ticket not found or outside org', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'p-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'p-1', role: 'partner', organization_id: 'org-1' }))
      // RLS returns null (ticket not visible to this partner)
      mockServer.from.mockReturnValueOnce(ok(null))
      const result = await raiseDispute()(PARTNER_TICKET_ID, 'This is a valid long enough reason')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Ticket not found')
    })

    it('returns success when dispute is raised successfully', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'p-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'p-1', role: 'partner', organization_id: 'org-1' }))
      mockServer.from.mockReturnValueOnce(ok({ id: PARTNER_TICKET_ID, organization_id: 'org-1' }))
      vi.mocked(raiseDisputeWorkflow).mockResolvedValue({ success: true, disputeId: 'dispute-1' } as any)

      const result = await raiseDispute()(PARTNER_TICKET_ID, 'Quality is not acceptable, needs revision')
      expect(result.success).toBe(true)
      expect((result as any).data?.disputeId).toBe('dispute-1')
    })

    it('returns workflow error when dispute creation fails', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'p-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'p-1', role: 'partner', organization_id: 'org-1' }))
      mockServer.from.mockReturnValueOnce(ok({ id: PARTNER_TICKET_ID, organization_id: 'org-1' }))
      vi.mocked(raiseDisputeWorkflow).mockResolvedValue({ success: false, error: 'Cannot dispute at this stage' } as any)

      const result = await raiseDispute()(PARTNER_TICKET_ID, 'Quality is not acceptable, needs revision')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Cannot dispute at this stage')
    })
  })

  describe('createAndSubmitTicket additional branches', () => {
    it('returns error when createTicket returns null data', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'user-1', role: 'partner', organization_id: 'org-1' }))
      vi.mocked(createTicket).mockResolvedValue({ data: null, error: null } as any)

      const result = await createAndSubmitTicket(validTicketData)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to create ticket')
    })

    it('logs error when draft cleanup also fails after workflow failure', async () => {
      const { err: mkErr } = await import('../helpers/mock-supabase')
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
      mockAdmin.from
        .mockReturnValueOnce(ok({ id: 'user-1', role: 'partner', organization_id: 'org-1' }))
        .mockReturnValueOnce(mkErr('cleanup update failed')) // soft-delete fails
      vi.mocked(createTicket).mockResolvedValue({ data: { id: TICKET_ID }, error: null } as any)
      vi.mocked((submitTicketWorkflows as any).submitExistingTicketWorkflow).mockResolvedValue({
        success: false, error: 'workflow failed',
      } as any)

      const result = await createAndSubmitTicket(validTicketData)
      // workflow 失败仍返回 false，cleanup 失败只记 log，不影响响应
      expect(result.success).toBe(false)
      expect(result.error).toBe('workflow failed')
    })
  })

  describe('partnerTransitionTicket additional branches', () => {
    it('returns error when partner has no organization', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'p-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'p-1', role: 'partner', organization_id: null }))
      const result = await partnerTransitionTicket(TICKET_ID, 'submitted' as any)
      expect(result.success).toBe(false)
      expect(result.error).toBe('User has no organization')
    })
  })
})
