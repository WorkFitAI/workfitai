import { test, expect } from '@playwright/test'
import { injectAuthToken } from './helpers/inject-auth-token'

test.describe('Admin report management', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page, 'admin@workfitai.com', 'admin123', 'admin.json')
  })

  test('report route renders management surface', async ({ page }) => {
    await page.goto('/report')
    await expect(page.getByRole('heading', { name: /report management/i })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByPlaceholder(/search reports/i)).toBeVisible({ timeout: 10_000 })
  })
})
