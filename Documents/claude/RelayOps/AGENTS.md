# Repository Guidelines

## Project Structure & Module Organization
`src/app` contains App Router pages, dashboards, and API routes. `src/lib` holds shared business logic such as the state machine, workflows, integrations, Supabase clients, and shared types. `tests/` mirrors the app by domain: `unit`, `components`, `actions`, `integrations`, `workflows`, and `e2e`. Database assets live in `supabase/migrations/` and `supabase/seed.sql`; longer project docs belong in `docs/`.

## Build, Test, and Development Commands
Use `pnpm dev` to start the Next.js app on `http://localhost:3000`. Run `pnpm build` for a production build and `pnpm typecheck` for strict TypeScript validation. `pnpm lint` runs ESLint, and `pnpm lint:fix` applies safe fixes. `pnpm test` runs Vitest once; `pnpm test -- --coverage` writes reports to `coverage/`. Use `pnpm test:e2e` for Playwright, or a scoped command such as `pnpm test:e2e:admin`. `pnpm validate` is the quick pre-PR gate. For local data services, run `npx supabase start` and `npx supabase db reset`.

## Coding Style & Naming Conventions
Use TypeScript with strict typing and the `@/` alias for imports from `src/`. Prefer 2-space indentation, PascalCase for React components, camelCase for functions and variables, and descriptive filenames such as `ticket.actions.test.ts`. Keep production code out of `console.log`; `console.warn` and `console.error` are acceptable. Follow `eslint.config.mjs` rather than introducing local formatting rules.

## Testing Guidelines
Write Vitest tests for business logic, actions, route handlers, and components. Reserve Playwright for end-to-end role flows and accessibility checks. Name unit and integration files `*.test.ts` or `*.test.tsx`; name E2E files `*.spec.ts`. Current coverage thresholds are lines 90%, functions 90%, statements 90%, and branches 80%. When changing workflows, state transitions, billing, or integrations, update the matching test area in `tests/`.

## Commit & Pull Request Guidelines
Match the repository’s commit style: `feat(scope): summary`, `fix(tests): summary`, `refactor(service): summary`, or `chore: summary`. Keep commits focused and reviewable. Pull requests should include a short problem/solution summary, linked issue or task when available, test evidence such as `pnpm validate`, and screenshots only when UI behavior changes.

## Security & Configuration Tips
Start from `.env.local.example`; never commit real secrets, Stripe keys, or Resend credentials. Use `INTEGRATION_MODE=mock` for normal local development unless you are explicitly testing live services. Do not hand-edit generated directories such as `.next/`, `coverage/`, or `playwright/.auth/`.
