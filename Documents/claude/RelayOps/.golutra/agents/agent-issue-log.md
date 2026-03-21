# Agent Terminal Issue Log

## Description
- This file is the issue fact log for recent execution problems.
- Load this file before each task to review recent issue patterns and avoid repeating them.
- Add a new entry whenever execution hits a real problem such as rework, misjudgment, omission, rollback, compatibility pit, validation gap, command misuse, or unintended scope expansion.
- Each entry must stay concrete and include `Problem`, `Action`, and `Verification`.
- If no issues occur in the current task, do not add a new entry.
- Do not write long-term rules, abstractions, or one-time task summaries here; promote stable lessons to `agent-guidelines.md`.
- Use datetime format `YYYY-MM-DD HH:MM` (24h).

## Mandatory Action
- MUST: If this registration table reaches 50 entries, summarize the stable and reusable lessons into `agent-guidelines.md`, then clear only the summarized issue rows.

## Registration Table
| Time | Problem | Action | Verification |
| --- | --- | --- | --- |
| 2026-03-21 09:53 | Vitest failed to resolve app route imports written as alias paths with route-group segments such as `@/app/(public)/page`, which caused false-negative SEO test failures. | Switched the new SEO test file to relative imports for App Router page modules while keeping alias imports for normal library modules. | `pnpm exec vitest run tests/unit/seo.test.tsx` passed, and the full `pnpm test` suite also passed. |
| 2026-03-21 10:17 | Full `pnpm test` for P4-02 is blocked by 6 failing tests in `tests/unit/design-system.test.ts` and `tests/components/tickets/ticket-status-badge.test.tsx`, which assert unrelated design-system colors/docs outside the case-studies scope. | Verified P4-02-specific work with targeted tests and confirmed `pnpm build` passes, then isolated the remaining failures to unrelated design-system files before escalation. | `pnpm exec vitest run tests/components/public/case-studies-page.test.tsx tests/components/layouts/public-navbar.test.tsx tests/unit/seo.test.tsx` passed; `pnpm build` passed; `pnpm test` failed only on unrelated design-system assertions. |
| 2026-03-21 10:29 | Full `pnpm test` for P3-02 is blocked by 5 non-UI baseline failures in `tests/middleware/middleware-rate-limit.test.ts`, `tests/utils/logger.test.ts`, `tests/workflows/full-lifecycle.test.ts`, and `src/app/api/webhooks/stripe/__tests__/route.test.ts`, all outside the style-only task boundary. | Kept the implementation scoped to style/class changes, verified the design-system work with targeted tests plus landing-page regression coverage, and recorded the unrelated failing suites instead of patching business logic owned by other members. | `pnpm exec vitest run tests/unit/design-system.test.ts tests/components/tickets/ticket-status-badge.test.tsx` passed; `pnpm exec vitest run tests/components/public/landing-page.test.tsx` passed; `pnpm build` passed; `pnpm test` failed only in the four non-UI suites listed. |
