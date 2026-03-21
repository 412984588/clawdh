import { test, expect } from '@playwright/test'

// ─── Public pages (no auth required) ─────────────────────────────────────────

test.describe('Public pages', () => {
  test('P0: homepage is accessible', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBeLessThan(400)
    await expect(page).toHaveTitle(/RelayOps/)
    await expect(page.getByRole('link', { name: /request access/i }).first()).toBeVisible()
    await expect(page.getByText('635 tests')).toBeVisible()
    await expect(page.getByText('Partner Intake')).toBeVisible()
    await expect(page.getByText('What partners say')).toBeVisible()
  })

  test('P0: /login renders email input', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
  })

  test('P0: /request-access partner apply page renders', async ({ page }) => {
    await page.goto('/request-access')
    await expect(page.getByRole('textbox', { name: /company name/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /submit application/i })).toBeVisible()
  })

  test('P1: unauthenticated access to /admin redirects to /login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login/)
  })

  test('P1: unauthenticated access to /partner redirects to /login', async ({ page }) => {
    await page.goto('/partner')
    await expect(page).toHaveURL(/\/login/)
  })

  test('P1: unauthenticated access to /worker redirects to /login', async ({ page }) => {
    await page.goto('/worker')
    await expect(page).toHaveURL(/\/login/)
  })
})
