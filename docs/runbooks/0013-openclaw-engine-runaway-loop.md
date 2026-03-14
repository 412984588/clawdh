# Runbook: OpenClaw Engine Runaway Loop Recovery

**Owner**: Runtime Reliability Engineer | **Last Updated**: 2026-03-13 | **Status**: Active

## Purpose

Diagnose and recover from runaway perpetual engine loops that generate unbounded logs and consume resources without meaningful progress.

## Detection Signals

Engine is in runaway loop when:

- `suggestions.log` > 100MB
- Loop count > 100,000 with same 3 suggestions repeating
- `engine-state.json` shows repeated identical errors
- Loop interval < 10ms (sub-second cycles)

## Root Cause Analysis (2026-03-13 Incident)

**Symptoms:**

- `.lobster-engine/suggestions.log`: 404MB, 5.8M lines
- Loop count: 23,440,930
- Time span: ~3 hours (13:30-16:19 EDT, March 12)
- Error: `Cannot read properties of undefined (reading 'createReasoningChain')`

**Root Causes:**

1. **No error backoff** — loop continues immediately after errors with no delay
2. **No circuit breaker** — no mechanism to stop after N consecutive failures
3. **No log rotation** — suggestions.log appends indefinitely
4. **No loop rate limit** — `setImmediate` allows sub-millisecond cycles
5. **Health check is passive** — only logs warnings, never stops the loop

## Recovery Steps

### 1. Stop the Engine

```bash
# Check if engine is running
ps aux | grep "lobster-perpetual-engine" | grep -v grep

# Stop via plugin command (preferred)
# In OpenClaw: /gateway_stop

# Force kill if needed
pkill -f "lobster-perpetual-engine"
```

### 2. Backup Current State

```bash
cd ~/.openclaw/plugins/lobster-perpetual-engine
cp -r .lobster-engine .lobster-engine.backup.$(date +%Y%m%d-%H%M%S)
```

### 3. Clean Up Runaway Logs

```bash
# Truncate suggestions log (preserve last 1000 lines)
tail -1000 .lobster-engine/suggestions.log > .lobster-engine/suggestions.log.tmp
mv .lobster-engine/suggestions.log.tmp .lobster-engine/suggestions.log

# Or remove entirely for fresh start
rm .lobster-engine/suggestions.log
```

### 4. Reset Engine State

```bash
# Edit engine-state.json to reset loop count
cat > .lobster-engine/engine-state.json << 'EOF'
{
  "isRunning": false,
  "loopCount": 0,
  "context": {
    "actions": [],
    "errors": []
  },
  "lastUpdate": "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)",
  "version": "1.0.0"
}
EOF
```

### 5. Verify and Restart

```bash
# Build and test
cd <plugin-dir>
npm run build
npm test

# Restart engine
# In OpenClaw: /gateway_start
```

## Prevention Fixes (Implemented)

### Fix 1: Error Backoff in Loop Engine

Add exponential backoff when consecutive errors occur:

```typescript
// In loop-engine.ts runLoop()
private consecutiveErrors = 0;
private readonly MAX_CONSECUTIVE_ERRORS = 10;
private readonly BASE_BACKOFF_MS = 1000;

// In catch block:
this.consecutiveErrors++;
if (this.consecutiveErrors >= this.MAX_CONSECUTIVE_ERRORS) {
  this.api.logger.error(`🛑 连续 ${this.consecutiveErrors} 次错误，引擎自动停止`);
  this.state.isRunning = false;
  break;
}
const backoff = Math.min(
  this.BASE_BACKOFF_MS * Math.pow(2, this.consecutiveErrors - 1),
  60000
);
await new Promise(resolve => setTimeout(resolve, backoff));
```

### Fix 2: Minimum Loop Interval

Add minimum time between loops:

```typescript
private readonly MIN_LOOP_INTERVAL_MS = 1000; // 1 second minimum

// At end of loop:
const elapsed = Date.now() - this.state.loopStartTime;
const remaining = this.MIN_LOOP_INTERVAL_MS - elapsed;
if (remaining > 0) {
  await new Promise(resolve => setTimeout(resolve, remaining));
}
```

### Fix 3: Log Rotation

Add log rotation to suggestions.log:

```typescript
private readonly MAX_LOG_SIZE_MB = 50;
private readonly MAX_LOG_LINES = 100000;

private async rotateLogIfNeeded(logPath: string): Promise<void> {
  try {
    const stats = await fs.stat(logPath);
    if (stats.size > this.MAX_LOG_SIZE_MB * 1024 * 1024) {
      const backup = `${logPath}.${Date.now()}.bak`;
      await fs.rename(logPath, backup);
      // Keep only last N lines in new file
      const lines = await this.readLastNLines(backup, this.MAX_LOG_LINES);
      await fs.writeFile(logPath, lines.join('\n') + '\n');
      await fs.unlink(backup).catch(() => {});
    }
  } catch {}
}
```

### Fix 4: Active Health Check

Make health check actually stop the loop:

```typescript
private readonly MAX_STALL_SECONDS = 300; // 5 minutes

// In startHealthCheck:
this.healthCheckInterval = setInterval(() => {
  const timeSinceLastLoop = Date.now() - this.state.lastLoopTime;
  if (timeSinceLastLoop > this.MAX_STALL_SECONDS * 1000 && this.state.isRunning) {
    this.api.logger.error(`🛑 引擎卡死超过 ${this.MAX_STALL_SECONDS} 秒，自动停止`);
    this.stopLoop(ctx).catch(() => {});
  }
}, this.config.healthCheckInterval);
```

## Related

- Runbook 0002: Agent Recovery Playbook
- Runbook 0007: Debugging Agent Failures
- ADR 0004: Agent Adapter Contract
