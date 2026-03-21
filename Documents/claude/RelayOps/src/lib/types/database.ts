import type {
  UserRole,
  UserStatus,
  ApprovalStatus,
  SensitivityLevel,
  RiskLevel,
  TicketStatus,
  TicketCategory,
  PricingTier,
  AssignmentStatus,
  SubmissionStatus,
  ReviewDecision,
  LedgerType,
  LedgerStatus,
  PayoutBatchStatus,
  AttachmentRole,
  CommentVisibility,
  DisputeStatus,
} from './enums'

export interface Organization {
  id: string
  name: string
  website?: string | null
  country?: string | null
  status: UserStatus
  risk_level: RiskLevel
  stripe_customer_id?: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  role: UserRole
  organization_id?: string | null
  status: UserStatus
  created_at: string
  updated_at: string
}

export interface PartnerProfile {
  organization_id: string
  service_focus?: string | null
  monthly_ticket_estimate?: number | null
  approval_status: ApprovalStatus
  dpa_requested: boolean
  dpa_status?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface WorkerProfile {
  id: string
  nickname: string
  real_name?: string | null
  payout_method_type?: string | null
  payout_method_last4_or_label?: string | null
  approval_status: ApprovalStatus
  primary_skill?: string | null
  secondary_skill?: string | null
  on_time_rate: number
  first_pass_rate: number
  dispute_rate: number
  risk_level: RiskLevel
  nda_signed: boolean
  data_handling_acknowledged: boolean
  created_at: string
  updated_at: string
}

export interface AcceptanceCriterion {
  id: string
  description: string
  required: boolean
}

export interface Ticket {
  id: string
  organization_id: string
  category: TicketCategory
  subtype?: string | null
  title: string
  problem_summary: string
  expected_output: string
  acceptance_criteria_json: AcceptanceCriterion[]
  out_of_scope_json: string[]
  sensitivity_level: SensitivityLevel
  pricing_tier?: PricingTier | null
  row_count_estimate?: number | null
  file_count_estimate?: number | null
  status: TicketStatus
  sla_hours_business: number
  due_at?: string | null
  expires_at?: string | null
  reviewed_at?: string | null
  no_response_closed_at?: string | null
  overdue_flag: boolean
  invoice_url?: string | null
  stripe_invoice_id?: string | null
  paid_at?: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface TicketAssignment {
  id: string
  ticket_id: string
  worker_id: string
  assigned_by: string
  assigned_at: string
  status: AssignmentStatus
}

export interface Submission {
  id: string
  ticket_id: string
  worker_id: string
  delivery_summary?: string | null
  submitted_at: string
  status: SubmissionStatus
}

export interface Review {
  id: string
  ticket_id: string
  reviewer_role: UserRole
  reviewer_user_id: string
  decision: ReviewDecision
  acceptance_failures_json: string[]
  notes?: string | null
  created_at: string
}

export interface LedgerEntry {
  id: string
  ticket_id?: string | null
  organization_id?: string | null
  worker_id?: string | null
  dispute_id?: string | null
  type: LedgerType
  amount: number
  currency: string
  status: LedgerStatus
  metadata_json: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface PayoutBatch {
  id: string
  period_start: string
  period_end: string
  status: PayoutBatchStatus
  total_amount: number
  export_file_path?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface Attachment {
  id: string
  ticket_id: string
  submission_id?: string | null
  uploaded_by_user_id: string
  uploaded_by_role: UserRole
  file_name: string
  storage_path: string
  mime_type: string
  byte_size: number
  attachment_role: AttachmentRole
  version: number
  created_at: string
}

export interface TicketEvent {
  id: string
  ticket_id: string
  actor_user_id?: string | null
  actor_role?: UserRole | null
  event_type: string
  payload_json: Record<string, unknown>
  created_at: string
}

export interface Dispute {
  id: string
  ticket_id: string
  raised_by_user_id: string
  raised_by_role: UserRole
  reason: string
  status: DisputeStatus
  resolution_summary?: string | null
  resolved_by_user_id?: string | null
  resolved_at?: string | null
  refund_ledger_entry_id?: string | null
  created_at: string
  updated_at: string
}

export interface TicketComment {
  id: string
  ticket_id: string
  author_user_id: string
  author_role: UserRole
  visibility: CommentVisibility
  body: string
  created_at: string
}
