import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function readWorkspaceFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8')
}

describe('design system audit', () => {
  it('uses RelayOps blue brand tokens in globals.css', () => {
    const css = readWorkspaceFile('src/app/globals.css')

    expect(css).toContain('--primary: 217 91% 48%')
    expect(css).toContain('--ring: 217 91% 48%')
    expect(css).toContain('--cta: 217 91% 48%')
    expect(css).toContain('--sidebar-item-active: 217 91% 48%')
  })

  it('removes decorative indigo and violet accents from dashboard chrome', () => {
    const shell = readWorkspaceFile('src/components/layouts/dashboard-shell.tsx')
    const sidebar = readWorkspaceFile('src/components/layouts/sidebar-nav.tsx')
    const topbar = readWorkspaceFile('src/components/layouts/topbar.tsx')
    const chrome = [shell, sidebar, topbar].join('\n')

    expect(chrome).not.toMatch(/indigo-/)
    expect(chrome).not.toMatch(/violet-/)
    expect(chrome).toMatch(/blue-/)
  })

  it('defines shared dashboard layout utilities and applies them to core pages', () => {
    const css = readWorkspaceFile('src/app/globals.css')
    const adminPage = readWorkspaceFile('src/app/(dashboard)/admin/page.tsx')
    const partnerPage = readWorkspaceFile('src/app/(dashboard)/partner/page.tsx')
    const workerPage = readWorkspaceFile('src/app/(dashboard)/worker/page.tsx')
    const detailPage = readWorkspaceFile('src/app/(dashboard)/admin/tickets/[id]/page.tsx')

    expect(css).toContain('.dashboard-page')
    expect(css).toContain('.dashboard-page-narrow')
    expect(css).toContain('.dashboard-page-detail')

    expect(adminPage).toContain('dashboard-page')
    expect(partnerPage).toContain('dashboard-page')
    expect(workerPage).toContain('dashboard-page-narrow')
    expect(detailPage).toContain('dashboard-page-detail')
  })

  it('keeps public marketing chrome on the blue brand system', () => {
    const footer = readWorkspaceFile('src/components/layouts/public-footer.tsx')

    expect(footer).not.toMatch(/amber-/)
    expect(footer).toMatch(/blue-/)
    expect(footer).toContain('59,130,246')
  })

  it('documents the design system contract', () => {
    const designSystemPath = resolve(process.cwd(), 'docs/DESIGN_SYSTEM.md')

    expect(existsSync(designSystemPath)).toBe(true)

    const doc = readFileSync(designSystemPath, 'utf8')

    expect(doc).toContain('# Design System')
    expect(doc).toContain('## Color System')
    expect(doc).toContain('## Typography')
    expect(doc).toContain('## Spacing')
    expect(doc).toContain('## Components')
  })
})
