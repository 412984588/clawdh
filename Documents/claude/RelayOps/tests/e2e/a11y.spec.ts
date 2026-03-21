import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import path from 'path'
import { SEED_TICKET_IDS } from './helpers/constants'

const AUTH_DIR = path.join(process.cwd(), 'playwright', '.auth')

/**
 * 辅助函数：运行 axe 扫描并断言 critical/serious 违规为 0
 * moderate/minor 级别只记录日志，不阻断测试
 */
async function assertA11y(page: import('@playwright/test').Page, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  const criticalAndSerious = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious'
  )

  // moderate/minor 只记录不阻断
  const otherViolations = results.violations.filter(
    (v) => v.impact === 'moderate' || v.impact === 'minor'
  )
  if (otherViolations.length > 0) {
    console.log(
      `[a11y:${label}] ${otherViolations.length} moderate/minor violation(s):`,
      otherViolations.map((v) => `${v.id}: ${v.description} (${v.impact})`).join('\n  ')
    )
  }

  expect(
    criticalAndSerious,
    `[a11y:${label}] Found ${criticalAndSerious.length} critical/serious violation(s):\n` +
      criticalAndSerious
        .map((v) => `  - ${v.id}: ${v.description} (${v.impact})`)
        .join('\n')
  ).toHaveLength(0)
}

// ─── A1: Admin dashboard axe 扫描 ───────────────────────────────────────────
test.describe('A11y: Admin pages', () => {
  test.use({ storageState: path.join(AUTH_DIR, 'admin.json') })

  test('A1: admin dashboard has no critical/serious a11y violations', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).not.toHaveURL(/\/login/)
    // 等待内容加载
    await page.waitForLoadState('networkidle')
    await assertA11y(page, 'admin-dashboard')
  })
})

test.describe('A11y: Public pages', () => {
  test('A1b: public homepage exposes a working skip link and has no critical/serious violations', async ({
    page,
  }) => {
    await page.goto('/en')
    await page.waitForLoadState('networkidle')

    const skipLink = page.locator('a[href="#main-content"]').first()
    await expect(skipLink).toHaveAttribute('href', '#main-content')
    await expect(page.locator('main#main-content')).toBeVisible()
    await assertA11y(page, 'public-homepage')
  })
})

// ─── A2: Partner ticket detail axe 扫描 ─────────────────────────────────────
test.describe('A11y: Partner pages', () => {
  test.use({ storageState: path.join(AUTH_DIR, 'partner.json') })

  test('A2: partner ticket detail has no critical/serious a11y violations', async ({ page }) => {
    await page.goto(`/partner/tickets/${SEED_TICKET_IDS[0]}`)
    await expect(page).not.toHaveURL(/\/login/)
    await page.waitForLoadState('networkidle')
    await assertA11y(page, 'partner-ticket-detail')
  })
})

// ─── A3: Worker assignments list axe 扫描 ───────────────────────────────────
test.describe('A11y: Worker pages', () => {
  test.use({ storageState: path.join(AUTH_DIR, 'worker.json') })

  test('A3: worker assignments list has no critical/serious a11y violations', async ({ page }) => {
    await page.goto('/worker')
    await expect(page).not.toHaveURL(/\/login/)
    await page.waitForLoadState('networkidle')
    await assertA11y(page, 'worker-assignments')
  })
})

// ─── A4: New ticket wizard (form 页) axe 扫描 ──────────────────────────────
test.describe('A11y: Partner wizard form', () => {
  test.use({ storageState: path.join(AUTH_DIR, 'partner.json') })

  test('A4: new ticket wizard form has no critical/serious a11y violations', async ({ page }) => {
    await page.goto('/partner/tickets/new')
    await expect(page).not.toHaveURL(/\/login/)
    await page.waitForLoadState('networkidle')
    await assertA11y(page, 'partner-wizard-form')
  })
})

test.describe('A11y: Auth pages', () => {
  test('A5: login page exposes a working skip link and has no critical/serious violations', async ({
    page,
  }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const skipLink = page.locator('a[href="#main-content"]').first()
    await expect(skipLink).toHaveAttribute('href', '#main-content')
    await expect(page.locator('main#main-content')).toBeVisible()
    await assertA11y(page, 'login-page')
  })
})
