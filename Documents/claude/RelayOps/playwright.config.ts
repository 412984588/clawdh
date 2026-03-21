import { defineConfig } from '@playwright/test'
import path from 'path'

const AUTH_DIR = path.join(process.cwd(), 'playwright', '.auth')

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'public',
      testMatch: 'public.spec.ts',
    },
    {
      name: 'admin',
      testMatch: 'admin.spec.ts',
      use: {
        storageState: path.join(AUTH_DIR, 'admin.json'),
      },
    },
    {
      name: 'partner',
      testMatch: 'partner.spec.ts',
      use: {
        storageState: path.join(AUTH_DIR, 'partner.json'),
      },
    },
    {
      name: 'worker',
      testMatch: 'worker.spec.ts',
      use: {
        storageState: path.join(AUTH_DIR, 'worker.json'),
      },
    },
    {
      // forms.spec.ts uses test.use({ storageState }) per describe block
      name: 'forms',
      testMatch: 'forms.spec.ts',
    },
    {
      // errors.spec.ts uses test.use({ storageState }) per describe block
      name: 'errors',
      testMatch: 'errors.spec.ts',
    },
    {
      // flows.spec.ts uses test.use({ storageState }) per describe block
      name: 'flows',
      testMatch: 'flows.spec.ts',
    },
    {
      // a11y.spec.ts uses test.use({ storageState }) per describe block
      name: 'a11y',
      testMatch: 'a11y.spec.ts',
    },
  ],
})
