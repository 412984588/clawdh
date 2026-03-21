# RelayOps — Demo Script

A complete walkthrough of the core business flow. Budget ~20 minutes for a full demo.

---

## Setup (do before the demo starts)

1. `npx supabase start` — confirm Studio opens at http://127.0.0.1:54323
2. `npx supabase db reset` — fresh seed data loaded
3. `pnpm dev` — app running at http://localhost:3000
4. Open two browser windows (or two profiles): one for **admin**, one for **partner**
5. Keep a third tab for **worker**

---

## Scene 1 — Org Isolation (2 min)

**Goal:** Prove that partners from different organisations cannot see each other's tickets.

1. Log in as **alice@acmecorp.com** / `dev-password-123`
   - Redirected to `/partner/tickets`
   - Visible tickets: T1, T2, T5 (all Acme Corp — org 1)

2. Open a new window, log in as **bob@bridgeinc.com** / `dev-password-123`
   - Visible tickets: T3, T4 (Bridge Inc — org 2 only)

3. **Talking point:** Row Level Security enforced at the database layer — even a direct API call with bob's token returns only his org's data.

---

## Scene 2 — Partner Submits a New Ticket (3 min)

**Goal:** Show the 5-step wizard and what a submitted ticket looks like.

Still logged in as **alice** (Acme Corp):

1. Go to `/partner/tickets/new`
2. **Step 1 — Eligibility Check:** answer all 5 questions "Yes" → click Next
3. **Step 2 — Data Source:** describe the file, upload format → Next
4. **Step 3 — Problem Definition:** fill in problem summary + expected output → Next
5. **Step 4 — Acceptance Criteria:** add at least one criterion → Next
6. **Step 5 — Review & Submit:** confirm and submit
7. New ticket appears in the list with status `submitted`

> **Already done in seed data (T1):** If you want to skip wizard steps, point to T1 as an example of a freshly submitted ticket.

---

## Scene 3 — Admin Scopes and Invoices (4 min)

**Goal:** Show admin portal — ticket queue, scoping, pricing, invoice generation.

Log in as **admin@relayops.com** / `dev-password-123`:

1. Go to `/admin/tickets` — all 5 tickets visible (cross-org)
2. Open **T1** (Deduplicate HubSpot — `submitted`)
   - Review problem summary, acceptance criteria
   - Click **Review** → status moves to `needs_scope_review`
   - Set pricing tier (e.g. Pilot) and SLA hours
   - Click **Lock Scope** → status moves to `scope_locked`
   - Invoice URL field is populated (mock Stripe invoice created)
3. **Talking point:** Invoice is sent to the partner via Stripe (mock in local mode — no real charge).

> **Already done in seed data (T2):** T2 is already at `scope_locked` with an invoice URL attached — use it to skip the scoping steps and go straight to the billing conversation.

---

## Scene 4 — Billing / Invoice View (1 min)

Still as **admin**, or switch to **alice**:

1. Admin view: `/admin/ledger` — ledger entries for all tickets
2. Partner view: `/partner/billing` — Alice sees only Acme Corp charges
3. Open **T2** (`scope_locked`) — invoice URL visible in the ticket detail
4. **Talking point:** Ledger entries are immutable audit records; Stripe invoice link opens the real (test mode) invoice page.

> **Seed evidence:** T5 (`completed`) has a confirmed `invoice_payment` ledger entry of $450 USD and a pending `worker_payout` of $180 USD.

---

## Scene 5 — Worker Assignment and In-Progress (3 min)

**Goal:** Show assignment workflow and worker portal.

As **admin**:

1. Open **T3** (`in_progress`, Bridge Inc)
   - Assignment visible: Jordan Smith (W-001) assigned 3 days ago
   - Status timeline in activity log shows full path: submitted → … → in_progress
2. Go to `/admin/tickets`, find a queued ticket (T3 is already in_progress — for demo, either reset or explain with T4's history)
3. **Talking point:** When admin clicks "Assign Worker", the ticket moves queued → assigned; worker acknowledges → in_progress.

Switch to **worker001@relayops.internal** / `dev-password-123`:

1. Go to `/worker/assignments`
2. Open the active assignment for T3
3. **Talking point:** Worker sees the ticket details, acceptance criteria, and can upload deliverables.

---

## Scene 6 — Comments (1 min)

Open **T3** as either admin or worker:

1. Scroll to the Comments section
2. Two pre-loaded comments are visible:
   - **bob** (partner): asked about a custom field `CloseDate__c`
   - **worker001**: replied with a diagnosis note
3. **Talking point:** Comments are scoped by visibility — `partner_admin` comments are visible to both sides; `internal_only` comments are admin/worker only.

---

## Scene 7 — Worker Submits Work (2 min)

**Goal:** Show submission and the review handoff.

As **worker001**:

1. In the assignment detail for T3, click **Submit Work**
2. Fill in delivery summary, attach the output file
3. Status moves: `in_progress` → `submitted_for_review`
4. Partner receives a notification (mock email in local mode)

> **Already done in seed data (T4):** T4 is already at `submitted_for_review` with a real submission from worker002.

---

## Scene 8 — Partner Reviews and Approves (2 min)

**Goal:** Show the partner review step — approve or request revision.

Log in as **bob@bridgeinc.com**:

1. Go to `/partner/tickets`
2. Open **T4** (`submitted_for_review`)
3. Read the delivery summary from Casey Rivera (W-002)
4. Click **Approve** → status moves: `submitted_for_review` → `approved` → `completed`
5. Ledger entry is created for the payment

**Alternative path — Request Revision:**

1. Instead of Approve, click **Request Revision**
2. Add a revision note
3. Status moves back to `revision_requested` → worker picks it up → resubmits
4. **Talking point:** The revision loop is tracked in the activity log with full history.

---

## Scene 9 — Dispute Flow (2 min)

**Goal:** Show the dispute and refund mechanism.

As **partner** (bob or alice on a completed ticket):

1. Open **T5** (`completed`) as alice
2. Click **Raise Dispute** → fill in reason and disputed amount
3. Status moves: `approved` → `disputed`

As **admin**:

1. Go to `/admin/disputes` — T5 dispute visible
2. Click **Resolve** → choose partial refund ($50)
3. Refund ledger entry created; status moves to `resolved`
4. **Talking point:** All financial movements are ledger entries — no direct balance manipulation.

---

## Scene 10 — Storage Signed URL (1 min)

**Goal:** Show that file delivery is secure.

1. Open any ticket with an attachment (e.g. T4 after submission)
2. Click the download link for the deliverable
3. URL is a signed, time-limited Supabase Storage URL
4. **Talking point:** URLs expire — partners can't share static links; each access generates a fresh signed URL via the server.

---

## Wrap-up Talking Points

| Feature | How it works |
|---------|-------------|
| **Org isolation** | RLS at DB level — no app-level filter needed |
| **State machine** | 13 statuses, role-guarded transitions — no illegal state jumps possible |
| **Billing** | Stripe invoicing (test mode) + immutable ledger entries |
| **Storage** | Private Supabase Storage bucket, signed URLs only |
| **Audit trail** | Every state change writes a `ticket_events` row |
| **Mock mode** | Stripe + email replaced with mock adapters — safe to demo without real credentials |
