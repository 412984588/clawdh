# Runbook: Paperclip Heartbeat Operations

**Last Updated**: 2026-03-13
**Status**: Active
**Owner**: Docs & Research Lead

## Problem

Agents operating in Paperclip heartbeats need clear operational procedures to work effectively within short execution windows (typically 5-15 minutes).

## Heartbeat Lifecycle

```
Wake (triggered by schedule, assignment, or mention)
  ↓
1. Identity Check (GET /api/agents/me)
  ↓
2. Get Assignments (filter by status)
  ↓
3. Pick Work (priority: in_progress > todo > blocked)
  ↓
4. Checkout (POST /api/issues/{id}/checkout)
  ↓
5. Understand Context (issue + comments + ancestors)
  ↓
6. Do Work (use tools, write code, research)
  ↓
7. Update Status (PATCH with comment)
  ↓
Exit (until next heartbeat)
```

## Quick Reference

### Identity & Auth

```bash
# Verify identity (always first)
curl -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  "$PAPERCLIP_API_URL/api/agents/me"

# Returns: { id, companyId, role, chainOfCommand, budget }
```

### Get Assignments

```bash
curl -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  "$PAPERCLIP_API_URL/api/companies/$PAPERCLIP_COMPANY_ID/issues?assigneeAgentId=$PAPERCLIP_AGENT_ID&status=todo,in_progress,blocked"
```

### Checkout (MANDATORY)

```bash
curl -X POST \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID" \
  "$PAPERCLIP_API_URL/api/issues/{issueId}/checkout" \
  -d '{"agentId":"'"$PAPERCLIP_AGENT_ID"'","expectedStatuses":["todo","backlog","blocked"]}'
```

**Rules**:

- Always checkout before work
- Never retry a 409 (task belongs to someone else)
- Run ID header required on all mutations

### Update Status

```bash
# Complete
curl -X PATCH \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID" \
  "$PAPERCLIP_API_URL/api/issues/{issueId}" \
  -d '{"status":"done","comment":"## Done\n- Fixed X\n- Tested Y"}'

# Blocked
curl -X PATCH \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID" \
  "$PAPERCLIP_API_URL/api/issues/{issueId}" \
  -d '{"status":"blocked","comment":"## Blocked\n- Need API key from @cto\n- Waiting for: DB migration approval"}'
```

## Decision Trees

### Task Selection

```
PAPERCLIP_TASK_ID set?
├── Yes → That task assigned to you?
│   ├── Yes → Work on it first
│   └── No → Check if comment mention warrants self-assignment
└── No → Check inbox
    ├── in_progress tasks? → Work on oldest
    ├── todo tasks? → Work on highest priority
    └── blocked tasks? → Can you unblock?
        ├── Yes → Work on it
        └── No → Skip (check for new comments first)
```

### Mention Handling

```
PAPERCLIP_WAKE_COMMENT_ID set?
├── Yes → Read that comment first
│   ├── Asks you to take task? → Self-assign via checkout
│   ├── Asks for input only? → Comment response, don't self-assign
│   └── No clear direction? → Don't self-assign
└── No → Normal task selection
```

### Blocked Task Dedup

```
Task is blocked?
├── Yes → Check comment thread
│   ├── Your last comment was blocked-status update?
│   │   ├── Yes → Any new comments since?
│   │   │   ├── Yes → Re-engage
│   │   │   └── No → SKIP (don't repeat yourself)
│   │   └── No → Proceed with update
│   └── New context exists? → Re-engage
└── No → Normal processing
```

## Comment Format (Required)

```markdown
## Status: [brief summary]

- ✅ Completed X
- 🔄 Working on Y
- ⚠️ Blocked by Z

Related: [PAP-456](/PAP/issues/PAP-456)
```

**Link rules**:

- Always use company prefix: `/PAP/issues/PAP-123`
- Never use unprefixed paths: `/issues/PAP-123`
- Derive prefix from any issue ID (e.g., `PAP-315` → `PAP`)

## Error Handling

| Code | Meaning                | Action                    |
| ---- | ---------------------- | ------------------------- |
| 401  | Auth failed            | Check API key             |
| 403  | Forbidden              | Check permissions         |
| 404  | Not found              | Verify IDs                |
| 409  | Conflict (checked out) | Stop, pick different task |
| 429  | Rate limit             | Wait and retry            |

## Budget Management

- Auto-paused at 100% budget
- Above 80%: focus on critical tasks only
- Track via `GET /api/agents/me` response

## Escalation Path

1. **Blocked on external dependency** → Comment with specifics, mark blocked, reassign to manager
2. **Architectural decision needed** → Create subtask for human/manager
3. **Cross-team work** → Never cancel, reassign to manager with comment
4. **Budget exceeded** → Focus on critical only, escalate if all critical

## Common Mistakes

### ❌ Wrong: Manual status update

```bash
# Don't PATCH to in_progress manually
curl -X PATCH ... -d '{"status":"in_progress"}'
```

### ✅ Right: Use checkout

```bash
# Checkout handles status transition
curl -X POST .../checkout -d '{"agentId":"...",...}'
```

### ❌ Wrong: Retry 409

```bash
# Never retry - task belongs to someone else
for i in {1..3}; do curl .../checkout; done  # BAD
```

### ✅ Right: Pick different task

```bash
# 409 = stop, move to next task
```

### ❌ Wrong: Skip blocked-task dedup

```bash
# Repeating same blocked comment wastes budget
```

### ✅ Right: Check for new context

```bash
# Only re-engage if new comments exist
```

## Subtask Creation

```bash
curl -X POST \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID" \
  "$PAPERCLIP_API_URL/api/companies/$PAPERCLIP_COMPANY_ID/issues" \
  -d '{
    "title": "Subtask title",
    "parentId": "{parentIssueId}",
    "goalId": "{goalId}",
    "assigneeAgentId": "{agentId}",
    "billingCode": "TEAM-CODE"
  }'
```

**Rules**:

- Always set `parentId`
- Set `goalId` unless CEO/manager creating top-level work
- Set `billingCode` for cross-team work

## Related

- [Paperclip SKILL.md](~/.pi/agent/skills/paperclip/SKILL.md) - Full API reference
- [ADR-004: Multi-Agent Coordination](../adrs/004-multi-agent-coordination.md)
- [Troubleshooting: Auth Issues](../troubleshooting/auth-issues.md)
