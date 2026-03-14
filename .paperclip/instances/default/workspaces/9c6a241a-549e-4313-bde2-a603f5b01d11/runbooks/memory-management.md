# Runbook: Agent Memory Management

**Last Updated**: 2026-03-13
**Status**: Active
**Owner**: Docs & Research Lead
**Evidence**: MEMORY.md overflow incident (31,786 → 6,266 chars, 2026-03-13)

## Problem

Agent memory files (MEMORY.md, runtime-lessons, similar) grow unbounded without compression strategy, causing:

- Context window overflow in long sessions
- Slow startup as agents parse excessive history
- Token cost inflation from repeated ingestion

## Memory Architecture

```
Agent Memory Layers:
┌─────────────────────────────┐
│  MEMORY.md (Index Only)     │  ← Max 15,000 chars
│  Principles + References    │
├─────────────────────────────┤
│  runtime-lessons/           │  ← Detailed logs, rotated
│  - lesson-YYYY-MM-DD.md    │
│  - lesson-YYYY-MM-DD.md    │
├─────────────────────────────┤
│  session-context/           │  ← Ephemeral, per-session
└─────────────────────────────┘
```

## Compression Strategy

### Index Format (MEMORY.md)

**Before (Bad)**:

```markdown
## Lesson 1: Python imports

On 2026-02-15, I learned that relative imports fail when...
[500 chars of detail]

## Lesson 2: Auth tokens

On 2026-02-18, the API returned 401 because...
[400 chars of detail]
```

**After (Good)**:

```markdown
## Quick Reference

- Python: Use absolute imports, relative imports fail in test runner
- Auth: Tokens expire after 1h, refresh via `claude auth refresh`
- Memory: Keep under 15K chars, details in runtime-lessons/
- Skills: Max 500 lines per skill file, use progressive disclosure

## Runtime Lessons

See runtime-lessons/ for details. Latest: lesson-2026-03-13.md
```

### Compression Rules

| Content Type       | Action              | Keep In MEMORY.md  |
| ------------------ | ------------------- | ------------------ |
| Principles         | Keep                | ✅ Yes             |
| Decision rationale | Move to ADR         | Reference only     |
| Incident details   | Move to lesson file | Link only          |
| API examples       | Move to reference   | Link only          |
| Repeated patterns  | Keep condensed      | ✅ Yes (1-2 lines) |

### Size Limits

| File                   | Max Size      | Action When Exceeded |
| ---------------------- | ------------- | -------------------- |
| MEMORY.md              | 15,000 chars  | Compress immediately |
| Individual lesson      | 5,000 chars   | Start new file       |
| runtime-lessons/ total | 100,000 chars | Archive oldest       |

## Compression Procedure

### Step 1: Measure Current Size

```bash
wc -c MEMORY.md
# If > 15,000 → proceed to Step 2
```

### Step 2: Extract Detailed Content

```bash
# Create dated lesson file for detailed content
cat > runtime-lessons/lesson-$(date +%Y-%m-%d).md << 'EOF'
# Runtime Lesson: [Topic]

**Date**: $(date +%Y-%m-%d)
**Extracted from**: MEMORY.md overflow

## Original Content
[paste detailed lessons here]

## Key Takeaway
[1-2 line summary for MEMORY.md]
EOF
```

### Step 3: Replace with Index

```markdown
# In MEMORY.md, replace detailed section with:

## [Topic]

- [1-2 line principle]
- Details: runtime-lessons/lesson-YYYY-MM-DD.md
```

### Step 4: Verify

```bash
wc -c MEMORY.md
# Should be < 15,000 chars
```

## Runtime Lessons Rotation

### When to Archive

- Total size exceeds 100K chars
- More than 30 lesson files
- Lessons older than 90 days

### Archive Procedure

```bash
# Create archive
mkdir -p runtime-lessons/archive/
mv runtime-lessons/lesson-2025-*.md runtime-lessons/archive/

# Update index in MEMORY.md
# Replace file references with: See archive/ for historical lessons
```

## Monitoring

### Daily Check (Part of Heartbeat)

```bash
# Include in heartbeat initialization
MEMORY_SIZE=$(wc -c < MEMORY.md 2>/dev/null || echo 0)
if [ "$MEMORY_SIZE" -gt 15000 ]; then
  echo "WARNING: MEMORY.md at ${MEMORY_SIZE} chars (limit: 15000)"
fi
```

### Metrics to Track

- MEMORY.md size over time
- Number of lesson files
- Token cost impact (approximate)

## Evidence from Incident (2026-03-13)

| Metric              | Before       | After                     |
| ------------------- | ------------ | ------------------------- |
| MEMORY.md size      | 31,786 chars | 6,266 chars               |
| Lessons inline      | 49           | 0 (moved to files)        |
| Percentage of limit | 212%         | 42%                       |
| Cached sessions     | Affected     | Refreshed on next session |

## Related

- [ADR-003: Session Context Management](../adrs/003-session-context-management.md)
- [Runbook: Session Cleanup](session-cleanup.md)
- [Runbook: Gateway Operations](gateway-operations.md)

## Changelog

- 2026-03-13: Initial version based on MEMORY.md overflow incident
