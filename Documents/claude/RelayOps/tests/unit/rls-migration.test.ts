import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const migrationPath = path.join(
  process.cwd(),
  'supabase',
  'migrations',
  '00011_missing_rls_policies.sql'
)

describe('rls migration', () => {
  it('does not reference removed worker roles outside the user_role enum', () => {
    expect(existsSync(migrationPath)).toBe(true)

    const sql = readFileSync(migrationPath, 'utf8')
    expect(sql).toContain("users.role = 'worker_internal'")
    expect(sql).not.toContain('worker_external')
  })
})
