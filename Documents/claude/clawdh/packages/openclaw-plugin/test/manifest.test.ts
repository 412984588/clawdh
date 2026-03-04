import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

interface OpenClawManifest {
  configuration: {
    env: Array<{
      name: string;
      description?: string;
    }>;
  };
}

describe('openclaw.plugin.json', () => {
  it('includes qwen-dashscope in VOICE_PROVIDER description', () => {
    const manifest = JSON.parse(
      readFileSync(resolve(process.cwd(), 'openclaw.plugin.json'), 'utf8')
    ) as OpenClawManifest;

    const providerSetting = manifest.configuration.env.find(
      (entry) => entry.name === 'VOICE_PROVIDER'
    );

    expect(providerSetting?.description).toContain('qwen-dashscope');
  });
});
