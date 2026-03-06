# Codex Audit Final

## Scope

- Repository: `voice-hub-monorepo`
- Audit date: 2026-03-05
- Audit basis: workspace layout, source inspection, manifests, scripts, docs, and real execution of:
  - `pnpm typecheck`
  - `pnpm build`
  - `pnpm test`

## Current Validation Snapshot

- `pnpm typecheck`: pass
- `pnpm build`: pass
- `pnpm test`: pass

These green checks are baseline only. They do not prove compliance with the target architecture because the workspace currently allows gaps such as `--passWithNoTests`, incomplete provider coverage, and missing smoke/install validation.

## Blocker

1. Provider architecture is not yet provider-agnostic.
   - Vendor logic is concentrated in `packages/provider`.
   - `packages/core-runtime` directly depends on provider package semantics.
   - Required provider packages do not exist yet.

2. Runtime/session routing is not safe for multi-session production use.
   - `VoiceRuntime.handleProviderAudio()` assumes a single active listening session.
   - Session registry does not bind all required routing keys.
   - Ownership/arbitration logic is missing.

3. Webhook flow is not yet production-grade.
   - No persisted replay/idempotency table is in use for callbacks.
   - No fast-ACK plus internal async processing queue boundary.
   - Callback routing to ended sessions is incomplete.

4. Memory bank schema does not satisfy required operational tables.
   - Current schema centers on `sessions` and `memories`.
   - Required tables such as `pitfalls`, `successful_patterns`, `task_runs`, `processed_webhooks`, and `pending_announcements` are absent.

5. Test gate is permissive.
   - Multiple packages still use `--passWithNoTests`.
   - Required conformance/smoke/install suites are not present.

## Major

1. Discord voice path is minimal and not hardened.
   - No bounded leave/rejoin recovery loop.
   - No explicit decrypt failure recovery policy wired into runtime.
   - No non-blocking boundary guarantees for backend pressure.

2. Plugin packaging is incomplete for real distribution.
   - OpenClaw and Claude manifests exist, but self-contained install flows and smoke scripts are incomplete.
   - Claude plugin does not yet expose the required skills/hooks/settings layout.

3. Config and docs still describe a smaller provider surface.
   - Current config enumerates `disabled`, `local-mock`, `doubao`, `qwen-dashscope`.
   - Docs do not yet describe capability negotiation, precision mode, provider matrix, or BYOK auth per provider.

4. Default persistence path is repo-local.
   - Current memory DB default is `./data/memory_bank.db`.
   - Required app-data path and sync-drive risk checks are not yet implemented.

## Minor

1. Package naming still reflects prototype state.
   - App package is `apps/voice-hub-app` rather than `apps/bridge-daemon`.

2. Some manifests reference `src` as publish/runtime entry rather than stable `dist`-only install surfaces.

3. Existing README and plugin docs are directionally correct but not aligned to final commands and package responsibilities.

## Recommended Execution Order

1. Lock repo governance and release gates.
2. Split provider contracts/registry and add required provider packages.
3. Refactor runtime/session ownership and announcement routing.
4. Rebuild memory bank and webhook processing around production requirements.
5. Complete OpenClaw and Claude plugin packaging and smoke validation.
6. Rewrite docs to match real commands and validated install flows.
