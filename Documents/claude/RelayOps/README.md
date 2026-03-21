# RelayOps

**Managed data operations platform.** Partners submit data cleanup and import jobs; admins scope and price them; internal workers execute; partners review and approve.

```
Partner → submits ticket → Admin scopes + invoices →
Payment → Worker assigned → Worker submits work →
Partner reviews → Approved → Completed
```

---

## Quick Start (Local Dev)

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 20 | [nodejs.org](https://nodejs.org) |
| pnpm | ≥ 9 | `npm i -g pnpm` |
| Docker Desktop | latest | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) |
| Supabase CLI | 2.78.x | `npm i -g supabase` |

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Then fill in the Supabase keys (after `supabase start` — see step 4):

```bash
# Get keys from: npx supabase status --output json
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase status>
SUPABASE_SERVICE_ROLE_KEY=<service_role key from supabase status>
```

For local demo, keep `INTEGRATION_MODE=mock` — Stripe and email calls are intercepted.

### 3. Start Docker Desktop

Ensure Docker is running before starting Supabase.

```bash
# Verify Docker is running
docker ps
```

### 4. Start local Supabase

```bash
npx supabase start
```

On first run this pulls ~1 GB of Docker images. Subsequent starts are fast.

After startup, copy the `ANON_KEY` and `SERVICE_ROLE_KEY` printed to the console into `.env.local`.

### 5. Reset the database (runs all migrations + seed data)

```bash
npx supabase db reset
```

This applies all 15 migration files and loads `supabase/seed.sql` with 5 demo users, 2 organisations, and 5 tickets across the full status lifecycle.

### 6. Start the Next.js dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `INTEGRATION_MODE` | yes | `mock` (local) or `live` (production) |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Local: `http://127.0.0.1:54321` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | From `npx supabase status` |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | From `npx supabase status` — server-side only |
| `STRIPE_SECRET_KEY` | live only | `sk_test_...` — not needed for mock mode |
| `STRIPE_WEBHOOK_SECRET` | live only | `whsec_...` — not needed for mock mode |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | live only | `pk_test_...` — not needed for mock mode |
| `RESEND_API_KEY` | live only | `re_...` — not needed for mock mode |
| `EMAIL_FROM` | live only | Sender address for transactional emails |
| `CRON_SECRET` | live only | Bearer token for cron job endpoints |
| `NEXT_PUBLIC_APP_URL` | yes | `http://localhost:3000` for local dev |
| `ADMIN_NOTIFICATION_EMAIL` | live only | SLA alert recipient email |
| `MIXPANEL_TOKEN` | optional | Mixpanel project token for analytics |
| `NEXT_PUBLIC_SENTRY_DSN` | optional | Sentry client-side error tracking |
| `SENTRY_DSN` | optional | Sentry server-side error tracking |

> In `INTEGRATION_MODE=mock`, Stripe invoice creation and email sending return mock responses. No real charges or emails occur.

### Getting local Supabase keys

```bash
npx supabase status --output json
# → ANON_KEY and SERVICE_ROLE_KEY are in the JSON output
```

---

## Stripe Test Mode

The app uses `INTEGRATION_MODE` to switch between mock and live Stripe behaviour.

| Mode | Behaviour |
|------|-----------|
| `mock` (default) | Invoice creation, webhooks, and payment all return fake responses. Safe for demos. |
| `live` | Real Stripe API calls using `sk_test_...` keys. Use for trial orders. |

### Setup

**1. Get Stripe test keys**

Sign in to [dashboard.stripe.com](https://dashboard.stripe.com), select your test-mode workspace, and copy:
- **Secret key** → `Developers → API keys → Secret key` (`sk_test_...`)
- **Webhook secret** → created when running `stripe listen` (see step 4)

**2. Add to `.env.local`**

```bash
INTEGRATION_MODE=live
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # filled after step 4
```

Restart `pnpm dev` after changing `INTEGRATION_MODE`.

**3. Register Stripe test customers for each org**

```bash
pnpm stripe:setup
```

This creates a Stripe test customer for every organisation that doesn't have one yet and writes the customer ID back to the `organizations` table. Required before the scope-and-invoice workflow will create real invoices.

**4. Forward Stripe webhooks to localhost**

Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) then:

```bash
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe \
              --events invoice.paid,invoice.payment_failed
```

Copy the `whsec_...` secret it prints into `.env.local` as `STRIPE_WEBHOOK_SECRET`, then restart `pnpm dev`.

**5. Trigger the full invoiced → paid flow**

```bash
# Requires INTEGRATION_MODE=live and stripe listen running
pnpm stripe:pay --live
```

The script finds the first `invoiced` ticket, pays its Stripe invoice via the API, waits for the webhook to fire, and confirms the ticket reached `queued` status.

**Mock mode shortcut (no Stripe keys needed)**

You can test the webhook handler without real Stripe keys:

```bash
# Works with INTEGRATION_MODE=mock (or unset)
pnpm stripe:pay
```

This POSTs a crafted `invoice.paid` event directly to the local webhook endpoint. In mock mode the app skips signature verification and processes it normally.

---

## Resend Email

### Setup

**1. Get a Resend API key**

Sign in to [resend.com](https://resend.com) → `API Keys` → create a key.

For local testing you can use Resend's free `onboarding@resend.dev` sender (no domain required).

**2. Add to `.env.local`**

```bash
RESEND_API_KEY=re_...
# Optional — defaults to "RelayOps <onboarding@resend.dev>"
EMAIL_FROM=RelayOps <noreply@yourdomain.com>
```

`INTEGRATION_MODE` controls whether emails are actually sent:
- `mock`: emails are logged to the console, nothing is sent
- `live`: emails go through Resend

**3. Send 3 test emails**

```bash
pnpm email:test your@email.com
```

Sends three templates: `partner_access_approved`, `invoice_sent`, `payment_received`.
Each result shows the Resend message ID on success or the error message on failure.

```
📧  Sending 3 test emails to: your@email.com
    From: RelayOps <onboarding@resend.dev>

  OK    [partner_access_approved] id=abc123  subject="Your RelayOps partner account has been approved"
  OK    [invoice_sent] id=def456  subject="Invoice ready: Deduplicate HubSpot records"
  OK    [payment_received] id=ghi789  subject="Payment confirmed: Deduplicate HubSpot records"

✅  3/3 emails sent successfully.
```

---

## Database

### Migrations

Migrations live in `supabase/migrations/` and run in order:

| File | Contents |
|------|----------|
| `00001_enums.sql` | 17 custom enum types |
| `00002_core_tables.sql` | users, organizations, profiles |
| `00003_tickets.sql` | tickets table |
| `00004_financial.sql` | ledger_entries, payout_batches |
| `00005_attachments.sql` | attachments |
| `00006_events_comments.sql` | ticket_events, ticket_comments |
| `00007_indexes.sql` | 16 performance indexes |
| `00008_triggers.sql` | 8 updated_at triggers |
| `00009_rls_policies.sql` | Row Level Security policies |
| `00010_storage.sql` | Storage bucket + policies |
| `00011_missing_rls_policies.sql` | Backfill missing authenticated read policies |
| `00012_worker_profile_user_link.sql` | Link `worker_profiles.user_id` to auth users |
| `00013_write_rls_policies.sql` | Add explicit write policies for authenticated users |
| `00014_tighten_worker_rls.sql` | Tighten worker-facing access patterns |
| `00015_storage_ticket_prefix_policies.sql` | Restrict storage access by ticket prefix + role ownership |

### Storage and worker identity notes

- Attachment objects in `ticket-files` are expected to use the path format `<ticketId>/<timestamp>-<filename>`.
- Storage policies now authorize access by ticket ownership or assignment, using the first path segment as the ticket id.
- Worker-facing application code must resolve `worker_profiles.user_id -> worker_profiles.id` before comparing against `ticket_assignments.worker_id` or `submissions.worker_id`.

### Commands

```bash
# Full reset — re-runs all migrations + seed
npx supabase db reset

# Apply new migrations only (no seed)
npx supabase db push

# Open Supabase Studio (table editor, SQL editor)
open http://127.0.0.1:54323

# Stop Supabase
npx supabase stop
```

---

## Demo Accounts

All accounts use the same password: **`dev-password-123`**

| Email | Role | Organisation | Notes |
|-------|------|-------------|-------|
| `admin@relayops.com` | admin | — | Full platform access |
| `alice@acmecorp.com` | partner | Acme Corp | Pilot partner, org 1 |
| `bob@bridgeinc.com` | partner | Bridge Inc | Standard partner, org 2 |
| `worker001@relayops.internal` | worker | — | Jordan Smith (W-001) |
| `worker002@relayops.internal` | worker | — | Casey Rivera (W-002) |

### Login

Go to [http://localhost:3000/login](http://localhost:3000/login) and enter email + password.

After login each role is redirected to its dashboard:
- Admin → `/admin`
- Partner → `/partner/tickets`
- Worker → `/worker/assignments`

---

## Demo Tickets (Seed Data)

Five pre-loaded tickets cover the full status lifecycle:

| # | Title (short) | Org | Status | Demo use |
|---|--------------|-----|--------|----------|
| T1 | Deduplicate HubSpot records | Acme Corp | `submitted` | Shows a new ticket awaiting admin review |
| T2 | Normalize phone numbers | Acme Corp | `scope_locked` | Shows pricing locked, invoice sent |
| T3 | Diagnose Salesforce failures | Bridge Inc | `in_progress` | Shows active worker assignment + comments |
| T4 | Standardize industry codes | Bridge Inc | `submitted_for_review` | Shows partner review step |
| T5 | Clean trade show CSV | Acme Corp | `completed` | Shows full history + ledger entries |

---

## Running Tests

### Unit + integration tests (Vitest)

```bash
pnpm test              # run all tests once
pnpm test:watch        # watch mode
```

Current: **421 tests, 41 files, all passing**.

Coverage thresholds: lines 90% / functions 90% / branches 80% / statements 90%.

```bash
pnpm test -- --coverage   # generate coverage report → coverage/
```

### End-to-end tests (Playwright)

E2E tests require the local Supabase and dev server to be running.

```bash
# Run all E2E tests
pnpm test:e2e

# Run a specific role
pnpm test:e2e:admin
pnpm test:e2e:partner

# Open Playwright UI
pnpm test:e2e:ui
```

---

## Project Structure

```
src/
  app/
    (public)/          — Marketing pages (home, how-it-works, for-partners…)
    (auth)/login       — Login page
    (dashboard)/
      admin/           — Admin portal (tickets, metrics, ledger, disputes…)
      partner/         — Partner portal (tickets, billing)
      worker/          — Worker portal (assignments)
    api/
      webhooks/stripe/ — Stripe payment webhook
      cron/            — Scheduled jobs (reminders, timeouts, data retention)
  lib/
    state-machine/     — Ticket status transitions + role guards
    workflows/         — Business workflow functions (8 workflows)
    integrations/      — Stripe, email, storage adapters
    supabase/          — Client factory (browser, server, admin, middleware)
    types/             — Shared TypeScript types
supabase/
  migrations/          — 10 SQL migration files
  seed.sql             — Demo data
tests/
  workflows/           — Workflow unit tests
  engine/              — State machine tests
  integrations/        — Stripe, email, storage tests
  e2e/                 — Playwright end-to-end tests
docs/
  demo-script.md       — Step-by-step walkthrough for live demo
  demo-checklist.md    — Pre-demo self-check list
```

---

## Production Deployment

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for the complete guide:

- Vercel 部署 step-by-step（环境变量、Stripe Webhook、Cron 配置）
- Supabase 生产配置（迁移推送、RLS 验证、Auth 设置）
- 上线前检查清单（25+ 项逐一确认）

Quick summary of required environment variables for production:

| Priority | Variables |
|----------|-----------|
| **P1 — 必填** | `INTEGRATION_MODE=live`, Supabase URL/keys, `NEXT_PUBLIC_APP_URL` |
| **P2 — 支付** | Stripe secret/webhook/publishable keys |
| **P3 — 通知** | Resend API key, `CRON_SECRET`, `ADMIN_NOTIFICATION_EMAIL` |
| **P4 — 可选** | Sentry DSN, Mixpanel Token |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + password) |
| Storage | Supabase Storage |
| Payments | Stripe (invoicing) |
| Email | Resend |
| UI | Tailwind CSS + shadcn/ui |
| Tests | Vitest + Playwright |
| Deployment | Vercel |
