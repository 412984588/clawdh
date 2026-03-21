import { test, expect } from '@playwright/test'
import path from 'path'

const AUTH_DIR = path.join(process.cwd(), 'playwright', '.auth')

const NON_EXISTENT_ID = '00000000-0000-0000-0000-000000099999'

// ─── Role-based access errors (partner auth) ──────────────────────────────────
test.describe('Role-based redirect errors', () => {
  test.use({ storageState: path.join(AUTH_DIR, 'partner.json') })

  test('E1: authenticated partner accessing /admin is redirected to login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login/)
  })

  test('E2: partner accessing /worker is redirected away', async ({ page }) => {
    await page.goto('/worker')
    // Worker page requires worker role — partner gets redirected away from /worker
    await expect(page).not.toHaveURL(/^http:\/\/localhost:\d+\/worker$/)
  })
})

// ─── 404 error pages (partner auth) ──────────────────────────────────────────
test.describe('404 not-found error pages — partner', () => {
  test.use({ storageState: path.join(AUTH_DIR, 'partner.json') })

  test('E3: partner accessing non-existent ticket URL returns 404', async ({ page }) => {
    await page.goto(`/partner/tickets/${NON_EXISTENT_ID}`)
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
    await expect(page.getByText(/page not found/i)).toBeVisible()
  })
})

// ─── 404 error pages (admin auth) ────────────────────────────────────────────
test.describe('404 not-found error pages — admin', () => {
  test.use({ storageState: path.join(AUTH_DIR, 'admin.json') })

  test('E4: admin accessing non-existent ticket URL returns 404', async ({ page }) => {
    await page.goto(`/admin/tickets/${NON_EXISTENT_ID}`)
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
    await expect(page.getByText(/page not found/i)).toBeVisible()
  })
})
