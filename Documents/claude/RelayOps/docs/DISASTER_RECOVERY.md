# Disaster Recovery Plan

## Recovery Objectives

| Metric | Target | Notes |
|--------|--------|-------|
| **RTO** (Recovery Time Objective) | < 1 hour | Time from incident detection to service restoration |
| **RPO** (Recovery Point Objective) | < 1 hour | Maximum acceptable data loss window |

Supabase PITR provides continuous WAL archiving, supporting RPO of seconds in most scenarios.

## Incident Severity Levels

| Level | Scenario | Examples | Response Time |
|-------|----------|----------|---------------|
| **SEV-1** | Complete data loss | Database deletion, infrastructure failure | Immediate |
| **SEV-2** | Data corruption | Bad migration, bulk update gone wrong | < 15 min |
| **SEV-3** | Accidental deletion | Dropped table, deleted critical rows | < 30 min |
| **SEV-4** | Performance degradation | Index corruption, bloated tables | < 2 hours |

## Recovery Procedures

### SEV-1: Complete Data Loss

1. **Assess**: Confirm data loss via Supabase Dashboard or `psql` connection attempt
2. **Notify**: Alert team via escalation path (see Contacts below)
3. **Restore from Supabase PITR**:
   - Go to Supabase Dashboard → Project → Database → Backups
   - Select "Point in Time Recovery"
   - Choose timestamp just before the incident
   - Initiate restore (Supabase handles the process)
4. **Verify**: Check critical tables and row counts
5. **Update DNS/config**: If a new project was created, update connection strings
6. **Post-incident**: Write postmortem within 48 hours

### SEV-2: Data Corruption

1. **Assess**: Identify affected tables and scope of corruption
2. **Stop writes**: If corruption is spreading, enable maintenance mode or pause the application
3. **Option A — PITR restore** (preferred):
   - Use Supabase PITR to restore to a point before corruption
4. **Option B — Manual restore from backup**:
   ```bash
   # Find the most recent clean backup
   ls -la ./backups/

   # Restore to production
   export DATABASE_URL="<production-db-url>"
   ./scripts/restore-db.sh ./backups/relayops_YYYYMMDD_HHMMSS.dump
   ```
5. **Verify**: Run integrity checks on affected tables
6. **Resume**: Re-enable the application

### SEV-3: Accidental Deletion

1. **Assess**: Identify what was deleted and when
2. **Option A — PITR** (if within retention window):
   - Restore to a temporary database at the point before deletion
   - Export only the deleted data
   - Import into production
3. **Option B — Full restore** (if targeted restore is impractical):
   ```bash
   ./scripts/restore-db.sh ./backups/latest.dump
   ```
4. **Verify**: Confirm deleted data is restored

### SEV-4: Performance Degradation

1. **Diagnose**: Check `pg_stat_user_tables`, `pg_stat_activity`, index usage
2. **Fix**: REINDEX, VACUUM FULL, or targeted fixes
3. **No restore needed** unless corruption is confirmed

## Contacts and Escalation Path

| Order | Role | Contact | When |
|-------|------|---------|------|
| 1 | On-call Engineer | (configure in PagerDuty/Opsgenie) | First responder |
| 2 | Engineering Lead | (configure) | SEV-1 or SEV-2 |
| 3 | CTO / Founder | (configure) | SEV-1 lasting > 30 min |
| 4 | Supabase Support | support@supabase.io or Dashboard | Infrastructure issues |

## Quarterly Drill Plan

### Schedule
- **Q1** (January): Full restore from backup to test environment
- **Q2** (April): PITR restore simulation
- **Q3** (July): Accidental deletion recovery (SEV-3 scenario)
- **Q4** (October): Full disaster recovery drill (SEV-1 scenario)

### Drill Checklist

- [ ] Select a backup (or PITR timestamp) for the drill
- [ ] Provision a test Supabase instance or local Docker environment
- [ ] Execute the restore procedure
- [ ] Verify data integrity:
  - [ ] Row counts match production (within RPO window)
  - [ ] Critical tables present: `tickets`, `ledger_entries`, `users`, `organizations`
  - [ ] Application connects and serves requests
- [ ] Measure actual recovery time (compare against RTO target)
- [ ] Document findings and gaps
- [ ] Update this plan if gaps are found

### Drill Results Log

| Date | Drill Type | RTO Actual | Pass/Fail | Notes |
|------|-----------|------------|-----------|-------|
| (TBD) | Q1 Full Restore | — | — | — |

## Runbook Quick Reference

```bash
# 1. Take a manual backup RIGHT NOW
./scripts/backup-db.sh

# 2. List available backups
ls -lah ./backups/

# 3. Restore from a backup
./scripts/restore-db.sh ./backups/relayops_YYYYMMDD_HHMMSS.dump

# 4. Quick health check after restore
psql "$DATABASE_URL" -c "
  SELECT 'tickets' AS tbl, COUNT(*) FROM tickets
  UNION ALL
  SELECT 'ledger_entries', COUNT(*) FROM ledger_entries
  UNION ALL
  SELECT 'users', COUNT(*) FROM users
  UNION ALL
  SELECT 'organizations', COUNT(*) FROM organizations;
"
```
