-- RelayOps seed data for local development
-- Run via: supabase db reset  (applies migrations then this seed)

-- ─── Fixed UUIDs for cross-reference ──────────────────────────────────────────

-- Admin user
DO $$
DECLARE
  v_admin_id UUID := '00000000-0000-0000-0000-000000000001';
  v_org1_id  UUID := '00000000-0000-0000-0000-000000000010';
  v_org2_id  UUID := '00000000-0000-0000-0000-000000000011';
  v_partner1_id UUID := '00000000-0000-0000-0000-000000000020';
  v_partner2_id UUID := '00000000-0000-0000-0000-000000000021';
  -- worker_profiles.id = auth.users.id，让 auth.uid() 直接对上 worker_profiles.id
  v_worker1_id  UUID := '00000000-0000-0000-0000-000000000030';
  v_worker2_id  UUID := '00000000-0000-0000-0000-000000000031';
  v_wp1_id   UUID := '00000000-0000-0000-0000-000000000030';
  v_wp2_id   UUID := '00000000-0000-0000-0000-000000000031';
  v_ticket1  UUID := '00000000-0000-0000-0000-000000000100';
  v_ticket2  UUID := '00000000-0000-0000-0000-000000000101';
  v_ticket3  UUID := '00000000-0000-0000-0000-000000000102';
  v_ticket4  UUID := '00000000-0000-0000-0000-000000000103';
  v_ticket5  UUID := '00000000-0000-0000-0000-000000000104';
  v_assign1  UUID := '00000000-0000-0000-0000-000000000200';
  v_sub1     UUID := '00000000-0000-0000-0000-000000000300';
BEGIN

-- ─── Auth users ────────────────────────────────────────────────────────────────

INSERT INTO auth.users (
  instance_id, id, email, encrypted_password, email_confirmed_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  v_admin_id,
  'admin@relayops.com',
  crypt('dev-password-123', gen_salt('bf')),
  NOW(),
  '',
  '',
  '',
  '',
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"email_verified": true}',
  'authenticated',
  'authenticated'
);

INSERT INTO auth.users (
  instance_id, id, email, encrypted_password, email_confirmed_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  v_partner1_id,
  'alice@acmecorp.com',
  crypt('dev-password-123', gen_salt('bf')),
  NOW(),
  '',
  '',
  '',
  '',
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"email_verified": true}',
  'authenticated',
  'authenticated'
);

INSERT INTO auth.users (
  instance_id, id, email, encrypted_password, email_confirmed_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  v_partner2_id,
  'bob@bridgeinc.com',
  crypt('dev-password-123', gen_salt('bf')),
  NOW(),
  '',
  '',
  '',
  '',
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"email_verified": true}',
  'authenticated',
  'authenticated'
);

INSERT INTO auth.users (
  instance_id, id, email, encrypted_password, email_confirmed_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  v_worker1_id,
  'worker001@relayops.internal',
  crypt('dev-password-123', gen_salt('bf')),
  NOW(),
  '',
  '',
  '',
  '',
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"email_verified": true}',
  'authenticated',
  'authenticated'
);

INSERT INTO auth.users (
  instance_id, id, email, encrypted_password, email_confirmed_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  v_worker2_id,
  'worker002@relayops.internal',
  crypt('dev-password-123', gen_salt('bf')),
  NOW(),
  '',
  '',
  '',
  '',
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"email_verified": true}',
  'authenticated',
  'authenticated'
);

INSERT INTO auth.identities (
  user_id, identity_data, provider_id, provider, created_at, updated_at
)
VALUES
  (
    v_admin_id,
    jsonb_build_object(
      'sub', v_admin_id::text,
      'email', 'admin@relayops.com',
      'email_verified', false,
      'phone_verified', false
    ),
    v_admin_id::text,
    'email',
    NOW(),
    NOW()
  ),
  (
    v_partner1_id,
    jsonb_build_object(
      'sub', v_partner1_id::text,
      'email', 'alice@acmecorp.com',
      'email_verified', false,
      'phone_verified', false
    ),
    v_partner1_id::text,
    'email',
    NOW(),
    NOW()
  ),
  (
    v_partner2_id,
    jsonb_build_object(
      'sub', v_partner2_id::text,
      'email', 'bob@bridgeinc.com',
      'email_verified', false,
      'phone_verified', false
    ),
    v_partner2_id::text,
    'email',
    NOW(),
    NOW()
  ),
  (
    v_worker1_id,
    jsonb_build_object(
      'sub', v_worker1_id::text,
      'email', 'worker001@relayops.internal',
      'email_verified', false,
      'phone_verified', false
    ),
    v_worker1_id::text,
    'email',
    NOW(),
    NOW()
  ),
  (
    v_worker2_id,
    jsonb_build_object(
      'sub', v_worker2_id::text,
      'email', 'worker002@relayops.internal',
      'email_verified', false,
      'phone_verified', false
    ),
    v_worker2_id::text,
    'email',
    NOW(),
    NOW()
  );

-- ─── Organizations ─────────────────────────────────────────────────────────────

INSERT INTO organizations (id, name, website, country, status, risk_level, created_at, updated_at)
VALUES
  (v_org1_id, 'Acme Corp', 'https://acmecorp.example.com', 'US', 'active', 'low', NOW() - INTERVAL '60 days', NOW()),
  (v_org2_id, 'Bridge Inc', 'https://bridgeinc.example.com', 'CA', 'active', 'low', NOW() - INTERVAL '45 days', NOW());

-- ─── Public users ──────────────────────────────────────────────────────────────

INSERT INTO users (id, email, role, organization_id, status, created_at, updated_at)
VALUES
  (v_admin_id,    'admin@relayops.com',             'admin',           NULL,      'active', NOW() - INTERVAL '90 days', NOW()),
  (v_partner1_id, 'alice@acmecorp.com',             'partner',         v_org1_id, 'active', NOW() - INTERVAL '60 days', NOW()),
  (v_partner2_id, 'bob@bridgeinc.com',              'partner',         v_org2_id, 'active', NOW() - INTERVAL '45 days', NOW()),
  (v_worker1_id,  'worker001@relayops.internal',    'worker_internal', NULL,      'active', NOW() - INTERVAL '30 days', NOW()),
  (v_worker2_id,  'worker002@relayops.internal',    'worker_internal', NULL,      'active', NOW() - INTERVAL '20 days', NOW());

-- ─── Partner profiles ──────────────────────────────────────────────────────────

INSERT INTO partner_profiles (organization_id, service_focus, monthly_ticket_estimate, approval_status, dpa_requested, dpa_status, notes, created_at, updated_at)
VALUES
  (v_org1_id, 'HubSpot CRM data hygiene and import prep', 8, 'approved', TRUE, 'signed', 'Pilot partner — high engagement', NOW() - INTERVAL '58 days', NOW()),
  (v_org2_id, 'Salesforce data normalization',            5, 'approved', TRUE, 'signed', 'Standard partner — second cohort',  NOW() - INTERVAL '43 days', NOW());

-- ─── Worker profiles ───────────────────────────────────────────────────────────

INSERT INTO worker_profiles (id, nickname, real_name, payout_method_type, payout_method_last4_or_label, approval_status, primary_skill, secondary_skill, on_time_rate, first_pass_rate, dispute_rate, risk_level, nda_signed, data_handling_acknowledged, created_at, updated_at)
VALUES
  (v_wp1_id, 'W-001', 'Jordan Smith',  'bank_transfer', '4321', 'approved', 'data_cleanup', 'crm_import', 97.50, 92.00, 1.50, 'low',  TRUE, TRUE, NOW() - INTERVAL '28 days', NOW()),
  (v_wp2_id, 'W-002', 'Casey Rivera',  'bank_transfer', '8765', 'approved', 'data_normalization', 'report_prep', 100.00, 88.00, 0.00, 'low', TRUE, TRUE, NOW() - INTERVAL '18 days', NOW());

-- 将 worker_profiles 与 auth 账户关联（迁移 00012 新增的 user_id 列）
UPDATE worker_profiles SET user_id = v_worker1_id WHERE id = v_wp1_id;
UPDATE worker_profiles SET user_id = v_worker2_id WHERE id = v_wp2_id;

-- ─── Tickets ───────────────────────────────────────────────────────────────────

-- Ticket 1: status=submitted (org 1)
INSERT INTO tickets (id, organization_id, category, title, problem_summary, expected_output, acceptance_criteria_json, out_of_scope_json, sensitivity_level, pricing_tier, row_count_estimate, status, sla_hours_business, created_by, created_at, updated_at)
VALUES (
  v_ticket1,
  v_org1_id,
  'data_cleanup_import_prep',
  'Deduplicate HubSpot company records before Q1 import',
  'We have approximately 3,200 company records exported from HubSpot. After a recent CRM migration roughly 800 companies appear as duplicates with slightly different email domains. These duplicates are blocking our import into the new system.',
  'A cleaned CSV file with duplicate companies merged into canonical records, plus a change log showing which records were merged and the merge rationale.',
  '[{"id":"ac-1","description":"All duplicate company records are merged into a single canonical entry","required":true},{"id":"ac-2","description":"A change log CSV is provided listing original vs merged record IDs","required":true}]',
  '["Contact-level deduplication","Deal record cleanup"]',
  'standard',
  'pilot',
  3200,
  'submitted',
  16,
  v_partner1_id,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
);

-- Ticket 2: status=scope_locked with invoice_url set (org 1)
INSERT INTO tickets (id, organization_id, category, title, problem_summary, expected_output, acceptance_criteria_json, out_of_scope_json, sensitivity_level, pricing_tier, row_count_estimate, status, sla_hours_business, invoice_url, reviewed_at, created_by, created_at, updated_at)
VALUES (
  v_ticket2,
  v_org1_id,
  'data_normalization_report_prep',
  'Normalize US phone numbers in contacts export',
  'Our contacts export contains phone numbers in at least 6 different formats including country codes, parentheses, dashes, and dots. We need all US phone numbers normalized to E.164 format (+1XXXXXXXXXX) before import.',
  'A normalized contacts CSV where all US phone numbers are in E.164 format, and a separate report listing any phone numbers that could not be normalized.',
  '[{"id":"ac-1","description":"All valid US phone numbers converted to E.164 format","required":true},{"id":"ac-2","description":"Non-normalizable numbers flagged in a separate error log","required":true},{"id":"ac-3","description":"Row count in output matches input","required":true}]',
  '["International numbers outside US/CA","Email validation"]',
  'standard',
  'standard',
  15000,
  'scope_locked',
  16,
  'https://invoice.stripe.com/i/acct_dev/test_inv_001',
  NOW() - INTERVAL '12 days',
  v_partner1_id,
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '12 days'
);

-- Ticket 3: status=in_progress with assignment (org 2)
INSERT INTO tickets (id, organization_id, category, title, problem_summary, expected_output, acceptance_criteria_json, out_of_scope_json, sensitivity_level, pricing_tier, row_count_estimate, status, sla_hours_business, due_at, created_by, created_at, updated_at)
VALUES (
  v_ticket3,
  v_org2_id,
  'crm_import_failure_diagnosis',
  'Diagnose Salesforce import failures for opportunity records',
  'Our last three Salesforce data imports have failed with validation errors on the Opportunity object. Roughly 400 out of 2,000 opportunity records are rejected each run. The errors mention required field violations and picklist mismatches but the details are inconsistent.',
  'A diagnostic report identifying the root causes of the import failures, categorized by error type, with a recommended remediation script or mapping correction for each category.',
  '[{"id":"ac-1","description":"All unique error types are catalogued with counts","required":true},{"id":"ac-2","description":"Remediation recommendation provided for each error type","required":true},{"id":"ac-3","description":"Sample of 5 failing records shown per error category","required":false}]',
  '["Re-importing the fixed records","Salesforce object schema changes"]',
  'sensitive',
  'complex',
  2000,
  'in_progress',
  24,
  NOW() + INTERVAL '2 days',
  v_partner2_id,
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '1 day'
);

-- ticket_assignment for ticket 3
INSERT INTO ticket_assignments (id, ticket_id, worker_id, assigned_by, assigned_at, status)
VALUES (
  v_assign1,
  v_ticket3,
  v_wp1_id,
  v_admin_id,
  NOW() - INTERVAL '3 days',
  'in_progress'
);

-- Ticket 4: status=submitted_for_review (org 2) — has a submission
INSERT INTO tickets (id, organization_id, category, title, problem_summary, expected_output, acceptance_criteria_json, out_of_scope_json, sensitivity_level, pricing_tier, row_count_estimate, status, sla_hours_business, created_by, created_at, updated_at)
VALUES (
  v_ticket4,
  v_org2_id,
  'data_normalization_report_prep',
  'Standardize industry codes across account records',
  'Our account records use a mix of NAICS 2012 and NAICS 2017 codes, plus some internal legacy codes that have no mapping. We need all accounts mapped to NAICS 2022 codes before uploading to the new analytics platform.',
  'An updated accounts CSV with a new NAICS2022 column, a mapping reference spreadsheet, and a list of legacy codes that required manual assignment.',
  '[{"id":"ac-1","description":"All NAICS 2012 and 2017 codes mapped to valid NAICS 2022 equivalents","required":true},{"id":"ac-2","description":"Legacy codes either mapped or flagged as unmappable with reason","required":true}]',
  '["SIC code mapping","Industry label display changes in the UI"]',
  'standard',
  'standard',
  5500,
  'submitted_for_review',
  16,
  v_partner2_id,
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '2 days'
);

-- submission for ticket 4
INSERT INTO submissions (id, ticket_id, worker_id, delivery_summary, submitted_at, status)
VALUES (
  v_sub1,
  v_ticket4,
  v_wp2_id,
  'Mapped all 5,432 account records to NAICS 2022. Found 48 legacy codes with no direct mapping — these are documented in the unmappable_codes.csv attachment. Overall mapping confidence is high; only 3 records required manual assignment based on company description.',
  NOW() - INTERVAL '2 days',
  'under_review'
);

-- Ticket 5: status=completed (org 1) — full history
INSERT INTO tickets (id, organization_id, category, title, problem_summary, expected_output, acceptance_criteria_json, out_of_scope_json, sensitivity_level, pricing_tier, row_count_estimate, status, sla_hours_business, reviewed_at, paid_at, created_by, created_at, updated_at)
VALUES (
  v_ticket5,
  v_org1_id,
  'data_cleanup_import_prep',
  'Clean and merge lead records from trade show CSV',
  'We collected 1,800 leads at three trade shows using three different forms. The resulting CSVs have inconsistent column names, duplicate entries across shows, and several records with missing required fields for HubSpot import.',
  'A single merged CSV with standardized column names matching HubSpot import requirements, duplicates removed, and a separate file listing records that were excluded with reasons.',
  '[{"id":"ac-1","description":"All three CSVs merged into one file with consistent column headers","required":true},{"id":"ac-2","description":"Duplicate leads deduplicated by email","required":true},{"id":"ac-3","description":"Records missing required fields moved to exclusion log","required":true}]',
  '["Email validation or deliverability checks","Enrichment of missing data from external sources"]',
  'standard',
  'pilot',
  1800,
  'completed',
  16,
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '27 days',
  v_partner1_id,
  NOW() - INTERVAL '35 days',
  NOW() - INTERVAL '20 days'
);

-- ─── Ticket events ─────────────────────────────────────────────────────────────

-- Ticket 1 events
INSERT INTO ticket_events (ticket_id, actor_user_id, actor_role, event_type, payload_json, created_at)
VALUES
  (v_ticket1, v_partner1_id, 'partner', 'status_changed', '{"from":"draft","to":"submitted"}', NOW() - INTERVAL '5 days');

-- Ticket 2 events
INSERT INTO ticket_events (ticket_id, actor_user_id, actor_role, event_type, payload_json, created_at)
VALUES
  (v_ticket2, v_partner1_id, 'partner', 'status_changed', '{"from":"draft","to":"submitted"}', NOW() - INTERVAL '20 days'),
  (v_ticket2, v_admin_id, 'admin', 'status_changed', '{"from":"submitted","to":"needs_scope_review"}', NOW() - INTERVAL '19 days'),
  (v_ticket2, v_admin_id, 'admin', 'status_changed', '{"from":"needs_scope_review","to":"scope_locked"}', NOW() - INTERVAL '18 days'),
  (v_ticket2, v_admin_id, 'admin', 'invoice_sent', '{"invoice_url":"https://invoice.stripe.com/i/acct_dev/test_inv_001"}', NOW() - INTERVAL '12 days');

-- Ticket 3 events
INSERT INTO ticket_events (ticket_id, actor_user_id, actor_role, event_type, payload_json, created_at)
VALUES
  (v_ticket3, v_partner2_id, 'partner', 'status_changed', '{"from":"draft","to":"submitted"}', NOW() - INTERVAL '8 days'),
  (v_ticket3, v_admin_id, 'admin', 'status_changed', '{"from":"submitted","to":"needs_scope_review"}', NOW() - INTERVAL '7 days'),
  (v_ticket3, v_admin_id, 'admin', 'status_changed', '{"from":"needs_scope_review","to":"scope_locked"}', NOW() - INTERVAL '6 days'),
  (v_ticket3, v_admin_id, 'admin', 'status_changed', '{"from":"scope_locked","to":"invoiced"}', NOW() - INTERVAL '6 days'),
  (v_ticket3, v_admin_id, 'admin', 'status_changed', '{"from":"invoiced","to":"paid"}', NOW() - INTERVAL '5 days'),
  (v_ticket3, v_admin_id, 'admin', 'status_changed', '{"from":"paid","to":"queued"}', NOW() - INTERVAL '4 days'),
  (v_ticket3, v_admin_id, 'admin', 'status_changed', '{"from":"queued","to":"assigned"}', NOW() - INTERVAL '3 days'),
  (v_ticket3, v_worker1_id, 'worker_internal', 'status_changed', '{"from":"assigned","to":"in_progress"}', NOW() - INTERVAL '1 day');

-- Ticket 4 events
INSERT INTO ticket_events (ticket_id, actor_user_id, actor_role, event_type, payload_json, created_at)
VALUES
  (v_ticket4, v_partner2_id, 'partner', 'status_changed', '{"from":"draft","to":"submitted"}', NOW() - INTERVAL '15 days'),
  (v_ticket4, v_admin_id, 'admin', 'status_changed', '{"from":"submitted","to":"needs_scope_review"}', NOW() - INTERVAL '14 days'),
  (v_ticket4, v_admin_id, 'admin', 'status_changed', '{"from":"needs_scope_review","to":"scope_locked"}', NOW() - INTERVAL '13 days'),
  (v_ticket4, v_admin_id, 'admin', 'status_changed', '{"from":"scope_locked","to":"invoiced"}', NOW() - INTERVAL '12 days'),
  (v_ticket4, v_admin_id, 'admin', 'status_changed', '{"from":"invoiced","to":"paid"}', NOW() - INTERVAL '11 days'),
  (v_ticket4, v_admin_id, 'admin', 'status_changed', '{"from":"paid","to":"queued"}', NOW() - INTERVAL '10 days'),
  (v_ticket4, v_admin_id, 'admin', 'status_changed', '{"from":"queued","to":"assigned"}', NOW() - INTERVAL '8 days'),
  (v_ticket4, v_worker2_id, 'worker_internal', 'status_changed', '{"from":"assigned","to":"in_progress"}', NOW() - INTERVAL '6 days'),
  (v_ticket4, v_worker2_id, 'worker_internal', 'status_changed', '{"from":"in_progress","to":"submitted_for_review"}', NOW() - INTERVAL '2 days');

-- Ticket 5 events (full history)
INSERT INTO ticket_events (ticket_id, actor_user_id, actor_role, event_type, payload_json, created_at)
VALUES
  (v_ticket5, v_partner1_id, 'partner',          'status_changed', '{"from":"draft","to":"submitted"}',               NOW() - INTERVAL '35 days'),
  (v_ticket5, v_admin_id,    'admin',             'status_changed', '{"from":"submitted","to":"needs_scope_review"}',  NOW() - INTERVAL '34 days'),
  (v_ticket5, v_admin_id,    'admin',             'status_changed', '{"from":"needs_scope_review","to":"scope_locked"}', NOW() - INTERVAL '33 days'),
  (v_ticket5, v_admin_id,    'admin',             'status_changed', '{"from":"scope_locked","to":"invoiced"}',         NOW() - INTERVAL '33 days'),
  (v_ticket5, v_admin_id,    'admin',             'status_changed', '{"from":"invoiced","to":"paid"}',                 NOW() - INTERVAL '32 days'),
  (v_ticket5, v_admin_id,    'admin',             'status_changed', '{"from":"paid","to":"queued"}',                   NOW() - INTERVAL '31 days'),
  (v_ticket5, v_admin_id,    'admin',             'status_changed', '{"from":"queued","to":"assigned"}',               NOW() - INTERVAL '30 days'),
  (v_ticket5, v_worker1_id,  'worker_internal',   'status_changed', '{"from":"assigned","to":"in_progress"}',          NOW() - INTERVAL '29 days'),
  (v_ticket5, v_worker1_id,  'worker_internal',   'status_changed', '{"from":"in_progress","to":"submitted_for_review"}', NOW() - INTERVAL '26 days'),
  (v_ticket5, v_partner1_id, 'partner',           'status_changed', '{"from":"submitted_for_review","to":"approved"}', NOW() - INTERVAL '25 days'),
  (v_ticket5, v_admin_id,    'admin',             'status_changed', '{"from":"approved","to":"completed"}',            NOW() - INTERVAL '20 days');

-- ─── Ticket comments for ticket 3 ─────────────────────────────────────────────

INSERT INTO ticket_comments (ticket_id, author_user_id, author_role, visibility, body, created_at)
VALUES
  (v_ticket3, v_partner2_id, 'partner', 'partner_admin',
   'The import errors mention fields like "CloseDate__c" and "StageName" — are these custom fields we should have mapped already? Happy to share the full error log.',
   NOW() - INTERVAL '2 days'),
  (v_ticket3, v_worker1_id, 'worker_internal', 'worker_admin',
   'Good question — I can see CloseDate__c in the error log. That looks like a custom field that may have been renamed in your sandbox vs production. I will flag this in the diagnostic report with a remediation note.',
   NOW() - INTERVAL '1 day');

-- ─── Ledger entries ────────────────────────────────────────────────────────────

-- Payment for completed ticket 5
INSERT INTO ledger_entries (ticket_id, organization_id, type, amount, currency, status, metadata_json, created_at, updated_at)
VALUES
  (v_ticket5, v_org1_id, 'invoice_payment', 450.00, 'USD', 'confirmed', '{"stripe_invoice_id":"inv_test_completed_001"}', NOW() - INTERVAL '27 days', NOW() - INTERVAL '27 days');

-- Worker payout for completed ticket 5
INSERT INTO ledger_entries (ticket_id, worker_id, type, amount, currency, status, metadata_json, created_at, updated_at)
VALUES
  (v_ticket5, v_wp1_id, 'worker_payout', 180.00, 'USD', 'pending', '{"batch_id":null,"notes":"Q1 batch pending"}', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days');

END $$;
