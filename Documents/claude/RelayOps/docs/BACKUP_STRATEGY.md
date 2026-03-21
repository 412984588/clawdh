# Database Backup Strategy

## Overview

RelayOps uses Supabase (PostgreSQL) as its primary database. This document defines the backup strategy covering automated backups, manual backups, retention policies, and verification procedures.

## Automated Backups (Supabase Managed)

### Pro Plan Features
- **Daily automatic backups** with 7-day retention
- **Point-in-Time Recovery (PITR)** via WAL archiving — restore to any second within the retention window
- Backups are stored in Supabase's infrastructure (separate availability zone)

### Configuration
PITR is enabled by default on Pro plan. Verify in Supabase Dashboard:
**Project Settings → Database → Backups → Point in Time Recovery**

No action required from RelayOps team — Supabase handles scheduling, storage, and rotation.

## Manual Backups

### When to Use
- Before major migrations or schema changes
- Before bulk data operations (imports, cleanup)
- Pre-deployment of risky changes
- Monthly compliance snapshots
- Before any destructive admin operation

### Usage

```bash
# Set database URL
export DATABASE_URL="postgresql://user:pass@host:5432/postgres"

# Default: custom format to ./backups/
./scripts/backup-db.sh

# Custom output directory + plain SQL format
./scripts/backup-db.sh -o /mnt/backups -f plain

# Restore from backup
./scripts/restore-db.sh ./backups/relayops_20260321_143000.dump
```

### Upload to S3 (Optional)

```bash
# After backup, upload to S3 for off-site storage
aws s3 cp ./backups/relayops_20260321_143000.dump \
  s3://relayops-backups/daily/ \
  --storage-class STANDARD_IA
```

## Backup Frequency

| Type | Frequency | Retention | Method |
|------|-----------|-----------|--------|
| Supabase PITR (WAL) | Continuous | 7 days | Automatic |
| Supabase daily snapshot | Daily | 7 days | Automatic |
| Manual pre-migration | Before each migration | 90 days | `backup-db.sh` |
| Monthly compliance | 1st of each month | 1 year | `backup-db.sh` + S3 |
| Milestone (launch, major release) | As needed | Permanent | `backup-db.sh` + S3 Glacier |

## Data Retention Policy

- **Rolling 30-day window**: Keep all manual backups from the last 30 days
- **Monthly snapshots**: Keep 1 backup per month for 12 months
- **Milestone backups**: Keep permanently (tag with reason in S3 metadata)
- **Local backups**: Clean up after upload to S3

### Cleanup Script

```bash
# Delete local backups older than 30 days
find ./backups -name "relayops_*.dump" -mtime +30 -delete
find ./backups -name "relayops_*.sql.gz" -mtime +30 -delete
```

## Backup Verification

### Monthly Verification Checklist
1. Select the most recent daily backup
2. Restore to a test Supabase instance or local Docker
3. Verify row counts on critical tables: `tickets`, `ledger_entries`, `users`, `organizations`
4. Run `pnpm test` against restored database
5. Document results in the verification log

### Verification Command

```bash
# Restore to local Supabase for verification
export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
./scripts/restore-db.sh ./backups/latest.dump --force
psql "$DATABASE_URL" -c "SELECT tablename, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC;"
```

## Responsibilities

| Role | Responsibility |
|------|---------------|
| Engineering Lead | Ensure PITR is enabled, review monthly verification |
| On-call Engineer | Execute manual backups before migrations |
| DevOps (future) | Automate S3 uploads and retention cleanup |
