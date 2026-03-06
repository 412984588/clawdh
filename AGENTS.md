# Voice Hub Repository Rules

## Toolchain

- Use `pnpm` for all package and workspace operations.
- Require Node.js `>=22.12.0`.
- Keep the repository as a `pnpm` workspace monorepo using Node.js + TypeScript only.
- Do not introduce Bun or Python as primary implementation runtimes.

## TypeScript

- Keep TypeScript `strict` mode enabled.
- Do not reintroduce `--passWithNoTests`.
- Do not reintroduce global `noImplicitAny: false`.
- Use `zod` for configuration validation.

## Secrets and BYOK

- Never write real tokens, cookies, API keys, webhook secrets, or private credentials into the repository.
- Keep the project BYOK only.
- Commit `.env.example` only; do not commit `.env` or any secret material.
- Keep secret scanning wired into packaging and release flows.

## Provider Protocol Rules

- Do not invent external provider protocol fields or event names.
- Any unverified protocol detail must be marked with `TODO(protocol-confirmation)`.
- Keep provider-specific auth, payload, and event mapping isolated inside provider packages.

## Packaging Rules

- OpenClaw plugin and Claude Code plugin must remain physically separated.
- Claude plugin assets must be self-contained inside the plugin directory.
- Do not make runtime-critical behavior depend on `postinstall`.

## Verification

After important changes, run:

1. `pnpm install`
2. `pnpm typecheck`
3. `pnpm build`
4. `pnpm test`
