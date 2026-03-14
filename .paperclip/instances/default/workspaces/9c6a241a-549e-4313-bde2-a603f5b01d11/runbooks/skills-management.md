# Runbook: Skills & Plugin Management

**Last Updated**: 2026-03-13
**Status**: Active
**Owner**: Docs & Research Lead
**Evidence**: Composio-skills truncation incident (834 dirs → quarantine, 2026-03-13)

## Problem

Skills discovery scans all directories under skills paths. Large skill collections (especially bulk imports) cause:

- Discovery truncation warnings
- Slow agent startup
- Context window bloat from skill descriptions
- Confusion about which skills are actually available

## Skill Directory Structure

```
~/.pi/agent/skills/         # Primary skill location
~/.agents/skills/           # Legacy/secondary location
~/.claude/skills/           # Claude Code specific

# QUARANTINE (never scanned)
~/.agents/skills-quarantine/   # Archived/bulk skills
```

## Discovery Limits

| Metric                 | Limit               | Source                    |
| ---------------------- | ------------------- | ------------------------- |
| Max skills per scan    | ~200 practical      | Context window constraint |
| Max description length | 500 chars per skill | Progressive disclosure    |
| Scan timeout           | 30 seconds          | Agent startup SLA         |

## Incident: Composio-Skills Truncation (2026-03-13)

### What Happened

- `awesome-claude-skills/composio-skills/` contained **834 subdirectories**
- Each was a separate "skill" (mostly wrappers for Composio integrations)
- Discovery scan truncated output, showing warning
- Existing sessions cached old (truncated) skill list

### Resolution

```bash
# 1. Quarantine bulk skills
mkdir -p ~/.agents/skills-quarantine/2026-03-13-composio-skills/
mv ~/.agents/skills/awesome-claude-skills/composio-skills/ \
   ~/.agents/skills-quarantine/2026-03-13-composio-skills/

# 2. Verify no truncation
claude mcp list  # Should complete without warnings

# 3. Note: Cached sessions retain old list until refresh
```

### Root Cause

- Bulk-imported skills without curation
- No pre-import size check
- Skills snapshot cached per-session

## Skill Management Procedures

### Adding New Skills

**Pre-check**:

```bash
# Count existing skills
find ~/.pi/agent/skills ~/.agents/skills -maxdepth 2 -name "SKILL.md" | wc -l

# If > 150, consider pruning before adding
```

**Quality gates**:

1. Skill must have clear trigger description
2. Must be < 500 lines (progressive disclosure)
3. Must not duplicate existing functionality
4. Should have tested trigger accuracy

### Bulk Import Procedure

**Never bulk import directly to active skills directory**:

```bash
# ❌ BAD: Direct import
cp -r downloaded-skills/* ~/.pi/agent/skills/

# ✅ GOOD: Staged import
# 1. Import to staging
mkdir -p ~/.agents/skills-staging/batch-$(date +%Y-%m-%d)/
cp -r downloaded-skills/* ~/.agents/skills-staging/batch-$(date +%Y-%m-%d)/

# 2. Review and select
ls ~/.agents/skills-staging/batch-*/
# Pick only useful skills

# 3. Move selected to active
mv ~/.agents/skills-staging/batch-*/selected-skill ~/.pi/agent/skills/

# 4. Archive or delete staging
rm -rf ~/.agents/skills-staging/batch-*/
```

### Quarantine Procedure

When skills cause issues:

```bash
# 1. Create dated quarantine directory
QUARANTINE_DIR=~/.agents/skills-quarantine/$(date +%Y-%m-%d)-description/
mkdir -p "$QUARANTINE_DIR"

# 2. Move problematic skills
mv problematic-skills/ "$QUARANTINE_DIR"

# 3. Document reason
echo "Quarantined on $(date): [reason]" > "$QUARANTINE_DIR/REASON.md"

# 4. Verify discovery works
# Restart agent or trigger skill scan
```

### Skill Pruning Criteria

Remove skills that:

- Haven't been triggered in 30+ days
- Duplicate functionality of another skill
- Have < 50% trigger accuracy (wrong activations)
- Are wrappers for services you don't use

## Monitoring

### Discovery Health Check

```bash
# Part of heartbeat or daily check
SKILL_COUNT=$(find ~/.pi/agent/skills ~/.agents/skills -maxdepth 2 -name "SKILL.md" 2>/dev/null | wc -l)
echo "Active skills: $SKILL_COUNT"

if [ "$SKILL_COUNT" -gt 200 ]; then
  echo "WARNING: High skill count may cause discovery issues"
fi
```

### Truncation Detection

```bash
# Check for truncation warnings in recent logs
grep -i "truncat" ~/.claude/logs/*.log 2>/dev/null | tail -5
```

## Quarantine Inventory

| Date       | Content         | Count | Reason               |
| ---------- | --------------- | ----- | -------------------- |
| 2026-03-13 | composio-skills | 834   | Discovery truncation |

## Related

- [Runbook: Memory Management](memory-management.md)
- [Runbook: MCP Server Operations](mcp-server-operations.md)
- [ADR-003: Session Context Management](../adrs/003-session-context-management.md)

## Changelog

- 2026-03-13: Initial version based on composio-skills truncation incident
