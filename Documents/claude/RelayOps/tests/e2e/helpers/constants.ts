// ─── Seed user credentials ───────────────────────────────────────────────────
export const ADMIN_EMAIL = 'admin@relayops.com'
export const PARTNER_EMAIL = 'alice@acmecorp.com'
export const WORKER_EMAIL = 'worker001@relayops.internal'
export const PASSWORD = 'dev-password-123'

// ─── Seed UUIDs ──────────────────────────────────────────────────────────────
export const SEED_ADMIN_ID = '00000000-0000-0000-0000-000000000001'
export const SEED_PARTNER1_ID = '00000000-0000-0000-0000-000000000020'
export const SEED_WORKER1_ID = '00000000-0000-0000-0000-000000000030'
export const SEED_WORKER_PROFILE_ID = '00000000-0000-0000-0000-000000000030'

// ticket_ids: 0100–0104
export const SEED_TICKET_IDS = [
  '00000000-0000-0000-0000-000000000100',
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000103',
  '00000000-0000-0000-0000-000000000104',
]

// Seed assignment 000...0200 belongs to worker profile 000...0030, which is
// linked to auth user worker001 via worker_profiles.user_id in migration 00012.
export const SEED_ASSIGNMENT_ID = '00000000-0000-0000-0000-000000000200'

// ─── App routes ──────────────────────────────────────────────────────────────
export const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'
