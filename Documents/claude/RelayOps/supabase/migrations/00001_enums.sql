-- Enums for all domains
CREATE TYPE user_role AS ENUM ('admin', 'partner', 'worker_internal');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deactivated');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE sensitivity_level AS ENUM ('standard', 'sensitive', 'highly_sensitive');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE ticket_status AS ENUM (
  'draft','submitted','needs_scope_review','scope_locked',
  'invoiced','paid','queued','assigned','in_progress',
  'submitted_for_review','revision_requested','approved',
  'disputed','completed','resolved','expired',
  'admin_closed_no_response','cancelled'
);
CREATE TYPE ticket_category AS ENUM (
  'data_cleanup_import_prep',
  'data_normalization_report_prep',
  'crm_import_failure_diagnosis'
);
CREATE TYPE pricing_tier AS ENUM ('pilot', 'standard', 'complex', 'custom');
CREATE TYPE assignment_status AS ENUM ('pending', 'acknowledged', 'in_progress', 'completed', 'reassigned');
CREATE TYPE submission_status AS ENUM ('submitted', 'under_review', 'approved', 'revision_requested', 'rejected');
CREATE TYPE review_decision AS ENUM ('approved', 'revision_requested', 'rejected');
CREATE TYPE ledger_type AS ENUM ('invoice_payment', 'worker_payout', 'refund', 'credit', 'adjustment');
CREATE TYPE ledger_status AS ENUM ('pending', 'confirmed', 'failed', 'reversed');
CREATE TYPE payout_batch_status AS ENUM ('draft', 'processing', 'completed', 'failed');
CREATE TYPE attachment_role AS ENUM ('input', 'sample', 'deliverable', 'issue_log', 'mapping_doc', 'payout_export');
CREATE TYPE comment_visibility AS ENUM ('partner_admin', 'worker_admin', 'internal_only');
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved_full_refund', 'resolved_partial_refund', 'resolved_no_refund', 'closed');
