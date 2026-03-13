# Runbook: Session & Transcript Cleanup

**Last Updated**: 2026-03-13  
**Status**: Active  
**Owner**: Docs & Research Lead  
**Evidence**: Orphan transcript discovery (117 files, 292MB, 2026-03-13)

## Problem

Session transcripts accumulate over time, creating:
- Orphan files not referenced by active sessions
- Split state across legacy and active directories
- Disk consumption growth (292MB in this case)
- Session history confusion

## State Directory Architecture

```
~/.openclaw/              # Legacy (25MB)
└── [old session data]

~/.openclaw-gateway/      # Active (7.4GB)
├── agents/
│   └── main/
│       └── sessions/
│           ├── sessions.json        # Session registry
│           └── *.json               # Transcript files
└── [other gateway data]
```

## Orphan Detection

### Find Orphan Transcripts
```bash
# Compare sessions.json references vs actual files
SESSIONS_DIR=~/.openclaw-gateway/agents/main/sessions/

# Get referenced transcripts from sessions.json
cat "$SESSIONS_DIR/sessions.json" | jq -r '.[].transcriptFile' | sort > /tmp/referenced.txt

# Get actual transcript files
find "$SESSIONS_DIR" -name "*.json" -not -name "sessions.json" | sort > /tmp/actual.txt

# Find orphans (in actual but not referenced)
comm -23 /tmp/actual.txt /tmp/referenced.txt > /tmp/orphans.txt
ORPHAN_COUNT=$(wc -l < /tmp/orphans.txt)
ORPHAN_SIZE=$(du -ch $(cat /tmp/orphans.txt) 2>/dev/null | tail -1 | cut -f1)

echo "Orphan transcripts: $ORPHAN_COUNT ($ORPHAN_SIZE)"
```

### Current State (2026-03-13)
| Metric | Value |
|--------|-------|
| Total session files | 315 |
| Orphan files | 117 |
| Orphan percentage | 37% |
| Total disk (sessions) | 292MB |

## Cleanup Procedure

### Safe Cleanup (Archiving)
```bash
# 1. Create archive directory
ARCHIVE_DIR=~/.openclaw-gateway/archives/transcripts-$(date +%Y-%m-%d)/
mkdir -p "$ARCHIVE_DIR"

# 2. Move orphans to archive
while read orphan; do
  mv "$orphan" "$ARCHIVE_DIR"
done < /tmp/orphans.txt

# 3. Verify no active sessions broken
# Check sessions.json integrity
cat "$SESSIONS_DIR/sessions.json" | jq 'length'

# 4. Document cleanup
echo "Archived $ORPHAN_COUNT orphan transcripts on $(date)" > "$ARCHIVE_DIR/CLEANUP.md"
```

### Aggressive Cleanup (Deletion)
Only if disk space is critical:
```bash
# Calculate reclaimable space
du -sh $(cat /tmp/orphans.txt) 2>/dev/null | tail -1

# Delete orphans permanently
while read orphan; do
  rm "$orphan"
done < /tmp/orphans.txt
```

## Split State Migration

### Current State
- `~/.openclaw/` (25MB) - Legacy, should be migrated or removed
- `~/.openclaw-gateway/` (7.4GB) - Active

### Migration Decision Tree
```
Split state exists?
├── Legacy has unique data?
│   ├── Yes → Migrate to active
│   │   cp -n ~/.openclaw/* ~/.openclaw-gateway/
│   └── No → Safe to remove
│       mv ~/.openclaw ~/.openclaw-archive-$(date +%Y%m%d)
└── Verify active state works
    # Run gateway, confirm sessions load
```

## Context Usage Monitoring

### High-Context Session Detection
```bash
# Check for sessions approaching context limits
# Claude Code: 200K tokens (~800K chars)
# Warn at 80% (160K tokens)

# Approximate by file size (rough: 1 char ≈ 0.25 tokens)
find ~/.openclaw-gateway/agents/main/sessions/ -name "*.json" -size +300k -exec ls -lh {} \;
```

### Thresholds
| Context Level | Percentage | Action |
|---------------|------------|--------|
| Normal | < 60% | No action |
| Monitor | 60-80% | Log warning |
| Critical | 80-90% | Consider truncation |
| Overflow | > 90% | Force new session |

## Orphan Prevention

### Root Causes
1. **Session crash** - Agent terminated before cleanup
2. **Manual session deletion** - Removed from registry but not disk
3. **Version migration** - Old format not migrated properly
4. **Failed checkout** - Session created but never registered

### Prevention Measures
1. **Atomic session operations** - Create file + register in single transaction
2. **Periodic cleanup jobs** - Weekly orphan detection
3. **Session TTL** - Auto-archive sessions older than 30 days
4. **Health check integration** - Include orphan count in heartbeat

## Maintenance Schedule

| Frequency | Task | Command |
|-----------|------|---------|
| Daily | Check orphan count | See orphan detection script |
| Weekly | Archive orphans > 7 days old | See safe cleanup |
| Monthly | Review disk usage | `du -sh ~/.openclaw-gateway/` |
| Quarterly | Consider legacy removal | See split state migration |

## Evidence

### Disk Usage by Component
```
~/.openclaw-gateway/: 7.4GB total
├── agents/main/sessions/: 292MB (315 files, 117 orphans)
├── [other components]: ~7.1GB
```

### Cleanup Impact Estimate
| Action | Space Reclaimed | Risk |
|--------|-----------------|------|
| Archive orphans | ~110MB | Low |
| Remove legacy | 25MB | Medium |
| Full cleanup | ~135MB | Low-Medium |

## Related

- [Runbook: Memory Management](memory-management.md)
- [Runbook: Gateway Operations](gateway-operations.md)
- [ADR-003: Session Context Management](../adrs/003-session-context-management.md)

## Changelog

- 2026-03-13: Initial version based on orphan transcript discovery (117 files, 292MB)
