import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

interface AppPackageJson {
  scripts?: Record<string, string>;
}

describe('voice-hub app start script', () => {
  it('uses tsx to run dist cli for workspace-compatible runtime resolution', () => {
    const packageJsonPath = join(import.meta.dirname, '..', 'package.json');
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as AppPackageJson;
    const startScript = pkg.scripts?.start;

    expect(startScript).toBeDefined();
    expect(startScript).toContain('tsx');
    expect(startScript).toContain('dist/cli.js');
  });
});
