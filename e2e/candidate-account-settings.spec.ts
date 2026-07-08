import { test, expect } from '@playwright/test'
import { injectAuthToken } from './helpers/inject-auth-token'

test.describe('Candidate account settings', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page, 'candidate1@gmail.com', 'password@123', 'candidate1.json')
  })

  test('account-settings page renders profile, notifications, and privacy tabs', async ({ page }) => {
    await page.goto('/account-settings')
    await expect(page).toHaveURL(/\/account-settings/, { timeout: 15_000 })
    await expect(page.getByRole('button', { name: /my profile/i })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('button', { name: /^notifications$/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /privacy/i })).toBeVisible()
  })

  test('candidate settings do not expose removed privacy fields', async ({ page }) => {
    await page.goto('/account-settings')
    await page.getByRole('button', { name: /privacy/i }).click()
    await expect(page.getByText(/privacy & security/i).first()).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/sms/i).first()).not.toBeVisible()
    await expect(page.getByText(/allow cv download/i).first()).not.toBeVisible()
  })
})
