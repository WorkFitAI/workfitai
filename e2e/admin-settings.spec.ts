import { test, expect } from '@playwright/test'
import { injectAuthToken } from './helpers/inject-auth-token'

test.describe('Admin settings', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page, 'admin@workfitai.com', 'admin123', 'admin.json')
  })

  test('admin settings renders feature switches', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: /^settings$/i })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('button', { name: /features/i })).toBeVisible({ timeout: 10_000 })
    await page.getByRole('button', { name: /features/i }).click()
    await expect(page.getByText(/job recommendation|cv referral/i).first()).toBeVisible({ timeout: 10_000 })
  })
})
