# Runbook: Gateway Operations

**Last Updated**: 2026-03-13  
**Status**: Active  
**Owner**: Docs & Research Lead  
**Evidence**: Discord health monitor characterization (2026-03-13)

## Problem

The OpenClaw gateway manages multiple integrations (Discord, Telegram, agents). Understanding expected vs. anomalous behavior prevents false alarms and enables rapid incident response.

## Gateway Architecture

```
OpenClaw Gateway (pid 27573)
├── Discord Bots (6)
│   ├── builder-claude
│   ├── builder-codex
│   ├── commander
│   ├── community
│   ├── loop
│   └── main
├── Telegram Integration
├── Paperclip Sidecar (pid 28303)
├── API Server (port varies: 3103 as of 2026-03-13)
└── UI Server (port 3100)
```

## Health Check

### Quick Status (5 seconds)
```bash
# Gateway process
ps aux | grep openclaw-gateway | grep -v grep

# API health (use $PAPERCLIP_API_URL or detect port)
curl -s ${PAPERCLIP_API_URL:-http://127.0.0.1:3103}/api/health | jq .

# UI health
curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/
```

### Full Diagnostic
```bash
echo "=== Gateway Status ==="
ps aux | grep -E "(openclaw|paperclip)" | grep -v grep

echo -e "\n=== API Health ==="
curl -s ${PAPERCLIP_API_URL:-http://127.0.0.1:3103}/api/health | jq .

echo -e "\n=== UI Status ==="
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3100/

echo -e "\n=== Sessions ==="
# Check active sessions count
find ~/.openclaw-gateway/agents/main/sessions/ -name "*.json" -not -name "sessions.json" | wc -l

echo -e "\n=== Memory ==="
# Check MEMORY.md size
wc -c MEMORY.md 2>/dev/null || echo "MEMORY.md not found"

echo -e "\n=== Disk ==="
df -h / | tail -1

echo -e "\n=== Discord Bots ==="
# Check Discord connection (requires bot token or API check)
curl -s -o /dev/null -w "Discord API: HTTP %{http_code}\n" https://discord.com/api/v10/
```

## Expected Behaviors (Not Bugs)

### Discord WebSocket Restarts

**Pattern observed (2026-03-13)**:
| Bot | Restarts/Hour | Reason |
|-----|---------------|--------|
| builder-claude | 8 | stale-socket / disconnected |
| builder-codex | 5 | stale-socket / disconnected |
| commander | 3 | stale-socket / disconnected |
| community | 4 | stale-socket / disconnected |
| loop | 4 | stale-socket / disconnected |
| **Total** | **~24** | Expected behavior |

**Root Cause**: Discord websocket servers periodically drop idle connections.

**Health Monitor Configuration** (from source):
```typescript
DEFAULT_CHECK_INTERVAL_MS = 5 * 60000;      // 5 minutes
staleEventThresholdMs = 1800000;             // 30 minutes
DEFAULT_MAX_RESTARTS_PER_HOUR = 10;          // Safety limit
```

**Status**: Expected behavior, not a bug. Health monitor working as designed.

**When to Worry**:
- Any bot exceeds 10 restarts/hour (safety limit)
- All bots restart simultaneously (network issue)
- Restarts don't recover (persistent failure)

**Mitigation Options** (if becomes disruptive):
1. Implement app-level keepalive pings to Discord
2. Request OpenClaw expose health-monitor timing config
3. Accept as normal operation (current recommendation)

### Session Count Fluctuation

**Normal**: ±2-5 sessions per heartbeat check  
**Investigate**: ±20+ sessions in short period

### Memory Growth

**Normal**: MEMORY.md stays under 15K chars  
**Action needed**: Memory exceeds limit → see [Memory Management](memory-management.md)

## Metrics Baseline (2026-03-13)

| Metric | Normal Range | Alert Threshold |
|--------|--------------|-----------------|
| Gateway uptime | Days-weeks | < 1 hour restart |
| CPU usage | 0.1-0.7% | > 5% sustained |
| Memory usage | 2.9-3.1% | > 10% |
| Discord bots connected | 6/6 | < 6/6 |
| Discord WS restarts/hr | 15-30 | > 60 (10/bot) |
| Active sessions | 100-150 | > 200 |
| API response time | < 100ms | > 500ms |
| Network to Discord | 0% loss, <10ms RTT | > 1% loss |

## Common Issues

### Gateway Won't Start

**Symptom**: Process not found, ports not listening  
**Diagnosis**:
```bash
# Check if ports are in use
lsof -i :3100
# Check API port (varies by deployment)
curl -s ${PAPERCLIP_API_URL:-http://127.0.0.1:3103}/api/health

# Check logs
tail -100 ~/.openclaw-gateway/logs/*.log
```

**Fix**:
```bash
# Kill stale processes
kill $(lsof -t -i :3100) 2>/dev/null
# Kill API server (port varies, check $PAPERCLIP_API_URL)
API_PORT=$(echo $PAPERCLIP_API_URL | grep -oP ':\K[0-9]+' || echo 3103)
kill $(lsof -t -i :$API_PORT) 2>/dev/null

# Restart gateway
openclaw gateway start
```

### High Context Sessions

**Symptom**: Agent responses truncated or slow  
**Detection**:
```bash
# Find large session files
find ~/.openclaw-gateway/agents/main/sessions/ -name "*.json" -size +300k -exec ls -lh {} \;
```

**Fix**: See [Session Cleanup](session-cleanup.md) for truncation/new session procedures

### API Authentication Failures

**Symptom**: 401 errors on API calls  
**Note**: `PAPERCLIP_API_KEY` may be empty in some contexts  
**Fix**: See [Auth Troubleshooting](../troubleshooting/auth-issues.md)

## Maintenance

### Daily (Automated in Heartbeat)
- [ ] Gateway process running
- [ ] API health endpoint responding
- [ ] Discord bots connected
- [ ] No errors in logs

### Weekly
- [ ] Review restart counts (should be within baseline)
- [ ] Check disk usage
- [ ] Verify MCP servers connected
- [ ] Check for orphan sessions

### Monthly
- [ ] Review and archive old logs
- [ ] Check for gateway updates
- [ ] Verify backup state
- [ ] Review metrics trends

## Incident Response

### Severity Levels

| Level | Criteria | Response Time |
|-------|----------|---------------|
| P0 - Critical | Gateway down, all bots offline | Immediate |
| P1 - High | API unreachable, >3 bots offline | 15 minutes |
| P2 - Medium | Single bot offline, high restarts | 1 hour |
| P3 - Low | Performance degradation, warnings | Next heartbeat |

### Escalation Path
1. Check this runbook for known issues
2. Restart gateway if process issues
3. Check Discord/Telegram status pages
4. Review recent changes in git
5. Escalate to human if unresolved

## Related

- [Runbook: Memory Management](memory-management.md)
- [Runbook: Session Cleanup](session-cleanup.md)
- [Runbook: MCP Server Operations](mcp-server-operations.md)
- [Troubleshooting: Auth Issues](../troubleshooting/auth-issues.md)

## Changelog

- 2026-03-13: Initial version with Discord WS characterization, metrics baseline
