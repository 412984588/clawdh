import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const seedPath = path.join(process.cwd(), 'supabase', 'seed.sql')

describe('seed auth data', () => {
  it('creates auth identities for demo users', () => {
    expect(existsSync(seedPath)).toBe(true)

    const sql = readFileSync(seedPath, 'utf8')
    expect(sql).toContain('INSERT INTO auth.identities')
    expect(sql).toContain("'email'")
    expect(sql).toContain('jsonb_build_object(')
    expect(sql).toContain("'sub'")
  })

  it('sets auth token fields to empty strings instead of nulls', () => {
    expect(existsSync(seedPath)).toBe(true)

    const sql = readFileSync(seedPath, 'utf8')
    expect(sql).toContain('confirmation_token')
    expect(sql).toContain('recovery_token')
    expect(sql).toContain('email_change_token_new')
    expect(sql).toContain('email_change')
    expect(sql).toContain("''")
  })
})
