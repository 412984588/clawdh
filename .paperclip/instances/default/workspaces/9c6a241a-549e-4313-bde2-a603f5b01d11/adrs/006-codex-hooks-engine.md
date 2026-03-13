# ADR-006: Codex CLI Hooks Engine Integration

**Date**: 2026-03-13  
**Status**: Proposed  
**Decision Makers**: Engineering Team  
**Supersedes**: None  
**Evidence**: Codex CLI 0.114.0 release notes (2026-03-13)

## Context

Codex CLI 0.114.0 introduces an experimental hooks engine with `SessionStart` and `Stop` hook events. This provides lifecycle automation capabilities similar to Claude Code's hooks system, enabling:

- Automated setup/teardown at session boundaries
- Integration with external systems (notifications, logging)
- Custom validation gates
- State persistence across sessions

Without a standard approach, teams will implement hooks inconsistently, leading to maintenance issues.

## Decision

**Adopt Codex hooks engine for session lifecycle automation, following the same patterns established in Claude Code hooks.**

### Hook Events Available

| Event | Trigger | Use Case |
|-------|---------|----------|
| `SessionStart` | When session begins | Setup environment, load context |
| `Stop` | When session ends | Cleanup, notifications, state save |

### Implementation Pattern

```bash
# Example: SessionStart hook for context loading
# In codex config (~/.codex/config.toml)

[hooks.session_start]
command = "bash"
args = ["-c", "cat CONTEXT.md 2>/dev/null || echo 'No context file'"]

[hooks.stop]
command = "bash"
args = ["-c", "echo 'Session ended at $(date)' >> ~/.codex/sessions.log"]
```

### Integration with Paperclip

```
Codex SessionStart Hook
  ↓
Load task context from Paperclip API
  ↓
Inject relevant docs/requirements
  ↓
Session proceeds with full context

Codex Stop Hook
  ↓
Update Paperclip task status
  ↓
Save session artifacts
  ↓
Clean up temporary files
```

## Health Check Endpoints (Related)

Codex 0.114.0 also adds health endpoints for WebSocket app-server:
- `GET /readyz` - Readiness probe
- `GET /healthz` - Liveness probe

These enable container orchestration and monitoring integration.

## Guidelines

### DO Use Hooks For
- Environment setup (loading context files)
- Cleanup (removing temp files)
- Notifications (alerting on completion)
- State persistence (saving session summaries)

### DON'T Use Hooks For
- Complex business logic (keep hooks simple)
- Long-running operations (hooks have timeouts)
- User interaction (hooks run non-interactively)
- Critical path operations (hooks may fail silently)

### Error Handling
```bash
# Hooks should be idempotent and handle errors gracefully
[hooks.session_start]
command = "bash"
args = ["-c", "setup_env.sh 2>/dev/null || echo 'Setup failed, continuing'"]
```

## Consequences

### Positive
- Consistent lifecycle automation across Codex sessions
- Better integration with CI/CD pipelines
- Automated context loading reduces manual setup
- Health endpoints enable proper monitoring

### Negative
- Experimental feature - may change
- Additional configuration complexity
- Potential for hook failures affecting sessions

### Mitigations
- Keep hooks simple and idempotent
- Test hooks in isolation before deployment
- Monitor hook execution in logs
- Have fallback behavior when hooks fail

## Alternatives Considered

### Option A: No hooks, manual workflow
**Pros**: Simpler, no experimental features  
**Cons**: Manual overhead, inconsistent setup  
**Why rejected**: Automation benefits outweigh stability concerns for non-critical paths

### Option B: Wrapper scripts instead of hooks
**Pros**: More control, easier debugging  
**Cons**: Requires discipline, not integrated  
**Why rejected**: Native hooks provide better integration

## Related

- [ADR-004: Multi-Agent Coordination](./004-multi-agent-coordination.md)
- [Runbook: Local Coding Agents Overview](../runbooks/local-coding-agents-overview.md)
- Codex Release Notes: https://github.com/openai/codex/releases/tag/rust-v0.114.0

## Changelog

- 2026-03-13: Initial version based on Codex CLI 0.114.0 release
