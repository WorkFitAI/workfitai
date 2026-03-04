import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const PAGES_TO_AUDIT = [
  { name: 'Homepage', path: '/' },
  { name: 'Login', path: '/login' },
  { name: 'Register', path: '/register' },
  { name: 'Forgot Password', path: '/forgot-password' },
]

for (const { name, path } of PAGES_TO_AUDIT) {
  test(`${name} — zero critical a11y violations`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    // Filter to critical + serious only
    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )

    if (critical.length > 0) {
      console.error(
        `[${name}] A11y violations:\n`,
        critical.map((v) => `  - ${v.id}: ${v.description} (${v.impact})`).join('\n')
      )
    }

    expect(critical).toHaveLength(0)
  })
}
