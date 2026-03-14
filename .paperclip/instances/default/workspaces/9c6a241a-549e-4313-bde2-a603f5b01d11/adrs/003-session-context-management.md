# ADR-003: Session & Context Window Management

**Date**: 2026-03-13
**Status**: Accepted
**Decision Makers**: Engineering Team
**Supersedes**: None

## Context

Coding agents degrade over long sessions due to:

- Context window filling up with irrelevant history
- Earlier instructions getting "lost in the middle"
- Conflicting information from multiple turns
- Increasing cost per turn as context grows

Without a strategy, agents become unreliable after ~30-50 turns.

## Decision

**Use file-based context with periodic session refreshes instead of continuous long sessions.**

### Core Principles

1. **File-based context over inline**: Reference docs, don't paste them
2. **Short sessions for discrete tasks**: 15-30 turns max per task
3. **Explicit context files**: `AGENTS.md` for rules, `CONTEXT.md` for current task state
4. **Fresh sessions for new tasks**: Start clean, inject only relevant context

### Implementation

```
project/
├── AGENTS.md          # Global rules (<500 lines, always loaded)
├── CONTEXT.md         # Current task state (updated each session)
├── docs/
│   ├── architecture.md # Reference, loaded on demand
│   └── api-spec.md     # Reference, loaded on demand
└── .claude/
    └── CLAUDE.md       # Tool-specific config
```

### Session Lifecycle

```
Start task
  ↓
Read AGENTS.md + relevant context files
  ↓
Work for 15-30 turns
  ↓
Update CONTEXT.md with progress
  ↓
Session complete or refresh
  ↓
New session reads updated CONTEXT.md
```

## Context Budget Guidelines

| File Type         | Max Size   | When Loaded             |
| ----------------- | ---------- | ----------------------- |
| AGENTS.md         | 500 lines  | Every session           |
| CONTEXT.md        | 200 lines  | Every session           |
| Architecture docs | 1000 lines | On demand               |
| API references    | 2000 lines | On demand (via grep)    |
| Full codebase     | N/A        | Never inline, use tools |

## Consequences

### Positive

- Consistent agent performance
- Lower cost per turn
- Clearer task boundaries
- Better context isolation between tasks

### Negative

- Overhead of maintaining context files
- Some information transfer loss between sessions
- Requires discipline to update CONTEXT.md

### Neutral

- Aligns with Paperclip heartbeat model (short executions)

## Alternatives Considered

### Option A: Continuous long sessions

**Pros**: No context transfer needed
**Cons**: Degrades after 50+ turns, expensive, unpredictable
**Why rejected**: Performance degradation is unacceptable

### Option B: Full context compaction

**Pros**: Keeps all history
**Cons**: Compaction loses detail, adds latency
**Why rejected**: Lossy process, unpredictable what's kept

## Evidence

- Anthropic recommends <100K tokens for optimal performance (200K still shows degradation)
- "Lost in the middle" paper shows 20-40% recall drop for middle content
- Paperclip heartbeat model naturally enforces session boundaries
- **Update (2026-03-13)**: Claude Code 2.1.75 adds 1M context for Opus 4.6 (Max/Team/Enterprise). While larger context helps for initial codebase analysis, the same degradation principles apply - use short sessions for discrete tasks regardless of available context.

## Related

- [ADR-001: TDD Enforcement](./001-tdd-enforcement.md)
- [Runbook: Debugging Agent Failures](../runbooks/debugging-agent-failures.md)
