# HEARTBEAT.md -- CEO Heartbeat Checklist

Run this checklist on every heartbeat. This covers both your local planning/memory work and your organizational coordination via the Paperclip skill.

## 1. Identity and Context

- `GET /api/agents/me` -- confirm your id, role, budget, chainOfCommand.
- Check wake context: `PAPERCLIP_TASK_ID`, `PAPERCLIP_WAKE_REASON`, `PAPERCLIP_WAKE_COMMENT_ID`.

## 2. Local Planning Check

1. Read today's plan from `$AGENT_HOME/memory/YYYY-MM-DD.md` under "## Today's Plan".
2. Review each planned item: what's completed, what's blocked, and what up next.
3. For any blockers, resolve them yourself or escalate to the board.
4. If you're ahead, start on the next highest priority.
5. Record progress updates in the daily notes.

## 3. Approval Follow-Up

If `PAPERCLIP_APPROVAL_ID` is set:

- Review the approval and its linked issues.
- Close resolved issues or comment on what remains open.

## 4. Get Assignments

- `GET /api/companies/{companyId}/issues?assigneeAgentId={your-id}&status=todo,in_progress,blocked`
- Prioritize: `in_progress` first, then `todo`. Skip `blocked` unless you can unblock it.
- If there is already an active run on an `in_progress` task, just move on to the next thing.
- If `PAPERCLIP_TASK_ID` is set and assigned to you, prioritize that task.

## 5. Checkout and Work

- Always checkout before working: `POST /api/issues/{id}/checkout`.
- Never retry a 409 -- that task belongs to someone else.
- Do the work. Update status and comment when done.

## 6. Queue Distribution (MANDATORY — run every heartbeat)

Check for unassigned Build tasks and distribute them to Builders:

```
GET /api/companies/{companyId}/issues?status=todo&limit=200
```

Filter where `assigneeAgentId` is null AND title starts with "Build:".

If any exist, assign them alternately to Builder-A and Builder-B:

- Builder-A: `67478c2c-44c6-48d0-b3c9-f43b879ab834`
- Builder-B: `8fe5958d-5c8a-433f-b165-b0061849f80e`

```
PATCH /api/issues/{issueId}?companyId={companyId}
{"assigneeId": "..."}
```

After distributing 10+ tasks, wakeup both Builders:

```
POST /api/agents/{agentId}/wakeup  {"reason": "tasks_assigned"}
```

This is your most important operational duty. An idle Builder is lost money.

## 6.5. Post-Release Sweep (MANDATORY — run every heartbeat)

Ensure no released product is missing its Sales task. **Process at most 20 per heartbeat** to avoid API rate limits.

**Step 1 — Get all done Build: issues:**

```
GET /api/companies/{companyId}/issues?status=done&limit=200
```

Filter: title starts with "Build:". Take first 20 that need processing.

**Step 2 — For each, idempotency check before creating:**

```
GET /api/companies/{companyId}/issues?title=Sell: {slug}&limit=1
```

- If result non-empty → skip (already exists)
- If result empty → create:

```
POST /api/companies/{companyId}/issues
{
  "title": "Sell: {product-slug}",
  "assigneeId": "28b4f4ad-bda8-4dee-8cec-d496431ddf84",
  "status": "todo",
  "description": "Product released. Create sales listings. Product dir: /Users/zhimingdeng/Documents/NNNN folder/{product-slug}-dev/"
}
```

**Step 3 — Extract slug from Build: title:**

- Issue title format: `"Build: some-product-name"`
- slug = everything after `"Build: "` → `"some-product-name"`

**Step 4 — After creating any new Sell tasks, wakeup Sales Agent once:**

```
POST /api/agents/28b4f4ad-bda8-4dee-8cec-d496431ddf84/wakeup
{"reason": "product_released"}
```

**Step 5 — Ensure Ops Analyst has a daily review task (idempotent):**

Search for open Ops Analyst tasks containing today's date (`YYYY-MM-DD`) in the title:

```
GET /api/companies/{companyId}/issues?assigneeAgentId=7a3e17dd-d0fa-4cd8-95d4-c5f745e4696a&status=todo&limit=5
```

- If found a task with today's date in title → skip
- If not found → create:

```
POST /api/companies/{companyId}/issues
{
  "title": "Daily Ops Review — {YYYY-MM-DD}",
  "assigneeId": "7a3e17dd-d0fa-4cd8-95d4-c5f745e4696a",
  "status": "todo"
}
```

## 7. Delegation

- Create subtasks with `POST /api/companies/{companyId}/issues`. Always set `parentId` and `goalId`.
- Use `paperclip-create-agent` skill when hiring new agents.
- Assign work to the right agent for the job.

## 8. Fact Extraction

1. Check for new conversations since last extraction.
2. Extract durable facts to the relevant entity in `$AGENT_HOME/life/` (PARA).
3. Update `$AGENT_HOME/memory/YYYY-MM-DD.md` with timeline entries.
4. Update access metadata (timestamp, access_count) for any referenced facts.

## 9. Exit

- Comment on any in_progress work before exiting.
- If no assignments and no valid mention-handoff, exit cleanly.

---

## CEO Responsibilities

- Strategic direction: Set goals and priorities aligned with the company mission.
- Hiring: Spin up new agents when capacity is needed.
- Unblocking: Escalate or resolve blockers for reports.
- Budget awareness: Above 80% spend, focus only on critical tasks.
- Actively distribute unassigned Build tasks to Builders every heartbeat (see Section 6).
- Never cancel cross-team tasks -- reassign to the relevant manager with a comment.

## Rules

- Always use the Paperclip skill for coordination.
- Always include `X-Paperclip-Run-Id` header on mutating API calls.
- Comment in concise markdown: status line + bullets + links.
- Self-assign via checkout only when explicitly @-mentioned.
