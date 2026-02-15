import { jest } from '@jest/globals';
import fs from 'fs';
import os from 'os';
import path from 'path';
import sqlite3pkg from 'sqlite3';
import register, { __testing } from '../index.js';

describe('forge internals', () => {
  test('runCommand executes asynchronously and returns stdout', async () => {
    const result = await __testing.runCommand('node -e "console.log(123)"', {
      timeoutMs: 3000,
    });
    expect(result.ok).toBe(true);
    expect(result.stdout.trim()).toBe('123');
  });

  test('LRU cache evicts least recently used entry', () => {
    const cache = new __testing.LRUCache(2);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.get('a');
    cache.set('c', 3);
    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('a')).toBe(1);
    expect(cache.get('c')).toBe(3);
  });

  test('rate limiter blocks requests over threshold', () => {
    const limiter = new __testing.RateLimiter({ limit: 2, windowMs: 10_000 });
    expect(limiter.consume('forge_status')).toBe(true);
    expect(limiter.consume('forge_status')).toBe(true);
    expect(limiter.consume('forge_status')).toBe(false);
  });

  test('input whitelist rejects invalid branch names', () => {
    const validation = __testing.validateToolParams('forge_git', {
      projectId: 'proj-1',
      action: 'branch',
      branch: 'bad;rm -rf /',
    });
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('branch');
  });

  test('normalizeErrorResult adds standard error shape', () => {
    const normalized = __testing.normalizeErrorResult({
      success: false,
      error: 'Missing projectId',
    });
    expect(normalized.errorCode).toBeDefined();
    expect(normalized.suggestion).toBeDefined();
  });

  test('incremental index detects changed files only', async () => {
    const fakeFs = {
      walkFiles: async () => [
        { relPath: 'src/a.ts', mtimeMs: 1, size: 10 },
        { relPath: 'src/b.ts', mtimeMs: 2, size: 20 },
      ],
      previousState: new Map([['src/a.ts', '1:10']]),
    };

    const result = await __testing.computeIncrementalChanges(fakeFs.walkFiles, fakeFs.previousState);
    expect(result.changed).toEqual(['src/b.ts']);
    expect(result.removed).toEqual([]);
  });

  test('forge_init succeeds for PRD with dependencies (no crash on array parse)', async () => {
    const tools = new Map();
    register({
      logger: { info: () => {}, warn: () => {}, error: () => {} },
      registerTool: (toolDef) => tools.set(toolDef.name, toolDef),
    });

    const prd = [
      '# Demo',
      '### Feature 1: Auth',
      '- 描述: login',
      '- 优先级: P1',
      '- 依赖: 无',
      '### Feature 2: Profile',
      '- 描述: profile page',
      '- 优先级: P1',
      '- 依赖: feat-001',
    ].join('\n');

    const result = await tools.get('forge_init').execute('t', { prd });
    expect(result.success).toBe(true);
    expect(result.projectId).toBeDefined();
  });

  test('forge_init can create two projects from same PRD without feature ID collision', async () => {
    const tools = new Map();
    register({
      logger: { info: () => {}, warn: () => {}, error: () => {} },
      registerTool: (toolDef) => tools.set(toolDef.name, toolDef),
    });
    const prd = [
      '# Collision Check',
      '### Feature 1: A',
      '- 描述: a',
      '- 优先级: P1',
      '- 依赖: 无',
      '### Feature 2: B',
      '- 描述: b',
      '- 优先级: P1',
      '- 依赖: feat-001',
    ].join('\n');

    const first = await tools.get('forge_init').execute('t1', { prd });
    const second = await tools.get('forge_init').execute('t2', { prd });
    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
  });

  test('input whitelist rejects unsafe package names', () => {
    const validation = __testing.validateToolParams('forge_install', {
      projectId: 'proj-1',
      packages: ['lodash', 'evil;rm -rf /'],
      dev: false,
    });
    expect(validation.valid).toBe(false);
  });

  test('state machine blocks invalid transition pending -> complete', () => {
    expect(__testing.isValidFeatureTransition('pending', 'complete')).toBe(false);
    expect(__testing.isValidFeatureTransition('pending', 'in_progress')).toBe(true);
  });

  test('detectCycle is resilient to malformed dependencies payload', () => {
    const features = [
      { id: 'a', dependencies: { bad: true } },
      { id: 'b', dependencies: 123 },
    ];
    expect(() => __testing.detectCycle(features)).not.toThrow();
    expect(__testing.detectCycle(features)).toBe(false);
  });

  test('validateDependencies is resilient to non-array dependencies', () => {
    const features = [
      { id: 'a', dependencies: 'oops' },
      { id: 'b', dependencies: null },
    ];
    expect(() => __testing.validateDependencies(features)).not.toThrow();
    expect(__testing.validateDependencies(features)).toEqual([]);
  });

  test('input whitelist rejects path traversal package names', () => {
    const validation = __testing.validateToolParams('forge_install', {
      projectId: 'proj-1',
      packages: ['../evil', '@safe/pkg'],
      dev: true,
    });
    expect(validation.valid).toBe(false);
  });

  test('audit sanitizer redacts token/account/path fields', () => {
    const sanitized = __testing.sanitizeAuditValue({
      token: 'abcd1234',
      account: 'user@example.com',
      nested: { apiToken: 'xyz', filePath: '/Users/alice/project' },
    });
    expect(sanitized.token).toMatch(/\[REDACTED/i);
    expect(sanitized.account).toMatch(/\[REDACTED/i);
    expect(sanitized.nested.apiToken).toMatch(/\[REDACTED/i);
    expect(sanitized.nested.filePath).toMatch(/\[REDACTED/i);
  });

  test('normalizeDependencyList keeps only valid dependency ids', () => {
    const deps = __testing.normalizeDependencyList(['feat-001', '', null, '   ', 'feat-002']);
    expect(deps).toEqual(['feat-001', 'feat-002']);
  });

  test('schema migration is idempotent on repeated upgrades', async () => {
    const sqlite3 = sqlite3pkg.verbose();
    const db = await new Promise((resolve, reject) => {
      const instance = new sqlite3.Database(':memory:', (err) => (err ? reject(err) : resolve(instance)));
    });
    const run = (sql) => new Promise((resolve, reject) => db.run(sql, [], (err) => (err ? reject(err) : resolve())));

    await run(`CREATE TABLE runs (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      feature_id TEXT,
      tool TEXT,
      status TEXT,
      model TEXT
    )`);
    await run(`CREATE TABLE features (id TEXT PRIMARY KEY, project_id TEXT, status TEXT, priority INTEGER, created_at DATETIME)`);
    await run(`CREATE TABLE projects (id TEXT PRIMARY KEY, name TEXT)`);
    await run(`CREATE TABLE commits (id TEXT PRIMARY KEY)`);
    await run(`CREATE TABLE file_index (project_id TEXT, rel_path TEXT, fingerprint TEXT, PRIMARY KEY(project_id, rel_path))`);
    await run(`CREATE TABLE audit_logs (id TEXT PRIMARY KEY, tool TEXT, phase TEXT, success INTEGER, payload TEXT)`);

    await expect(__testing.ensureSchema(db)).resolves.toBeUndefined();
    await expect(__testing.ensureSchema(db)).resolves.toBeUndefined();

    await new Promise((resolve, reject) => db.close((err) => (err ? reject(err) : resolve())));
  });
});
