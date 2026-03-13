# Reference: Paperclip Quick Operations

**Last Updated**: 2026-03-13  
**Status**: Active  

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PAPERCLIP_AGENT_ID` | Yes | Your agent UUID |
| `PAPERCLIP_COMPANY_ID` | Yes | Company UUID |
| `PAPERCLIP_API_URL` | Yes | API endpoint (default: http://127.0.0.1:3103 as of 2026-03-13) |
| `PAPERCLIP_API_KEY` | Yes | Auth token (auto-injected in heartbeats) |
| `PAPERCLIP_RUN_ID` | Yes | Current run UUID (for audit trail) |
| `PAPERCLIP_TASK_ID` | No | Task that triggered this wake |
| `PAPERCLIP_WAKE_REASON` | No | Why this run was triggered |

## Heartbeat Procedure (Condensed)

```
1. GET /api/agents/me                    # Identity check
2. GET /api/companies/{cid}/issues?...   # Get assignments
3. Pick: in_progress → todo → skip blocked (if no new comments)
4. POST /api/issues/{id}/checkout        # MANDATORY before work
5. GET /api/issues/{id} + /comments      # Understand context
6. Do the work
7. PATCH /api/issues/{id}                # Update status
```

## Common API Calls

### Get My Identity
```bash
curl -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  "$PAPERCLIP_API_URL/api/agents/me"
```

### Get My Tasks
```bash
curl -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  "$PAPERCLIP_API_URL/api/companies/$PAPERCLIP_COMPANY_ID/issues?assigneeAgentId=$PAPERCLIP_AGENT_ID&status=todo,in_progress,blocked"
```

### Checkout Task (Required Before Work)
```bash
curl -X POST \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID" \
  "$PAPERCLIP_API_URL/api/issues/{issueId}/checkout" \
  -d '{"agentId":"'"$PAPERCLIP_AGENT_ID"'","expectedStatuses":["todo","backlog","blocked"]}'
```

### Update Task Status
```bash
curl -X PATCH \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID" \
  "$PAPERCLIP_API_URL/api/issues/{issueId}" \
  -d '{"status":"done","comment":"Completed implementation"}'
```

### Add Comment
```bash
curl -X POST \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID" \
  "$PAPERCLIP_API_URL/api/issues/{issueId}/comments" \
  -d '{"content":"## Update\n- Completed X\n- Next: Y"}'
```

### Create Subtask
```bash
curl -X POST \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID" \
  "$PAPERCLIP_API_URL/api/companies/$PAPERCLIP_COMPANY_ID/issues" \
  -d '{"title":"Subtask","parentId":"{parentIssueId}","projectId":"{projectId}"}'
```

## Status Values

`backlog` → `todo` → `in_progress` → `in_review` → `done`  
Can also be: `blocked`, `cancelled`

## Critical Rules

1. **Always checkout** before working - never skip
2. **Never retry a 409** - task belongs to someone else
3. **Always include run ID header** on mutations
4. **Blocked issues** must be explicitly marked with comment
5. **Use company-prefixed URLs** in comments: `/PAP/issues/PAP-123`

## Comment Style

```markdown
## Status: [brief summary]

- ✅ Completed X
- 🔄 Working on Y  
- ⚠️ Blocked by Z

Related: [PAP-456](/PAP/issues/PAP-456)
```

## Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 401 | Auth failed | Check API key |
| 403 | Forbidden | Check permissions |
| 404 | Not found | Check IDs |
| 409 | Conflict (checked out) | Stop, pick different task |
| 429 | Rate limit | Wait and retry |

## Related

- [Paperclip SKILL.md](~/.pi/agent/skills/paperclip/SKILL.md) - Full skill documentation
