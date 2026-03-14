# Runbook: claude_local Adapter CLI Flag Bug

**Owner**: Runtime Reliability Engineer | **Last Updated**: 2026-03-13 | **Status**: Active

## Problem

Claude_local agents heartbeat consistently but never checkout assigned tasks because the adapter uses a non-existent CLI flag.

## Root Cause

The `@paperclipai/adapter-claude-local@0.3.1` adapter uses `--append-system-prompt-file <filepath>` to inject the AGENTS.md content, but **this flag does not exist** in Claude CLI.

### Evidence

```bash
$ claude --version
2.1.74 (Claude Code)

$ claude --help | grep append
  --append-system-prompt <prompt>    Append a system prompt to the default system prompt
```

Claude CLI only supports `--append-system-prompt <inline-content>`, NOT `--append-system-prompt-file <filepath>`.

### Impact

- The heartbeat procedure in AGENTS.md is **never injected** into the agent prompt
- Claude agents receive the base `--print` prompt with no instructions to:
  1. Check for assignments via Paperclip API
  2. Checkout tasks before working
  3. Update status after completion
- Agents heartbeat (survival instinct) but never pickup tasks (no instructions)

## Affected Agents

Any agent using `claude_local` adapter with `instructionsFilePath` configured.

## Symptoms

1. Agent heartbeat is regular and healthy
2. Agent status shows `idle` or `running`
3. Issues are assigned but never checked out
4. No active runs after assignment
5. `files_touched` is empty in heartbeat records

## Detection

Use the protocol compliance check:

```bash
make health-check-protocol
```

Or run directly:

```bash
python3 scripts/agent_health_check.py --protocol-check
```

## Workaround

### Option 1: Use pi_local adapter (Recommended)

Switch affected agents to `pi_local` adapter which correctly injects instructions:

```bash
curl -X PATCH "$PAPERCLIP_API_URL/api/agents/{agentId}" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"adapterType": "pi_local"}'
```

### Option 2: Use codex_local adapter

```bash
curl -X PATCH "$PAPERCLIP_API_URL/api/agents/{agentId}" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"adapterType": "codex_local"}'
```

## Fix Required (Upstream)

The adapter source code in `execute.js` needs to be updated:

```javascript
// BEFORE (broken):
if (effectiveInstructionsFilePath) {
  args.push("--append-system-prompt-file", effectiveInstructionsFilePath);
}

// AFTER (fix):
if (effectiveInstructionsFilePath) {
  const instructionsContent = await fs.readFile(
    effectiveInstructionsFilePath,
    "utf-8",
  );
  args.push("--append-system-prompt", instructionsContent);
}
```

## Related

- CLI-35: ESCALATE: claude_local adapter fails to load instructionsFilePath for task pickup
- RB 0021: Claude Local Adapter Instructions Injection
- RB 0022: Provider Health Monitoring
