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
