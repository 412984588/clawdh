import { test, expect } from '@playwright/test'
import { SEED_ASSIGNMENT_ID } from './helpers/constants'

// storageState injected via playwright.config.ts → projects[worker]

test.describe('Worker role', () => {
  test('P0: /worker loads without redirect', async ({ page }) => {
    await page.goto('/worker')
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('P0: worker assignments list page renders', async ({ page }) => {
    await page.goto('/worker/assignments')
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('P1: worker can open the seeded in-progress assignment detail', async ({ page }) => {
    await page.goto(`/worker/assignments/${SEED_ASSIGNMENT_ID}`)
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { level: 1, name: 'Assignment' })).toBeVisible()
  })

  test('P1: worker cannot access admin routes', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login/)
  })

  test('P1: worker cannot access partner routes', async ({ page }) => {
    await page.goto('/partner')
    await expect(page).toHaveURL(/\/login/)
  })
})
