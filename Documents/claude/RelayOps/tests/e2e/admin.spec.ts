import { test, expect } from '@playwright/test'
import { SEED_TICKET_IDS } from './helpers/constants'

// storageState injected via playwright.config.ts → projects[admin]

test.describe('Admin role', () => {
  test('P0: /admin loads dashboard without redirect', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: /admin dashboard/i })).toBeVisible()
  })

  test('P0: admin dashboard shows metric cards', async ({ page }) => {
    await page.goto('/admin')
    // All 4 metric card titles must be visible
    await expect(page.getByText('Total Tickets')).toBeVisible()
    await expect(page.getByText('Active Tickets')).toBeVisible()
    await expect(page.getByText('Awaiting Review')).toBeVisible()
    await expect(page.getByText('Open Disputes')).toBeVisible()
  })

  test('P1: admin tickets list page renders rows', async ({ page }) => {
    await page.goto('/admin/tickets')
    await expect(page).not.toHaveURL(/\/login/)
    // At least one row from seed data
    const rows = page.getByRole('row')
    await expect(rows.first()).toBeVisible()
  })

  test('P1: admin can view seed ticket detail', async ({ page }) => {
    await page.goto(`/admin/tickets/${SEED_TICKET_IDS[0]}`)
    await expect(page).not.toHaveURL(/\/login/)
    await expect(
      page.getByRole('heading', { level: 1, name: /deduplicate hubspot company records/i })
    ).toBeVisible()
  })

  test('P1: admin quick links are visible', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByRole('link', { name: /view all tickets/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /view disputes/i })).toBeVisible()
  })
})
