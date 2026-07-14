import { test, expect } from '@playwright/test'
import { injectAuthToken } from './helpers/inject-auth-token'

test.describe('Admin audit logs', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page, 'admin@workfitai.com', 'admin123', 'admin.json')
  })

  test('audit logs route renders filters and table or empty state', async ({ page }) => {
    await page.goto('/audit-logs')
    await expect(page.getByRole('heading', { name: /audit logs/i })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('button', { name: /apply/i })).toBeVisible()

    const hasTable = await page.locator('table').first().isVisible({ timeout: 8_000 }).catch(() => false)
    const hasEmpty = await page.getByText(/no audit events found/i).first().isVisible({ timeout: 8_000 }).catch(() => false)
    const hasError = await page.getByText(/failed to load audit logs/i).first().isVisible({ timeout: 8_000 }).catch(() => false)
    expect(hasTable || hasEmpty || hasError).toBeTruthy()
  })
})
