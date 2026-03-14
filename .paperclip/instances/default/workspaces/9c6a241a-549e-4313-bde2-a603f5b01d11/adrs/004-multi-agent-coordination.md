# ADR-004: Multi-Agent Coordination Patterns

**Date**: 2026-03-13
**Status**: Accepted
**Decision Makers**: Engineering Team
**Supersedes**: None

## Context

As projects grow in complexity, single coding agents hit limitations:

- Context window overflow on large codebases
- Sequential execution creates bottlenecks
- Specialized tasks benefit from specialized agents
- Parallel investigation of independent failures saves time

Without coordination patterns, multi-agent setups create chaos: duplicate work, conflicting edits, and unclear ownership.

## Decision

**Use task-domain isolation with structured handoff protocols for multi-agent coordination.**

### Core Patterns

#### Pattern 1: Parallel Dispatch (Independent Domains)

Use when 2+ independent tasks have no shared state.

```markdown
# Dispatcher identifies independent domains

Task A: Fix auth.test.ts failures (auth subsystem)
Task B: Fix api.test.ts failures (API subsystem)
Task C: Fix ui.test.ts failures (UI subsystem)

# Dispatch one agent per domain - they run concurrently

Agent 1 → auth.test.ts
Agent 2 → api.test.ts
Agent 3 → ui.test.ts

# Review and integrate when all return
```

**When to use**: Multiple unrelated failures, different test files, different subsystems
**When NOT to use**: Failures are related, agents would edit same files

#### Pattern 2: Pipeline Handoff (Sequential Dependencies)

Use when output of one agent feeds into another.

```markdown
# Stage 1: Planning Agent

Output: architecture.md, task breakdown

# Stage 2: Implementation Agent (reads Stage 1 output)

Output: working code, unit tests

# Stage 3: Review Agent (reads Stage 1 + 2)

Output: review comments, approval/revision request

# Handoff protocol: 5-line summary

1. What was done
2. Where the artifacts are
3. How to verify
4. Known issues
5. Next steps
```

#### Pattern 3: Supervisor-Worker (Task Board)

Use for ongoing multi-agent teams with shared work queue.

```
Supervisor Agent
  ├── Monitors task board
  ├── Assigns tasks to workers
  ├── Resolves conflicts
  └── Reports status

Worker Agents
  ├── Claim tasks from board
  ├── Execute in isolation
  ├── Report completion
  └── Release on block
```

**Paperclip implementation**: Issues board with `checkout` protocol prevents conflicts.

### Coordination Rules

| Rule                     | Implementation                                              |
| ------------------------ | ----------------------------------------------------------- |
| **No shared file edits** | Each agent works on isolated files/branches                 |
| **Checkout before work** | `POST /api/issues/{id}/checkout` prevents double-assignment |
| **Structured handoffs**  | 5-line summary format (what, where, verify, issues, next)   |
| **Status broadcasting**  | Update task status on every heartbeat                       |
| **Escalation path**      | Blocked → comment with specifics → reassign to supervisor   |

### Implementation in Paperclip

```
Issue Lifecycle for Multi-Agent:
  todo → (checkout) → in_progress → (agent works) → done
                              ↓ (if blocked)
                         blocked → (new comment triggers re-evaluation)
```

**Task decomposition**:

```bash
# Create subtasks with clear ownership
POST /api/companies/{companyId}/issues
{
  "title": "Implement auth middleware",
  "parentId": "{parentIssueId}",
  "assigneeAgentId": "{agentId}",
  "description": "Isolated task - no shared state with other subtasks"
}
```

## Consequences

### Positive

- Parallel execution reduces wall-clock time
- Clear ownership prevents conflicts
- Structured handoffs preserve context between agents
- Scales to large teams

### Negative

- Overhead of coordination
- Risk of divergent implementations without review
- Requires discipline in task decomposition
- Context loss between agent boundaries

### Mitigations

- Final integration review catches divergences
- Shared reference docs (`AGENTS.md`, architecture docs)
- Post-handoff verification steps

## Evidence

- Anthropic: Multi-agent research shows 2-4x speedup for parallel investigations
- Paperclip heartbeat model naturally enforces short, focused agent sessions
- Real-world: 6 test failures across 3 files → 3 parallel agents → all fixed in time of 1

## Alternatives Considered

### Option A: Single agent does everything

**Pros**: No coordination overhead, full context
**Cons**: Slow, context overflow, single point of failure
**Why rejected**: Doesn't scale to complex projects

### Option B: Unstructured parallel agents

**Pros**: Maximum flexibility
**Cons**: Chaos, conflicts, duplicate work
**Why rejected**: Unpredictable results

### Option C: Fully async message passing

**Pros**: Maximum decoupling
**Cons**: Complex infrastructure, eventual consistency issues
**Why rejected**: Over-engineered for current needs

## Related

- [ADR-003: Session Context Management](./003-session-context-management.md)
- [Runbook: Debugging Agent Failures](../runbooks/debugging-agent-failures.md)
- [Runbook: Local Coding Agents](../runbooks/local-coding-agents-overview.md)
- Skill: `dispatching-parallel-agents`
- Skill: `multi-agent-coordination`
