# Runbook: Reliability Service Operations

**Owner**: Runtime Reliability Engineer | **Last Updated**: 2026-03-13 | **Status**: Active

## Purpose

Operate and troubleshoot the reliability service that provides run cleanup, heartbeat tracking, and auth drift detection for the Paperclip agent system.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Reliability Service                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Heartbeat   │  │ Run Cleanup │  │ Auth Drift  │         │
│  │ Tracker     │  │ Service     │  │ Detector    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      SQLite Database                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ heartbeats  │  │ run_cleanup │  │ auth_checks │         │
│  │             │  │ _log        │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints

### Heartbeat Operations

| Endpoint                         | Method | Purpose                         |
| -------------------------------- | ------ | ------------------------------- |
| `/api/reliability/heartbeat`     | POST   | Record a heartbeat for a run    |
| `/api/reliability/stale-runs`    | GET    | Detect stale runs               |
| `/api/reliability/cleanup`       | POST   | Run cleanup operation           |
| `/api/reliability/health-report` | GET    | Get comprehensive health report |

### Auth Drift Operations

| Endpoint                                   | Method | Purpose                         |
| ------------------------------------------ | ------ | ------------------------------- |
| `/api/reliability/auth-check`              | POST   | Check auth status for providers |
| `/api/reliability/auth-status`             | POST   | Record auth status              |
| `/api/reliability/auth-history/{provider}` | GET    | Get auth history                |
| `/api/reliability/auth-drift`              | GET    | Detect auth drift               |

## Common Operations

### Record a Heartbeat

```bash
curl -X POST http://localhost:8000/api/reliability/heartbeat \
  -H "Content-Type: application/json" \
  -d '{
    "run_id": "run-codex-241",
    "status": "running",
    "files_touched": ["src/main.py", "tests/test_main.py"],
    "metadata": {"step": 3, "total_steps": 10}
  }'
```

### Check for Stale Runs

```bash
# Default thresholds (5 min stale, 10 min dead)
curl http://localhost:8000/api/reliability/stale-runs

# Custom thresholds
curl "http://localhost:8000/api/reliability/stale-runs?stale_timeout_seconds=120&dead_timeout_seconds=300"
```

### Run Cleanup

```bash
# Dry run (detect only)
curl -X POST http://localhost:8000/api/reliability/cleanup \
  -H "Content-Type: application/json" \
  -d '{
    "stale_timeout_seconds": 300,
    "dead_timeout_seconds": 600,
    "auto_release": false
  }'

# Auto-release dead runs
curl -X POST http://localhost:8000/api/reliability/cleanup \
  -H "Content-Type: application/json" \
  -d '{
    "stale_timeout_seconds": 300,
    "dead_timeout_seconds": 600,
    "auto_release": true
  }'
```

### Get Health Report

```bash
curl http://localhost:8000/api/reliability/health-report
```

### Record Auth Status

```bash
curl -X POST http://localhost:8000/api/reliability/auth-status \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "codex",
    "status": "valid",
    "expires_at": "2026-03-14T16:00:00Z"
  }'
```

### Check Auth Drift

```bash
# Check for drift (default 24 hour threshold)
curl http://localhost:8000/api/reliability/auth-drift

# Custom threshold
curl "http://localhost:8000/api/reliability/auth-drift?drift_threshold_hours=12"
```

## Health Status Values

### Run Health Status

| Status    | Meaning                         | Action                            |
| --------- | ------------------------------- | --------------------------------- |
| `healthy` | Recent heartbeat within timeout | No action needed                  |
| `stale`   | No heartbeat within timeout     | Monitor, may need recovery        |
| `dead`    | No heartbeat for 2x timeout     | Auto-fail if auto_release enabled |
| `unknown` | No heartbeat data               | Check run status manually         |

### Auth Status

| Status    | Meaning                | Action                   |
| --------- | ---------------------- | ------------------------ |
| `valid`   | Auth is current        | No action needed         |
| `expired` | Auth token expired     | Re-authenticate provider |
| `invalid` | Auth is invalid        | Check credentials        |
| `unknown` | No auth check recorded | Run auth check           |

## Troubleshooting

### Run Shows as Stale but Should Be Active

**Symptoms**: Run appears in stale runs list but agent is still working

**Cause**: Heartbeat not being recorded by agent adapter

**Solution**:

1. Check agent adapter is calling heartbeat endpoint
2. Verify heartbeat interval is less than stale timeout
3. Manually record heartbeat if needed

### Auth Drift Detected for Healthy Provider

**Symptoms**: Auth drift shows provider as drifted but auth is actually valid

**Cause**: No recent auth check recorded

**Solution**:

1. Record current auth status
2. Set up periodic auth checks in heartbeat

### Cleanup Marks Active Runs as Failed

**Symptoms**: Active runs get marked as failed during cleanup

**Cause**: Dead timeout is too short for long-running tasks

**Solution**:

1. Increase `dead_timeout_seconds` for the cleanup call
2. Ensure heartbeats are being recorded regularly
3. Review heartbeat interval configuration

## Configuration

### Default Timeouts

| Setting                 | Default      | Description                                 |
| ----------------------- | ------------ | ------------------------------------------- |
| `stale_timeout_seconds` | 300 (5 min)  | Time before run is considered stale         |
| `dead_timeout_seconds`  | 600 (10 min) | Time before run is considered dead          |
| `drift_threshold_hours` | 24           | Hours before auth check is considered stale |

### Recommended Settings

| Scenario                  | Stale Timeout | Dead Timeout |
| ------------------------- | ------------- | ------------ |
| Quick tasks (< 5 min)     | 60s           | 120s         |
| Standard tasks (5-30 min) | 300s          | 600s         |
| Long tasks (> 30 min)     | 900s          | 1800s        |

## Monitoring Queries

### Check Recent Heartbeats

```sql
SELECT run_id, MAX(recorded_at) as last_heartbeat, COUNT(*) as count
FROM heartbeats
GROUP BY run_id
ORDER BY last_heartbeat DESC;
```

### Check Cleanup History

```sql
SELECT run_id, action, reason, performed_at
FROM run_cleanup_log
ORDER BY performed_at DESC
LIMIT 20;
```

### Check Auth Check History

```sql
SELECT provider, status, checked_at, error
FROM auth_checks
ORDER BY checked_at DESC
LIMIT 20;
```

## Related

- Runbook 0002: Agent Recovery Playbook
- Runbook 0005: Provider Auth Troubleshooting
- Runbook 0013: OpenClaw Engine Runaway Loop
- ADR 0005: Heartbeat and Session Management Model
