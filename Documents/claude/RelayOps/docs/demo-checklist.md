# RelayOps — Pre-Demo Checklist

Run through this list before every demo. Takes ~5 minutes.

---

## Infrastructure

- [ ] **Docker Desktop is running**
  ```bash
  docker ps   # should list running containers, not an error
  ```

- [ ] **Local Supabase is up**
  ```bash
  npx supabase status
  # Expected: API URL http://127.0.0.1:54321, Studio http://127.0.0.1:54323
  ```

- [ ] **Database has been reset with fresh seed data**
  ```bash
  npx supabase db reset
  # Expected: "Finished supabase db reset."
  ```

---

## Data Verification

- [ ] **5 demo tickets exist** — open Supabase Studio at http://127.0.0.1:54323 → Table Editor → tickets → confirm 5 rows (T1–T5)

- [ ] **5 demo users exist** — Table Editor → users → confirm 5 rows

- [ ] **2 organisations exist** — Table Editor → organizations → confirm Acme Corp + Bridge Inc

---

## App

- [ ] **Dev server is running**
  ```bash
  pnpm dev   # http://localhost:3000
  ```

- [ ] **Homepage loads** — open http://localhost:3000

---

## Account Login Tests

Open http://localhost:3000/login for each account. All passwords: **`dev-password-123`**

| Account | Email | Expected redirect |
|---------|-------|-------------------|
| Admin | admin@relayops.com | `/admin` |
| Partner (Alice) | alice@acmecorp.com | `/partner/tickets` |
| Partner (Bob) | bob@bridgeinc.com | `/partner/tickets` |
| Worker 1 | worker001@relayops.internal | `/worker/assignments` |

- [ ] **Admin login** — lands on `/admin`
- [ ] **Alice login** — lands on `/partner/tickets`, sees 3 tickets (T1, T2, T5)
- [ ] **Bob login** — lands on `/partner/tickets`, sees 2 tickets (T3, T4)
- [ ] **Worker login** — lands on `/worker/assignments`

---

## Page Accessibility

- [ ] `/admin/tickets` — ticket queue visible, all 5 tickets listed
- [ ] `/admin/ledger` — ledger entries visible (T5 has $450 + $180 entries)
- [ ] `/admin/disputes` — page loads without error
- [ ] `/partner/tickets` — Alice sees T1, T2, T5
- [ ] `/partner/tickets/new` — wizard step 1 loads
- [ ] `/partner/billing` — billing page loads for Alice
- [ ] `/worker/assignments` — Jordan Smith's active assignment (T3) visible

---

## Ticket Status Spot-Check

Confirm seed data is at the right statuses before demo:

| Ticket | Title | Expected Status |
|--------|-------|----------------|
| T1 | Deduplicate HubSpot records | `submitted` |
| T2 | Normalize phone numbers | `scope_locked` |
| T3 | Diagnose Salesforce failures | `in_progress` |
| T4 | Standardize industry codes | `submitted_for_review` |
| T5 | Clean trade show CSV | `completed` |

- [ ] All 5 tickets are at the correct statuses (check via admin ticket list or Studio)

---

## Environment Variables

- [ ] `.env.local` has `INTEGRATION_MODE=mock`
- [ ] `.env.local` has non-empty `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `.env.local` has non-empty `SUPABASE_SERVICE_ROLE_KEY`

> If Supabase was restarted, keys may have changed. Run `npx supabase status --output json` and update `.env.local` if needed, then restart `pnpm dev`.

---

## Browser Setup

- [ ] Two browser windows (or profiles) ready: one for admin, one for partner
- [ ] Third tab available for worker
- [ ] Browser zoom at 100% (or demo-friendly size)
- [ ] No leftover sessions from a previous demo (use incognito or log out all accounts)

---

## Ready to Demo

If all boxes are checked, you're good to go. Start with Scene 1 in `docs/demo-script.md`.
