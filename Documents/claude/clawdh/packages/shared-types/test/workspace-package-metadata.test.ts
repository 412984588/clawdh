import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

interface PackageJsonLike {
  main?: string;
  types?: string;
  exports?: Record<string, string | { import?: string; types?: string; default?: string }>;
}

function readWorkspacePackageJsons(): Array<{ name: string; path: string; pkg: PackageJsonLike }> {
  const packagesDir = join(import.meta.dirname, '..', '..');
  const repoRoot = join(packagesDir, '..', '..');

  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const packageJsonPath = join(packagesDir, entry.name, 'package.json');
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as PackageJsonLike;
      return {
        name: entry.name,
        path: packageJsonPath,
        pkg,
      };
    })
    .filter((item) => {
      try {
        execFileSync('git', [
          '-C',
          repoRoot,
          'ls-files',
          '--error-unmatch',
          item.path,
        ], { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    });
}

describe('workspace package metadata', () => {
  it('publishes package entrypoints from dist paths', () => {
    const packages = readWorkspacePackageJsons();

    for (const item of packages) {
      if (item.pkg.main) {
        expect(item.pkg.main, `${item.name} main should point to dist`).toMatch(/^\.\/dist\//);
      }

      if (item.pkg.types) {
        expect(item.pkg.types, `${item.name} types should point to dist`).toMatch(/^\.\/dist\//);
      }

      for (const [subpath, target] of Object.entries(item.pkg.exports ?? {})) {
        if (typeof target === 'string') {
          expect(target, `${item.name} export ${subpath} should point to dist`).toMatch(/^\.\/dist\//);
          continue;
        }

        if (target.import) {
          expect(target.import, `${item.name} export ${subpath} import should point to dist`).toMatch(/^\.\/dist\//);
        }

        if (target.default) {
          expect(target.default, `${item.name} export ${subpath} default should point to dist`).toMatch(/^\.\/dist\//);
        }

        if (target.types) {
          expect(target.types, `${item.name} export ${subpath} types should point to dist`).toMatch(/^\.\/dist\//);
        }
      }
    }
  });
});
