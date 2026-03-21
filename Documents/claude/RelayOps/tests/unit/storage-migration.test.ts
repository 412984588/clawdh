import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const migrationPath = path.join(
  process.cwd(),
  'supabase',
  'migrations',
  '00015_storage_ticket_prefix_policies.sql'
)

describe('storage migration', () => {
  it('creates a follow-up migration that removes the open authenticated bucket policies', () => {
    expect(existsSync(migrationPath)).toBe(true)

    const sql = readFileSync(migrationPath, 'utf8')
    expect(sql).toContain('DROP POLICY IF EXISTS "ticket_files_auth_only"')
    expect(sql).toContain('DROP POLICY IF EXISTS "ticket_files_insert"')
  })

  it('limits access to ticket-id-prefixed objects for partner and worker users', () => {
    expect(existsSync(migrationPath)).toBe(true)

    const sql = readFileSync(migrationPath, 'utf8')
    expect(sql).toContain("split_part(name, '/', 1)")
    expect(sql).toContain('worker_profiles')
    expect(sql).toContain('users.organization_id')
    expect(sql).toContain("users.role = 'partner'")
    expect(sql).toContain("users.role = 'worker_internal'")
  })
})
