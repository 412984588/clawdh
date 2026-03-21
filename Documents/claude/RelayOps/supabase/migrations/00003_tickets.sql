CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  category ticket_category NOT NULL,
  subtype TEXT,
  title TEXT NOT NULL,
  problem_summary TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  acceptance_criteria_json JSONB NOT NULL DEFAULT '[]',
  out_of_scope_json JSONB NOT NULL DEFAULT '[]',
  sensitivity_level sensitivity_level NOT NULL DEFAULT 'standard',
  pricing_tier pricing_tier,
  row_count_estimate INTEGER,
  file_count_estimate INTEGER,
  status ticket_status NOT NULL DEFAULT 'draft',
  sla_hours_business INTEGER DEFAULT 16,
  due_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  no_response_closed_at TIMESTAMPTZ,
  overdue_flag BOOLEAN NOT NULL DEFAULT FALSE,
  invoice_url TEXT,
  stripe_invoice_id TEXT,
  paid_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ticket_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES worker_profiles(id),
  assigned_by UUID NOT NULL REFERENCES users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status assignment_status NOT NULL DEFAULT 'pending'
);

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES worker_profiles(id),
  delivery_summary TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status submission_status NOT NULL DEFAULT 'submitted'
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  reviewer_role user_role NOT NULL,
  reviewer_user_id UUID NOT NULL REFERENCES users(id),
  decision review_decision NOT NULL,
  acceptance_failures_json JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
