import { test, expect } from '@playwright/test'
import { SEED_TICKET_IDS } from './helpers/constants'

// storageState injected via playwright.config.ts → projects[partner]

test.describe('Partner role', () => {
  test('P0: /partner loads dashboard without redirect', async ({ page }) => {
    await page.goto('/partner')
    await expect(page).not.toHaveURL(/\/login/)
    // Dashboard heading or ticket list should be visible
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('P0: partner dashboard shows tickets section', async ({ page }) => {
    await page.goto('/partner')
    // Seed data includes tickets owned by partner1 — at least one row visible
    const ticketLink = page.getByRole('link').filter({ hasText: /ticket/i }).first()
    await expect(ticketLink.or(page.getByRole('row').first())).toBeVisible({ timeout: 10_000 })
  })

  test('P1: partner can navigate to create new ticket', async ({ page }) => {
    await page.goto('/partner/tickets/new')
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: /submit a new job/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /eligibility check/i })).toBeVisible()
  })

  test('P1: partner can view seed ticket detail', async ({ page }) => {
    await page.goto(`/partner/tickets/${SEED_TICKET_IDS[0]}`)
    await expect(page).not.toHaveURL(/\/login/)
    // Should render without 404 — a heading is present
    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('P1: partner tickets list page renders', async ({ page }) => {
    await page.goto('/partner/tickets')
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })
})
