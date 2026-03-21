-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role from users table
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM users WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function to get user's organization_id
CREATE OR REPLACE FUNCTION get_user_org_id(user_id UUID)
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Organizations: partners see their own, admin sees all
CREATE POLICY "org_partner_select" ON organizations FOR SELECT
  USING (
    get_user_role(auth.uid()) = 'admin'
    OR id = get_user_org_id(auth.uid())
  );

-- Users: see yourself, admin sees all
CREATE POLICY "users_select" ON users FOR SELECT
  USING (
    id = auth.uid()
    OR get_user_role(auth.uid()) = 'admin'
  );

-- Tickets: partners see their org's tickets, admin sees all
CREATE POLICY "tickets_partner_select" ON tickets FOR SELECT
  USING (
    get_user_role(auth.uid()) = 'admin'
    OR organization_id = get_user_org_id(auth.uid())
  );

CREATE POLICY "tickets_partner_insert" ON tickets FOR INSERT
  WITH CHECK (
    get_user_role(auth.uid()) = 'partner'
    AND organization_id = get_user_org_id(auth.uid())
  );

-- Ticket events: same as tickets
CREATE POLICY "ticket_events_select" ON ticket_events FOR SELECT
  USING (
    get_user_role(auth.uid()) = 'admin'
    OR ticket_id IN (
      SELECT id FROM tickets WHERE organization_id = get_user_org_id(auth.uid())
    )
  );

-- Comments: visibility-based
CREATE POLICY "ticket_comments_select" ON ticket_comments FOR SELECT
  USING (
    get_user_role(auth.uid()) = 'admin'
    OR (
      visibility = 'partner_admin'
      AND ticket_id IN (
        SELECT id FROM tickets WHERE organization_id = get_user_org_id(auth.uid())
      )
    )
  );

-- Attachments: ticket-based access
CREATE POLICY "attachments_select" ON attachments FOR SELECT
  USING (
    get_user_role(auth.uid()) = 'admin'
    OR ticket_id IN (
      SELECT id FROM tickets WHERE organization_id = get_user_org_id(auth.uid())
    )
  );

-- Ledger entries: org-scoped
CREATE POLICY "ledger_partner_select" ON ledger_entries FOR SELECT
  USING (
    get_user_role(auth.uid()) = 'admin'
    OR organization_id = get_user_org_id(auth.uid())
  );
