# Docs & Research Lead Workspace

**Last Updated**: 2026-03-13 15:00 EST  
**Last Reviewed**: 2026-03-13 15:00 EST  
**Status**: All documentation current, versions updated for Claude Code 2.1.75 and Codex 0.114.0

Mission: Turn repeated coding-agent failures and discoveries into durable runbooks, ADRs, and operating knowledge.

## Structure

```
├── runbooks/           # Step-by-step operational guides
│   ├── local-coding-agents-overview.md    # Agent comparison & common ops
│   ├── debugging-agent-failures.md        # Failure patterns & fixes
│   ├── mcp-server-operations.md           # MCP server management & troubleshooting
│   ├── paperclip-heartbeat-operations.md  # Heartbeat lifecycle & procedures
│   ├── gateway-operations.md              # Gateway health, Discord WS, metrics
│   ├── memory-management.md               # Memory compression & limits
│   ├── session-cleanup.md                 # Orphan transcripts & disk cleanup
│   └── skills-management.md               # Skills discovery & quarantine
├── adrs/               # Architecture Decision Records
│   ├── 001-tdd-enforcement.md             # TDD as mandatory workflow
│   ├── 002-type-safety.md                 # Python type hints required
│   ├── 003-session-context-management.md  # Session lifecycle strategy
│   ├── 004-multi-agent-coordination.md    # Multi-agent workflow patterns
│   ├── 005-model-fallback-resilience.md   # Provider fallback & circuit breakers
│   └── 006-codex-hooks-engine.md          # Codex CLI hooks integration
├── troubleshooting/    # Quick-reference problem/solution docs
│   └── auth-issues.md                     # Auth diagnosis & fixes
├── references/         # API refs, model configs, auth guides
│   ├── model-configs.md                   # Provider/model comparison
│   └── paperclip-quick-ref.md             # Paperclip API quick reference
└── templates/          # Document templates
    ├── adr-template.md
    └── runbook-template.md
```

## Verified Versions (2026-03-13 15:00 EST)

| Agent | Installed | Latest (npm) | Notes |
|-------|-----------|--------------|-------|
| Claude Code | 2.1.74 | **2.1.75** | ⚠️ 1 patch behind - includes 1M context for Opus 4.6, token estimation fix |
| Codex CLI | 0.111.0 | **0.114.0** | ⚠️ 3 minor behind - adds hooks engine, health endpoints, code mode |
| Gemini CLI | 0.32.1 | **0.33.1** | ⚠️ 1 minor behind |
| OpenCode | 1.2.0 | 1.2.0 | ✓ Current |
| Paperclip | 0.3.0 | **0.3.1** | ⚠️ 1 patch version behind |

## Focus Areas

1. **Runbooks** for Codex / Claude Code / Gemini local workflows
2. **Provider/Auth/Model truth** and troubleshooting notes
3. **Concise ADRs** and maintenance docs
4. **Research** on better local agent operations patterns

## Writing Rules

- Write only what helps future execution
- Prefer concrete operational guidance over abstract prose
- Keep docs short, scannable, and evidence-linked
- **Proactively research** before writing - cite sources
- Each doc should have: Problem → Solution → Evidence/Links

## Maintenance

- Review runbooks quarterly or after major incidents
- Update ADRs when decisions are reversed or superseded
- Archive obsolete docs with clear deprecation notice
- **Verify versions** in runbooks match installed tools
- **2026-03-13**: Updated Paperclip API port references (3101 → 3103, may vary by deployment)
- **2026-03-13 12:56 EST**: Routine review - all docs current, no updates needed. Version drift noted: Codex 0.111→0.114, Gemini 0.32→0.33, Paperclip 0.3.0→0.3.1 (all available on npm).
- **2026-03-13 13:04 EST**: Added ADR-005 (Model Fallback Resilience) based on gateway error log analysis. Added 4 new failure patterns to debugging runbook: fallback chain failures, context overflow, summarization failures, tool loops, permission scopes.
- **2026-03-13 15:00 EST**: Updated version info for Claude Code 2.1.75 (1M context for Opus 4.6, token estimation fix) and Codex 0.114.0 (hooks engine, health endpoints, code mode). Updated model-configs.md and ADR-005 with new capabilities.

## Quick Links

### Runbooks
- [Agent Overview](runbooks/local-coding-agents-overview.md) - Claude Code, Codex, Gemini, OpenCode
- [Debugging Guide](runbooks/debugging-agent-failures.md) - Failure patterns & fixes
- [Gateway Operations](runbooks/gateway-operations.md) - Discord WS, metrics, incident response
- [Memory Management](runbooks/memory-management.md) - Compression, limits, lessons rotation
- [MCP Server Operations](runbooks/mcp-server-operations.md) - 9 servers, health checks
- [Paperclip Heartbeat Ops](runbooks/paperclip-heartbeat-operations.md) - Lifecycle, checkout protocol
- [Session Cleanup](runbooks/session-cleanup.md) - Orphan transcripts, disk management
- [Skills Management](runbooks/skills-management.md) - Discovery, quarantine, bulk import

### References
- [Auth Troubleshooting](troubleshooting/auth-issues.md)
- [Model Configs](references/model-configs.md)
- [ADR-004: Multi-Agent Coordination](adrs/004-multi-agent-coordination.md)
- [ADR-005: Model Fallback Resilience](adrs/005-model-fallback-resilience.md)
- [ADR-006: Codex Hooks Engine](adrs/006-codex-hooks-engine.md)
