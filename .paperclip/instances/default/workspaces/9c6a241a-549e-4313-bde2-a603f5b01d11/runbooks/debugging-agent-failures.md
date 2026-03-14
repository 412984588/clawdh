# Runbook: Debugging Coding Agent Failures

**Last Updated**: 2026-03-13
**Status**: Active
**Owner**: Docs & Research Lead

## Problem

Coding agents (Claude Code, Codex, Gemini) fail in predictable patterns. This runbook documents common failures and their fixes.

## Quick Diagnosis Flowchart

```
Agent failed
├── Hallucination (wrong API, fake lib)
│   └── → Force doc verification
├── Infinite loop (no progress)
│   └── → Add explicit stopping criteria
├── Context overflow (ignores instructions)
│   └── → Reduce task scope
├── Test failure (TDD violation)
│   └── → Check test-first evidence
└── Auth error
    └── → See auth-issues.md
```

## Common Failures & Fixes

### 1. Hallucinated APIs/Libraries

**Symptom**: Code uses non-existent functions or parameters
**Root Cause**: Training data cutoff or model confidence without verification

**Fix**:

```markdown
# Add to AGENTS.md

## Verification Required

- Before using any API, verify with official docs
- Use `context7` MCP server for documentation lookup
- If uncertain, ask human rather than guessing
```

**Evidence**: Agents perform 40% better when explicitly told to verify ([Source: Anthropic best practices](https://docs.anthropic.com))

---

### 2. Infinite Planning Loops

**Symptom**: Agent keeps planning but never implements
**Root Cause**: Ambiguous requirements, no clear "done" signal

**Fix**:

```markdown
# Add to AGENTS.md

## Execution Rules

1. Plan maximum 3 steps ahead
2. After planning, IMMEDIATELY start implementation
3. Each response must include code changes, not just thoughts
4. If blocked for >2 turns, state the blocker explicitly
```

---

### 3. Context Window Degradation

**Symptom**: Agent forgets earlier instructions, repeats mistakes
**Root Cause**: Long conversations exceed effective context

**Fix**:

```bash
# Start fresh session for new task
# Or use subtask delegation:
"Create a new subagent for this specific task with only relevant context"
```

**Prevention**:

- Keep `AGENTS.md` under 500 lines
- Break tasks into <50 turn sessions
- Use file-based context (reference docs) instead of inline

---

### 4. TDD Workflow Violations

**Symptom**: Implementation without tests, or tests written after code
**Root Cause**: Agent shortcut behavior

**Detection**:

```bash
# Check if test file exists before implementation
find . -name "*.test.*" -o -name "test_*" | xargs ls -la

# Check git history for test-first evidence
git log --oneline --all | grep -i "test"
```

**Fix**: Enforce via skill file with explicit gate:

```markdown
BLOCK: Do not write implementation code until a failing test exists.
```

---

### 5. Wrong Model Selected

**Symptom**: Poor quality output, wrong capabilities
**Root Cause**: Default model not optimal for task type

**Fix by Task Type**:
| Task | Optimal Model | Why |
|------|---------------|-----|
| Code generation | GPT-4o / Claude Sonnet | Fast, accurate |
| Complex reasoning | Claude Opus | Best reasoning |
| Large context | Gemini Pro | 1M+ window |
| Quick edits | Claude Haiku | Fast, cheap |

---

## Escalation Path

1. **Try fix from this runbook** (5 min)
2. **Restart agent session** with clearer instructions (2 min)
3. **Delegate to different agent** if one consistently fails (immediate)
4. **Human intervention** for architectural decisions

## Prevention Checklist

Before starting any coding task:

- [ ] `AGENTS.md` is current and <500 lines
- [ ] Task scope is clear (single feature/bug)
- [ ] Test requirements are explicit
- [ ] API/library verification rule is present
- [ ] Stopping criteria are defined

## References

- [Troubleshooting: Auth Issues](../troubleshooting/auth-issues.md)
- [ADR-001: TDD Enforcement](../adrs/001-tdd-enforcement.md)
- [ADR-002: Type Safety](../adrs/002-type-safety.md)

## Agent-Specific Failure Patterns

### Claude Code Specific

| Issue                     | Symptom                     | Fix                                         |
| ------------------------- | --------------------------- | ------------------------------------------- |
| `--worktree` fails        | Git worktree creation error | Ensure clean git state, check branch exists |
| Skills disabled           | No slash commands work      | Check `--disable-slash-commands` wasn't set |
| Chrome integration blocks | Browser access hangs        | Use `--no-chrome` flag                      |
| Stream JSON parsing       | Output truncated            | Use `--include-partial-messages`            |

### Codex CLI Specific

| Issue                   | Symptom            | Fix                                       |
| ----------------------- | ------------------ | ----------------------------------------- |
| `exec` mode hangs       | No output in CI    | Add `--json` for machine-readable output  |
| `review` misses files   | Only checks staged | Use `codex review --all` or specify paths |
| Sandbox too restrictive | Commands blocked   | Adjust `-s/--sandbox` mode                |
| `apply` fails           | Diff won't apply   | Check working tree is clean first         |

### Gemini CLI Specific

| Issue                | Symptom             | Fix                                |
| -------------------- | ------------------- | ---------------------------------- |
| 1M context slow      | Long response times | Use `gemini-2.5-flash` for speed   |
| Extensions conflict  | Tool not found      | Check `-e/--extensions` list       |
| Session resume fails | "Session not found" | Use `--list-sessions` to verify ID |

## MCP Server Failures

**Symptom**: MCP tools unavailable or returning errors
**Common Causes**:

1. Server not running - check process
2. Config path wrong - verify `--mcp-config` path
3. Auth expired - refresh tokens

**Debug Steps**:

```bash
# Claude Code
claude -d mcp    # Debug MCP connections

# Check MCP server health
curl http://localhost:<port>/health  # For HTTP servers
```

**For comprehensive MCP troubleshooting**: See [MCP Server Operations Runbook](mcp-server-operations.md)

---

## Gateway & Provider Failures (2026-03-13 Patterns)

### 6. Model Fallback Chain Failures

**Symptom**: Task fails after multiple model fallbacks
**Log Pattern**: `FailoverError: LLM request timed out` → `model fallback decision` → `HTTP 404`

**Observed Pattern**:

```
gpt-5.4 (timeout 16s) → kimi-coding/k2p5 (404) → claude-opus-4-6
```

**Root Cause**: Unreliable providers in fallback chain, model endpoints returning 404

**Fix**:

```yaml
# In gateway config, review fallback chain
fallback:
  primary: claude-sonnet-4 # Reliable primary
  secondary: gpt-4o # Reliable fallback
  # Remove or flag unreliable: kimi-coding/k2p5
```

**Prevention**:

- Use reliable providers in fallback chain (Anthropic, OpenAI)
- Set circuit breaker for providers with >5% failure rate
- Monitor `model-fallback/decision` log entries

### 7. Context Window Overflow

**Symptom**: `Context window is full. Reduce conversation history, system prompt, or tools.`
**Log Pattern**: `embedded run agent end: isError=true ... error=400 Context window is full`

**Root Cause**: Conversation exceeds model context limit (200K for Claude, 1M for Opus 4.6+, varies by provider)

**Fix**:

1. Start fresh session for long-running tasks
2. Use subtask delegation to reduce context scope
3. Enable automatic context compression:

```bash
# Check current context usage
grep "context.*%" gateway.log | tail -5

# Force session compaction
# (gateway handles this automatically at 80%+)
```

**Prevention**:

- Break tasks into <50 turn sessions
- Use file-based context (reference docs) instead of inline
- Monitor sessions at >80% context usage
- **Claude Code 2.1.75+**: Token estimation fix prevents premature compaction for thinking blocks (was causing ~40% overcount)
- **Opus 4.6**: Now has 1M context window (Max/Team/Enterprise plans) - use for large codebase analysis

### 8. Summarization Endpoint Failures

**Symptom**: `Summarization failed: 404 The requested resource was not found`
**Log Pattern**: `Full summarization failed, trying partial: ...` → `Partial summarization also failed`

**Root Cause**: Summarization API endpoint unavailable or misconfigured

**Fix**:

1. Check provider status page
2. Verify API key has summarization permissions
3. Fall back to manual truncation:

```bash
# Emergency context reduction
# Keep last 10 messages, summarize rest manually
```

**Prevention**:

- Test summarization endpoint during health checks
- Have truncation fallback ready
- Monitor `compaction` log entries

### 9. Tool Loop Detection

**Symptom**: `WARNING: You have called exec 10 times with identical arguments`
**Log Pattern**: `tool=exec level=warning action=warn detector=generic_repeat count=10`

**Root Cause**: Agent stuck in retry loop, usually due to:

- Command failing but agent not understanding why
- Wrong working directory
- Missing dependency

**Fix**:

```bash
# Check what command is looping
grep "tool=exec.*count=" gateway.err.log | tail -5

# Common issues:
# - "command not found: ping" → Install or use alternative
# - Permission denied → Check file permissions
# - Wrong path → Verify working directory
```

**Prevention**:

- Add explicit stopping criteria to AGENTS.md
- Set max retries in tool config
- Ensure common tools are available

### 10. Permission Scope Missing

**Symptom**: `401 You have insufficient permissions for this operation. Missing scopes: api.responses.write`
**Log Pattern**: `image failed: Image model failed ... 401`

**Root Cause**: API key lacks required OAuth scopes for specific operations

**Fix**:

1. Check provider dashboard for API key permissions
2. Required scopes vary by operation:
   - Image generation: `api.responses.write`
   - Embeddings: `embeddings.create`
   - Fine-tuning: `fine-tuning.write`

**Prevention**:

- Document required scopes per operation type
- Use project-scoped API keys
- Test new operations with key validation script

## Escalation Path

1. **Try fix from this runbook** (5 min)
2. **Restart agent session** with clearer instructions (2 min)
3. **Delegate to different agent** if one consistently fails (immediate)
4. **Human intervention** for architectural decisions

## Prevention Checklist

Before starting any coding task:

- [ ] `AGENTS.md` is current and <500 lines
- [ ] Task scope is clear (single feature/bug)
- [ ] Test requirements are explicit
- [ ] API/library verification rule is present
- [ ] Stopping criteria are defined
- [ ] Approval mode is appropriate for task risk level
- [ ] MCP servers are healthy (if required)

## References

- [Troubleshooting: Auth Issues](../troubleshooting/auth-issues.md)
- [ADR-001: TDD Enforcement](../adrs/001-tdd-enforcement.md)
- [ADR-002: Type Safety](../adrs/002-type-safety.md)
- [Runbook: Local Coding Agents Overview](local-coding-agents-overview.md)

## Changelog

- 2026-03-13: Added agent-specific failure patterns, MCP failures, prevention checklist updates
- 2026-03-13: Initial version with 5 common failure patterns
