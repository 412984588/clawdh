-- Organizations and Users
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website TEXT,
  country TEXT,
  status user_status NOT NULL DEFAULT 'active',
  risk_level risk_level NOT NULL DEFAULT 'low',
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  status user_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE partner_profiles (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  service_focus TEXT,
  monthly_ticket_estimate INTEGER,
  approval_status approval_status NOT NULL DEFAULT 'pending',
  dpa_requested BOOLEAN NOT NULL DEFAULT FALSE,
  dpa_status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE worker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname TEXT NOT NULL,
  real_name TEXT,
  payout_method_type TEXT,
  payout_method_last4_or_label TEXT,
  approval_status approval_status NOT NULL DEFAULT 'pending',
  primary_skill TEXT,
  secondary_skill TEXT,
  on_time_rate NUMERIC(5,2) DEFAULT 100,
  first_pass_rate NUMERIC(5,2) DEFAULT 100,
  dispute_rate NUMERIC(5,2) DEFAULT 0,
  risk_level risk_level NOT NULL DEFAULT 'low',
  nda_signed BOOLEAN NOT NULL DEFAULT FALSE,
  data_handling_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
