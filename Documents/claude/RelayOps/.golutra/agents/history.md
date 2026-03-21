# History

## Description
- Record each Git change or local file change summary.
- Each entry includes reason, impact scope, and related links (put links in Notes when applicable).
- If owner is not specified, default to `<project-name>-agent-1`.
- Use datetime format `YYYY-MM-DD HH:MM` (24h).

## Mandatory Action
- MUST: When this table reaches 50 entries, compress the records into shorter and more general summaries, keeping stable and reusable change points.

## Record Template
| Date Time | Type | Summary | Reason | Impact Scope | Owner Id | Notes |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 2026-03-21 09:53 | code | Added sitewide SEO metadata, OG image generation, sitemap/robots routes, JSON-LD, and verification tests for public pages. | Implement P4-01 SEO optimization without changing page content or dashboard routes. | `src/app/layout.tsx`, public marketing pages, `src/app/opengraph-image.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/lib/seo.ts`, `tests/unit/seo.test.tsx` | 01KM89Q90KP1QV3XDHYDHXX5EH | Verified with `pnpm exec vitest run tests/unit/seo.test.tsx`, `pnpm test`, `pnpm typecheck`, and `pnpm build`. |
