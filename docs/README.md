# Documentation Index

**Owner**: Docs & Research Lead | **Last Updated**: 2026-03-13 21:45 EDT | **Last Review**: 2026-03-13 21:45 EDT

## Architecture Decision Records (ADRs)

| #                                                          | Title                                  | Status   | Date       |
| ---------------------------------------------------------- | -------------------------------------- | -------- | ---------- |
| [0001](adr/0001-core-application-stack.md)                 | Core Application Stack                 | Accepted | 2026-03    |
| [0002](adr/0002-repository-structure-and-quality-gates.md) | Repository Structure and Quality Gates | Accepted | 2026-03    |
| [0003](adr/0003-design-system-architecture.md)             | Design System Architecture             | Accepted | 2026-03    |
| [0004](adr/0004-agent-adapter-contract.md)                 | Agent Adapter Contract                 | Accepted | 2026-03-13 |
| [0005](adr/0005-heartbeat-session-model.md)                | Heartbeat and Session Management Model | Accepted | 2026-03-13 |
| [0006](adr/0006-mcp-server-integration-architecture.md)    | MCP Server Integration Architecture    | Accepted | 2026-03-13 |
| [0007](adr/0007-agent-selection-strategy.md)               | Agent Selection Strategy               | Accepted | 2026-03-13 |

## Runbooks

| #                                                          | Title                                       | Owner                        | Last Updated |
| ---------------------------------------------------------- | ------------------------------------------- | ---------------------------- | ------------ |
| [0001](runbooks/0001-local-workspace-bootstrap.md)         | Local Workspace Bootstrap                   | Founding Engineer            | 2026-03-13   |
| [0002](runbooks/0002-agent-recovery-playbook.md)           | Agent Recovery Playbook                     | Runtime Reliability Engineer | 2026-03-13   |
| [0003](runbooks/0003-quality-gates-verification.md)        | Quality Gates and CI Verification           | Verification Lead            | 2026-03-13   |
| [0004](runbooks/0004-git-worktree-agent-isolation.md)      | Git Worktree Agent Isolation                | Founding Engineer            | 2026-03-13   |
| [0005](runbooks/0005-provider-auth-troubleshooting.md)     | Provider Auth Troubleshooting               | Runtime Reliability Engineer | 2026-03-13   |
| [0006](runbooks/0006-coding-agent-cli-patterns.md)         | Coding Agent CLI Patterns                   | Docs & Research Lead         | 2026-03-13   |
| [0007](runbooks/0007-debugging-agent-failures.md)          | Debugging Agent Failures                    | Docs & Research Lead         | 2026-03-13   |
| [0008](runbooks/0008-mcp-server-management.md)             | MCP Server Management                       | Docs & Research Lead         | 2026-03-13   |
| [0009](runbooks/0009-model-selection-guide.md)             | Model Selection Guide                       | Docs & Research Lead         | 2026-03-13   |
| [0010](runbooks/0010-multi-agent-coordination.md)          | Multi-Agent Coordination                    | Docs & Research Lead         | 2026-03-13   |
| [0011](runbooks/0011-local-agent-operations.md)            | Local Agent Operations                      | Docs & Research Lead         | 2026-03-13   |
| [0012](runbooks/0012-cost-optimization.md)                 | Agent Cost Optimization                     | Docs & Research Lead         | 2026-03-13   |
| [0013](runbooks/0013-openclaw-engine-runaway-loop.md)      | OpenClaw Engine Runaway Loop Recovery       | Runtime Reliability Engineer | 2026-03-13   |
| [0014](runbooks/0014-local-paperclip-setup.md)             | Local Paperclip Setup                       | Docs & Research Lead         | 2026-03-13   |
| [0015](runbooks/0015-reliability-service.md)               | Reliability Service Operations              | Runtime Reliability Engineer | 2026-03-13   |
| [0016](runbooks/0016-adapter-resilience-testing.md)        | Adapter Resilience Testing                  | Docs & Research Lead         | 2026-03-13   |
| [0017](runbooks/0017-performance-baselines.md)             | Performance Baselines                       | Docs & Research Lead         | 2026-03-13   |
| [0018](runbooks/0018-backend-hardening-patterns.md)        | Backend Hardening Patterns                  | Docs & Research Lead         | 2026-03-13   |
| [0019](runbooks/0019-error-recovery-resilience.md)         | Error Recovery and Session Resilience       | Docs & Research Lead         | 2026-03-13   |
| [0020](runbooks/0020-error-recovery-patterns.md)           | Error Recovery Patterns                     | Runtime Reliability Engineer | 2026-03-13   |
| [0021](runbooks/0021-claude-local-adapter-instructions.md) | Claude Local Adapter Instructions Injection | Runtime Reliability Engineer | 2026-03-13   |
| [0022](runbooks/0022-provider-health-monitoring.md)        | Provider Health Monitoring                  | Runtime Reliability Engineer | 2026-03-13   |
| [0023](runbooks/0023-claude-local-cli-flag-bug.md)         | claude_local Adapter CLI Flag Bug           | Runtime Reliability Engineer | 2026-03-13   |

## API Reference

| Document                                          | Status | Last Updated |
| ------------------------------------------------- | ------ | ------------ |
| [MVP API Reference](api-reference.md)             | Active | 2026-03-13   |
| [API Integration Guide](api-integration-guide.md) | Active | 2026-03-13   |

## Architecture

| Document                                                       | Status | Last Updated |
| -------------------------------------------------------------- | ------ | ------------ |
| [MVP Architecture Reference](architecture/mvp-architecture.md) | Active | 2026-03-13   |

## Product Requirements

| Document                                                          | Status |
| ----------------------------------------------------------------- | ------ |
| [Agent Operations Platform PRD](prd/agent-operations-platform.md) | Active |

## Quick Reference

### Common Commands

```bash
# Setup
make setup          # Install all dependencies

# Quality Gates
make test           # Run all tests
make lint           # Run linters
make format         # Auto-format code
make ci             # Run full CI suite

# Development
cd backend && uv run uvicorn app.main:app --reload
cd frontend && npm run dev
```

### Team Contacts

| Role                         | Responsibility                             |
| ---------------------------- | ------------------------------------------ |
| CEO                          | Direction, approvals, structural decisions |
| Founding Engineer            | Implementation, tooling, automation        |
| Runtime Reliability Engineer | Runtime stability, recovery, auth          |
| Verification Lead            | Independent verification, quality          |
| Docs & Research Lead         | Runbooks, ADRs, operational knowledge      |

### Key Files

- `Makefile` — Repo-level commands
- `backend/pyproject.toml` — Python dependencies and config
- `frontend/package.json` — Node dependencies and scripts
- `agents/*/AGENTS.md` — Agent instructions per role

## Changelog

| Date                 | Document            | Change                                                                                                         |
| -------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------- |
| 2026-03-13 22:30 EDT | RB 0023             | Created claude_local Adapter CLI Flag Bug runbook (root cause: --append-system-prompt-file doesn't exist)      |
| 2026-03-13 21:45 EDT | RB 0021-0022        | Fixed duplicate numbering: 0021=Claude Local Adapter Instructions, 0022=Provider Health Monitoring             |
| 2026-03-13 21:35 EDT | Research            | Documented Gemini CLI v0.34.0 preview (keybindings, parallel tools, A2A, voice mode)                           |
| 2026-03-13 21:30 EDT | RB 0019-0021        | Fixed duplicate numbering: renamed 0019-provider-health-monitoring to 0021, added RB 0020 and RB 0021 to index |
| 2026-03-13 16:53 EDT | CLI-36              | Completed: API Integration Guide with middleware docs, auth flow, curl examples                                |
| 2026-03-13 16:53 EDT | API Guide           | Created comprehensive API Integration Guide (middleware, endpoints, models, patterns)                          |
| 2026-03-13 16:50 EDT | RB 0019             | Created Error Recovery and Session Resilience runbook                                                          |
| 2026-03-13 16:34 EDT | RB 0016, 0017, 0018 | Added to documentation index                                                                                   |
| 2026-03-13 18:20 EDT | RB 0015             | Created Reliability Service Operations runbook                                                                 |
| 2026-03-13 18:20 EDT | Backend             | Implemented run cleanup, heartbeat, and auth drift detection service                                           |
| 2026-03-13 17:45 EDT | RB 0006             | Updated with Claude Code 2.1.75, Codex CLI 0.114.0, Gemini CLI 0.33.1                                          |
| 2026-03-13 17:45 EDT | RB 0009             | Added Opus 4.6 with 1M context window for large codebase analysis                                              |
| 2026-03-13 17:45 EDT | Research Log        | Added CLI version updates review with Codex 0.114.0 features                                                   |
| 2026-03-13 17:00 EDT | CLI-15              | Completed: Document MVP API surface and integration guide                                                      |
| 2026-03-13 17:00 EDT | CLI-18              | Completed: Write integration guide for local Paperclip setup                                                   |
| 2026-03-13 16:45 EDT | RB 0014             | Created Local Paperclip Setup runbook                                                                          |
| 2026-03-13 16:45 EDT | RB 0006             | Updated with Codex CLI v0.111.0 and Gemini CLI v0.32.1 new commands                                            |
| 2026-03-13 16:45 EDT | RB 0008             | Added new MCP servers (brave-search, netlify, postgres, slack, codex)                                          |
| 2026-03-13 16:45 EDT | RB 0007             | Added Paperclip run cleanup patterns (3 proposed patterns)                                                     |
| 2026-03-13 16:45 EDT | Research Log        | Added comprehensive research session findings                                                                  |
| 2026-03-13           | Arch                | Added MVP Architecture Reference (project structure, API, data model, components)                              |
| 2026-03-13           | RB 0012             | Added Agent Cost Optimization runbook                                                                          |
| 2026-03-13           | ADR 0007            | Added Agent Selection Strategy                                                                                 |
| 2026-03-13           | RB 0006, 0008       | Updated with Claude Code v2.1.74 changes                                                                       |
| 2026-03-13           | Index               | Added RB 0011 (Local Agent Operations)                                                                         |
| 2026-03-13           | RB 0007             | Added Paperclip run ownership conflict troubleshooting                                                         |
| 2026-03-13           | API Ref             | Added MVP API Reference (endpoints, schemas, integration guide)                                                |
| 2026-03-13           | All                 | Initial documentation structure created                                                                        |
