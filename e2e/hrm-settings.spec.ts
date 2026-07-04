import { test, expect } from '@playwright/test'
import { injectAuthToken } from './helpers/inject-auth-token'

test.describe('HRM settings', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page, 'hrmanager1@gmail.com', 'password@123', 'hrmanager1.json')
  })

  test('HRM settings renders HR notification controls but not admin feature switches', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: /^settings$/i })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('button', { name: /hr notifications/i })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('button', { name: /features/i })).not.toBeVisible()
  })
})
