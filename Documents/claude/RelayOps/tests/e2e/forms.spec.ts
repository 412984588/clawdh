import { test, expect } from '@playwright/test'
import path from 'path'
import { SEED_TICKET_IDS } from './helpers/constants'

const AUTH_DIR = path.join(process.cwd(), 'playwright', '.auth')

// ─── Partner: New Ticket Wizard ───────────────────────────────────────────────
test.describe('Partner: new ticket wizard', () => {
  test.use({ storageState: path.join(AUTH_DIR, 'partner.json') })

  test('F1: new ticket page renders wizard step 1 (Eligibility Check)', async ({ page }) => {
    await page.goto('/partner/tickets/new')
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: /submit a new job/i })).toBeVisible()
    // Step indicator shows "Step 1 of 5"
    await expect(page.getByText(/step 1 of 5/i)).toBeVisible()
    // Eligibility heading inside the step
    await expect(page.getByRole('heading', { name: /eligibility check/i })).toBeVisible()
  })

  test('F2: wizard shows validation error if Next clicked without answering questions', async ({
    page,
  }) => {
    await page.goto('/partner/tickets/new')
    await page.getByRole('button', { name: /^next$/i }).click()
    await expect(page.getByText(/please answer all eligibility questions/i)).toBeVisible()
    // Still on step 1
    await expect(page.getByText(/step 1 of 5/i)).toBeVisible()
  })

  test('F3: wizard advances to step 2 after all eligibility questions answered Yes', async ({
    page,
  }) => {
    await page.goto('/partner/tickets/new')

    // Answer all 5 eligibility questions with positive responses
    // Q1: "Do you have the raw data file ready?" → Yes
    await page.getByRole('button', { name: /^yes$/i }).nth(0).click()
    // Q2: "Can you describe what done looks like?" → Yes
    await page.getByRole('button', { name: /^yes$/i }).nth(1).click()
    // Q3: "Fewer than 50,000 rows?" → Yes
    await page.getByRole('button', { name: /^yes$/i }).nth(2).click()
    // Q4: "Is this a one-time cleanup?" → Yes, one-time
    await page.getByRole('button', { name: /yes, one-time/i }).click()
    // Q5: "Do you have permission to share?" → Yes
    await page.getByRole('button', { name: /^yes$/i }).nth(3).click()

    await page.getByRole('button', { name: /^next$/i }).click()

    // Should advance to step 2 (Data Source)
    await expect(page.getByText(/step 2 of 5/i)).toBeVisible()
  })

  test('F4: wizard Back button returns from step 2 to step 1', async ({ page }) => {
    await page.goto('/partner/tickets/new')

    // Answer eligibility and advance to step 2
    await page.getByRole('button', { name: /^yes$/i }).nth(0).click()
    await page.getByRole('button', { name: /^yes$/i }).nth(1).click()
    await page.getByRole('button', { name: /^yes$/i }).nth(2).click()
    await page.getByRole('button', { name: /yes, one-time/i }).click()
    await page.getByRole('button', { name: /^yes$/i }).nth(3).click()
    await page.getByRole('button', { name: /^next$/i }).click()
    await expect(page.getByText(/step 2 of 5/i)).toBeVisible()

    // Go back to step 1
    await page.getByRole('button', { name: /^back$/i }).click()
    await expect(page.getByText(/step 1 of 5/i)).toBeVisible()
    await expect(page.getByRole('heading', { name: /eligibility check/i })).toBeVisible()
  })

  test('F5: partner ticket list shows seed tickets', async ({ page }) => {
    await page.goto('/partner/tickets')
    await expect(page).not.toHaveURL(/\/login/)
    // At least 3 tickets in org 1: ticket 1 (submitted), 2 (scope_locked), 5 (completed)
    const rows = page.getByRole('row').or(page.getByRole('listitem'))
    await expect(rows.first()).toBeVisible({ timeout: 8_000 })
  })
})

// ─── Partner: Ticket Detail Review Actions ────────────────────────────────────
test.describe('Partner: ticket detail and review actions', () => {
  test.use({ storageState: path.join(AUTH_DIR, 'partner.json') })

  test('F6: partner ticket detail page renders for scope_locked ticket', async ({ page }) => {
    await page.goto(`/partner/tickets/${SEED_TICKET_IDS[1]}`)
    await expect(page).not.toHaveURL(/\/login/)
    // Ticket 2 is scope_locked — heading and status badge should be visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText('Scope Locked').first()).toBeVisible()
  })

  test('F7: completed ticket does not show review action buttons', async ({ page }) => {
    // Ticket 5 is completed (org 1)
    await page.goto(`/partner/tickets/${SEED_TICKET_IDS[4]}`)
    await expect(page).not.toHaveURL(/\/login/)
    // Review actions only shown when status === 'submitted_for_review'
    await expect(page.getByRole('button', { name: /approve/i })).not.toBeVisible()
    await expect(page.getByRole('button', { name: /request.?revision/i })).not.toBeVisible()
  })
})

// ─── Admin: Ticket Detail and Scope Panels ────────────────────────────────────
test.describe('Admin: ticket detail and scope panels', () => {
  test.use({ storageState: path.join(AUTH_DIR, 'admin.json') })

  test('F8: admin ticket detail shows activity log section', async ({ page }) => {
    await page.goto(`/admin/tickets/${SEED_TICKET_IDS[0]}`)
    await expect(page).not.toHaveURL(/\/login/)
    // Ticket 1 is 'submitted' — admin can view it
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    // Activity Log card
    await expect(page.getByText(/activity log/i)).toBeVisible()
  })

  test('F9: admin can view scope_locked ticket with scope card', async ({ page }) => {
    // Ticket 2 is scope_locked — scope lock card shows pricing/details
    await page.goto(`/admin/tickets/${SEED_TICKET_IDS[1]}`)
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page.getByText('Scope Locked').first()).toBeVisible()
  })

  test('F10: admin ticket for submitted_for_review shows heading and status', async ({ page }) => {
    // Ticket 4 is submitted_for_review (org 2 — admin can see all)
    await page.goto(`/admin/tickets/${SEED_TICKET_IDS[3]}`)
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText('Submitted for Review').first()).toBeVisible()
  })
})
